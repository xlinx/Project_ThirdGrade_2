import express from 'express';
const app = express();  //建立 express 物件\
import cors from 'cors';
//引入「跨來源資源共享（CORS）」這個套件
//CORS = 「讓不同網址之間可以互相存取資料的規則」
app.use(cors());
app.use(express.json());

import mysql from 'mysql2';
const connection = mysql.createConnection({   //建立 MySQL 連線資料
  host     : 'localhost',
  user     : 'root',
  password : '0906468525',
  database : 'sheetMusicDatabase'
});

import WebSocket, { WebSocketServer } from 'ws';
import e from 'express';
// const Websocket = require('ws');    //導入Websocket模組，建立Websocket物件
const server = new WebSocketServer({ port: 8080 });   //建立Websocket服務器，監聽8080端口
// websocket 沒有http的request/response概念，只有連接和消息事件


//   res.send("hello songs")

// API
// 一個 API request 只能回一個 response
// app.get("/", (req, res) => {

//     connection.query("SELECT * FROM baseTable", (err, results) => {  
//         if (err) {
//         res.status(500).json({ error: err });
//         return;
//         }

//         console.log(results);
//         res.json(results);   // 將查詢結果以 JSON 格式回傳給客戶端

//           // 廣播 websocket
//         server.clients.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//               client.send(JSON.stringify(results));
//           }
//         });
//     });

// });


// // 啟動 server
// app.listen(3000, () => {
//   console.log("server running");
// });


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

    // // 每個客戶端連接時自動查詢 MySQL 並發送資料
    // connection.query("SELECT * FROM baseTable", (err, results) => {  
    //     if (err) {
    //         console.error("Database query error:", err);
    //         ws.send(JSON.stringify({ error: "Database query failed" }));
    //         return;
    //     }else {
    //         console.log("Sending initial data from MySQL:", results);
    //         ws.send(JSON.stringify(results));   
    //     }
    // });

    
    // 接收消息(從esp32))
    ws.on("message", (message) => {   
        const data = message.toString();
        console.log(`Received yaw: ${data}`);

        // 廣播角度
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data); 
            }
        });
    });

});


// ws.boardcast 