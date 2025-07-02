const allSections = [
  { file: "data/server1-thai.json", id: "server1-thai", title: "หนังไทย" },
  { file: "data/server1-en.json", id: "server1-en", title: "หนังฝรั่ง" },
  { file: "data/server1-china.json", id: "server1-china", title: "หนังจีน" },
  { file: "data/server1-korea.json", id: "server1-korea", title: "หนังเกาหลี" },
  { file: "data/server1-asia.json", id: "server1-asia", title: "หนังเอเชีย" },
  { file: "data/server1-cartoon.json", id: "server1-cartoon", title: "การ์ตูน" },
  { file: "data/server2-thai.json", id: "server2-thai", title: "หนังไทย" },
  { file: "data/server2-inter.json", id: "server2-inter", title: "หนังฝรั่ง" },
  { file: "data/server2-asia.json", id: "server2-asia", title: "หนังเอเชีย" },
  { file: "data/server2-cartoon.json", id: "server2-cartoon", title: "การ์ตูน" }
];

const container = document.getElementById("accordion-container");

const params = new URLSearchParams(location.search);
const keyword = (params.get("q") || "").trim().toLowerCase();

if (keyword) {
  searchBox.value = keyword;
  performSearch(keyword);
}

let allMovies = [];

allSections.forEach(({ file, id, title }) => {
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

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu");
  const overlay = document.querySelector(".overlay");
  const toggle = document.getElementById("hamburger");

  if (!menu || !toggle || !overlay) return;

  // ✅ toggle menu
  toggle.addEventListener("click", () => {
    menu.classList.toggle("show");
  });

  // ✅ คลิกนอกเมนู (overlay) เพื่อปิด
  overlay.addEventListener("click", () => {
    menu.classList.remove("show");
  });

  // ✅ คลิกลิงก์เมนู → ปิดเมนู
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("show");
    });
  });
});