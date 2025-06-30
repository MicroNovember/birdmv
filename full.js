const qs = new URLSearchParams(location.search);
const category = qs.get("category");
const title = qs.get("title") || "";
const perPage = parseInt(qs.get("perPage") || "24"); // ✅ ค่าเริ่มต้น 24
let currentPage = parseInt(qs.get("page") || "1");

document.title = title;
// document.getElementById("page-title").textContent = title;

fetch(`data/${category}.json`)
  .then(res => res.json())
  .then(movies => {
    const movieList = document.getElementById("movie-list");
    const pagination = document.getElementById("pagination");

    // ✅ ดึงค่า perPageSelect ถ้ามี
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

    // แสดงเฉพาะช่วงหนังตามหน้าปัจจุบัน
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageMovies = movies.slice(start, end);

    pageMovies.forEach(movie => {
      const div = document.createElement("div");
      div.className = "movie";
      div.innerHTML = `
        <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&subtitle=${encodeURIComponent(movie.subtitle || '')}">
          <img src="${movie.image}" alt="${movie.name}">
          <h4 title="${movie.name}">${movie.name}</h4>
          <span class="info">${movie.info || ""}</span>
        </a>
      `;
      movieList.appendChild(div);
    });

    // ✅ สร้างปุ่มเปลี่ยนหน้า
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