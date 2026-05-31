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
    let centralColor = [0,0,0]; 
    let outsideColor = [0,0,0]; 

    switch(this.judgeType) {
      case 1: // Perfect
        centralColor = CONFIG.judgeText.hitColor; 
        break;
      case 2: // Good
        centralColor = CONFIG.judgeText.hitColor; 
        break;
      case 3: // Miss
        centralColor = CONFIG.judgeText.missColor; 
        break;
    }

    push();
    noStroke();
    drawingContext.shadowBlur = 40; 
    drawingContext.shadowColor = `rgba(${centralColor[0]}, ${centralColor[1]}, ${centralColor[2]}, ${alpha / 255})`; 
    fill(centralColor[0], centralColor[1], centralColor[2], alpha);
    circle(width / 2, height / 2, CONFIG.uslNoteSetting.lifeLine ); // 圓形大小略大於生命線
    pop();

    push();
    noFill();
    drawingContext.shadowBlur = 40; 
    drawingContext.shadowColor = `rgba(${centralColor[0]}, ${centralColor[1]}, ${centralColor[2]}, ${alpha / 255})`; 
    stroke(centralColor[0], centralColor[1], centralColor[2], alpha);
    strokeWeight(5);
    circle(width / 2, height / 2, CONFIG.uslNoteSetting.initialPosition );
    pop();

    push();
    if(typeof songJudgeText !== 'undefined' && songJudgeText) {
        songJudgeText.update(this.judgeType, alpha);
    }
    pop();

    push();
    if(typeof songComboText !== 'undefined' && songComboText) {
        songComboText.update(alpha);
    }
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

// 選歌畫面中央的環狀文字特效
class SongJudgeText extends JudgeText {
    constructor() {
        super(); 
        this.radius = 600; 
        this.judgeText = "";
    }

    update(currentJudgeType, currentAlpha) {
        push();
        textAlign(CENTER, CENTER);
        
        switch(currentJudgeType) {
          case 1: 
            this.judgeText = "Perfect";
            break;
          case 2: 
            this.judgeText = "Good";
            break;
          case 3: 
            this.judgeText = "Miss";
            break;
          default:
            this.judgeText = "";
        }

        this.display(this.judgeText, currentAlpha, currentJudgeType);
        pop();
    }

    display(str, currentAlpha, currentJudgeType) {
        if (!str) return; 
        
        let chars = str.split("");
        let count = chars.length;

        // 設定字距角度（例如 8 度就是很合適的距離，依據 textSize 可自行微調）
        let angleSpacing = radians(6); 
        // 算出整體文字散開的總角度
        let totalAngleSpan = angleSpacing * (count - 1);
        
        // 讓整串文字的中心對準正上方的 180 度 (對 p5 而言正下方是 HALF_PI，正上方是 PI + HALF_PI，這裡使用 1.5 * PI 差不多是上方)
        // 根據你遊戲畫面，如果是正下方，則使用 HALF_PI ；如果正左，使用 PI
        let startAngle = PI - (totalAngleSpan / 2);


        push();
        translate(width / 2, height / 2); 
        
        for (let i = 0; i < count; i++) {
            let angle = startAngle + (i * angleSpacing); // 只在 180 度附近散開
            
            // radius 如果 1000 太大，你可以自己改成想要的數字
            let x = cos(angle) * (this.radius); 
            let y = sin(angle) * (this.radius);

            push();
            translate(x, y);
            rotate(angle + HALF_PI); // 讓文字垂直於圓周 (面朝中心)
            textSize(50);
            noStroke();
            fill(255, 255, 255, currentAlpha); 
            text(chars[i], 0, 0);
            pop();
        }
        pop();
    }
}

class SongComboText extends JudgeText {
    constructor() {
        super(); 
        this.radius = 600; 
        this.comboText = "";
    }

    update(currentAlpha) {

        push();
        textAlign(CENTER, CENTER);
        
        let currentComboStr = CONFIG.score.combo.toString(); // 數字作為文字
        this.comboText = currentComboStr;
        this.display(this.comboText, currentAlpha);
        
        pop();
    }

    display(str, currentAlpha) {
        let chars = str.split("");
        let count = chars.length;

        let angleSpacing = radians(6); 
        let totalAngleSpan = angleSpacing * (count - 1);

        let startAngle = 0;

        push();
        translate(width / 2, height / 2); 
        
        for (let i = 0; i < count; i++) {
            let angle = startAngle + (i * angleSpacing); 
            
            let x = cos(angle) * this.radius; 
            let y = sin(angle) * this.radius;

            push();
            translate(x, y);
            rotate(angle + HALF_PI); 
            textAlign(CENTER, CENTER);
            textSize(50);
            noStroke();
            fill(255,255,255,currentAlpha); 
            text(chars[i], 0, 0);
            pop();
        }
        pop();
    }
}