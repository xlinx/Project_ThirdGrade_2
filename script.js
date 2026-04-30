let CONFIG = {}; // 用來存放設定參數

let table;      // 宣告變數table
let CSVData = [];

let Notes = []; // 用來存放所有音符的陣列
let Drags = []; // 用來存放所有拖曳音符的陣列
let Rotates = []; // 用來存放所有旋轉音符的陣列
let isplaying = false; // 用來追蹤音樂是否正在播放的變數

let angle = 0; // 用來存放玩家當前的角度

// 判定文字顯示系統
let JudgeTexts = []; // 存儲所有正在顯示的判定文字

let status = 0; // 0: 等待開始, 1: 遊戲進行中, 2: 遊戲結束

// 音樂播完後計時變數
let musicFinishedTime = null; // 記錄音樂播完的時間
let waitDuration = 10000; // 等待 10 秒（毫秒）



function setup() {
  createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);
  CSVData = getCSVData();
  websocketSetup();
  
  for (let i = 0; i < CSVData.length; i++) {
    const row = CSVData[i];
    
    if(row.type === 'note') {
      Notes.push(new note(row.triggerTime, row.noteLand));
    }
    else if(row.type === 'drag') {
      Drags.push(new drag(row.triggerTimeStart, row.noteLandStart, row.triggerTimeEnd, row.noteLandEnd, row.direction));
    }else if(row.type === 'rotate') {
      Rotates.push(new Rotate(row.triggerTime, row.direction));
    }
  }

   
}



function draw() {
  background(...CONFIG.display.backgroundColor);
  frameRate(CONFIG.display.frameRate);

if(status === 0){
  waveView();
}
if(status === 1){
  
  if (!isplaying && song && status === 1) {
    song.play();
    isplaying = true;
  }

  // 檢查音樂是否播完
  if (song && !song.isPlaying() && isplaying) {
    // 音樂已播完
    if (musicFinishedTime === null) {
      musicFinishedTime = millis(); // 記錄音樂播完的時間
    }
    
    // 檢查是否已等待 10 秒
    if (millis() - musicFinishedTime >= waitDuration) {
      status = 0; // 設回等待狀態
      musicFinishedTime = null; // 重置計時
      isplaying = false; // 重置播放狀態
      isinitAngleSet = false; // 重置初始角度標記以便下一輪
    }
  }

      let time = millis();  
      if (song.isPlaying()) {
        time = song.currentTime() * 1000;
      }

      // textSize(30);
      // fill(0);
      // text(time ,100 ,200);
      // textSize(50);
      // text(angleCount_360() ,100 ,400);


      noFill();
      stroke(50);
      circle(width / 2, height / 2, CONFIG.uslNoteSetting.lifeLine);   //音符生命線
      strokeWeight(5);
      stroke(20);
      circle(width / 2, height / 2, CONFIG.uslNoteSetting.judgeLine);  //判定線
      stroke(50);
      circle(width / 2, height / 2, CONFIG.uslNoteSetting.initialPosition); //顯示用的最大圓

      scoreDisplay(); // 顯示分數

        // 更新和顯示判定文字
        for (let i = JudgeTexts.length - 1; i >= 0; i--) {
          if (!JudgeTexts[i].update()) {
            JudgeTexts.splice(i, 1); // 移除已過期的文字
          } else {
            JudgeTexts[i].display();
          }
        }

        if(song.isPlaying()) {
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
      
      // // 如果音樂已播完，顯示倒計時
      // if (musicFinishedTime !== null && !song.isPlaying()) {
      //   let remainingTime = waitDuration - (millis() - musicFinishedTime);
      //   if (remainingTime > 0) {
      //     push();
      //     fill(255, 100, 100);
      //     textSize(48);
      //     textAlign(CENTER, CENTER);
      //     text("倒數: " + Math.ceil(remainingTime / 1000) + "秒", width / 2, 100);
      //     pop();
      //   }
      // }
    }
  }

function keyPressed() {
  userStartAudio();
}
