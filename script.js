const sections = [
  { file: "data/thai.json", id: "thai", title: "หนังไทย" },
  { file: "data/en.json", id: "en", title: "หนังฝรั่ง" },
  { file: "data/china.json", id: "china", title: "หนังจีน" },
  { file: "data/korea.json", id: "korea", title: "หนังเกาหลี" }, 
  { file: "data/asia.json", id: "asia", title: "หนังเอเชีย" },
  { file: "data/cartoon.json", id: "cartoon", title: "การ์ตูน" },
];

const container = document.getElementById("accordion-container");
const searchInput = document.getElementById("searchInput");
let allMovies = [];

sections.forEach(({ file, id, title }) => {
  fetch(file).then(res => res.json()).then(data => {
    allMovies.push(...data);

    const section = document.createElement("section");
    section.className = "accordion";
    section.id = id;

    // ✅ สร้างหัวหมวดพร้อมปุ่ม "→"
    const heading = document.createElement("h2");
    heading.className = "accordion-header";
    heading.innerHTML = `
      <span class="header-title">${title}</span>
      <a href="full.html?category=${id}&title=${encodeURIComponent(title)}" class="see-all-link">ดูทั้งหมด →</a>
    `;

    // ✅ Event พับ/ขยาย
    heading.addEventListener("click", () => {
      content.classList.toggle("show");
    });

    const content = document.createElement("div");
    content.className = "accordion-content show"; // เปิดไว้ตอนโหลด

    // จำนวนเรื่อง ที่แสดงใน สไลด์
    data.slice(0, 10).forEach((movie, index) => {
      const isNew = index < 6; // 👈 ตรงนี้กำหนดว่า index 0-5 คือเรื่อง "ใหม่"
      const badgeNew = isNew ? `<span class="badge-new">NEW</span>` : "";

      const div = document.createElement("div");
      div.className = "movie";
      div.innerHTML = `
        <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&audio=${encodeURIComponent(movie.info || '')}">
        <div class="poster-container">
        <img src="${movie.image}" alt="${movie.name}">
        ${badgeNew}
        </div>
        <h4 title="${movie.name}">${movie.name}</h4>
        <span class="info">${movie.info || ""}</span>
        </a>
      `;
      content.appendChild(div);
    });

    section.appendChild(heading);
    section.appendChild(content);
    container.appendChild(section);
  });
});

// ✅ ค้นหาหนัง
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim().toLowerCase();
  container.innerHTML = "";

  if (!keyword) {
    // ถ้าไม่มีคำค้นหา ให้แสดงหมวดปกติใหม่
    sections.forEach(({ file, id, title }) => {
      fetch(file).then(res => res.json()).then(data => {
        const section = document.createElement("section");
        section.className = "accordion";
        section.id = id;

        const heading = document.createElement("h2");
        heading.className = "accordion-header";
        heading.innerHTML = `
          <span class="header-title">${title}</span>
          <a href="full.html?category=${id}&title=${encodeURIComponent(title)}" class="see-all-link">ดูทั้งหมด →</a>
        `;
        heading.addEventListener("click", () => {
          content.classList.toggle("show");
        });

        const content = document.createElement("div");
        content.className = "accordion-content show";
        data.slice(0, 10).forEach((movie, index) => {
          const isNew = index < 6;
          const badgeNew = isNew ? `<span class="badge-new">NEW</span>` : "";
          const div = document.createElement("div");
          div.className = "movie";
          div.innerHTML = `
            <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&audio=${encodeURIComponent(movie.info || '')}">
            <div class="poster-container">
            <img src="${movie.image}" alt="${movie.name}">
            ${badgeNew}
            </div>
            <h4 title="${movie.name}">${movie.name}</h4>
            <span class="info">${movie.info || ""}</span>
            </a>
          `;
          content.appendChild(div);
        });

        section.appendChild(heading);
        section.appendChild(content);
        container.appendChild(section);
      });
    });
    return;
  }

  // แสดงผลลัพธ์การค้นหา
  const resultSection = document.createElement("section");
  resultSection.className = "accordion";

  const heading = document.createElement("h2");
  heading.className = "accordion-header";
  heading.textContent = "🔍 ผลลัพธ์การค้นหา";

  const content = document.createElement("div");
  content.className = "accordion-content show";

  allMovies
    .filter(m => m.name.toLowerCase().includes(keyword))
    .forEach(movie => {
      const div = document.createElement("div");
      div.className = "movie";
      div.innerHTML = `
        <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&audio=${encodeURIComponent(movie.info || '')}">
          <img src="${movie.image}" alt="${movie.name}">
          <h4 title="${movie.name}">${movie.name}</h4>
          <span class="info">${movie.info || ""}</span>
        </a>
      `;
      content.appendChild(div);
    });

  resultSection.appendChild(heading);
  resultSection.appendChild(content);
  container.appendChild(resultSection);
});

function showContinueWatching() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("watch_"));
  if (keys.length === 0) return;

  const section = document.createElement("section");
  section.className = "accordion";
  section.id = "continue";

  const heading = document.createElement("h2");
  heading.className = "accordion-header";
  heading.textContent = "🎞️ ดูต่อ";
  // เพิ่ม event toggle
  heading.addEventListener("click", () => {
    content.classList.toggle("show");
  });

  const content = document.createElement("div");
  content.className = "accordion-content show";

  keys.forEach(k => {
    const watch = JSON.parse(localStorage.getItem(k));
    if (watch.duration > 60 && watch.currentTime < watch.duration - 30) {
      if (watch.duration === 0) return;
      const percent = Math.floor((watch.currentTime / watch.duration) * 100);

      const div = document.createElement("div");
      div.className = "movie";
      div.innerHTML = `
        <a href="player.html?name=${encodeURIComponent(watch.name)}&url=${encodeURIComponent(watch.url)}&image=${encodeURIComponent(watch.image)}&audio=${encodeURIComponent(watch.info || '')}">
          <img src="${watch.image}" alt="${watch.name}">
          <h4 title="${watch.name}">${watch.name}</h4>
          <span class="info">รับชมแล้ว ${percent}%</span>
          <div class="progress" style="width:${percent}%"></div>
        </a>
      `;
      content.appendChild(div);
    }
  });

  if (content.children.length > 0) {
    section.appendChild(heading);
    section.appendChild(content);
    container.prepend(section);
  }
}

showContinueWatching();

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favorites.length === 0) return;

  const section = document.createElement("section");
  section.className = "accordion";
  section.id = "favorites";

  const heading = document.createElement("h2");
  heading.className = "accordion-header";
  heading.textContent = "❤️ รายการโปรด";
  heading.addEventListener("click", () => {
    content.classList.toggle("show");
  });

  const content = document.createElement("div");
  content.className = "accordion-content show";

  favorites.forEach(movie => {
    const div = document.createElement("div");
    div.className = "movie";
    div.innerHTML = `
      <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image || '')}&audio=${encodeURIComponent(movie.info || '')}">
        <img src="${movie.image}" alt="${movie.name}">
        <h4>${movie.name}</h4>
      </a>
    `;
    content.appendChild(div);
  });

  section.appendChild(heading);
  section.appendChild(content);
  container.prepend(section);
}

showFavorites();

// marquee JS (ถ้ามี)
window.addEventListener("DOMContentLoaded", function () {
  const marquee = document.getElementById("marquee-text");
  if (!marquee) return;
  let pos = marquee.parentElement.offsetWidth;
  function animate() {
    pos--;
    marquee.style.left = pos + "px";
    if (pos < -marquee.offsetWidth) {
      pos = marquee.parentElement.offsetWidth;
    }
    requestAnimationFrame(animate);
  }
  animate();
});