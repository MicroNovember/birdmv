// marquee.js

const marqueeMessages = [
  "📢 Version 1.0.1 อัปเดตหนังใหม่ไม่ทุกวัน!  ",
  "😊 รับชมฟรี ไม่มีโฆษณา  ",
  "😊 ขอบคุณที่ติดตาม : ⲦⲉⲁⲙⲦⲁlⲕ  🦜"
];

const selectedIndexes = [0, 1, 2]; // 🟡 เลือกข้อความที่ 1 และ 3

const marqueeSpeed = 60; // วินาที
const marqueeColor = "#00ffff";
const marqueeFontSize = "18px";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.className = "marquee-container";

  const textEl = document.createElement("div");
  textEl.className = "marquee-text";
  textEl.textContent = selectedIndexes.map(i => marqueeMessages[i]).join("   ♦   ");

  textEl.style.animationDuration = marqueeSpeed + "s";
  textEl.style.color = marqueeColor;
  textEl.style.fontSize = marqueeFontSize;

  container.appendChild(textEl);

  // ✅ แทรกใต้ .top-row
  const topRow = document.querySelector(".top-row");
  if (topRow && topRow.parentNode) {
    topRow.insertAdjacentElement("afterend", container); // 🎯 ตรงตำแหน่งที่พี่ต้องการ
  } else {
    document.body.prepend(container); // fallback ถ้าไม่เจอ
  }
});
