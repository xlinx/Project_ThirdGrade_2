class Rotate {  
    constructor(triggerTime, direction) {
        this.triggerTime = triggerTime;
        this.direction = direction;
        this.noteSpeed = CONFIG.universalNoteSettings.speed;
        this.notePosition = CONFIG.universalNoteSettings.initialPosition;
        this.noteStrokeWeight = CONFIG.rotate.noteStrokeWeight;
        this.isActive = false;
    }

    update(time) {
    // 當前時間 到 判定時間 的剩餘毫秒數
    const remainingMs = this.triggerTime - time;
    // 當下音符到達終點所需的毫秒數
    const requiredMs = (this.notePosition - CONFIG.universalNoteSettings.lifeLine) / this.noteSpeed * (1000 / CONFIG.display.frameRate);  //幀數 × 每幀時間 = 總時間(ms)
    
    //當音符需要的時間 >= 剩餘時間時啟動，使其在 triggerTime 時到達終點
    if(remainingMs <= requiredMs && !this.isActive) {
      this.isActive = true;
    }
    //音符活動時持續移動
    if(this.isActive && this.notePosition > CONFIG.universalNoteSettings.lifeLine) {
      this.notePosition -= this.noteSpeed;
    }else if(this.notePosition <= CONFIG.universalNoteSettings.lifeLine) {
      this.isActive = false;
    }
  }

  display() {
    if(this.isActive && this.notePosition >= 0) {

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