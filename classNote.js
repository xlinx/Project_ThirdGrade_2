class note {
    constructor(triggerTime, noteLand) {
    this.triggerTime = triggerTime;
    this.noteLand = noteLand;
    this.noteSpeed = CONFIG.uslNoteSetting.speed;
    this.notePosition = CONFIG.uslNoteSetting.initialPosition;
    this.noteStrokeWeight = CONFIG.note.noteStrokeWeight;
    this.isActive = false;  //是否已啟動
    this.judgeAllowAngle = CONFIG.note.judgeAllowAngle;  // 判定允許的角度範圍(一半)
    this.judgeStyle = 0;  // 0: 未判定, 1: Perfect, 2: Good, 3: Miss  
    this.isJudged = false;
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


    //如果音符超過great判定區域，開啟判定
    if (!this.isJudged){
      // 將音符和玩家的角度都轉換為 0~360 度，以利比對
     
      // // 檢查目前的音符是不是「畫面上最前面、且還沒被判定的音符」
      // let targetNote = Notes.find(n => n.isActive && !n.isJudged);

      // if (targetNote === this) {
      //   push();
      //   fill(255, 0, 0); 
      //   noStroke();
      //   textSize(24);
      //   text("Note: " + noteAngleDeg.toFixed(1) + "°", 100, 600);
      //   text("Player: " + playerAngleDeg.toFixed(1) + "°", 100, 650);
      //   text("Diff: " + angleDiff.toFixed(1) + "°", 100, 700);
      //   pop();
      // }

      //miss不受角度干擾
      if (this.notePosition <= CONFIG.uslNoteSetting.lifeLine) {
        this.judgeStyle = 3; 
      }
      else if (this.notePosition < CONFIG.uslNoteSetting.judgeLine + CONFIG.uslNoteSetting.judgeRange)
      {
        if(Math.abs(this.getNoteAngleDiff()) <= CONFIG.uslNoteSetting.prefectRange) {
          this.judgeStyle = 1; 
        } else if(Math.abs(this.getNoteAngleDiff()) <= CONFIG.uslNoteSetting.greatRange) {
          this.judgeStyle = 2; 
        } 
      }
     

       switch(this.judgeStyle) {
      case 1:
         this.isJudged = true;
         this.isActive = false;
         CONFIG.score.combo++;
         CONFIG.score.prefect++;
        break;
      case 2:
         this.isJudged = true;
         this.isActive = false;
         CONFIG.score.combo++;
         CONFIG.score.great++;
        break;
      case 3:
         this.isJudged = true;
         this.isActive = false;
        CONFIG.score.miss++;
         CONFIG.score.combo = 0; // 重置連擊數
        break;
    }
    }

   
  }

    display() {
    if(this.isActive && !this.isJudged &&  this.notePosition >= 0) {
      // 初始角度寬度
      const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;
      const centerAngle = this.getNoteCenterAngle();  
      const startAngle = centerAngle - arcWidth / 2;
      const endAngle = centerAngle + arcWidth / 2;
      
      push();
      strokeWeight(this.noteStrokeWeight);
      stroke(...CONFIG.note.strokeColor);
      arc(width / 2, height / 2, this.notePosition, this.notePosition, startAngle, endAngle);
      pop();
    }
  }

  // 計算該 noteLand 對應的中心角度
  getNoteCenterAngle() {
    return this.noteLand * (TWO_PI / 32);
  }

  getNoteAngleDiff(){
     let noteAngleDeg = degrees(this.getNoteCenterAngle()); // 將音符的角度(弧度)轉為度數
      let playerAngleDeg = ((angleCount_360() % 360) + 360) % 360; // 將玩家累積的角度強制轉換為 0~360 度圓內

      // 計算兩者之間的最小夾角差值 (0~180度)
      let angleDiff = Math.abs(playerAngleDeg - noteAngleDeg);
      return angleDiff;
  }

}