class note {
  constructor(triggerTime, noteLand, noteConfig = {}) {
    this.triggerTime = triggerTime;
    this.noteLand = noteLand;
    this.noteSpeed = noteConfig.speed;
    this.notePosition = noteConfig.initialPosition;
    this.isActive = false;  //是否已啟動
  }

  update(time) {
    // 當前時間 到 判定時間 的剩餘毫秒數
    const remainingMs = this.triggerTime - time;
    // 當下音符到達終點所需的毫秒數
    const requiredMs = (this.notePosition / this.noteSpeed) * (1000 / CONFIG.display.frameRate);  //幀數 × 每幀時間 = 總時間(ms)
    
    //當音符需要的時間 >= 剩餘時間時啟動，使其在 triggerTime 時到達終點
    if(remainingMs <= requiredMs && !this.isActive) {
      this.isActive = true;
    }
    //音符活動時持續移動
    if(this.isActive && this.notePosition > CONFIG.judgeLine.a) {
      this.notePosition -= this.noteSpeed;
    }else if(this.notePosition <= CONFIG.judgeLine.a) {
      this.isActive = false;
    }
  }

      display() {
    if(this.isActive && this.notePosition >= 0) {
      // 32種角度，每種11.25度 (TWO_PI / 32)
      const startAngle = (this.noteLand - 1) * (TWO_PI / 32);
      const endAngle = this.noteLand * (TWO_PI / 32);
      arc(width / 2, height / 2, this.notePosition, this.notePosition, startAngle, endAngle);
    }
  }
}