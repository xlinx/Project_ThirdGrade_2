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

// 添加判定
function addJudgeText(judgeType) {
  const centerX = width / 2;
  const centerY = height / 2;
  const offsetY = 100;
  
  // 清空上一個音符的判定顯示，只顯示當前判定
  JudgeTexts = [];
  
  // 添加新判定
  JudgeTexts.push(new JudgeText(judgeType));
}