/**
 * ========================================================
 * [POST_ENGINE.JS] 레트로 일반 글 작성 및 스트림 표시 엔진
 * ========================================================
 * - 사용자가 홈페이지 안에서 새로운 글 직접 작성 및 추가
 * - 제목, 본문, 작성 날짜 입력/기록
 * - 네모난 카드 형태가 아닌 일반적인 글 형태 표시
 * - 글과 글 사이 회색 가로선 구분
 * - 최근 작성 순서대로 자동 정렬
 * - localStorage 기반 자동 저장 (새로고침 시 유지)
 */

class RetroPostEngine {
  constructor(options) {
    this.storageKey = options.storageKey || "retro_posts_default";
    this.listContainerId = options.listContainerId || "postListContainer";
    this.formId = options.formId || "postForm";
    this.titleInputId = options.titleInputId || "postTitleInput";
    this.dateInputId = options.dateInputId || "postDateInput";
    this.contentInputId = options.contentInputId || "postContentInput";
    this.countDisplayId = options.countDisplayId || "postCountDisplay";
    this.initialPosts = options.initialPosts || [];

    this.posts = [];

    this.init();
  }

  init() {
    this.loadPosts();
    this.setupDateDefault();
    this.bindEvents();
    this.render();
  }

  // 1. 오늘 날짜를 YYYY-MM-DD 형식으로 기본 세팅
  setupDateDefault() {
    const dateInput = document.getElementById(this.dateInputId);
    if (dateInput && !dateInput.value) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      dateInput.value = `${year}-${month}-${day}`;
    }
  }

  // 2. 저장된 글 불러오기
  loadPosts() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.posts = JSON.parse(saved);
      } else {
        this.posts = [...this.initialPosts];
      }
    } catch (e) {
      console.warn("[PostEngine] Failed to read from localStorage:", e);
      this.posts = [...this.initialPosts];
    }

    // 최근 작성한 순서대로 정렬 (타임스탬프 내림차순)
    this.posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // 3. 글 저장
  savePosts() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.posts));
    } catch (e) {
      console.error("[PostEngine] Failed to save posts:", e);
    }
  }

  // 4. 이벤트 바인딩
  bindEvents() {
    const form = document.getElementById(this.formId);
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  }

  // 5. 새 글 등록 처리
  handleFormSubmit() {
    const titleEl = document.getElementById(this.titleInputId);
    const dateEl = document.getElementById(this.dateInputId);
    const contentEl = document.getElementById(this.contentInputId);

    if (!titleEl || !contentEl) return;

    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    let date = dateEl ? dateEl.value.trim() : "";

    if (!title) {
      alert("글 제목을 입력해 주세요!");
      titleEl.focus();
      return;
    }

    if (!content) {
      alert("본문 내용을 입력해 주세요!");
      contentEl.focus();
      return;
    }

    // 날짜가 없으면 현재 날짜 포맷
    if (!date) {
      const now = new Date();
      date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    } else {
      // YYYY-MM-DD -> YYYY.MM.DD 형태로 변환
      date = date.replace(/-/g, ".");
    }

    const currentTime = Date.now();
    const newPost = {
      id: `post_${currentTime}_${Math.random().toString(36).substr(2, 5)}`,
      title: title,
      date: date,
      content: content,
      timestamp: currentTime // 최근 작성 순서 정렬용
    };

    // 최근 작성 순서대로 맨 앞에 추가
    this.posts.unshift(newPost);
    this.savePosts();
    this.render();

    // 입력 폼 비우기 & 오늘 날짜로 재설정
    titleEl.value = "";
    contentEl.value = "";
    this.setupDateDefault();

    // 알림 표시
    console.log("[PostEngine] New post added:", newPost);
  }

  // 6. 글 목록 렌더링 (일반적인 글 형태, 회색 가로선 구분)
  render() {
    const container = document.getElementById(this.listContainerId);
    if (!container) return;

    container.innerHTML = "";

    if (this.posts.length === 0) {
      container.innerHTML = `
        <div class="empty-posts-notice">
          <p>★ 아직 등록된 글이 없습니다. 상단에서 첫 번째 글을 작성해 보세요! ★</p>
        </div>
      `;
      return;
    }

    // 일반적인 글 형태로 렌더링
    this.posts.forEach((post) => {
      const itemEl = document.createElement("article");
      itemEl.className = "general-post-item";

      itemEl.innerHTML = `
        <header class="post-header-line">
          <h3 class="general-post-title">${this.escapeHtml(post.title)}</h3>
          <div class="post-meta-right">
            <time class="general-post-date" datetime="${this.escapeHtml(post.date)}">작성일: ${this.escapeHtml(post.date)}</time>
            <button type="button" class="post-delete-btn" title="이 글 삭제">[ ✕ 삭제 ]</button>
          </div>
        </header>
        <div class="general-post-body">${this.escapeHtml(post.content)}</div>
      `;

      // 삭제 버튼 클릭 이벤트
      const deleteBtn = itemEl.querySelector(".post-delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          this.deletePost(post.id);
        });
      }

      container.appendChild(itemEl);
    });

    // 글 개수 표시 갱신
    const countEl = document.getElementById(this.countDisplayId);
    if (countEl) {
      countEl.textContent = `총 ${this.posts.length}개의 기록`;
    }
  }

  // 7. 게시물 삭제 메서드
  deletePost(postId) {
    const postToDelete = this.posts.find((p) => p.id === postId);
    const postTitle = postToDelete ? `"${postToDelete.title}"` : "이 게시물";

    if (confirm(`${postTitle} 글을 정말 삭제하시겠습니까?`)) {
      this.posts = this.posts.filter((p) => p.id !== postId);
      this.savePosts();
      this.render();
      console.log(`[PostEngine] Post deleted: ${postId}`);
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}

window.RetroPostEngine = RetroPostEngine;
