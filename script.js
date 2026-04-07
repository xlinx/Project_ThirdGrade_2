let CONFIG = {}; // 用來存放設定參數

let table;      // 宣告變數table
let CSVData = [];

let Notes = []; // 用來存放所有音符的陣列
let Drags = []; // 用來存放所有拖曳音符的陣列



function setup() {
  createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);
  CSVData = getCSVData();
  
  for (let i = 0; i < CSVData.length; i++) {
    const row = CSVData[i];
    
    if(row.type === 'note') {
      Notes.push(new note(row.triggerTime, row.noteLand, CONFIG.note));
    }
    else if(row.type === 'drag') {
      Drags.push(new drag(row.triggerTimeStart, row.noteLandStart, row.triggerTimeEnd, row.noteLandEnd, row.direction, CONFIG.note));
    }
  }
}



function draw() {
  background(CONFIG.display.backgroundColor);
  frameRate(CONFIG.display.frameRate);
  let time = millis();  
  textSize(30);
  fill(0);
  text(time ,100 ,200);

  noFill();
  circle(width / 2, height / 2, CONFIG.judgeLine.a);
  circle(width / 2, height / 2, CONFIG.display.circleRadius);

  for (let i = 0; i < Notes.length; i++) {
    Notes[i].update(time);
    Notes[i].display();
  }

  // 更新和顯示 drag 音符
  for (let i = 0; i < Drags.length; i++) {
    Drags[i].display(time);  // 傳遞 time
  }

}


