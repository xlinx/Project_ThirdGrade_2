const express = require("express"); // 引入並使用 express 相關套件。
const app = express();  //建立 express 物件\
const cors = require("cors"); // 引入並使用 cors 相關套件，解決跨域問題。
//引入「跨來源資源共享（CORS）」這個套件
//CORS = 「讓不同網址之間可以互相存取資料的規則」
app.use(cors());
app.use(express.json());

const mysql = require('mysql2'); // 引入並使用 mysql2 相關套件
const connection = mysql.createConnection({   //建立 MySQL 連線資料
  host     : 'localhost',
  user     : 'root',
  password : '0906468525',
  database : 'sheetMusicDatabase'
});


// API
// 一個 API request 只能回一個 response
app.get("/", (req, res) => {

//   res.send("hello songs")

    connection.query("SELECT * FROM baseTable", (err, results) => {
        if (err) {
        res.status(500).json({ error: err });
        return;
        }

        res.json(results);
    });
});


// 啟動 server
app.listen(3000, () => {
  console.log("server running");
});

// 連線 MySQL 測試
// connection.connect(function(err) {
//   if (err) {
//     console.error('MySQL connection failed：', err);
//     return;
//   }
//   console.log('MySQL connection');
// });

