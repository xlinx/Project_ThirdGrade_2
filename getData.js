
let firstLineInt;

// 載入資料==========================================================
function preload() {
  table = loadTable('data/base.csv', 'csv');   //載入csv檔案
  CONFIG = loadJSON('setting.json');   //載入設定檔案
  song = loadSound('data/base.mp3'); // 載入音樂檔案
}


// 讀取CSV資料==========================================================
function getCSVData() {
  if (!table) { return []; }
  
  // 讀取第一行的整數數字
  firstLineInt = table.getNum(0, 0);
  console.log("First line integer:", firstLineInt);

  let data = [];
  let rowCount = table.getRowCount();
  
  // 從第二行開始讀取資料 (i = 1)
  for (let i = 1; i < rowCount; i++) {
    let type = table.getString(i, 0);  // 第一欄：類型
    
    if(type === 'note') {
      let triggerTime = table.getNum(i, 1)+firstLineInt;  // 加上第一行的整數數字
      let noteLand = table.getNum(i, 2);  
      data.push({ type, triggerTime, noteLand });
    } 
    else if(type === 'drag') {
      let triggerTimeStart = table.getNum(i, 1)+firstLineInt;  // 加上第一行的整數數字
      let triggerTimeEnd = table.getNum(i, 2)+firstLineInt;  // 加上第一行的整數數字
      let noteLandStart = table.getNum(i, 3);
      let noteLandEnd = table.getNum(i, 4);
      let direction = table.getNum(i, 5);  // 方向
      data.push({ type, triggerTimeStart, triggerTimeEnd, noteLandStart, noteLandEnd, direction });
    }else if(type === 'rotate') { 
      let triggerTime = table.getNum(i, 1)+firstLineInt;  // 加上第一行的整數數字
      let direction = table.getNum(i, 2);  // 方向
      data.push({ type, triggerTime, direction });
    }
  }
  
  return data;
}



// Websocket setup==========================================================
let socket; 
let sensorObj = { yaw: 0 }; // 預設資料結構

function websocketSetup() {
  socket = new WebSocket(CONFIG.websocket.serverAddress);
  
  socket.onopen = () => {
    console.log("連線成功！");
  };
  
  // 讀取訊息的核心：onmessage
  socket.onmessage = (event) => {
    // 讀取從 server.js 廣播過來的內容
    // 將收到的 JSON 字串轉成 JS 物件
    try {
      sensorObj = JSON.parse(event.data);
      angle = sensorObj.yaw; // 更新 angle 變量
      // console.log("解析後的資料:", sensorObj, "角度:", angle);
    } catch (e) {
      console.log("收到非 JSON 格式的消息:", event.data);
    }
  };
  
  socket.onerror = (err) => console.log("Socket Error:", err);
  socket.onclose = () => console.log("WebSocket 連線已關閉");
}


let lastAngle = 0;
let totalAngle = 0;

function angleCount_360(){
  let delta = angle - lastAngle;

   if (delta > 180) {
    delta -= 360;
  } else if (delta < -180) {
    delta += 360;
  }

  totalAngle += delta;
  lastAngle = angle;

  return totalAngle;
}

