let CONFIG = {}; // 用來存放設定參數

let table;      // 宣告變數table
let img;        // 宣告變數img
let CSVData = [];

let songList = []; // 用來存放從 MySQL 取得的歌曲資料的陣列
let Notes = []; // 用來存放所有音符的陣列
let Drags = []; // 用來存放所有拖曳音符的陣列
let Rotates = []; // 用來存放所有旋轉音符的陣列
let isplaying = false; // 用來追蹤status是否已經變成 2

let angle = 0; // 用來存放玩家當前的角度
let botton = 0; // 用來存放玩家當前的按鈕狀態

// 判定文字顯示系統
let JudgeTexts = []; // 存儲所有正在顯示的判定文字

let status = -1; 
let isSandMySQL = false; // 用來追蹤是否已經向伺服器請求過 MySQL 資料




function setup() {
  createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);
  CSVData = getCSVData();
  websocketSetup(); // 初始化 WebSocket 連線

  setSounds(); // 預先載入聲音檔案
  
}



function draw() {
  background(...CONFIG.display.backgroundColor);
  frameRate(CONFIG.display.frameRate);

  let time = millis(); 
push(); 
  noFill();
  stroke(50);
  circle(width / 2, height / 2, CONFIG.uslNoteSetting.lifeLine);   //音符生命線
pop();


  if(status == -1){
    pushHint();
  }

  if(status == 0){
    startLogic();
     if(song && !song.paused) {
        song.pause();
        song.currentTime = 0;
    }
  }

  if(status == 1){
    time = millis();
      // 只有在切換到 1 的時候，發送一次請求給伺服器
    // if (socket && socket.readyState === WebSocket.OPEN && !isSandMySQL) {
    //   socket.send(JSON.stringify({ action: "get_mysql_data" }));
    //   console.log("已請求 MySQL 資料");
    //   isSandMySQL = true;
    // }
    loadSongMenu();
    selectSong();
    playerMark();
    if (songList.length > 0) {
        for(let i = 0; i < songList.length; i++) {
            songList[i].update();
        }
    }
    drawSongMenu( CONFIG.songSelectMenu.songPage, CONFIG.songSelectMenu.songQuantity);
    
  }

  if(status == 2){
    

    if (!isplaying && song) {
        song.play();
console.log("csv rows", table?.getRowCount?.());
console.log("min trigger", Math.min(...Notes.map(n => n.triggerTime)));
console.log("notes len", Notes.length, "drags len", Drags.length, "rotates len", Rotates.length);
        isplaying = true;
    }

     if (song && !song.paused) {
    time = song.currentTime * 1000;
  }

      textSize(30);
      fill(0);
      text(time ,100 ,200);
      textSize(50);
      text(angleCount_360() ,100 ,400);


      strokeWeight(5);
      stroke(20);
      circle(width / 2, height / 2, CONFIG.uslNoteSetting.judgeLine);  //判定線
      stroke(50);
      circle(width / 2, height / 2, CONFIG.uslNoteSetting.initialPosition); //顯示用的最大圓
      noFill();
      stroke(50);
      circle(width / 2, height / 2, CONFIG.uslNoteSetting.lifeLine);   //音符生命線

      // 更新和顯示判定文字
      for (let i = JudgeTexts.length - 1; i >= 0; i--) {
        if (!JudgeTexts[i].update()) {
          JudgeTexts.splice(i, 1); // 移除已過期的文字
        } else {
          JudgeTexts[i].display();
        }
      }

      if(song && !song.paused) {
      for (let i = 0; i < Notes.length; i++) {
        Notes[i].update(time);
        Notes[i].display();
      }

      // 更新和顯示 drag 音符
      for (let i = 0; i < Drags.length; i++) {
        Drags[i].display(time);  // 傳遞 time
      }

      for (let i = 0; i < Rotates.length; i++) {
        Rotates[i].update(time);
        Rotates[i].display();
      }

      playerMark();
    }

  }

  if (song && song.paused && status == 2){
      status = 3;
    }

  if(status == 2.5){
    pause();
    isplaying = false;
}

  if(status == 3){
    settlement();
  }

  if(status !== 2 && status !== 3 && status !== 2.5) {
    CONFIG.score.combo = 0;
        CONFIG.score.prefect = 0;
        CONFIG.score.great = 0;
        CONFIG.score.miss = 0;
        isplaying =false;
  }
}




