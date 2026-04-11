function preload() {
  table = loadTable('data/base.csv', 'csv');   //載入csv檔案
  CONFIG = loadJSON('setting.json');   //載入設定檔案
}



function getCSVData() {
  if (!table) { return []; }
  
  let data = [];
  let rowCount = table.getRowCount();
  
  for (let i = 0; i < rowCount; i++) {
    let type = table.getString(i, 0);  // 第一欄：類型
    
    if(type === 'note') {
      let triggerTime = table.getNum(i, 1);   
      let noteLand = table.getNum(i, 2);  
      data.push({ type, triggerTime, noteLand });
    } 
    else if(type === 'drag') {
      let triggerTimeStart = table.getNum(i, 1);
      let triggerTimeEnd = table.getNum(i, 2);
      let noteLandStart = table.getNum(i, 3);
      let noteLandEnd = table.getNum(i, 4);
      let direction = table.getNum(i, 5);  // 方向
      data.push({ type, triggerTimeStart, triggerTimeEnd, noteLandStart, noteLandEnd, direction });
    }else if(type === 'rotate') { 
      let triggerTime = table.getNum(i, 1);
      let direction = table.getNum(i, 2);  // 方向
      data.push({ type, triggerTime, direction });
    }
  }
  
  return data;
}

function getCSP32Data() {





}