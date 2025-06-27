const sections = [
  { file: "data/thai.json", id: "thai", title: "🎬 หนังไทย" },
  { file: "data/en.json", id: "en", title: "🎥 หนังฝรั่ง" },
  { file: "data/asia.json", id: "asia", title: "🇰🇷 หนังเอเชีย" },
  { file: "data/cartoon.json", id: "cartoon", title: "🧸 การ์ตูน" },
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
      <a href="full.html?category=${id}&title=${encodeURIComponent(title)}" class="see-all-link">→</a>
    `;

    // ✅ Event พับ/ขยาย
    heading.addEventListener("click", () => {
      content.classList.toggle("show");
    });

    const content = document.createElement("div");
    content.className = "accordion-content show"; // เปิดไว้ตอนโหลด

    data.slice(0, 36).forEach(movie => {
      const div = document.createElement("div");
      div.className = "movie";
      div.innerHTML = `
        <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&subtitle=${encodeURIComponent(movie.subtitle || '')}">
          <img src="${movie.image}" alt="${movie.name}">
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
  if (!keyword) return location.reload();

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
        <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&subtitle=${encodeURIComponent(movie.subtitle || '')}">
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