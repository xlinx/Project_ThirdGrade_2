var mysql      = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '0906468525',
  database : 'sheetMusicDatabase'
});

connection.connect(function(err) {
  if (err) {
    console.error('MySQL connection failed：', err);
    return;
  }
  console.log('MySQL connection');
});


// 引入 Node.js 的檔案系統模塊，用於讀取目錄
const fs = require('fs');

// 讀取 ./data 目錄下的所有文件夾（每個文件夾代表一首歌曲）
let songs = fs.readdirSync('../data');

// 在控制台列印所有歌曲名稱
console.log(songs);

// 遍歷每首歌曲
songs.forEach(songName => {
  
  let mp3Path = `data/${songName}/song.mp3`;
  let csvPath = `data/${songName}/base.csv`;
  let jpgPath = `data/${songName}/base.jpg`;

  // 在控制台列印每首歌曲的信息：歌曲名稱、MP3 路徑、CSV 路徑
  console.log(songName, mp3Path, csvPath, jpgPath);

});