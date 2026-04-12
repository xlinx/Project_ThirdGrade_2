const Websocket = require('ws');    //導入Websocket模組，建立Websocket物件

const server = new Websocket.Server({ port: 8080 });   //建立Websocket服務器，監聽8080端口
// websocket 沒有http的request/response概念，只有連接和消息事件

server.on("connection" ,(ws) => {   //監聽連接事件，當有客戶端連接時執行回調函式，ws是連接對象
    console.log("New client connected :");   //顯示有客戶端連接的訊息

    ws.send("Welcome to the WebSocket server!");   //向連接的客戶端發送歡迎消息

    ws.on("message", (message) => {   //監聽消息事件，當有消息從客戶端發送過來時執行回調函式，message是收到的消息
        // 1. 解析收到的資料 (Buffer 轉 String)
        const data = message.toString();
        console.log(`Received yaw: ${data}`);

        // 2. 廣播格式：將資料轉發給所有連線的客戶端 
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data); // 這裡發送出去的資料會被 p5.js 的 onmessage 接收
            }
        });
    });
});

