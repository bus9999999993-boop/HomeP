/**
 * ========================================================
 * [GALLERY_ENGINE.JS] 레트로 사진 및 동영상 갤러리 엔진 (완전 영구 저장)
 * ========================================================
 * - 사진/동영상 직접 추가 (다중 파일 연속 추가)
 * - 정사각형 썸네일 (object-fit: cover) & 비디오 재생 배지
 * - 최근 추가 순서(최신순) 자동 정렬
 * - 원본 크기 모달 팝업 (닫기 버튼, 배경 클릭, ESC 키 닫기)
 * - 개별 미디어 삭제 기능
 * - IndexedDB 기반 브라우저 내 영구 바이너리 저장 (새로고침/페이지 이동 완벽 보존)
 * - 대용량 미디어 용량 제한 처리 및 클라우드 확장 인터페이스 연동
 */

class RetroGalleryEngine {
  constructor(options) {
    this.storageKey = options.storageKey || "retro_gallery_default";
    this.containerId = options.containerId || "mediaGrid";
    this.fileInputId = options.fileInputId || "mediaFileInput";
    this.modalId = options.modalId || "mediaModal";
    this.modalBodyId = options.modalBodyId || "modalMediaBody";
    this.modalTitleId = options.modalTitleId || "modalMediaTitle";
    this.modalCloseBtnId = options.modalCloseBtnId || "modalCloseBtn";
    this.initialItems = options.initialItems || [];

    this.items = []; // { id, type: 'image'|'video', url, name, timestamp, blob? }
    this.db = null;

    this.init();
  }

  async init() {
    await this.initDB();
    await this.loadItems();
    this.bindEvents();
    this.render();
  }

  // 1. IndexedDB 초기화 (대용량 미디어 영구 바이너리 저장소)
  initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open("RetroMediaStorageDB", 2);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("media_stores")) {
          db.createObjectStore("media_stores", { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = (e) => {
        console.warn("[GalleryEngine] IndexedDB init error, fallback to in-memory:", e);
        resolve();
      };
    });
  }

  // 2. 저장된 미디어 불러오기 (새로고침/페이지 이동 후 완벽 복원)
  async loadItems() {
    if (!this.db) {
      this.items = [...this.initialItems];
      return;
    }

    try {
      const record = await new Promise((resolve) => {
        const tx = this.db.transaction("media_stores", "readonly");
        const store = tx.objectStore("media_stores");
        const req = store.get(this.storageKey);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (record && Array.isArray(record.items) && record.items.length > 0) {
        // Blob 데이터로부터 유효한 Object URL 재구성 & blob 바이너리 보존
        this.items = record.items.map((item) => {
          if (item.blob) {
            return {
              ...item,
              blob: item.blob, // ★ 바이너리 지속 보존
              url: URL.createObjectURL(item.blob)
            };
          }
          return item;
        });
      } else {
        // 저장된 데이터가 없으면 기본 초기 아이템 로드
        this.items = [...this.initialItems];
      }
    } catch (e) {
      console.warn("[GalleryEngine] Error loading from IndexedDB:", e);
      this.items = [...this.initialItems];
    }

    // 최근 추가 순서대로 정렬 (타임스탬프 내림차순)
    this.items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // 3. 미디어 영구 저장 (Blob 바이너리 보존)
  async saveItems() {
    if (!this.db) return;
    try {
      const toSave = this.items.map((item) => {
        const blobData = item.file || item.blob || null;
        if (blobData) {
          return {
            id: item.id,
            type: item.type,
            name: item.name,
            timestamp: item.timestamp,
            blob: blobData // ★ Blob 바이너리 그대로 저장
          };
        }
        return {
          id: item.id,
          type: item.type,
          name: item.name,
          timestamp: item.timestamp,
          url: item.url // 정적 상대 경로인 경우
        };
      });

      await new Promise((resolve, reject) => {
        const tx = this.db.transaction("media_stores", "readwrite");
        const store = tx.objectStore("media_stores");
        const req = store.put({ id: this.storageKey, items: toSave });
        req.onsuccess = () => resolve();
        req.onerror = (err) => reject(err);
      });

      console.log(`[GalleryEngine] Saved ${toSave.length} items to IndexedDB (${this.storageKey})`);
    } catch (e) {
      console.error("[GalleryEngine] Failed to save to IndexedDB (Quota exceeded?):", e);
      if (e.name === "QuotaExceededError") {
        alert("브라우저 저장소 용량이 가득 찼습니다! 일부 사진이나 동영상을 삭제한 후 다시 시도해 주세요.");
      }
    }
  }

  // 4. 이벤트 바인딩
  bindEvents() {
    const fileInput = document.getElementById(this.fileInputId);
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files);
        fileInput.value = ""; // 연속 동일 파일 선택 가능하도록 초기화
      });
    }

    // 모달 닫기 버튼
    const closeBtn = document.getElementById(this.modalCloseBtnId);
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }

    // 모달 배경 클릭 시 닫기
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.classList.contains("modal-backdrop") || e.target.classList.contains("retro-modal")) {
          this.closeModal();
        }
      });
    }

    // ESC 키로 닫기
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        this.closeModal();
      }
    });
  }

  // 5. 파일 추가 처리 (다중 파일 연속 추가)
  async handleFileUpload(files) {
    if (!files || files.length === 0) return;

    const newItems = [];
    const currentTime = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) continue;

      const objectUrl = URL.createObjectURL(file);
      const item = {
        id: `media_${currentTime}_${i}_${Math.random().toString(36).substr(2, 6)}`,
        type: isVideo ? "video" : "image",
        url: objectUrl,
        name: file.name || "미디어 파일",
        timestamp: currentTime + i, // 최근 순서 정렬
        file: file,
        blob: file // 바이너리 보관
      };

      newItems.push(item);
    }

    if (newItems.length === 0) return;

    // 최근 작성/추가 순서대로 맨 앞에 추가
    this.items = [...newItems.reverse(), ...this.items];
    await this.saveItems();
    this.render();
  }

  // 6. 화면 렌더링
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = "";

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-gallery-notice">
          <p class="empty-title">★ 등록된 사진 및 동영상이 없습니다 ★</p>
          <p class="empty-sub">위의 [ 📁 사진 / 동영상 추가 ] 버튼을 눌러 콘텐츠를 추가해 보세요!</p>
        </div>
      `;
      const countEl = document.getElementById("mediaCountDisplay");
      if (countEl) countEl.textContent = "총 0개의 미디어";
      return;
    }

    this.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "retro-thumbnail-card";
      card.setAttribute("tabindex", "0");
      card.title = `${item.name} (클릭하여 원본 보기)`;

      if (item.type === "video") {
        card.innerHTML = `
          <div class="thumbnail-inner">
            <video src="${item.url}#t=0.1" class="thumbnail-media" preload="metadata" muted playsinline></video>
            <div class="video-play-badge">
              <span class="video-play-icon">▶</span>
              <span class="video-badge-text">VIDEO</span>
            </div>
          </div>
          <div class="thumbnail-filename">${this.escapeHtml(item.name)}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="thumbnail-inner">
            <img src="${item.url}" alt="${this.escapeHtml(item.name)}" class="thumbnail-media" loading="lazy">
          </div>
          <div class="thumbnail-filename">${this.escapeHtml(item.name)}</div>
        `;
      }

      // 클릭 시 모달 열기
      card.addEventListener("click", () => this.openModal(item));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.openModal(item);
      });

      container.appendChild(card);
    });

    // 개수 카운터 갱신
    const countEl = document.getElementById("mediaCountDisplay");
    if (countEl) {
      countEl.textContent = `총 ${this.items.length}개의 미디어`;
    }
  }

  // 7. 모달 창 열기
  openModal(item) {
    const modal = document.getElementById(this.modalId);
    const modalBody = document.getElementById(this.modalBodyId);
    const modalTitle = document.getElementById(this.modalTitleId);

    if (!modal || !modalBody) return;

    if (modalTitle) {
      modalTitle.textContent = item.name || "미디어 원본 보기";
    }

    modalBody.innerHTML = "";

    if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.url;
      video.controls = true;
      video.autoplay = true;
      video.className = "modal-full-media";
      modalBody.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.name;
      img.className = "modal-full-media";
      modalBody.appendChild(img);
    }

    // 모달 내 삭제 버튼 이벤트 연결
    const deleteBtn = document.getElementById("modalDeleteBtn");
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        if (confirm(`"${item.name}" 미디어를 정말 삭제하시겠습니까?`)) {
          this.deleteItem(item.id);
          this.closeModal();
        }
      };
    }

    modal.classList.add("active");
  }

  // 8. 개별 미디어 삭제
  async deleteItem(itemId) {
    const target = this.items.find((item) => item.id === itemId);
    if (target && target.url && target.url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(target.url);
      } catch (e) {}
    }

    this.items = this.items.filter((item) => item.id !== itemId);
    await this.saveItems();
    this.render();
    console.log(`[GalleryEngine] Media deleted: ${itemId}`);
  }

  // 9. 모달 창 닫기
  closeModal() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    modal.classList.remove("active");

    // 재생 중이던 비디오 정지 및 메모리 정리
    const modalBody = document.getElementById(this.modalBodyId);
    if (modalBody) {
      const video = modalBody.querySelector("video");
      if (video) {
        video.pause();
        video.src = "";
      }
      modalBody.innerHTML = "";
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}

window.RetroGalleryEngine = RetroGalleryEngine;
