let table;      // 宣告變數table
let Notes = []; // 用來存放所有音符的陣列
let CSVData = [];
let CONFIG = {}; // 用來存放設定參數

function preload() {
  table = loadTable('data/base.csv', 'csv');   //載入csv檔案
  CONFIG = loadJSON('setting.json');   //載入設定檔案
}

function getCSVData() {
  if (!table) { return []; }  // 如果表格未成功載入，返回空陣列
  
  let data = [];
  let rowCount = table.getRowCount();
  
  for (let i = 0; i < rowCount; i++) {
    let triggerTime = table.getNum(i, 0);   
    let noteLand = table.getNum(i, 1);            

    data.push({ triggerTime, noteLand });
  }

  return data;
}

function setup() {
  createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);
  CSVData = getCSVData(); // 只在 setup 讀取一次 CSV
  
  // 為CSV中的每一個值，創建note物件
  for (let i = 0; i < CSVData.length; i++) {
    Notes.push(new note(CSVData[i].triggerTime, CSVData[i].noteLand, CONFIG.note));
  }
}

function draw() {
  background(CONFIG.display.backgroundColor);
  frameRate(CONFIG.display.frameRate);
  let time = millis();  
  textSize(16);
  fill(0);
  text(time ,100 ,200);

  noFill();
  circle(width / 2, height / 2, CONFIG.judgeLine.a);
  circle(width / 2, height / 2, CONFIG.display.circleRadius);

  for (let i = 0; i < Notes.length; i++) {
    Notes[i].update(time);
    Notes[i].display();
  }
}


