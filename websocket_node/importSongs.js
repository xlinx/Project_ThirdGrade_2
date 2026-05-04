const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// ===== DB =====
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0906468525",
  database: "sheetMusicDatabase"
});

const dataPath = path.join(__dirname, "../data");

// 連線
connection.connect(err => {
  if (err) {
    console.error("DB 連線失敗:", err);
    return;
  }

  console.log("DB 已連線");

  // 讀取 data 目錄下的所有資料夾
  let folders = fs.readdirSync(dataPath);

  // 只保留資料夾
  folders = folders.filter(name =>
    fs.statSync(path.join(dataPath, name)).isDirectory()
  );

  let values = [];

  folders.forEach(folder => {

    const folderPath = path.join(dataPath, folder);

    const mp3 = path.join(folderPath, "base.mp3"); 
    const csv = path.join(folderPath, "base.csv");
    const jpg = path.join(folderPath, "base.jpg");
    const json = path.join(folderPath, "song.json");

    // ===== 檢查 =====
    if (!fs.existsSync(mp3) || !fs.existsSync(csv) || !fs.existsSync(jpg)) {
      console.log(`❌ 缺檔案: ${folder}`);
      return;
    }

    if (!fs.existsSync(json)) {
      console.log(`❌ 缺 song.json: ${folder}`);
      return;
    }

    // ===== 讀 JSON =====
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(json, "utf-8"));
    } catch (e) {
      console.log(`❌ JSON 解析失敗: ${folder}`);
      return;
    }

    // json空值預設
    const name = meta.name || folder;
    const song_artist = meta.song_artist || "Unknown";
    const sheet_artist = meta.sheet_artist || "Unknown";
    const bpm = parseFloat(meta.bpm) || 120;
    const level = parseInt(meta.level) || 1;

    values.push([
      name,
      song_artist,
      sheet_artist,
      bpm,
      level,
      `data/${folder}/base.mp3`,
      `data/${folder}/base.csv`,
      `data/${folder}/base.jpg`
    ]);

  });

  if (values.length === 0) {
    console.log("⚠️ 沒有資料可匯入");
    connection.end();
    return;
  }

  // ===== SQL（重點🔥）=====
  const sql = `
  INSERT INTO baseTable
  (name, song_artist, sheet_artist, bpm, level, mp3, csv, jpg)
  VALUES ?
  ON DUPLICATE KEY UPDATE
    song_artist = VALUES(song_artist),
    sheet_artist = VALUES(sheet_artist),
    bpm = VALUES(bpm),
    level = VALUES(level),
    mp3 = VALUES(mp3),
    csv = VALUES(csv),
    jpg = VALUES(jpg)
  `;

  connection.query(sql, [values], (err, result) => {
    if (err) {
      console.error("❌ 匯入失敗:", err);
      return;
    }

    console.log(`✅ 匯入完成: ${result.affectedRows} 筆`);
    connection.end();
  });

});