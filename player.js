const params = new URLSearchParams(location.search);
const name = params.get("name") || "ไม่ทราบชื่อ";
const rawUrl = params.get("url") || "";
const info = params.get("info") || "";
const image = params.get("image") || "";
const audio = params.get("audio") || ""; // เพิ่มบรรทัดนี้
const videoURL = decodeURIComponent(rawUrl);

document.getElementById("movie-title").textContent = name;
document.getElementById("info-text").textContent = info;

// แสดงข้อมูลพากย์/บรรยาย
const audioInfoElem = document.getElementById("audio-info");
if (audioInfoElem) {
  audioInfoElem.textContent = audio ? `เสียง: ${audio}` : "";
}

const videoSource = document.getElementById("video-source");
const posterBg = document.getElementById("video-poster-bg");
const favBtn = document.getElementById("fav-btn");
const hitbox = document.getElementById("player-hitbox");
const hitboxIcon = document.getElementById("player-hitbox-icon");

// ตั้งค่าวิดีโอ
if (videoURL) {
  videoSource.src = videoURL;
  if (videoURL.endsWith(".m3u8")) {
    videoSource.type = "application/x-mpegURL";
  }
}

const player = videojs("my-player");

if (image) {
  player.poster(image);
  posterBg.style.backgroundImage = `url('${image}')`;
  posterBg.style.opacity = 1;
}

player.on("pause", () => {
  animateHitbox("▶️");
});

function animateHitbox(icon = "▶️") {
  hitboxIcon.textContent = icon;
  hitboxIcon.classList.add("show");
  setTimeout(() => {
    hitboxIcon.classList.remove("show");
  }, 1000);
}

// เพิ่ม event สำหรับแตะหรือคลิกที่วิดีโอ (รองรับทั้ง desktop และ mobile)
const videoElem = document.getElementById("my-player");

// รองรับ tap/click ที่ video โดยตรง
videoElem.addEventListener("click", togglePlayPause);
videoElem.addEventListener("touchend", function(e) {
  // ป้องกัน tap ซ้อน
  e.preventDefault();
  togglePlayPause();
});

function togglePlayPause() {
  if (player.paused()) {
    player.play();
  } else {
    player.pause();
  }
}

hitbox.addEventListener("click", () => {
  const promise = player.paused() ? player.play() : player.pause();
  if (promise) {
    promise.catch(e => console.warn("⛔ ไม่สามารถเล่นวิดีโอ:", e));
  }
});

// ----- ระบบ Resume -----
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
    document.getElementById("resume-message").textContent = msg;
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

// ----- รายการโปรด -----
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