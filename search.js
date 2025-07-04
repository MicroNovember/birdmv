const jsonFiles = [
  "server1-asia.json",
  "server1-cartoon.json",
  "server1-china.json",
  "server1-en.json",
  "server1-korea.json",
  "server1-thai.json",
  "server2-asia.json",
  "server2-cartoon.json",
  "server2-inter.json",
  "server2-thai.json"
];

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("submit");
const resultsContainer = document.getElementById("search-results");

let allMovies = [];

Promise.all(
  jsonFiles.map(filename =>
    fetch(`data/${filename}`)
      .then(res => res.ok ? res.json() : [])
      .catch(() => [])
  )
).then(allData => {
  allMovies = allData.flat(); // ✅ รองรับ JSON ที่เป็น array ของหนังโดยตรง

  const params = new URLSearchParams(location.search);
  const keyword = (params.get("q") || "").trim();
  if (keyword) {
    searchBox.value = keyword;
    performSearch(keyword);
  }
});

searchBtn.addEventListener("click", () => performSearch());
searchBox.addEventListener("keypress", e => {
  if (e.key === "Enter") performSearch();
});

function performSearch(forcedKeyword) {
  const rawKeyword = (forcedKeyword || searchBox.value).trim().toLowerCase();
  resultsContainer.innerHTML = "";

  if (rawKeyword.length < 2) {
    resultsContainer.innerHTML = `<p>🔎 กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร</p>`;
    return;
  }

  const keywords = rawKeyword.split(/\s+/); // 🔹 แยกคำด้วยช่องว่าง

  const found = allMovies.filter(movie => {
    const name = (movie.name || "").toLowerCase();
    return keywords.every(word => name.includes(word));
  });

  if (found.length === 0) {
    resultsContainer.innerHTML = `<p>❌ ไม่พบชื่อเรื่องที่ตรงกับ "<strong>${rawKeyword}</strong>"</p>`;
    return;
  }

  found.forEach(movie => {
    const div = document.createElement("div");
    div.className = "movie";
    div.innerHTML = `
      <a href="player.html?name=${encodeURIComponent(movie.name)}&url=${encodeURIComponent(movie.url)}&image=${encodeURIComponent(movie.image)}&info=${encodeURIComponent(movie.info || '')}">
        <img src="${movie.image}" alt="${movie.name}" />
        <h4 title="${movie.name}">${movie.name}</h4>
        <span class="info">${movie.info || ""}</span>
      </a>
    `;
    resultsContainer.appendChild(div);
  });

  
}