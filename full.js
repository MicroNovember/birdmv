const qs = new URLSearchParams(location.search);
const category = qs.get("category");
const title = qs.get("title") || "";
const perPage = parseInt(qs.get("perPage") || "24");
let currentPage = parseInt(qs.get("page") || "1");

document.title = `${title} | ดูทั้งหมด - ⲦⲉⲁⲙⲦⲁlⲕ`;

const movieList = document.getElementById("movie-list");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

const allSections = [
  { file: "data/server1-thai.json", id: "server1-thai", title: "หนังไทย" },
  { file: "data/server1-en.json", id: "server1-en", title: "หนังฝรั่ง" },
  { file: "data/server1-china.json", id: "server1-china", title: "หนังจีน" },
  { file: "data/server1-korea.json", id: "server1-korea", title: "หนังเกาหลี" },
  { file: "data/server1-asia.json", id: "server1-asia", title: "หนังเอเชีย" },
  { file: "data/server1-cartoon.json", id: "server1-cartoon", title: "การ์ตูน" },
  { file: "data/server2-thai.json", id: "server2-thai", title: "หนังไทย" },
  { file: "data/server2-inter.json", id: "server2-en", title: "หนังฝรั่ง" },
  { file: "data/server2-asia.json", id: "server2-asia", title: "หนังเอเชีย" },
  { file: "data/server2-cartoon.json", id: "server2-cartoon", title: "การ์ตูน" }
];

const allMovies = [];

Promise.all(allSections.map(s => fetch(s.file).then(r => r.json())))
  .then(jsonArrays => {
    jsonArrays.forEach(arr => allMovies.push(...arr));
    renderMainCategory(); // default view
  });

// ✅ ฟังก์ชันแสดงหมวดปกติ
function renderMainCategory() {
  movieList.innerHTML = "";
  pagination.innerHTML = "";

  fetch(`data/${category}.json`)
    .then(res => res.json())
    .then(movies => {
      const perPageSelect = document.getElementById("perPageSelect");
      if (perPageSelect) {
        perPageSelect.value = perPage;
        perPageSelect.addEventListener("change", e => {
          const selected = e.target.value;
          qs.set("perPage", selected);
          qs.set("page", "1");
          location.search = qs.toString();
        });
      }

      const start = (currentPage - 1) * perPage;
      const end = start + perPage;
      const pageMovies = movies.slice(start, end);

      pageMovies.forEach(movie => {
        const div = document.createElement("div");
        div.className = "movie";
        div.innerHTML = `
          <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&audio=${encodeURIComponent(movie.info || '')}">
            <img src="${movie.image}" alt="${movie.name}" />
            <h4 title="${movie.name}">${movie.name}</h4>
            <span class="info">${movie.info || ""}</span>
          </a>
        `;
        movieList.appendChild(div);
      });

      const totalPages = Math.ceil(movies.length / perPage);
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.className = "active";
        btn.addEventListener("click", () => {
          qs.set("page", i);
          location.search = qs.toString();
        });
        pagination.appendChild(btn);
      }
    });
}

