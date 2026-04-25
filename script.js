let CONFIG = {}; // 用來存放設定參數

let table;      // 宣告變數table
let CSVData = [];

let Notes = []; // 用來存放所有音符的陣列
let Drags = []; // 用來存放所有拖曳音符的陣列
let Rotates = []; // 用來存放所有旋轉音符的陣列

let angle = 0; // 用來存放玩家當前的角度


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
  let time = millis();  

  textSize(30);
  fill(0);
  text(time ,100 ,200);
  textSize(50);
  text(angleCount_360() ,100 ,400);


  noFill();
  stroke(100);
  circle(width / 2, height / 2, CONFIG.uslNoteSetting.lifeLine);   //音符生命線
  stroke(0);
  circle(width / 2, height / 2, CONFIG.uslNoteSetting.judgeLine);  //判定線
  circle(width / 2, height / 2, CONFIG.uslNoteSetting.initialPosition); //顯示用的最大圓

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


