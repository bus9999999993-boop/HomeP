/**
 * ========================================================
 * [CATEGORY2.JS] 카테고리 2 (Crack High school) 미니홈피 인터랙션
 * ========================================================
 * - 1. 세로형 인덱스 탭 전환 (홈 / 프로필 / 사진첩 / 게시판 / 방명록)
 * - 2. 왼쪽 프로필 페이지 고정 및 편집/저장 시스템
 *      - TODAY / TOTAL 실제 방문자 카운팅 및 히스토리 모달
 *      - TODAY IS... 기분 문구 수정
 *      - 프로필 사진 직접 파일 업로드 및 교체
 *      - 홈페이지 이름, 사용자 이름, 자기소개 글귀 자연스러운 텍스트 배치 및 EDIT 수정
 * - 3. 일촌평(What friends say) 작성 및 삭제 (localStorage 저장)
 * - 4. 방명록 작성 및 삭제 (localStorage 저장)
 * - 5. 파도타기 드롭다운 이동
 */

document.addEventListener("DOMContentLoaded", () => {
  initVisitorStats();
  profileManagerInstance = initProfileManager();
  applyConfig();
  initTabs();
  initCommonPages();
  initGalleries();
  initBoard();
  initSurfSelect();
});

// ========================================================
// [1] 실제 방문자 수 카운팅 및 히스토리 시스템
// - 새로고침 시 무조건 증가하지 않도록 sessionStorage 기반 세션 제어
// - 날짜별 실제 방문 기록을 영구 저장하고 모달에서 확인 가능
// ========================================================
function initVisitorStats() {
  const todayCountEl = document.getElementById("hompyTodayCount");
  const totalCountEl = document.getElementById("hompyTotalCount");
  const counterWrap = document.getElementById("todayCounterWrap");
  const historyModal = document.getElementById("visitHistoryModal");
  const closeHistoryBtn = document.getElementById("closeVisitHistoryModal");
  const confirmHistoryBtn = document.getElementById("confirmVisitHistoryBtn");
  const btnViewHistory = document.getElementById("btnViewHistory");

  const todayStr = getTodayFormatted(); // YYYY-MM-DD

  // 1. 저장소에서 방문 데이터 로드
  let totalCount = parseInt(localStorage.getItem("cy_visit_total") || "6088", 10);
  let todayCount = parseInt(localStorage.getItem("cy_visit_today") || "12", 10);
  let lastDate = localStorage.getItem("cy_visit_last_date") || todayStr;
  
  let historyData = {};
  try {
    const savedHistory = localStorage.getItem("cy_visit_history");
    if (savedHistory) historyData = JSON.parse(savedHistory);
  } catch (e) {
    historyData = {};
  }

  // 기본 히스토리 데이터가 비어있다면 레트로 샘플 데이터 채움
  if (Object.keys(historyData).length === 0) {
    historyData["2026-10-31"] = 12;
    historyData["2026-10-30"] = 28;
    historyData["2026-10-29"] = 19;
    historyData["2026-10-28"] = 35;
    historyData["2026-10-27"] = 22;
  }

  // 2. 날짜 변경 확인 (새로운 날이면 TODAY 리셋)
  if (lastDate !== todayStr) {
    todayCount = 0;
    lastDate = todayStr;
  }

  // 3. 브라우저 세션 체크 (새로고침 시 중복 증가 방지)
  const isVisitedInThisSession = sessionStorage.getItem("cy_session_visited_flag");

  if (!isVisitedInThisSession) {
    // 새로운 방문 세션인 경우에만 1 증가
    todayCount += 1;
    totalCount += 1;
    historyData[todayStr] = todayCount;

    sessionStorage.setItem("cy_session_visited_flag", "true");
    localStorage.setItem("cy_visit_today", todayCount.toString());
    localStorage.setItem("cy_visit_total", totalCount.toString());
    localStorage.setItem("cy_visit_last_date", todayStr);
    localStorage.setItem("cy_visit_history", JSON.stringify(historyData));
  }

  // 4. 화면에 방문자 수 렌더링
  if (todayCountEl) todayCountEl.textContent = todayCount.toLocaleString();
  if (totalCountEl) totalCountEl.textContent = totalCount.toLocaleString();

  // 5. 방문 기록 모달 열기 / 닫기
  function openHistoryModal() {
    if (!historyModal) return;
    const historyTodayEl = document.getElementById("historyTodayCountDisplay");
    const historyTotalEl = document.getElementById("historyTotalCountDisplay");
    const tbody = document.getElementById("visitHistoryTableBody");

    if (historyTodayEl) historyTodayEl.textContent = todayCount.toLocaleString();
    if (historyTotalEl) historyTotalEl.textContent = totalCount.toLocaleString();

    if (tbody) {
      tbody.innerHTML = "";
      const dates = Object.keys(historyData).sort().reverse();
      dates.forEach((d) => {
        const count = historyData[d];
        const isToday = d === todayStr;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="${isToday ? 'font-weight:bold; color:#1E668C;' : ''}">${d} ${isToday ? '★(오늘)' : ''}</td>
          <td style="${isToday ? 'font-weight:bold; color:#FF0000;' : ''}">${count}명</td>
          <td><span style="font-size:10px; color:#2E7D32;">정상 집계</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    historyModal.classList.add("active");
  }

  function closeHistoryModal() {
    if (historyModal) historyModal.classList.remove("active");
  }

  if (counterWrap) counterWrap.addEventListener("click", openHistoryModal);
  if (btnViewHistory) btnViewHistory.addEventListener("click", openHistoryModal);
  if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", closeHistoryModal);
  if (confirmHistoryBtn) confirmHistoryBtn.addEventListener("click", closeHistoryModal);
  if (historyModal) {
    historyModal.addEventListener("click", (e) => {
      if (e.target === historyModal) closeHistoryModal();
    });
  }
}

// 오늘 날짜 포맷 (YYYY-MM-DD)
function getTodayFormatted() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ========================================================
// [2] 왼쪽 프로필 관리 시스템
// - 페이지(탭)마다 왼쪽 형태는 100% 동일하게 유지하되,
// - 프로필 사진/소개글/사용자이름/홈페이지이름은 페이지마다 다르게 편집 및 독립 저장
// ========================================================
let currentActiveTab = "home";
let profileManagerInstance = null;

function initProfileManager() {
  const cfg = window.CATEGORY2_CONFIG || {};
  const defaultProfiles = cfg.profiles || {};

  function getDefaultSettings(tabId) {
    if (defaultProfiles[tabId]) return { ...defaultProfiles[tabId] };
    return {
      hompyName: "Crack High school",
      ownerName: "여주 (엑스트라)",
      introText: "순정만화 속 엑스트라로 빙의했다.\n조용히 졸업만 하고 싶은데...\n자꾸만 주인공들이 얽혀온다?!",
      todayFeeling: "⚡ 빙의됨",
      profileImage: "assets/images/crack_profile.svg"
    };
  }

  function getProfileData(tabId) {
    const key = `cy_crack_profile_${tabId}`;
    const defaults = getDefaultSettings(tabId);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("[ProfileManager] Read failed:", e);
    }
    return { ...defaults };
  }

  function saveProfileData(tabId, data) {
    const key = `cy_crack_profile_${tabId}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("[ProfileManager] Storage failed:", e);
    }
  }

  // 화면 요소들
  const hompyTitleDisplay = document.getElementById("hompyTitleDisplay");
  const hompyOwnerName = document.getElementById("hompyOwnerName");
  const hompyIntroDesc = document.getElementById("hompyIntroDesc");
  const hompyTodayFeeling = document.getElementById("hompyTodayFeeling");
  const hompyProfileImg = document.getElementById("hompyProfileImg");

  const profileImgContainer = document.getElementById("profileImgContainer");
  const profileImgInput = document.getElementById("profileImgInput");

  // 모달 요소들
  const editModal = document.getElementById("profileEditModal");
  const btnEditProfile = document.getElementById("btnEditProfile");
  const closeEditModal = document.getElementById("closeProfileEditModal");
  const cancelEditBtn = document.getElementById("cancelProfileEditBtn");
  const profileEditForm = document.getElementById("profileEditForm");

  const editHompyNameInput = document.getElementById("editHompyNameInput");
  const editOwnerNameInput = document.getElementById("editOwnerNameInput");
  const editTodayFeelingInput = document.getElementById("editTodayFeelingInput");
  const editIntroDescInput = document.getElementById("editIntroDescInput");
  const editProfileFileInput = document.getElementById("editProfileFileInput");

  // 1. 화면 렌더링
  function renderProfile(tabId = currentActiveTab) {
    const profileData = getProfileData(tabId);
    if (hompyTitleDisplay) hompyTitleDisplay.textContent = profileData.hompyName;
    if (hompyOwnerName) hompyOwnerName.textContent = profileData.ownerName;
    if (hompyIntroDesc) {
      hompyIntroDesc.innerHTML = escapeHtml(profileData.introText).replace(/\n/g, "<br>");
    }
    if (hompyTodayFeeling) hompyTodayFeeling.textContent = profileData.todayFeeling;
    if (hompyProfileImg && profileData.profileImage) {
      hompyProfileImg.src = profileData.profileImage;
    }
  }

  // 2. 프로필 이미지 직접 클릭 시 파일 선택
  if (profileImgContainer && profileImgInput) {
    profileImgContainer.addEventListener("click", () => {
      profileImgInput.click();
    });

    profileImgInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const profileData = getProfileData(currentActiveTab);
        profileData.profileImage = event.target.result;
        saveProfileData(currentActiveTab, profileData);
        renderProfile(currentActiveTab);
      };
      reader.readAsDataURL(file);
      profileImgInput.value = "";
    });
  }

  // 3. TODAY IS 문구 직접 클릭 시 수정 모달 유도
  if (hompyTodayFeeling) {
    hompyTodayFeeling.addEventListener("click", () => {
      openEditModal();
      if (editTodayFeelingInput && typeof editTodayFeelingInput.focus === "function") {
        editTodayFeelingInput.focus();
      }
    });
  }

  // 4. EDIT 모달 열기 / 닫기
  function openEditModal() {
    if (!editModal) return;
    const profileData = getProfileData(currentActiveTab);
    if (editHompyNameInput) editHompyNameInput.value = profileData.hompyName;
    if (editOwnerNameInput) editOwnerNameInput.value = profileData.ownerName;
    if (editTodayFeelingInput) editTodayFeelingInput.value = profileData.todayFeeling;
    if (editIntroDescInput) editIntroDescInput.value = profileData.introText;
    if (editProfileFileInput) editProfileFileInput.value = "";

    editModal.classList.add("active");
  }

  function closeEditModalFunc() {
    if (editModal) editModal.classList.remove("active");
  }

  if (btnEditProfile) btnEditProfile.addEventListener("click", openEditModal);
  if (closeEditModal) closeEditModal.addEventListener("click", closeEditModalFunc);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModalFunc);
  if (editModal) {
    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) closeEditModalFunc();
    });
  }

  // 5. EDIT 폼 서밋 저장
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const profileData = getProfileData(currentActiveTab);

      if (editHompyNameInput) profileData.hompyName = editHompyNameInput.value.trim() || profileData.hompyName;
      if (editOwnerNameInput) profileData.ownerName = editOwnerNameInput.value.trim() || profileData.ownerName;
      if (editTodayFeelingInput) profileData.todayFeeling = editTodayFeelingInput.value.trim() || profileData.todayFeeling;
      if (editIntroDescInput) profileData.introText = editIntroDescInput.value.trim() || profileData.introText;

      // 모달 내 파일 선택이 있는 경우
      if (editProfileFileInput && editProfileFileInput.files && editProfileFileInput.files[0]) {
        const file = editProfileFileInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          profileData.profileImage = event.target.result;
          saveProfileData(currentActiveTab, profileData);
          renderProfile(currentActiveTab);
          closeEditModalFunc();
        };
        reader.readAsDataURL(file);
      } else {
        saveProfileData(currentActiveTab, profileData);
        renderProfile(currentActiveTab);
        closeEditModalFunc();
      }
    });
  }

  renderProfile(currentActiveTab);

  return {
    switchTab: (tabId) => {
      currentActiveTab = tabId;
      renderProfile(tabId);
    }
  };
}

// 0. config.js 설정 동적 바인딩 (사진, 글, 탭 이름 모두 수정 가능)
function applyConfig() {
  const config = window.CATEGORY2_CONFIG;
  if (!config) return;

  const headlineEl = document.getElementById("hompyHeadline");
  const bgmTitleEl = document.getElementById("hompyBgmTitle");
  const miniroomImgEl = document.getElementById("hompyMiniroomImg");

  // 1) 미니홈피 한 줄 제목
  if (headlineEl && config.hompyTitle) {
    headlineEl.innerHTML = `<span>나 함정에 빠진 거 같아...</span> ${escapeHtml(config.hompyTitle)}`;
  }
  // 2) BGM 제목
  if (bgmTitleEl && config.bgmTitle) {
    bgmTitleEl.textContent = `BGM : ${config.bgmTitle}`;
  }
  // 3) 미니룸 이미지
  if (miniroomImgEl && config.miniroomImage) {
    miniroomImgEl.src = config.miniroomImage;
  }

  // 4) ★ 오른쪽 카테고리 탭 이름 동적 반영 (config.js에서 이름 변경 시 즉시 반영)
  if (config.tabs && Array.isArray(config.tabs)) {
    config.tabs.forEach((tab) => {
      const tabBtn = document.getElementById(`tab_${tab.id}`) || document.querySelector(`.cy-tab-btn[data-tab="${tab.id}"]`);
      if (tabBtn && tab.name) {
        tabBtn.textContent = tab.name;
      }
    });
  }
}

// 1. 세로형 인덱스 탭 전환 (오른쪽 콘텐츠 전환 + 왼쪽 프로필 독립 데이터 전환)
function initTabs() {
  const tabButtons = document.querySelectorAll(".cy-tab-btn");
  const panes = {
    home: document.getElementById("pane-home"),
    profile: document.getElementById("pane-profile"),
    photo: document.getElementById("pane-photo"),
    board: document.getElementById("pane-board"),
    guestbook: document.getElementById("pane-guestbook")
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      // 탭 활성화 상태 변경
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 콘텐츠 영역 전환
      Object.keys(panes).forEach((key) => {
        if (panes[key]) {
          panes[key].style.display = key === targetTab ? "block" : "none";
        }
      });

      // 스크롤 맨 위로 초기화
      const scrollArea = document.getElementById("contentScrollStage");
      if (scrollArea) scrollArea.scrollTop = 0;

      // ★ 페이지 전환 시 왼쪽 프로필 데이터도 해당 탭 것으로 즉시 전환 렌더링!
      if (profileManagerInstance) {
        profileManagerInstance.switchTab(targetTab);
      }
    });
  });
}

// ========================================================
// [3] 아이콘 1 & 아이콘 2 공통 페이지 엔진 (완전 독립 데이터 관리)
// - 상단 한 줄 제목 수정
// - 큰 직사각형 이미지 교체 (파일 업로드 -> DataURL 영구 저장)
// - 미니홈수 & 깜짝링크 문구 및 실제 이동 URL 설정
// - 일촌평 일반 텍스트 목록, 작성, 날짜 자동기록, 수정, 삭제
// ========================================================
function initCommonPages() {
  const cfg = window.CATEGORY2_CONFIG || {};

  // 모달 요소들
  const titleModal = document.getElementById("titleEditModal");
  const titleForm = document.getElementById("titleEditForm");
  const titleInput = document.getElementById("titleEditInput");
  const closeTitleModalBtn = document.getElementById("closeTitleEditModal");
  const cancelTitleModalBtn = document.getElementById("cancelTitleEditBtn");

  const linkModal = document.getElementById("linkEditModal");
  const linkForm = document.getElementById("linkEditForm");
  const miniCountInput = document.getElementById("miniCountEditInput");
  const surpriseTextInput = document.getElementById("surpriseTextEditInput");
  const surpriseUrlInput = document.getElementById("surpriseUrlEditInput");
  const closeLinkModalBtn = document.getElementById("closeLinkEditModal");
  const cancelLinkModalBtn = document.getElementById("cancelLinkEditBtn");

  const ilchonModal = document.getElementById("ilchonEditModal");
  const ilchonForm = document.getElementById("ilchonEditForm");
  const ilchonAuthorInput = document.getElementById("ilchonEditAuthorInput");
  const ilchonTextInput = document.getElementById("ilchonEditTextInput");
  const closeIlchonModalBtn = document.getElementById("closeIlchonEditModal");
  const cancelIlchonModalBtn = document.getElementById("cancelIlchonEditBtn");

  let activeModalPage = null; // "page1" or "page2"
  let activeIlchonEditItem = null; // { pageKey, itemId }

  // 1. 공통 모달 닫기 제어
  function closeAllCommonModals() {
    if (titleModal) titleModal.classList.remove("active");
    if (linkModal) linkModal.classList.remove("active");
    if (ilchonModal) ilchonModal.classList.remove("active");
    activeModalPage = null;
    activeIlchonEditItem = null;
  }

  [closeTitleModalBtn, cancelTitleModalBtn, closeLinkModalBtn, cancelLinkModalBtn, closeIlchonModalBtn, cancelIlchonModalBtn].forEach((btn) => {
    if (btn) btn.addEventListener("click", closeAllCommonModals);
  });

  [titleModal, linkModal, ilchonModal].forEach((m) => {
    if (m) {
      m.addEventListener("click", (e) => {
        if (e.target === m) closeAllCommonModals();
      });
    }
  });

  // 페이지 인스턴스 초기화 헬퍼
  function setupPage(pageKey, defaultData) {
    const storageKey = `cy_crack_${pageKey}_data`;
    let pageData = { ...defaultData };

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        pageData = { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {
      pageData = { ...defaultData };
    }

    function save() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(pageData));
      } catch (e) {
        console.warn(`[${pageKey}] Save failed:`, e);
      }
    }

    // DOM 요소 바인딩
    const prefix = pageKey; // "page1" or "page2"
    const titleEl = document.getElementById(`${prefix}TitleText`);
    const imgEl = document.getElementById(`${prefix}MainImg`);
    const imgContainer = document.getElementById(`${prefix}ImageContainer`);
    const fileInput = document.getElementById(`${prefix}FileInput`);
    const miniCountEl = document.getElementById(`${prefix}MiniCountText`);
    const linkAnchor = document.getElementById(`${prefix}SurpriseLinkAnchor`);
    const ilchonContainer = document.getElementById(`${prefix}IlchonList`);
    const ilchonAddForm = document.getElementById(`${prefix}IlchonForm`);
    const ilchonAddAuthor = document.getElementById(`${prefix}IlchonAuthor`);
    const ilchonAddText = document.getElementById(`${prefix}IlchonText`);

    // 1) 렌더링 함수
    function render() {
      // 1. 제목
      if (titleEl) titleEl.textContent = pageData.title;
      // 2. 메인 이미지
      if (imgEl && pageData.image) imgEl.src = pageData.image;
      // 3. 미니홈수 & 깜짝링크
      if (miniCountEl) miniCountEl.textContent = pageData.miniCount;
      if (linkAnchor) {
        linkAnchor.textContent = pageData.surpriseLinkText;
        linkAnchor.href = pageData.surpriseLinkUrl || "#";
      }
      // 4. 일촌평 목록
      renderIlchonList();
    }

    // 일촌평 목록 렌더링
    function renderIlchonList() {
      if (!ilchonContainer) return;
      ilchonContainer.innerHTML = "";

      const list = pageData.ilchonList || [];
      list.forEach((item) => {
        const row = document.createElement("div");
        row.className = "cy-ilchon-item";

        row.innerHTML = `
          <div class="cy-ilchon-text-left">
            <span class="cy-ilchon-bullet">&bull;</span>
            <span class="cy-ilchon-comment-text">${escapeHtml(item.comment)}</span>
            <span class="cy-ilchon-author-tag">(${escapeHtml(item.author)})</span>
            <span class="cy-ilchon-date-tag">${escapeHtml(item.date || "")}</span>
          </div>
          <div class="cy-ilchon-actions">
            <button type="button" class="cy-text-action-btn edit-btn" title="수정">수정</button>
            <button type="button" class="cy-text-action-btn del-btn" title="삭제">삭제</button>
          </div>
        `;

        // 수정 클릭
        row.querySelector(".edit-btn").addEventListener("click", () => {
          activeModalPage = pageKey;
          activeIlchonEditItem = item;
          if (ilchonAuthorInput) ilchonAuthorInput.value = item.author;
          if (ilchonTextInput) ilchonTextInput.value = item.comment;
          if (ilchonModal) ilchonModal.classList.add("active");
        });

        // 삭제 클릭
        row.querySelector(".del-btn").addEventListener("click", () => {
          if (confirm("이 일촌평을 삭제하시겠습니까?")) {
            pageData.ilchonList = pageData.ilchonList.filter((i) => i.id !== item.id);
            save();
            renderIlchonList();
          }
        });

        ilchonContainer.appendChild(row);
      });
    }

    // 2) 이미지 교체 바인딩
    if (imgContainer && fileInput) {
      imgContainer.addEventListener("click", () => fileInput.click());

      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          pageData.image = event.target.result;
          save();
          render();
        };
        reader.readAsDataURL(file);
      });
    }

    // 3) 일촌평 등록 폼
    if (ilchonAddForm) {
      ilchonAddForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const author = ilchonAddAuthor ? ilchonAddAuthor.value.trim() : "";
        const comment = ilchonAddText ? ilchonAddText.value.trim() : "";
        if (!author || !comment) return;

        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

        const newItem = {
          id: `${prefix}_${Date.now()}`,
          author: author,
          comment: comment,
          date: dateStr
        };

        if (!pageData.ilchonList) pageData.ilchonList = [];
        pageData.ilchonList.unshift(newItem);
        save();
        renderIlchonList();

        if (ilchonAddText) ilchonAddText.value = "";
      });
    }

    // 4) 전역 버튼 트리거 연결
    document.querySelectorAll(`.btn-edit-title[data-page="${pageKey}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        activeModalPage = pageKey;
        if (titleInput) titleInput.value = pageData.title;
        if (titleModal) titleModal.classList.add("active");
        if (titleInput && typeof titleInput.focus === "function") titleInput.focus();
      });
    });

    document.querySelectorAll(`.btn-edit-link[data-page="${pageKey}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        activeModalPage = pageKey;
        if (miniCountInput) miniCountInput.value = pageData.miniCount;
        if (surpriseTextInput) surpriseTextInput.value = pageData.surpriseLinkText;
        if (surpriseUrlInput) surpriseUrlInput.value = pageData.surpriseLinkUrl || "";
        if (linkModal) linkModal.classList.add("active");
      });
    });

    // 렌더링 실행
    render();

    return {
      getPageData: () => pageData,
      updateTitle: (newTitle) => {
        pageData.title = newTitle;
        save();
        render();
      },
      updateLinks: (miniCount, linkText, linkUrl) => {
        pageData.miniCount = miniCount;
        pageData.surpriseLinkText = linkText;
        pageData.surpriseLinkUrl = linkUrl;
        save();
        render();
      },
      updateIlchonItem: (itemId, author, comment) => {
        const item = (pageData.ilchonList || []).find((i) => i.id === itemId);
        if (item) {
          item.author = author;
          item.comment = comment;
          save();
          renderIlchonList();
        }
      }
    };
  }

  // 1. Page 1 (아이콘 1) 인스턴스 초기화
  const page1Instance = setupPage("page1", cfg.page1 || {
    title: "나 함정에 빠진거같아...",
    image: "assets/images/miniroom_crack.svg",
    miniCount: "미니홈수 [1]",
    surpriseLinkText: "깜짝링크 [0]",
    surpriseLinkUrl: "https://www.cyworld.com",
    ilchonList: [
      { id: "p1_1", comment: "일촌평 남겨주면 서울 갈때마다 잔디세탁에 교복 맡길게ㅋㅋㅋㅋ", author: "신서혜", date: "2026.10.31" },
      { id: "p1_2", comment: "윤지후나한테줘", author: "평생지기 홍슬기", date: "2026.10.30" },
      { id: "p1_3", comment: "나.. 구조표 친구다 니들이 서민이냐?", author: "서민.. 김상현", date: "2026.10.29" },
      { id: "p1_4", comment: "우리잔디 어디갔어 유치원때 나괴롭히던 원장아들혼내준것도 다 정의소녀 금잔디였잖아", author: "베프 추가을", date: "2026.10.28" },
      { id: "p1_5", comment: "잔디씨 내부탁 잊지 말아요", author: "우상 민서현", date: "2026.10.27" }
    ]
  });

  // 2. Page 2 (아이콘 2) 인스턴스 초기화 (완전 독립 데이터)
  const page2Instance = setupPage("page2", cfg.page2 || {
    title: "순정만화 엑스트라의 은밀한 이중생활 ★",
    image: "assets/images/category2_poster.svg",
    miniCount: "미니홈수 [14]",
    surpriseLinkText: "깜짝링크 [도서관 비밀통로 ▶]",
    surpriseLinkUrl: "category1.html",
    ilchonList: [
      { id: "p2_1", comment: "오늘 도서관 3층 구석에서 마주친 거 비밀로 해줄게.", author: "서브남주 (학생회장)", date: "2026.10.31" },
      { id: "p2_2", comment: "여주야 이번 주말에 F4 연습실 놀러 올래? 맛있는 거 사줄게!", author: "송우빈 (일진 보스)", date: "2026.10.30" },
      { id: "p2_3", comment: "내가 빚은 도자기 화병 깨뜨리지 마라... 비싼 거다.", author: "소이정 (도예가)", date: "2026.10.29" }
    ]
  });

  // 모달 서밋 핸들러
  if (titleForm) {
    titleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = titleInput ? titleInput.value.trim() : "";
      if (!val) return;

      if (activeModalPage === "page1") {
        page1Instance.updateTitle(val);
      } else if (activeModalPage === "page2") {
        page2Instance.updateTitle(val);
      }
      closeAllCommonModals();
    });
  }

  if (linkForm) {
    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const miniCount = miniCountInput ? miniCountInput.value.trim() : "";
      const linkText = surpriseTextInput ? surpriseTextInput.value.trim() : "";
      const linkUrl = surpriseUrlInput ? surpriseUrlInput.value.trim() : "";

      if (activeModalPage === "page1") {
        page1Instance.updateLinks(miniCount, linkText, linkUrl);
      } else if (activeModalPage === "page2") {
        page2Instance.updateLinks(miniCount, linkText, linkUrl);
      }
      closeAllCommonModals();
    });
  }

  if (ilchonForm) {
    ilchonForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const author = ilchonAuthorInput ? ilchonAuthorInput.value.trim() : "";
      const comment = ilchonTextInput ? ilchonTextInput.value.trim() : "";
      if (!author || !comment || !activeIlchonEditItem) return;

      if (activeModalPage === "page1") {
        page1Instance.updateIlchonItem(activeIlchonEditItem.id, author, comment);
      } else if (activeModalPage === "page2") {
        page2Instance.updateIlchonItem(activeIlchonEditItem.id, author, comment);
      }
      closeAllCommonModals();
    });
  }
}

// ========================================================
// [4] 아이콘 3 & 아이콘 4 사진·동영상 갤러리 시스템 (IndexedDB 영구 저장)
// - 사진과 동영상 다중 파일 연속 추가 (accept="image/*,video/*", multiple)
// - 정사각형 썸네일 (object-fit: cover) & 동영상 재생 아이콘 배지 (▶ VIDEO)
// - 최근 추가한 순서대로 자동 정렬 (최신순)
// - 썸네일 클릭 시 원본 모달 창 (사진 해상도 보존, 동영상 재생, 닫기/ESC/바깥클릭)
// - 아이콘 3과 아이콘 4 서로 완전 독립 관리
// ========================================================
function initGalleries() {
  const cfg = window.CATEGORY2_CONFIG || {};

  // 원본 미리보기 모달 요소들
  const mediaModal = document.getElementById("cyMediaModal");
  const modalTitle = document.getElementById("cyMediaModalTitle");
  const modalBody = document.getElementById("cyMediaModalBody");
  const closeBtn = document.getElementById("closeCyMediaModal");
  const confirmBtn = document.getElementById("confirmCyMediaModalBtn");
  const delBtn = document.getElementById("delCyMediaModalBtn");

  let currentActiveGallery = null; // { deleteItem(id) }
  let activeModalItem = null;

  function closeModal() {
    if (mediaModal) mediaModal.classList.remove("active");
    if (modalBody) modalBody.innerHTML = "";
    activeModalItem = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (confirmBtn) confirmBtn.addEventListener("click", closeModal);
  if (mediaModal) {
    mediaModal.addEventListener("click", (e) => {
      if (e.target === mediaModal) closeModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.keyCode === 27) {
      closeModal();
    }
  });

  if (delBtn) {
    delBtn.addEventListener("click", () => {
      if (activeModalItem && currentActiveGallery) {
        if (confirm("이 미디어를 삭제하시겠습니까?")) {
          currentActiveGallery.deleteItem(activeModalItem.id);
          closeModal();
        }
      }
    });
  }

  // IndexedDB 헬퍼
  function openDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) return resolve(null);
      const req = indexedDB.open("RetroMediaStorageDB", 2);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("media_stores")) {
          db.createObjectStore("media_stores", { keyPath: "id" });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    });
  }

  // 갤러리 인스턴스 셋업
  async function setupGallery(options) {
    const { storageKey, fileInputId, btnUploadId, gridId, countId, initialItems } = options;
    const db = await openDB();
    let items = [];

    // 불러오기
    if (db) {
      try {
        const record = await new Promise((resolve) => {
          const tx = db.transaction("media_stores", "readonly");
          const store = tx.objectStore("media_stores");
          const req = store.get(storageKey);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });

        if (record && Array.isArray(record.items) && record.items.length > 0) {
          items = record.items.map((it) => {
            if (it.blob) {
              return {
                ...it,
                blob: it.blob,
                url: URL.createObjectURL(it.blob)
              };
            }
            return it;
          });
        } else {
          items = [...initialItems];
        }
      } catch (e) {
        items = [...initialItems];
      }
    } else {
      items = [...initialItems];
    }

    items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    async function save() {
      if (!db) return;
      try {
        const toSave = items.map((it) => {
          if (it.blob) {
            return {
              id: it.id,
              type: it.type,
              name: it.name,
              timestamp: it.timestamp,
              blob: it.blob
            };
          }
          return {
            id: it.id,
            type: it.type,
            name: it.name,
            timestamp: it.timestamp,
            url: it.url
          };
        });

        await new Promise((resolve, reject) => {
          const tx = db.transaction("media_stores", "readwrite");
          const store = tx.objectStore("media_stores");
          const req = store.put({ id: storageKey, items: toSave });
          req.onsuccess = () => resolve();
          req.onerror = (err) => reject(err);
        });
      } catch (e) {
        console.warn("[Gallery] Save failed:", e);
      }
    }

    const grid = document.getElementById(gridId);
    const countEl = document.getElementById(countId);
    const fileInput = document.getElementById(fileInputId);
    const btnUpload = document.getElementById(btnUploadId);

    function render() {
      if (countEl) countEl.textContent = `총 ${items.length}개의 미디어`;
      if (!grid) return;
      grid.innerHTML = "";

      if (items.length === 0) {
        grid.innerHTML = `
          <div class="cy-empty-gallery">
            <p style="font-weight:bold; margin-bottom:4px;">★ 등록된 사진 및 동영상이 없습니다 ★</p>
            <p>위의 [ 📁 사진 / 동영상 추가 ] 버튼을 눌러 사진이나 영상을 추가해 보세요!</p>
          </div>
        `;
        return;
      }

      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "cy-media-card";
        card.title = `${item.name} (클릭하여 원본 보기)`;

        if (item.type === "video") {
          card.innerHTML = `
            <video src="${item.url}#t=0.1" class="cy-thumbnail-media" preload="metadata" muted playsinline></video>
            <div class="cy-video-badge"><span>▶</span> VIDEO</div>
            <button type="button" class="cy-media-del-btn" title="삭제">&times;</button>
          `;
        } else {
          card.innerHTML = `
            <img src="${item.url}" alt="${escapeHtml(item.name)}" class="cy-thumbnail-media" loading="lazy">
            <button type="button" class="cy-media-del-btn" title="삭제">&times;</button>
          `;
        }

        // 썸네일 클릭 시 원본 모달 열기
        card.addEventListener("click", (e) => {
          if (e.target.classList.contains("cy-media-del-btn")) return;
          openMediaModal(item, galleryInstance);
        });

        // 삭제 버튼 클릭
        card.querySelector(".cy-media-del-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("이 미디어를 삭제하시겠습니까?")) {
            galleryInstance.deleteItem(item.id);
          }
        });

        grid.appendChild(card);
      });
    }

    // 파일 업로드 바인딩 (다중 파일 연속 추가)
    if (btnUpload && fileInput) {
      btnUpload.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newItems = [];
        const now = Date.now();
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const isVideo = f.type.startsWith("video/");
          const isImage = f.type.startsWith("image/");
          if (!isImage && !isVideo) continue;

          newItems.push({
            id: `media_${now}_${i}_${Math.random().toString(36).substr(2, 5)}`,
            type: isVideo ? "video" : "image",
            url: URL.createObjectURL(f),
            name: f.name || "미디어 파일",
            timestamp: now + i,
            blob: f
          });
        }

        if (newItems.length > 0) {
          items = [...newItems.reverse(), ...items];
          await save();
          render();
        }
        fileInput.value = "";
      });
    }

    const galleryInstance = {
      deleteItem: async (id) => {
        items = items.filter((it) => it.id !== id);
        await save();
        render();
      }
    };

    render();
    return galleryInstance;
  }

  function openMediaModal(item, galleryInstance) {
    if (!mediaModal || !modalBody) return;
    currentActiveGallery = galleryInstance;
    activeModalItem = item;

    if (modalTitle) modalTitle.textContent = `${item.name} (${item.type === "video" ? "동영상 원본" : "사진 원본"})`;
    modalBody.innerHTML = "";

    if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.url;
      video.className = "cy-modal-video";
      video.controls = true;
      video.autoplay = true;
      modalBody.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.name;
      img.className = "cy-modal-img";
      modalBody.appendChild(img);
    }

    mediaModal.classList.add("active");
  }

  // 1) 갤러리 3 (아이콘 3: 사진첩)
  setupGallery({
    storageKey: "cy_crack_gallery_cat3",
    fileInputId: "galleryFileInput3",
    btnUploadId: "btnUploadGallery3",
    gridId: "galleryGrid3",
    countId: "galleryCount3",
    initialItems: cfg.gallery3 || []
  });

  // 2) 갤러리 4 (아이콘 4: 동영상) - 완전 독립
  setupGallery({
    storageKey: "cy_crack_gallery_cat4",
    fileInputId: "galleryFileInput4",
    btnUploadId: "btnUploadGallery4",
    gridId: "galleryGrid4",
    countId: "galleryCount4",
    initialItems: cfg.gallery4 || []
  });
}

// ========================================================
// [5] 아이콘 5 글 목록 페이지 시스템 (게시판/다이어리)
// - 글과 글 사이는 네모난 카드가 아닌 얇은 회색 가로선 구분
// - 제목, 본문, 작성 날짜 자동 기록
// - 최신순 자동 정렬
// - 수정 및 삭제 지원
// ========================================================
function initBoard() {
  const cfg = window.CATEGORY2_CONFIG || {};
  const storageKey = "cy_crack_posts_cat5";
  const initialPosts = cfg.posts5 || [
    {
      id: "post_5_1",
      title: "오늘 급식 메뉴 스파게티 나온대 ㅋㅋㅋ",
      date: "2026.10.31",
      timestamp: Date.now() - 1800000,
      content: "오늘 점심 급식에 치즈오븐 스파게티랑 마늘빵 나온다고 하네.\n점심시간 종 치자마자 식당으로 달릴 파티원 구함! (1/4)"
    },
    {
      id: "post_5_2",
      title: "도서관 3층 구석 자리에 은발 누구냐? 혹시 걔임?",
      date: "2026.10.30",
      timestamp: Date.now() - 86400000,
      content: "어제 5교시 끝나고 도서관 갔는데 창가 자리에 후광 비치는 사람이 앉아있더라.\n설마 원작 서브남주인가? 모르는 척하고 조용히 빠져나왔다 휴..."
    }
  ];

  let posts = [];
  try {
    const saved = localStorage.getItem(storageKey);
    posts = saved ? JSON.parse(saved) : initialPosts;
  } catch (e) {
    posts = initialPosts;
  }

  posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(posts));
    } catch (e) {
      console.warn("[Board] Save failed:", e);
    }
  }

  const container = document.getElementById("cyPostListContainer");
  const countEl = document.getElementById("cyBoardCountDisplay");
  const form = document.getElementById("cyBoardForm");
  const titleInput = document.getElementById("cyBoardTitleInput");
  const contentInput = document.getElementById("cyBoardContentInput");

  // 수정 모달 요소들
  const editModal = document.getElementById("cyPostEditModal");
  const editForm = document.getElementById("cyPostEditForm");
  const editTitleInput = document.getElementById("editPostTitleInput");
  const editContentInput = document.getElementById("editPostContentInput");
  const closeEditBtn = document.getElementById("closeCyPostEditModal");
  const cancelEditBtn = document.getElementById("cancelCyPostEditBtn");
  let activeEditingPost = null;

  function closeEditModal() {
    if (editModal) editModal.classList.remove("active");
    activeEditingPost = null;
  }

  if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);
  if (editModal) {
    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) closeEditModal();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!activeEditingPost) return;
      const title = editTitleInput ? editTitleInput.value.trim() : "";
      const content = editContentInput ? editContentInput.value.trim() : "";
      if (!title || !content) return;

      activeEditingPost.title = title;
      activeEditingPost.content = content;
      save();
      render();
      closeEditModal();
    });
  }

  function render() {
    if (countEl) countEl.textContent = `총 ${posts.length}개의 글`;
    if (!container) return;
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:#888888; font-size:11px;">
          ★ 작성된 게시글이 없습니다. 상단에서 첫 글을 남겨보세요! ★
        </div>
      `;
      return;
    }

    posts.forEach((post) => {
      const item = document.createElement("article");
      item.className = "cy-post-item";

      item.innerHTML = `
        <div class="cy-post-title-row">
          <h3 class="cy-post-title">${escapeHtml(post.title)}</h3>
          <div class="cy-post-meta-row">
            <span class="cy-post-date">${escapeHtml(post.date || "")}</span>
            <div class="cy-post-actions">
              <button type="button" class="cy-text-action-btn edit-post-btn" title="글 수정">수정</button>
              <button type="button" class="cy-text-action-btn del-post-btn" title="글 삭제">삭제</button>
            </div>
          </div>
        </div>
        <div class="cy-post-content">${escapeHtml(post.content)}</div>
      `;

      // 수정 버튼
      item.querySelector(".edit-post-btn").addEventListener("click", () => {
        activeEditingPost = post;
        if (editTitleInput) editTitleInput.value = post.title;
        if (editContentInput) editContentInput.value = post.content;
        if (editModal) editModal.classList.add("active");
        if (editTitleInput && typeof editTitleInput.focus === "function") editTitleInput.focus();
      });

      // 삭제 버튼
      item.querySelector(".del-post-btn").addEventListener("click", () => {
        if (confirm("이 글을 삭제하시겠습니까?")) {
          posts = posts.filter((p) => p.id !== post.id);
          save();
          render();
        }
      });

      container.appendChild(item);
    });
  }

  // 새 글 등록
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = titleInput ? titleInput.value.trim() : "";
      const content = contentInput ? contentInput.value.trim() : "";
      if (!title || !content) return;

      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

      const newPost = {
        id: `post_${Date.now()}`,
        title: title,
        content: content,
        date: dateStr,
        timestamp: Date.now()
      };

      posts.unshift(newPost);
      save();
      render();

      if (titleInput) titleInput.value = "";
      if (contentInput) contentInput.value = "";
    });
  }

  render();
}

// 4. 파도타기 셀렉트 박스
function initSurfSelect() {
  const selectBox = document.getElementById("surfSelectBox");
  if (!selectBox) return;

  selectBox.addEventListener("change", (e) => {
    const val = e.target.value;
    if (!val) return;

    if (val.endsWith(".html")) {
      window.location.href = val;
    } else {
      const selectedName = selectBox.options[selectBox.selectedIndex].text;
      alert(`[파도타기] ${selectedName} 님의 미니홈피로 파도타기를 시도합니다!\n(현재 Crack High school 내에서 연결 준비 중입니다 ★)`);
      selectBox.value = "";
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
