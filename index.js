/**

NUMBER PANEL -> DEV DRIXALEXA

✅ menambah Bendera Deteksi dari Kode Negara

✅ membaca pesam dari index 4

✅ Deteksi OTP dari pesan

✅ tidak akan pernah ngirim duplikat

✅ bot otp rapih dan enak di liat by drixalexa BERIKUT KODE NYA.

*/

const fs = require("fs");

const path = require("path");

const axios = require("axios");

/// ========== CONFIG ==========

const TELEGRAM_TOKEN = "8317383114:AAHA81sPMiO_SPW6-JNlIQMkOuxl10uJfMI";

const TELEGRAM_CHAT_ID = "-1002591228761";

const ADMIN_CHAT_ID = "1174609217";

const BASE_URL = "https://www.imssms.org/client";

const FIXED_ENDPOINT = `${BASE_URL}/res/data_smscdr.php`;

const COOKIE_FILE = path.join(__dirname, ".cookie");

const LAST_ID_FILE = path.join(__dirname, "last_id.json");

const CHECK_INTERVAL_MS = 15 * 1000; // cek setiap 15 detik

/// ============================

let lastId = null;

// === UTIL ===

function todayRange() {

const now = new Date();

const pad = (n) => n.toString().padStart(2, "0");

const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;

const end = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 23:59:59`;

return { start, end };

}

function loadCookieHeader() {

try {

const raw = fs.readFileSync(COOKIE_FILE, "utf8").trim();  

if (!raw) return null;  

if (raw.includes("=")) {  

  const phps = raw  

    .split(";")  

    .map((p) => p.trim())  

    .find((p) => p.toLowerCase().startsWith("phpsessid="));  

  return phps || `PHPSESSID=${raw}`;  

}  

return `PHPSESSID=${raw}`;

} catch {

return null;

}

}

function loadLastId() {

try {

return JSON.parse(fs.readFileSync(LAST_ID_FILE, "utf8")).lastId || null;

} catch {

return null;

}

}

function saveLastId(id) {

try {

fs.writeFileSync(LAST_ID_FILE, JSON.stringify({ lastId: id }), "utf8");

} catch {}

}

function toWIB(utcTime) {

const date = new Date(utcTime);

if (isNaN(date.getTime())) return utcTime;

const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

const pad = (n) => n.toString().padStart(2, "0");

return `${pad(wib.getDate())}-${pad(wib.getMonth() + 1)}-${wib.getFullYear()} ${pad(

wib.getHours()

)}:${pad(wib.getMinutes())}:${pad(wib.getSeconds())} WIB`;

}

function maskNumber(num) {

const s = String(num || "");

if (s.length <= 8) return `${s.slice(0, 2)}***${s.slice(-2)}`;

return `${s.slice(0, 5)}***${s.slice(-3)}`;

}

function detectOTP(text) {

if (!text) return "";

let m = text.match(/\b(\d{3,4}[- ]?\d{3,4})\b/);

if (m) return m[1].replace(/[-\s]/g, "");

m = text.match(/\b(\d{4,8})\b/);

if (m) return m[1];

return "";

}

// === DETEKSI NEGARA DARI NOMOR ===

function detectCountry(number) {

const prefix = String(number).replace(/[^0-9]/g, "");

const countries = {

62: "Indonesia 🇮🇩",  

60: "Malaysia 🇲🇾",  

65: "Singapore 🇸🇬",  

91: "India 🇮🇳",  

1: "United States 🇺🇸",  

93: "Afghanistan 🇦🇫",  

58: "Venezuela 🇻🇪",  

972: "Israel 🇮🇱",  

249: "Sudan 🇸🇩",  

269: "Comoros 🇰🇲",  

81: "Japan 🇯🇵",  

82: "Korea 🇰🇷",  

84: "Vietnam 🇻🇳",  

63: "Philippines 🇵🇭",  

66: "Thailand 🇹🇭",  

7: "Russia 🇷🇺",  

55: "Brazil 🇧🇷",  

998: "Uzbekistan 🇺🇿",  

996: "Kyrgyzstan 🇰🇬",  

92: "Pakistan 🇵🇰",  

977: "Nepal 🇳🇵",  

234: "Nigeria 🇳🇬",  

221: "Senegal 🇸🇳",

};

for (const code of Object.keys(countries).sort((a, b) => b.length - a.length)) {

if (prefix.startsWith(code)) return countries[code];

}

return "Tidak Dikenal 🏳";

}

// === BUILD TELEGRAM MESSAGE ===

function buildTelegramMessage(payload) {
const flagMatch = payload.country.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
const flag = flagMatch ? flagMatch[0] : "🌍";
const countryName = payload.country.split(" ")[0];
const messageLines = [

`${flag}${payload.country} <b>${payload.application} OTP Received!!`,
  "─────────────────────",  

`🌍 <b>COUNTRY :</b> ${payload.country || "Tidak Dikenal 🏳"}`,  

`📱 <b>SERVICE :</b> ${payload.application || "Unknown"}`,  

`📞 <b>NUMBER :</b> ${maskNumber(payload.number || "")}`,  

`🔑 <b>YOUR OTP :</b> <code>${payload.otp || "-"}</code>`,  

`⏰ <b>TIME :</b> ${toWIB(payload.time)}`,  

"─────────────────────",  

`💬 <b>MESSAGE:</b>\n${payload.message?.trim() || "(tidak ada pesan)"}`,  

"─────────────────────",

];

return messageLines.join("\n");

}

// === KIRIM TELEGRAM ===

async function sendToTelegram(text, chatId = TELEGRAM_CHAT_ID, withButtons = false) {

try {

const payload = {  

  chat_id: chatId,  

  text,  

  parse_mode: "HTML",  

};  

if (withButtons) {  

  payload.reply_markup = {  

    inline_keyboard: [  

      [  

        { text: "OWNER", url: "https://t.me/Shinzureal" },  

        { text: "NUMBER", url: "https://t.me/Numberszotp" },  

      ],  

    ],  

  };  

}  

await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, payload);

} catch (e) {

console.log("❌ Gagal kirim Telegram:", e.response?.data || e.message);

}

}

// === CEK PESAN ===

async function checkForMessage() {

try {

const cookieHeader = loadCookieHeader();  

if (!cookieHeader) {  

  console.log("⚠️ Cookie tidak ditemukan. Harap update file .cookie");  

  return;  

}  

const { start, end } = todayRange();  

const url = `${FIXED_ENDPOINT}?fdate1=${encodeURIComponent(start)}&fdate2=${encodeURIComponent(end)}`;  

const res = await axios.get(url, {  

  timeout: 15000,  

  headers: {  

    Cookie: cookieHeader,  

    "User-Agent":  

      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",  

    Accept: "application/json, text/javascript, */*; q=0.01",  

    Referer: `${BASE_URL}/SMSCDRStats`,  

    "X-Requested-With": "XMLHttpRequest",  

  },  

  validateStatus: null,  

});  

const arr = res.data.aaData || res.data.data || [];  

const validRows = arr.filter((r) => Array.isArray(r) && r[2] && String(r[2]).length > 5);  

if (validRows.length === 0) {  

  console.log("⏳ Menunggu pesan...");  

  return;  

}  

const sorted = validRows.sort((a, b) => new Date(a[0]) - new Date(b[0]));  

const latest = sorted[sorted.length - 1];  

const realMessage = (latest[4] || "").trim();  

const data = {  

  id: `${latest[2]}_${latest[0]}`,  

  country: detectCountry(latest[2]),  

  application: latest[3] || "Unknown",  

  number: latest[2],  

  message: realMessage,  

  time: latest[0],  

  otp: detectOTP(realMessage),  

};  

const newHash = `${data.id}_${data.message}`;  

if (newHash === lastId) {  

  console.log("⏳ Duplikat, lewati...");  

  return;  

}  

if (!data.message) {  

  console.log("⚠️ Tidak ada pesan terdeteksi:", latest);  

  return;  

}  

console.log("📩 Pesan baru ditemukan!");  

await sendToTelegram(buildTelegramMessage(data), TELEGRAM_CHAT_ID, true);  

saveLastId(newHash);  

lastId = newHash;

} catch (err) {

console.log("❌ ERROR:", err.message);

}

}

// === START ===

(async () => {

console.log("🚀 Bot aktif – memeriksa pesan setiap 15 detik...");

lastId = loadLastId();

await checkForMessage();

setInterval(checkForMessage, CHECK_INTERVAL_MS);

})();
