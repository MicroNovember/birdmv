const params = new URLSearchParams(location.search);
const name = params.get("name");
const videoUrl = params.get("url");

if (videoUrl) {
  document.querySelector("video").src = decodeURIComponent(videoUrl);
}

const infoBox = document.getElementById("movie-info");

if (name) {
  fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=c7ef2bfe{encodeURIComponent(name)}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        infoBox.innerHTML = `
          <h2>${data.Title} (${data.Year})</h2>
          <img src="${data.Poster}" alt="${data.Title}" style="max-width:120px; float:left; margin-right:10px;" />
          <p><strong>ประเภท:</strong> ${data.Genre}</p>
          <p><strong>ความยาว:</strong> ${data.Runtime}</p>
          <p><strong>ผู้กำกับ:</strong> ${data.Director}</p>
          <p><strong>นักแสดง:</strong> ${data.Actors}</p>
          <p><strong>เรื่องย่อ:</strong> ${data.Plot}</p>
          <p><strong>IMDB:</strong> ⭐ ${data.imdbRating} / 10</p>
        `;
      } else {
        infoBox.innerHTML = `<p>❌ ไม่พบข้อมูลสำหรับเรื่อง "${name}"</p>`;
      }
    })
    .catch(err => {
      console.error(err);
      infoBox.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>`;
    });
}