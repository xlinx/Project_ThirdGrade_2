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
    // 當前時間 到 判定時間 的剩餘毫秒數
    const remainingMs = this.triggerTime - time;
    // 當下音符到達終點所需的毫秒數
    const requiredMs = (this.notePosition - CONFIG.uslNoteSetting.lifeLine) / this.noteSpeed * (1000 / CONFIG.display.frameRate);  //幀數 × 每幀時間 = 總時間(ms)
    
    //當音符需要的時間 >= 剩餘時間時啟動，使其在 triggerTime 時到達終點
    if(remainingMs <= requiredMs && !this.isActive) {
      this.isActive = true;
    }
    //音符活動時持續移動
    if(this.isActive && this.notePosition > CONFIG.uslNoteSetting.lifeLine) {
      this.notePosition -= this.noteSpeed;
    }else if(this.notePosition <= CONFIG.uslNoteSetting.lifeLine) {
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
            console.log("Perfect");
            break;
          case 2:
            this.isJudged = true;
            this.isActive = false;
            console.log("Good");
            break;
          case 3:
            this.isJudged = true;
            this.isActive = false;
            console.log("Miss");
            break;
        }
      }
    }
      
  }

  display() {
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



let timeGap = 20;  //每20毫秒檢查一次
let timeNow = 0;
let angleNow = 0;
let isTimeCheck = false;

function getRotateJdgeAngle(time) {

  // initialize
  if (!isTimeCheck) {
    timeNow = time;
    angleNow = angleCount_360();
    isTimeCheck = true;
    return 0;
  }

  // 每隔 20ms 檢查
  if (time - timeNow >= timeGap) {
    if (angleCount_360() - angleNow >= CONFIG.rotate.judgeNeedAngle) {
      return 1;
    }else if (angleNow - angleCount_360() <= -CONFIG.rotate.judgeNeedAngle) {
      return 2;
    } 

     timeNow = time;
    angleNow = angleCount_360();

  }
  return 0;
}