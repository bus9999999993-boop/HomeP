/**
 * ========================================================
 * [CATEGORY1.JS] 카테고리 1 (萬事屋) 전용 스크립트
 * ========================================================
 * config.js의 CATEGORY1_CONFIG 설정을 읽어서
 * 화면 중앙 큰 이미지 영역의 배경 이미지와 4개 헤이안 사문(四門) 아이콘을 렌더링합니다.
 */

document.addEventListener("DOMContentLoaded", () => {
  const config = window.CATEGORY1_CONFIG || {
    backgroundImage: "assets/images/yorozuya_bg.svg",
    icons: [
      { id: "cat1_icon_1", title: "📜 願書 의뢰소", subTitle: "絵巻 · REQUESTS", image: "assets/images/cat1_icon1.svg", link: "cat1_sub1.html" },
      { id: "cat1_icon_2", title: "📸 浮世 화랑", subTitle: "風流 · GALLERY", image: "assets/images/cat1_icon2.svg", link: "cat1_sub2.html" },
      { id: "cat1_icon_3", title: "🎏 平安 일기", subTitle: "随筆 · DIARY", image: "assets/images/cat1_icon3.svg", link: "cat1_sub3.html" },
      { id: "cat1_icon_4", title: "🍡 萬事 人物", subTitle: "仲間 · MEMBERS", image: "assets/images/cat1_icon4.svg", link: "cat1_sub4.html" }
    ]
  };

  // 1. 메인 배경 이미지 적용
  const bgImgEl = document.getElementById("yorozuyaBgImg");
  if (bgImgEl && config.backgroundImage) {
    bgImgEl.src = config.backgroundImage;
  }

  // 2. 4개의 클릭 가능한 헤이안 사문(四門) 아이콘 렌더링
  const iconContainer = document.getElementById("category1IconsContainer");
  if (iconContainer && Array.isArray(config.icons)) {
    iconContainer.innerHTML = ""; // 기존 내용 초기화

    const kanjiNumbers = ["壱", "弐", "参", "肆"];

    config.icons.forEach((item, index) => {
      const linkEl = document.createElement("a");
      linkEl.href = item.link || item.targetUrl || "#";
      linkEl.className = "desktop-icon-btn";
      linkEl.setAttribute("id", item.id || `cat1_icon_${index + 1}`);
      linkEl.title = `${item.title} 페이지로 이동`;

      const imgSrc = item.image || item.iconImage || "";
      const subtitleText = item.subTitle || item.subtitle || "";
      const numLabel = kanjiNumbers[index] || (index + 1);

      linkEl.innerHTML = `
        <div class="desktop-icon-box">
          <img src="${imgSrc}" alt="${item.title}" class="desktop-icon-img">
          <span class="desktop-icon-number">${numLabel}</span>
        </div>
        <div class="desktop-icon-label-wrap">
          <span class="desktop-icon-title">${item.title}</span>
          <span class="desktop-icon-subtitle">${subtitleText}</span>
        </div>
      `;

      iconContainer.appendChild(linkEl);
    });
  }

  console.log("❖ 平安 萬事屋 (Yorozuya) 四門 및 배경화면 초기화 완료 ❖");
});
