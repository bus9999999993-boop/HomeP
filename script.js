/**
 * ========================================================
 * [SCRIPT.JS] 레트로 홈페이지 서비스 및 UI 컨트롤러
 * ========================================================
 * 디자인과 기능을 유지하면서, 향후 클라우드 데이터베이스 및
 * 파일 저장소(Storage)를 손쉽게 연결할 수 있도록 계층화(Layered)된 구조입니다.
 * 
 * 1. DatabaseService : 데이터베이스 추상화 계층 (Local / Cloud)
 * 2. StorageService  : 파일 저장소 추상화 계층 (Local / Cloud Storage)
 * 3. RetroApp        : UI 렌더링 및 인터랙션 컨트롤러
 */

// ========================================================
// [1] DATABASE SERVICE LAYER (데이터베이스 서비스)
// ========================================================
const DatabaseService = {
  /**
   * 사이트 데이터 조회 (비동기)
   * 현재: localStorage 또는 config.js의 DEFAULT_SITE_DATA에서 로드
   * 향후: Supabase, Firebase, REST API 등 클라우드 DB 연동 시 이 메서드 내부만 확장
   */
  async fetchSiteData() {
    const config = window.CLOUD_CONFIG || { provider: "local" };

    // 1) 클라우드 프로바이더가 설정된 경우 (향후 확장)
    if (config.provider !== "local" && config.database && config.database.enabled) {
      try {
        console.log(`[DatabaseService] Connecting to cloud database (${config.provider})...`);
        
        // --- ☁️ [클라우드 연동 확장 지점] ---
        // 예: Supabase 연동 시:
        // const res = await fetch(`${config.database.endpoint}/rest/v1/${config.database.tableName}?select=*`, {
        //   headers: { "apikey": config.database.apiKey, "Authorization": `Bearer ${config.database.apiKey}` }
        // });
        // const cloudData = await res.json();
        // if (cloudData && cloudData.length > 0) return cloudData[0].payload;
        
      } catch (cloudError) {
        console.warn("[DatabaseService] Cloud fetch failed, falling back to local data:", cloudError);
      }
    }

    // 2) 로컬 기본 동작 (Local Cache -> Default Data)
    try {
      const localCache = localStorage.getItem("retro_site_data");
      if (localCache) {
        const parsed = JSON.parse(localCache);
        return { ...window.DEFAULT_SITE_DATA, ...parsed };
      }
    } catch (e) {
      console.warn("[DatabaseService] LocalStorage read error:", e);
    }

    return window.DEFAULT_SITE_DATA;
  },

  /**
   * 사이트 데이터 저장 (비동기)
   * 현재: 브라우저 localStorage에 안전하게 보관
   * 향후: 클라우드 DB에 동기화
   */
  async saveSiteData(newData) {
    try {
      localStorage.setItem("retro_site_data", JSON.stringify(newData));
      console.log("[DatabaseService] Data saved locally.");
    } catch (e) {
      console.error("[DatabaseService] Failed to save data locally:", e);
    }

    const config = window.CLOUD_CONFIG || { provider: "local" };
    if (config.provider !== "local" && config.database && config.database.enabled) {
      // --- ☁️ [클라우드 저장 확장 지점] ---
      // 예: 클라우드 DB UPDATE / UPSERT 호출
      console.log("[DatabaseService] Cloud sync triggered.");
    }
  }
};


// ========================================================
// [2] STORAGE SERVICE LAYER (파일 저장소 서비스)
// ========================================================
const StorageService = {
  /**
   * 이미지 키에 해당하는 최종 URL 반환
   * @param {string} imageKey - 이미지 식별자 (예: 'mainPhoto', 'headerBanner')
   * @param {string} fallbackPath - 기본 이미지 경로
   * @returns {string} 로컬 경로 또는 클라우드 스토리지 CDN URL
   */
  resolveImageUrl(imageKey, fallbackPath) {
    const config = window.CLOUD_CONFIG || {};
    
    // 클라우드 스토리지가 활성화되어 있는 경우
    if (config.storage && config.storage.enabled && config.storage.endpoint) {
      const bucket = config.storage.bucketName || "assets";
      return `${config.storage.endpoint}/${bucket}/${imageKey}.png`;
    }

    // 현재 로컬 모드: 기본 설정에 등록된 경로 또는 fallbackPath 반환
    const siteData = window.DEFAULT_SITE_DATA || {};
    if (siteData.images && siteData.images[imageKey]) {
      return siteData.images[imageKey];
    }

    return fallbackPath;
  },

  /**
   * 향후 파일 업로드 인터페이스 (Storage 확장용)
   */
  async uploadFile(file, imageKey) {
    console.log(`[StorageService] Uploading file for ${imageKey}... (Feature ready for cloud integration)`);
    // --- ☁️ [클라우드 파일 업로드 확장 지점: S3, Supabase Storage, Firebase Storage 등] ---
    return URL.createObjectURL(file);
  }
};


// ========================================================
// [3] RETRO APP (UI 렌더링 및 비즈니스 로직)
// ========================================================
const RetroApp = {
  data: null,

  /**
   * 애플리케이션 초기화 (비동기)
   */
  async init() {
    try {
      // 1. 데이터베이스 서비스로부터 데이터 로드
      this.data = await DatabaseService.fetchSiteData();

      // 2. 각 UI 컴포넌트 렌더링
      this.renderSiteInfo();
      this.renderDday();
      this.renderPlaylist();
      this.renderNews();
      this.renderImages();

      // 3. 인터랙션 이벤트 바인딩
      this.bindEvents();

      console.log("★ Retro Homepage successfully initialized! ★");
    } catch (err) {
      console.error("[RetroApp] Initialization failed:", err);
    }
  },

  /**
   * 1. 상단 HOME 및 소개 문구 렌더링
   */
  renderSiteInfo() {
    const info = this.data.siteInfo || {};
    const homeTitleEl = document.getElementById("homeTitle");
    const introTextEl = document.getElementById("introText");

    if (homeTitleEl && info.homeTitle) {
      homeTitleEl.textContent = info.homeTitle;
    }
    if (introTextEl && info.introText) {
      introTextEl.textContent = info.introText;
    }
  },

  /**
   * 2. D-DAY 계산 및 렌더링
   */
  calculateDday(targetDateStr) {
    if (!targetDateStr) return "D-00";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `D-${diffDays}`;
    } else if (diffDays === 0) {
      return "D-Day";
    } else {
      return `D+${Math.abs(diffDays)}`;
    }
  },

  renderDday() {
    const ddayConfig = this.data.dday || {};
    const sectionTitleEl = document.getElementById("ddaySectionTitle");
    if (sectionTitleEl && ddayConfig.sectionTitle) {
      sectionTitleEl.textContent = ddayConfig.sectionTitle;
    }

    const items = ddayConfig.items || [];
    if (items[0]) {
      const label1El = document.getElementById("ddayLabel1");
      const count1El = document.getElementById("ddayCount1");
      if (label1El) label1El.textContent = items[0].label;
      if (count1El) count1El.textContent = this.calculateDday(items[0].date);
    }

    if (items[1]) {
      const label2El = document.getElementById("ddayLabel2");
      const count2El = document.getElementById("ddayCount2");
      if (label2El) label2El.textContent = items[1].label;
      if (count2El) count2El.textContent = this.calculateDday(items[1].date);
    }
  },

  /**
   * 3. BGM 플레이어 (유튜브 임베드) 렌더링
   */
  renderPlaylist() {
    const playlist = this.data.playlist || {};
    const musicTitleEl = document.getElementById("musicTitle");
    const iframeEl = document.getElementById("playlistIframe");

    if (musicTitleEl && playlist.title) {
      musicTitleEl.textContent = playlist.title;
    }

    if (iframeEl && playlist.youtubeVideoId) {
      // 유튜브 ID 뒤에 ?si=... 파라미터가 포함되어 있어도 순수 ID만 안전하게 추출
      const cleanVideoId = playlist.youtubeVideoId.split("?")[0].split("&")[0];
      const embedSrc = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=0&rel=0&modestbranding=1`;
      
      // 불필요한 새로고침 방지
      if (iframeEl.src !== embedSrc) {
        iframeEl.src = embedSrc;
      }
    }
  },

  /**
   * 4. News 카테고리 카드 렌더링
   */
  renderNews() {
    const newsConfig = this.data.news || {};
    const sectionTitleEl = document.getElementById("newsSectionTitle");
    if (sectionTitleEl && newsConfig.sectionTitle) {
      sectionTitleEl.textContent = newsConfig.sectionTitle;
    }

    const categories = newsConfig.categories || [];
    
    // 카테고리 1
    if (categories[0]) {
      const tagEl = document.getElementById("cat1Tag");
      const titleEl = document.getElementById("cat1Title");
      const descEl = document.getElementById("cat1Desc");
      const imgEl = document.getElementById("cat1Image");

      if (tagEl) tagEl.textContent = categories[0].tag;
      if (titleEl) titleEl.textContent = categories[0].title;
      if (descEl) descEl.textContent = categories[0].desc;
      if (imgEl) {
        imgEl.src = StorageService.resolveImageUrl(categories[0].imageKey || "category1", imgEl.src);
      }
    }

    // 카테고리 2
    if (categories[1]) {
      const tagEl = document.getElementById("cat2Tag");
      const titleEl = document.getElementById("cat2Title");
      const descEl = document.getElementById("cat2Desc");
      const imgEl = document.getElementById("cat2Image");

      if (tagEl) tagEl.textContent = categories[1].tag;
      if (titleEl) titleEl.textContent = categories[1].title;
      if (descEl) descEl.textContent = categories[1].desc;
      if (imgEl) {
        imgEl.src = StorageService.resolveImageUrl(categories[1].imageKey || "category2", imgEl.src);
      }
    }
  },

  /**
   * 5. 이미지 에셋 일괄 동적 확인 (클라우드 스토리지 확장 대응)
   */
  renderImages() {
    const imageMappings = [
      { id: "topBannerImg", key: "headerBanner", defaultPath: "assets/images/header_banner.svg" },
      { id: "mainPhotoImg", key: "mainPhoto", defaultPath: "assets/images/큰이미지.png" },
      { id: "subPhotoImg", key: "subPhoto", defaultPath: "assets/images/네컷.png" },
      { id: "sideBannerImg", key: "sideBanner", defaultPath: "assets/images/side_banner.svg" },
      { id: "sidePhotoImg", key: "sidePhoto", defaultPath: "assets/images/side_photo.svg" }
    ];

    imageMappings.forEach(mapping => {
      const imgEl = document.getElementById(mapping.id);
      if (imgEl) {
        const resolvedUrl = StorageService.resolveImageUrl(mapping.key, mapping.defaultPath);
        if (resolvedUrl && imgEl.getAttribute("src") !== resolvedUrl) {
          imgEl.src = resolvedUrl;
        }
      }
    });
  },

  /**
   * 6. 이벤트 바인딩
   */
  bindEvents() {
    const cards = document.querySelectorAll(".news-poster-card");
    cards.forEach((card) => {
      card.onclick = (e) => {
        const href = card.getAttribute("href");
        // 실제 페이지 파일이 연결되어 있으면(예: category1.html) 해당 페이지로 이동
        if (href && href !== "#" && !href.startsWith("#")) {
          return true;
        }

        // 세부 페이지가 아직 없는 카테고리는 안내 알림 표시
        e.preventDefault();
        const title = card.querySelector(".news-item-title")?.textContent || "카테고리";
        alert(`[${title}] 공간을 클릭하셨습니다!\n(추후 세부 페이지 또는 클라우드 게시판으로 바로 연결할 수 있습니다 ★)`);
      };
    });
  }
};

// ========================================================
// [4] 하위 호환성 (Legacy compatibility)
// ========================================================
// 기존 스크립트 작성 방식(단순 변수 접근)과의 100% 호환 보장
window.SITE_INFO = window.DEFAULT_SITE_DATA?.siteInfo;
window.DDAY_CONFIG = window.DEFAULT_SITE_DATA?.dday;
window.NEWS_CATEGORIES = window.DEFAULT_SITE_DATA?.news;
window.PLAYLIST_CONFIG = window.DEFAULT_SITE_DATA?.playlist;
window.DatabaseService = DatabaseService;
window.StorageService = StorageService;
window.RetroApp = RetroApp;

// 문서 로드 완료 시 애플리케이션 시작
document.addEventListener("DOMContentLoaded", () => {
  RetroApp.init();
});
