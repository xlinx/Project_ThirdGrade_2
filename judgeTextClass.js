// 判定文字類別
class JudgeText {
  constructor(judgeType) {
    this.judgeType = judgeType; // "Perfect", "Good", "Miss"
    this.createdTime = millis();
    this.duration = CONFIG.judgeText.duration; // 顯示持續時間（毫秒）
    this.maxAlpha = 255;
    this.fadeOutDuration = CONFIG.judgeText.duration; // 淡出持續時間
  }

  update() {
    // 檢查是否應該移除
    const elapsedTime = millis() - this.createdTime;
    return elapsedTime < this.duration;
  }

  display() {
    const elapsedTime = millis() - this.createdTime;
    const remainingTime = this.duration - elapsedTime;
    
    // 計算透明度（淡出效果）
    let alpha = this.maxAlpha;
    if (remainingTime < this.fadeOutDuration) {
      alpha = map(remainingTime, 0, this.fadeOutDuration, 0, this.maxAlpha);
    }

    // 設定顏色
    let color = [255, 255, 255]; // 預設白色

    switch(this.judgeType) {
      case 1: // Perfect
        color = CONFIG.judgeText.hitColor; 
        break;
      case 2: // Good
        color = CONFIG.judgeText.hitColor; 
        break;
      case 3: // Miss
        color = CONFIG.judgeText.missColor; 
        break;
    }

    push();
    noStroke();
    fill(color[0], color[1], color[2], alpha);
    // 繪製直徑為 530 的圓形
    circle(width / 2, height / 2, CONFIG.uslNoteSetting.lifeLine ); // 圓形大小略大於生命線
    pop();
  }
}

// 添加判定文字到顯示列表
function addJudgeText(judgeType) {
  // 清除所有之前的判定圓圈，只保留最新的
  JudgeTexts = [];
  
  JudgeTexts.push(new JudgeText(judgeType));
}