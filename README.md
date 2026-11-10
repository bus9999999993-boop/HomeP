# ★ 2000s Y2K Retro Personal Homepage ★

2000년대 감성을 담은 연하늘(Sky Blue) & 연노랑(Cream Yellow) 테마의 3단 개인 홈페이지 프로젝트입니다.  
곡선 없는 완전한 각진 네모 박스, 도트 패턴 배경, BGM 플레이어, D-DAY 카운터, 포스터형 카테고리 공간을 제공합니다.

---

## 📂 파일 및 폴더 구조

```text
├── index.html            # 메인 HTML 마크업 (3단 반응형 레이아웃)
├── style.css             # 레트로 Y2K 디자인 스타일시트 (곡선 제거, 도트 배경, 테마 색상)
├── category1.html        # 카테고리 1(萬事屋) 메인 (블랙 배경, 4개 클릭 가능한 아이콘)
├── category1.css         # 카테고리 1 메인 전용 스타일시트
├── category1.js          # 카테고리 1 배경 및 아이콘 동적 렌더링
├── cat1_sub1.html        # [1번 의뢰소] 사진/영상 갤러리 (크기 고정, 내부 스크롤, 모달)
├── cat1_sub2.html        # [2번 활동기록] 사진/영상 갤러리
├── cat1_sub3.html        # [3번 만사옥일기] 사진/영상 갤러리
├── cat1_sub4.html        # [4번 멤버이야기] 일반 텍스트 글터 (글 작성/목록/삭제)
├── category_gallery.css  # 서브페이지 공통 스타일시트 (고정 흰색 윈도우, 스크롤 잠금)
├── gallery_engine.js     # [엔진] IndexedDB 기반 미디어 영구 저장/썸네일/모달 엔진
├── post_engine.js        # [엔진] 글 작성/목록/삭제/영구 보존 엔진
├── category2.html        # [NEW] 카테고리 2(Crack High school) 싸이월드 미니홈피
├── category2.css         # [NEW] 싸이월드 레트로 바인더 스타일시트 (스티치 점선, 은색 링)
├── category2.js          # [NEW] 세로형 인덱스 탭 전환, 일촌평 및 방명록 인터랙션
├── config.js             # [설정] 기본 문구, D-DAY, BGM, 카테고리 1·2/메인 이미지 통합 설정
├── script.js             # [서비스 & 로직] DatabaseService, StorageService, UI 컨트롤러
├── assets/
│   └── images/           # 로컬 이미지 및 SVG 그래픽 에셋
└── README.md             # 프로젝트 안내 및 클라우드 연동 가이드
```

---

## 🎨 주요 특징 및 디자인 규칙

1. **완전한 각진 네모 (`border-radius: 0 !important`)**: 모든 박스와 버튼, 프레임에 둥근 곡선 없이 2000년대 정통 레트로 스타일 유지
2. **연하늘 & 연노랑 Y2K 컬러 팔레트**:
   - 배경: 연하늘 도트 패턴 (`#D8EEF8`, 도트 `#FFFFFF`)
   - 주요 테두리: 연하늘 실선 (`#7DC5E6`), 포인트 연노랑 (`#FFF2C2`, `#F7D478`)
   - 그림자: 각진 하드 섀도우 (`box-shadow: 4px 4px 0px #BFDFEE`)
3. **빈틈없는 3단 화면 구성**:
   - **LEFT**: BGM 플레이어 (유튜브 임베드) + 실시간 D-DAY 계산 카드 2개 + 하단 사진 공간
   - **CENTER**: HOME 일자 바 + 메인 액자 사진 + News 포스터 카테고리 카드 2개
   - **RIGHT**: 세로 롱 배너 + 하단 서브 사진 공간 (양쪽 사이드 하단까지 빈틈없이 채움)

---

## ⚙️ 기본 사용 방법 (초보자 가이드)

### 1. 문구, 디데이, 노래 바꾸기
`config.js` 파일을 메모장이나 VSCode로 열고 따옴표(`" "`) 안의 내용만 수정하면 됩니다:
- **소개글**: `DEFAULT_SITE_DATA.siteInfo.introText`
- **D-DAY**: `DEFAULT_SITE_DATA.dday.items` 안의 `label`과 `date` (예: `"2026-10-15"`)
- **BGM 노래**: `DEFAULT_SITE_DATA.playlist`의 `title`과 유튜브 영상 ID (`youtubeVideoId`)
- **News 카테고리**: `DEFAULT_SITE_DATA.news.categories` 내용 수정

### 2. 사진 교체하기
- `assets/images/` 폴더에 원하는 이미지를 넣은 후, `config.js`의 `DEFAULT_SITE_DATA.images` 경로를 수정합니다.
  - 메인 사진: `mainPhoto`
  - 디데이 밑 사진: `subPhoto`
  - 오른쪽 세로 배너: `sideBanner`
  - 오른쪽 하단 사진: `sidePhoto`

---

## ☁️ 클라우드 데이터베이스 & 파일 저장소(Storage) 연동 가이드

본 프로젝트는 추후 외부 공개 및 서비스 확장을 고려하여 **서비스 레이어 아키텍처(Layered Service Architecture)**로 설계되었습니다.  
현재는 외부 서버 없이도 독립 실행되지만, 추후 클라우드를 붙일 때 **HTML과 CSS를 전혀 수정하지 않고 `config.js`와 `script.js`의 서비스 계층만 연결**하면 됩니다.

```
[UI Layer (index.html / RetroApp)]
         ▲
         │ (추상화된 데이터 호출)
┌────────┴────────┐
│ DatabaseService │ ──► [현재: localStorage / DEFAULT_SITE_DATA]
│                 │ ──► [향후: Supabase DB / Firebase / REST API]
├─────────────────┤
│ StorageService  │ ──► [현재: assets/images/ 로컬 정적 파일]
│                 │ ──► [향후: Supabase Storage / AWS S3 / Cloudinary CDN]
└─────────────────┘
```

### 1. Supabase 연동 예시

#### (1) `config.js` 설정 활성화
```javascript
const CLOUD_CONFIG = {
  provider: "supabase", // 'local' -> 'supabase'로 변경
  database: {
    enabled: true,
    endpoint: "https://your-project.supabase.co",
    apiKey: "YOUR_SUPABASE_ANON_KEY",
    tableName: "homepage_content"
  },
  storage: {
    enabled: true,
    endpoint: "https://your-project.supabase.co/storage/v1/object/public",
    bucketName: "homepage-images"
  }
};
```

#### (2) `script.js` 내 `DatabaseService.fetchSiteData` 연결
```javascript
// script.js 내 DatabaseService.fetchSiteData 부분:
if (config.provider === "supabase" && config.database.enabled) {
  const res = await fetch(`${config.database.endpoint}/rest/v1/${config.database.tableName}?select=*`, {
    headers: {
      "apikey": config.database.apiKey,
      "Authorization": `Bearer ${config.database.apiKey}`
    }
  });
  const data = await res.json();
  if (data && data.length > 0) return data[0].payload;
}
```

#### (3) 스토리지 이미지 업로드 및 CDN 연결
`StorageService.resolveImageUrl(key)`가 자동으로 클라우드 버킷 URL을 반환하도록 설계되어 있으므로:
- 업로드된 이미지는 `https://your-project.supabase.co/storage/v1/object/public/homepage-images/{key}.png` 형태로 즉시 브라우저에 표시됩니다.

---

## 🚀 실행 방법

별도의 Node.js나 서버 설치 없이, `index.html` 파일을 더블 클릭하여 웹 브라우저(Chrome, Edge 등)로 열면 바로 작동합니다.
