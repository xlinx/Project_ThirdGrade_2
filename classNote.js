class note {
    constructor(triggerTime, noteLand) {
    this.triggerTime = triggerTime;
    this.noteLand = noteLand;
    this.noteSpeed = CONFIG.universalNoteSettings.speed;
    this.notePosition = CONFIG.universalNoteSettings.initialPosition;
    this.noteStrokeWeight = CONFIG.note.noteStrokeWeight;
    this.isActive = false;  //是否已啟動
    this.judgeAllowAngle = CONFIG.note.judgeAllowAngle;  // 判定允許的角度範圍(一半)
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

    // if(this.isActive && )
  }

    display() {
    if(this.isActive && this.notePosition >= 0) {
      // 初始角度寬度
      const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;
      const centerAngle = this.noteLand  * (TWO_PI / 32);  // 該 land 的中心角度
      const startAngle = centerAngle - arcWidth / 2;
      const endAngle = centerAngle + arcWidth / 2;
      
      push();
      strokeWeight(this.noteStrokeWeight);
      stroke(...CONFIG.note.strokeColor);
      arc(width / 2, height / 2, this.notePosition, this.notePosition, startAngle, endAngle);
      pop();
    }
  }
}