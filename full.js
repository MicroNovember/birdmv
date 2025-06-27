const params = new URLSearchParams(location.search);
const category = params.get("category");
const title = params.get("title") || "ดูทั้งหมด";
const page = parseInt(params.get("page") || "1");

const MOVIES_PER_PAGE = 36;
const file = `data/${category}.json`;
document.getElementById("title").textContent = title;

fetch(file)
  .then(res => res.json())
  .then(data => {
    const totalPages = Math.ceil(data.length / MOVIES_PER_PAGE);
    const container = document.getElementById("movie-list");
    const pag = document.getElementById("pagination");

    const start = (page - 1) * MOVIES_PER_PAGE;
    const end = start + MOVIES_PER_PAGE;
    const movies = data.slice(start, end);

    movies.forEach(movie => {
      const div = document.createElement("div");
      div.className = "movie";
      div.innerHTML = `
        <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&subtitle=${encodeURIComponent(movie.subtitle || '')}">
          <img src="${movie.image}" alt="${movie.name}">
          <h4>${movie.name}</h4>
        </a>
      `;
      container.appendChild(div);
    });

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === page) btn.classList.add("active");
      btn.onclick = () => {
        location.href = `full.html?category=${category}&title=${encodeURIComponent(title)}&page=${i}`;
      };
      pag.appendChild(btn);
    }
  });