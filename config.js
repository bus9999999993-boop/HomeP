/**
 * ========================================================
 * [CONFIG.JS] 레트로 홈페이지 통합 설정 파일
 * ========================================================
 * 💡 초보자 가이드:
 * 아래 따옴표(" ") 안의 글자나 이미지 파일 경로를 원하는 내용으로 변경하면
 * 웹사이트에 즉시 반영됩니다!
 */

// ========================================================
// [1] 카테고리 1 (萬事屋) 전용 설정 - 平安時代 (헤이안 일본풍) 테마
// ========================================================
const CATEGORY1_CONFIG = {
  // 1) 화면 중앙 큰 이미지 영역의 '헤이안 에마키 메인 배경'
  backgroundImage: "assets/images/yorozuya_bg.svg",

  // 2) 큰 이미지 영역 안에 배치되는 '4개의 클릭 가능한 헤이안 바로가기 아이콘'
  icons: [
    {
      id: "cat1_icon_1",
      title: "📜 願書 의뢰소",
      subTitle: "絵巻 · REQUESTS",
      image: "assets/images/cat1_icon1.svg", // 👈 1번 의뢰소 두루마리
      link: "cat1_sub1.html"                 // 👈 클릭 시 이동할 페이지
    },
    {
      id: "cat1_icon_2",
      title: "📸 浮世 화랑",
      subTitle: "風流 · GALLERY",
      image: "assets/images/cat1_icon2.svg", // 👈 2번 우키요 화랑
      link: "cat1_sub2.html"                 // 👈 클릭 시 이동할 페이지
    },
    {
      id: "cat1_icon_3",
      title: "🎏 平安 일기",
      subTitle: "随筆 · DIARY",
      image: "assets/images/cat1_icon3.svg", // 👈 3번 수필 일기
      link: "cat1_sub3.html"                 // 👈 클릭 시 이동할 페이지
    },
    {
      id: "cat1_icon_4",
      title: "🍡 萬事 人物",
      subTitle: "仲間 · MEMBERS",
      image: "assets/images/cat1_icon4.svg", // 👈 4번 만사옥 인물록
      link: "cat1_sub4.html"                 // 👈 클릭 시 이동할 페이지
    }
  ]
};

// ========================================================
// [2] 카테고리 2 (Crack High school) 싸이월드 미니홈피 설정
// 💡 팁: 사진, 소개글, 미니홈피 제목, 오른쪽 탭 이름을 여기서 모두 변경할 수 있습니다!
// ========================================================
const CATEGORY2_CONFIG = {
  // 1) 상단 미니홈피 한 줄 제목
  hompyTitle: "나 함정에 빠진 거 같아... 왜 엑스트라한테 자꾸 집착해?!",

  // 2) 프로필 영역 기본 설정 (홈페이지 이름, 사용자 이름, 글귀, 기분, 사진)
  hompyName: "Crack High school",                     // 👈 1. 홈페이지 이름
  ownerName: "여주 (엑스트라)",                         // 👈 2. 사용자 이름
  introText: "순정만화 속 엑스트라로 빙의했다.\n조용히 졸업만 하고 싶은데...\n자꾸만 주인공들이 얽혀온다?!", // 👈 3. 짧은 자기소개 또는 글귀
  todayFeeling: "⚡ 빙의됨",                             // 👈 TODAY IS... 기분 문구
  profileImage: "assets/images/crack_profile.svg",     // 👈 원하는 프로필 사진 경로

  // 3) 미니룸 배경 이미지
  miniroomImage: "assets/images/miniroom_crack.svg",

  // 4) BGM 제목
  bgmTitle: "프리스타일 - Y (Please Tell Me Why)",

  // 5) ★ 오른쪽 카테고리 탭 이름 (홈 -> 성훈, 프로필 -> 바다, 사진첩, 동영상, 게시판)
  tabs: [
    { id: "home", name: "성훈" },
    { id: "profile", name: "바다" },
    { id: "photo", name: "사진첩" },
    { id: "board", name: "동영상" },
    { id: "guestbook", name: "게시판" }
  ],

  // ★ 페이지별(탭별) 왼쪽 프로필 기본 설정 (형태는 동일하되, 사진/글은 페이지마다 독립적 편집 가능)
  profiles: {
    home: {
      hompyName: "Crack High school - 성훈",
      ownerName: "성훈 (재벌 후계자)",
      introText: "순정만화 속 엑스트라로 빙의했다.\n조용히 졸업만 하고 싶은데...\n자꾸만 주인공들이 얽혀온다?!",
      todayFeeling: "⚡ 빙의됨",
      profileImage: "assets/images/crack_profile.svg"
    },
    profile: {
      hompyName: "Crack High school - 바다",
      ownerName: "바다 (학생회장)",
      introText: "조용한 도서관이 제일 좋아.\n엑스트라라고 불러도 상관없어.\n내 갈 길은 내가 정하니까.",
      todayFeeling: "📖 독서중",
      profileImage: "assets/images/category2_poster.svg"
    },
    photo: {
      hompyName: "Crack High - 사진 갤러리",
      ownerName: "포토부 여주",
      introText: "찰칵! 순간을 영원으로 기록하는\nCrack High 사진부 아카이브.\n(불펌 및 무단도용 금지!)",
      todayFeeling: "📷 찰칵",
      profileImage: "assets/images/cat1_icon1.svg"
    },
    board: {
      hompyName: "Crack High - 영상 갤러리",
      ownerName: "방송부 여주",
      introText: "Crack High 축제 및 일상 영상 기록소.\n그 시절 캠코더 감성 그대로!",
      todayFeeling: "🎬 촬영중",
      profileImage: "assets/images/cat1_icon2.svg"
    },
    guestbook: {
      hompyName: "Crack High - 다이어리 & 게시판",
      ownerName: "여주 (기록자)",
      introText: "순정만화 속 일상 생존 일기.\n하루하루를 차분히 남겨봅니다.",
      todayFeeling: "✍️ 끄적끄적",
      profileImage: "assets/images/cat1_icon4.svg"
    }
  },

  // 6) ★ 아이콘 1 (성훈) 전용 데이터 (제목, 메인 이미지, 미니홈수, 깜짝링크, 일촌평)
  page1: {
    title: "나 함정에 빠진거같아... (성훈)",
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
  },

  // 7) ★ 아이콘 2 (바다) 전용 데이터 (성훈 페이지와 형식이 100% 동일하며, 독립 동작)
  page2: {
    title: "순정만화 엑스트라의 은밀한 이중생활 ★ (바다)",
    image: "assets/images/category2_poster.svg",
    miniCount: "미니홈수 [14]",
    surpriseLinkText: "깜짝링크 [도서관 비밀통로 ▶]",
    surpriseLinkUrl: "category1.html",
    ilchonList: [
      { id: "p2_1", comment: "오늘 도서관 3층 구석에서 마주친 거 비밀로 해줄게.", author: "서브남주 (학생회장)", date: "2026.10.31" },
      { id: "p2_2", comment: "바다야 이번 주말에 F4 연습실 놀러 올래? 맛있는 거 사줄게!", author: "송우빈 (일진 보스)", date: "2026.10.30" },
      { id: "p2_3", comment: "내가 빚은 도자기 화병 깨뜨리지 마라... 비싼 거다.", author: "소이정 (도예가)", date: "2026.10.29" },
      { id: "p2_4", comment: "너 요즘 왜 나 피해? 옥상으로 따라와.", author: "구남주 (재벌 2세)", date: "2026.10.28" },
      { id: "p2_5", comment: "엑스트라 모임 회비 3,000원 이번 주 금요일까지 내세요~", author: "엑스트라 B", date: "2026.10.27" }
    ]
  },

  // 8) ★ 아이콘 3 (사진첩) 전용 갤러리 초기 데이터
  gallery3: [
    {
      id: "media_p3_1",
      type: "image",
      url: "assets/images/category2_poster.svg",
      name: "학교_축제_스냅.jpg",
      timestamp: Date.now() - 3600000
    },
    {
      id: "media_p3_2",
      type: "image",
      url: "assets/images/category1_poster.svg",
      name: "도서관_풍경.jpg",
      timestamp: Date.now() - 7200000
    },
    {
      id: "media_p3_3",
      type: "image",
      url: "assets/images/crack_profile.svg",
      name: "학생증_사진.jpg",
      timestamp: Date.now() - 10800000
    }
  ],

  // 9) ★ 아이콘 4 (동영상) 전용 갤러리 초기 데이터 (독립 동작)
  gallery4: [
    {
      id: "media_p4_1",
      type: "image",
      url: "assets/images/cat1_icon2.svg",
      name: "캠코더_촬영_클립1.mp4",
      timestamp: Date.now() - 5000000
    },
    {
      id: "media_p4_2",
      type: "image",
      url: "assets/images/cat1_icon3.svg",
      name: "밴드_공연_리허설.mp4",
      timestamp: Date.now() - 9000000
    }
  ],

  // 10) ★ 아이콘 5 (게시판/다이어리) 전용 글 목록 초기 데이터
  posts5: [
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
    },
    {
      id: "post_5_3",
      title: "순정만화 엑스트라 생존 모임 안내 (가입 환영)",
      date: "2026.10.28",
      timestamp: Date.now() - 259200000,
      content: "원작 메인 스토리나 F4랑 얽히지 않고 무사히 졸업하기 위한 엑스트라들의 정보 교류 모임입니다.\n주요 수칙: 복도에서 F4 마주치면 즉시 90도 회전하여 반대편 계단으로 이동하기."
    }
  ]
};

// ========================================================
// [3] 메인 홈페이지 기본 데이터 (index.html 연동)
// ========================================================
const DEFAULT_SITE_DATA = {
  // 상단 HOME 문구 및 한 줄 소개
  siteInfo: {
    homeTitle: "HOME",
    introText: "Ctrl + S : 그들과의 기억을 저장합니다."
  },

  // 왼쪽 D-DAY 영역 설정
  dday: {
    sectionTitle: "MY - DAY",
    items: [
      {
        id: "dday1",
        label: "🧹🍡⋆｡°✩♡",
        date: "2026-08-18" // YYYY-MM-DD 형식
      },
      {
        id: "dday2",
        label: "☀️🌊⋆｡°✩♡",
        date: "2026-10-15" // YYYY-MM-DD 형식
      }
    ]
  },

  // News 카테고리 포스터 카드 설정
  news: {
    sectionTitle: "News",
    categories: [
      {
        id: "category1",
        tag: "🎏 平安日和",
        title: "萬事屋",
        desc: "만사옥__일손 구함. 주술 가능자 우대. 단, 월급은 기대하지 말 것.",
        imageKey: "category1",
        link: "category1.html" // 👈 카테고리 1 클릭 시 이동할 페이지
      },
      {
        id: "category2",
        tag: "📖 순정만화 클리셰",
        title: "Crack High School",
        desc: "순정만화 속 엑스트라로 빙의했다.",
        imageKey: "category2",
        link: "category2.html" // 👈 카테고리 2 클릭 시 이동할 페이지
      }
    ]
  },

  // BGM 플레이어 (유튜브) 설정
  playlist: {
    title: "GReeeeN - キセキ",
    youtubeVideoId: "DwTinTO0o9I"
  },

  // 💡 메인 홈페이지 이미지 경로 설정 (원하는 이미지 파일명으로 교체 가능)
  images: {
    headerBanner: "assets/images/header_banner.svg",
    mainPhoto: "assets/images/큰이미지.png",
    subPhoto: "assets/images/네컷.png",
    sideBanner: "assets/images/side_banner.svg",
    sidePhoto: "assets/images/side_photo.svg",
    category1: "assets/images/category1_poster.svg",
    category2: "assets/images/category2_poster.svg"
  }
};

// ========================================================
// [3] 클라우드 연동 환경설정 (향후 확장용)
// ========================================================
const CLOUD_CONFIG = {
  provider: "local",
  database: {
    enabled: false,
    endpoint: "",
    apiKey: "",
    tableName: "retro_homepage_data"
  },
  storage: {
    enabled: false,
    endpoint: "",
    bucketName: "retro-assets"
  }
};

// 브라우저 전역 노출
window.CATEGORY1_CONFIG = CATEGORY1_CONFIG;
window.CATEGORY2_CONFIG = CATEGORY2_CONFIG;
window.DEFAULT_SITE_DATA = DEFAULT_SITE_DATA;
window.CLOUD_CONFIG = CLOUD_CONFIG;
