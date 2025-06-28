const params = new URLSearchParams(location.search);
const name = params.get("name") || "ไม่ทราบชื่อ";
const rawUrl = params.get("url") || "";
const info = params.get("info") || "";
const image = params.get("image") || "";
const videoURL = decodeURIComponent(rawUrl);

document.getElementById("movie-title").textContent = name;
document.getElementById("info-text").textContent = info;

const videoSource = document.getElementById("video-source");
const posterBg = document.getElementById("video-poster-bg");
const favBtn = document.getElementById("fav-btn");
const overlayBtn = document.getElementById("player-overlay-btn");

if (videoURL) {
  videoSource.src = videoURL;
  if (videoURL.endsWith(".m3u8")) {
    videoSource.type = "application/x-mpegURL";
  }
}

const player = videojs("my-player");

if (image) {
  player.poster(image);
  if (posterBg) {
    posterBg.style.backgroundImage = `url('${image}')`;
    posterBg.style.opacity = 1;
  }
}

player.on("play", () => {
  try {
    player.requestFullscreen();
  } catch (e) {}
  if (posterBg) posterBg.style.opacity = 0;
  animateOverlay("⏸");
});

player.on("pause", () => {
  animateOverlay("▶️");
});

// 🎛 ปุ่ม overlay พร้อม animation
function animateOverlay(icon = "▶️") {
  overlayBtn.textContent = icon;
  overlayBtn.classList.add("show");
  setTimeout(() => {
    overlayBtn.classList.remove("show");
  }, 1000);
}

overlayBtn.addEventListener("click", () => {
  if (player.paused()) {
    player.play();
  } else {
    player.pause();
  }
});

// 🎬 Resume Popup
const watchKey = "watch_" + videoURL;
let watchData = null;

try {
  watchData = JSON.parse(localStorage.getItem(watchKey) || "null");
} catch (e) {}

player.ready(() => {
  if (watchData && watchData.currentTime > 20) {
    player.pause();
    const mins = Math.floor(watchData.currentTime / 60);
    const secs = Math.floor(watchData.currentTime % 60).toString().padStart(2, "0");
    const msg = `คุณเคยดู "${name}" ถึงนาทีที่ ${mins}:${secs}`;

    const dialog = document.getElementById("resume-dialog");
    const msgEl = document.getElementById("resume-message");
    msgEl.textContent = msg;
    dialog.classList.remove("hidden");

    document.getElementById("resume-yes").onclick = () => {
      dialog.classList.add("hidden");
      player.currentTime(watchData.currentTime);
      player.play();
    };

    document.getElementById("resume-no").onclick = () => {
      dialog.classList.add("hidden");
      player.currentTime(0);
      player.play();
    };
  }
});

// 💾 บันทึกตำแหน่ง
player.on("timeupdate", () => {
  const progress = {
    name,
    url: videoURL,
    image,
    currentTime: player.currentTime(),
    duration: player.duration(),
    lastWatched: Date.now()
  };
  localStorage.setItem(watchKey, JSON.stringify(progress));
});

// ❤️ รายการโปรด
function updateFavUI() {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const isFav = favs.some(m => m.url === videoURL);
  favBtn.textContent = isFav ? "💔 ลบจากรายการโปรด" : "❤️ เพิ่มในรายการโปรด";
}

favBtn.addEventListener("click", () => {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const index = favs.findIndex(m => m.url === videoURL);
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push({ name, url: videoURL, image });
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
  updateFavUI();
});

updateFavUI();