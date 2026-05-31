import express from 'express';
const app = express();  //建立 express 物件\
import cors from 'cors';
//引入「跨來源資源共享（CORS）」這個套件
//CORS = 「讓不同網址之間可以互相存取資料的規則」
app.use(cors());
app.use(express.json());

import * as uuid from 'uuid';  //用來生成唯一的連接 ID，確保每個客戶端都有一個獨特的識別碼

import mysql from 'mysql2';
const connection = mysql.createConnection({   
  host     : 'localhost',
  user     : 'root',
  password : '0906468525',
  database : 'sheetMusicDatabase'
});

import WebSocket, { WebSocketServer } from 'ws';
import e from 'express';
// const Websocket = require('ws');    //導入Websocket模組，建立Websocket物件
const server = new WebSocketServer({ port: 8080 });   //建立Websocket服務器，監聽8080端口
const clients = new Map(); // 儲存客戶端連接的 Map
// websocket 沒有http的request/response概念，只有連接和消息事件

let webID;


// API - HTTP 架構
app.get("/api/songs", (req, res) => {
    // SQL 語句必須包含 SELECT 和 FROM
    const sql = "SELECT id, name, song_artist, sheet_artist, level, bpm, mp3, csv, jpg FROM baseTable";
    
    connection.query(sql, (err, results) => {
        if (err) {
            // 這裡建議印出 err 方便除錯
            console.error("資料庫查詢失敗:", err);
            return res.status(500).json({ error: "伺服器內部錯誤", details: err.message });
        }
        
        // 成功時回傳 JSON 陣列
        console.log(`成功讀取 ${results.length} 首歌曲`);
        res.json(results);
    });
});

  // 啟動 server
  app.listen(3000, () => {
    console.log("server running");
  });


  // 連線 MySQL 測試
 connection.connect(function(err) {
    if (err) {
      console.error('MySQL connection failed：', err);
      return;
    }
    console.log('MySQL connection');
  });


  // Websocket 
server.on("connection" ,(ws) => {    // message
    console.log("New client");   

      
    // 接收消息(從esp32))
    ws.on("message", (message) => {  
      const data = message.toString();
      let testData;
      try{ 
        testData = JSON.parse(data);
        console.log("Received yaw:", testData);
      }catch (e) {
        console.log("收到非 JSON 訊息:", message.toString());
      }
            


        // 向「所有客戶端」廣播角度
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data); 
            }
        });
    });

});


// ws.boardcast 

// whach dog 當有任何訊號有問題亮紅燈之類的
// who 每台都要有一個ID辨別裝置
// 指令
// 加入時間戳記(封包到達時間，檢查延遲等)
// this.initExpress
// this.initUDP
// this.initWebsocket
// this.initHttp
// 每個步驟記錄到資料庫所以選用mogonDB
// proxy


// cline 
// antd
// react
// immer
// redux
// zustand

// m - model 不可變資料
// c - controller 處理邏輯
// v - view 顯示

// action 驅動 state改變 

