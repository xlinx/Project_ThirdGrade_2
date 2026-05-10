class Rotate {  
    constructor(triggerTime, direction) {
        this.triggerTime = triggerTime;
        this.direction = direction;
        this.noteSpeed = CONFIG.uslNoteSetting.speed;
        this.notePosition = CONFIG.uslNoteSetting.initialPosition;
        this.noteStrokeWeight = CONFIG.rotate.noteStrokeWeight;
        this.isActive = false;

        this.isJudged = false;
        this.judgeStyle = 0;  
    }

    update(time) {
    if (this.isJudged) return; // 【效能優化】已判定完畢直接離開

    // 計算到達 lifeLine 所需的時間（毫秒）
    const requiredMs = (CONFIG.uslNoteSetting.initialPosition - CONFIG.uslNoteSetting.lifeLine) / this.noteSpeed * (1000 / CONFIG.display.frameRate);
    
    // 【效能優化】如果時間還太早（距離音符出現還有 2 秒以上），直接跳出運算
    if (time < this.triggerTime - requiredMs - 2000) return;

    // 計算從音符應該開始移動的時間點到現在，經過了多少毫秒
    const elapsedMs = time - (this.triggerTime - requiredMs);

    if (elapsedMs < 0) {
      // 還沒到啟動時間
      this.isActive = false;
      this.notePosition = CONFIG.uslNoteSetting.initialPosition;
    } else {
      // 已經啟動，根據經過的時間計算精確位置 (Frame-Independent)
      this.isActive = true;
      const elapsedFrames = elapsedMs / (1000 / CONFIG.display.frameRate);
      this.notePosition = CONFIG.uslNoteSetting.initialPosition - this.noteSpeed * elapsedFrames;
    }

    // 如果超出了螢幕 (小於 lifeLine)，則停止活動
    if (this.notePosition <= CONFIG.uslNoteSetting.lifeLine) {
      this.isActive = false;
    }

      if (!this.isJudged) {

        let rotateInput = getRotateJdgeAngle(time);

        if (this.notePosition <= CONFIG.uslNoteSetting.lifeLine) {
          this.judgeStyle = 3;
        }

      
        // 進入prefect判定區間
        else if (this.notePosition <= CONFIG.uslNoteSetting.judgeLine + CONFIG.rotate.prefectRange
          && this.notePosition >= CONFIG.uslNoteSetting.judgeLine - CONFIG.rotate.prefectRange)
        {
          // 角度回傳為正 + 音符方向為正
          if (rotateInput === 1 && this.direction === 1) {
            this.judgeStyle = 1;
          }
          // 角度回傳為負 + 音符方向為負
          else if (rotateInput === 2 && this.direction === 0) {
            this.judgeStyle = 1;
          } 
        }


        // 進入great判定區間
        else if (this.notePosition <= CONFIG.uslNoteSetting.judgeLine + CONFIG.rotate.greatRange
          && this.notePosition >= CONFIG.uslNoteSetting.judgeLine - CONFIG.rotate.greatRange)
        {
          // 角度回傳為正 + 音符方向為正
          if (rotateInput === 1 && this.direction === 1) {
            this.judgeStyle = 2;
          }
          // 角度回傳為負 + 音符方向為負
          else if (rotateInput === 2 && this.direction === 0) {
            this.judgeStyle = 2;
          }
        }

      // 確保 judgeStyle 有值才進行判定
      if (this.judgeStyle !== 0 && !this.isJudged) {
        switch(this.judgeStyle) {
          case 1:
            this.isJudged = true;
            this.isActive = false;
            CONFIG.score.combo++;
            CONFIG.score.prefect++;
            playSound('hit');
            addJudgeText(1);
            break;
          case 2:
            this.isJudged = true;
            this.isActive = false;
            CONFIG.score.combo++;
            CONFIG.score.great++;
            playSound('hit');
            addJudgeText(2);
            break;
          case 3:
            this.isJudged = true;
            this.isActive = false;
            CONFIG.score.miss++;
            CONFIG.score.combo = 0; // 重置連擊數
            addJudgeText(3);
            break;
        }
      }
    }
      
  }

  display() {
    if (this.isJudged) return; // 【效能優化】已判定完畢直接離開

    // 【效能優化】如果時間還太早（甚至還沒開始移動、或是剛要移動且位置在發源處），跳過渲染
    if (this.notePosition >= CONFIG.uslNoteSetting.initialPosition) return;

    if(this.isActive && !this.isJudged && this.notePosition >= 0) {

      push();
      if(this.direction === 1) {
        stroke(...CONFIG.rotate.strokeColorClockwise);
      } else if(this.direction === 0) {
        stroke(...CONFIG.rotate.strokeColorCounterClockwise);
      }
      
      strokeWeight(this.noteStrokeWeight);
      circle(width / 2, height / 2, this.notePosition); // 在判定線外圍繪製一個圓表示旋轉
      pop();
  }

  }


}



// 改用陣列記錄過去一小段時間的角度，避免多個 Rotate 音符彼此干擾 timeNow
let angleHistory = [];

function getRotateJdgeAngle(time) {
  if (angleHistory.length === 0 || angleHistory[angleHistory.length - 1].time !== time) {
    // 將當下時間與總角度存入歷史紀錄
    angleHistory.push({ time: time, angle: angleCount_360() });
  }

  // 移除超過 100 毫秒以前的紀錄 (以 100ms 內的轉動量來判定)
  while (angleHistory.length > 0 && time - angleHistory[0].time > 100) {
    angleHistory.shift();
  }

  if (angleHistory.length > 0) {
    let oldest = angleHistory[0];
    let latest = angleHistory[angleHistory.length - 1];
    let diff = latest.angle - oldest.angle;

    // 若 100ms 內角度變化(diff) >= 需要的角度，視為持續順時針轉
    if (diff >= CONFIG.rotate.judgeNeedAngle) {
      return 1;
    } 
    // 若 100ms 內角度變化(diff) <= 負的需要的角度，視為持續逆時針轉
    else if (diff <= -CONFIG.rotate.judgeNeedAngle) {
      return 2;
    }
  }

  return 0;
}