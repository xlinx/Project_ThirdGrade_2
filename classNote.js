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
    const requiredMs = (this.notePosition - CONFIG.judgeLine.a) / this.noteSpeed * (1000 / CONFIG.display.frameRate);  //幀數 × 每幀時間 = 總時間(ms)
    
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
      // 初始角度寬度（32分之1的圓周）
      const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;
      // 當半徑變小時，增加角度寬度以保持弧長不變
      const dynamicArcWidth = arcWidth * CONFIG.note.initialPosition / this.notePosition;
      
      const centerAngle = this.noteLand  * (TWO_PI / 32);  // 該 land 的中心角度
      const startAngle = centerAngle - dynamicArcWidth / 2;
      const endAngle = centerAngle + dynamicArcWidth / 2;
      
      arc(width / 2, height / 2, this.notePosition, this.notePosition, startAngle, endAngle);
    }
  }
}