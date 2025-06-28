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

const overlayBtn = document.getElementById("player-overlay-btn");

function showOverlay(icon = "▶️") {
  overlayBtn.textContent = icon;
  overlayBtn.classList.remove("hidden");
  overlayBtn.classList.add("visible");

  setTimeout(() => {
    overlayBtn.classList.remove("visible");
    overlayBtn.classList.add("hidden");
  }, 1500);
}

// แตะตรงกลางเพื่อ toggle เล่น/หยุด
overlayBtn.addEventListener("click", () => {
  if (player.paused()) {
    player.play();
  } else {
    player.pause();
  }
});

// แสดง overlay ปุ่มทุกครั้งที่หยุด
player.on("pause", () => showOverlay("▶️"));
player.on("play", () => showOverlay("⏸"));



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

function updateFavUI() {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const isFav = favs.some(m => m.url === videoURL);
  favBtn.textContent = isFav ? "💔 ลบจากรายการโปรด" : "❤️ เพิ่มในรายการโปรด";
}

fav