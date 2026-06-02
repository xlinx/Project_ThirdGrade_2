class drag{
    constructor(triggerTimeStart, noteLandStart, triggerTimeEnd, noteLandEnd, direction) {
        this.triggerTimeStart = triggerTimeStart;
        this.noteLandStart = noteLandStart;
        this.triggerTimeEnd = triggerTimeEnd;
        this.noteLandEnd = noteLandEnd;
        this.direction = direction;
        this.noteSpeed = CONFIG.uslNoteSetting.speed;

        this.startPosition = CONFIG.uslNoteSetting.initialPosition;
        this.endPosition = CONFIG.uslNoteSetting.judgeLine;
        this.lifePosition = CONFIG.uslNoteSetting.lifeLine;

        this.noteStrokeWeight = CONFIG.drag.noteStrokeWeight;
        this.density = CONFIG.drag.density;  

        // 【新增】陣列來紀錄每一個 density 區段的判定狀態
        this.isJudged = new Array(this.density + 1).fill(false);  //建立一個長度為 density + 1 的陣列
        this.judgeStyle = new Array(this.density + 1).fill(0); // 0: 未判定, 1: Perfect, 2: Good, 3: Miss
        this.isActive = new Array(this.density + 1).fill(false); // 每個細分音符是否已啟動
    }

    display(time) {
    // 從 startPosition 走到 judgeLine 需要的時間（毫秒）
    const requiredMs = (this.startPosition - this.endPosition) / this.noteSpeed * (1000 / CONFIG.display.frameRate);

    // 【效能優化】如果時間還沒到（提早太多），或者這個拖曳音符已經結束很久（延遲太多），直接不進入高消耗的 density 迴圈運算
    if (time < this.triggerTimeStart - requiredMs - 2000) return;
    if (time > this.triggerTimeEnd + 2000) return;

    // 每個細分音符之間的平均毫秒數
    const averageMs = (this.triggerTimeEnd - this.triggerTimeStart) / this.density; 
    // 計算拖曳總角度距離（含順逆時針修正）
    let diff = this.noteLandEnd - this.noteLandStart;
    if (this.direction === 1) { // 順時針
      if (diff < 0) diff += 32;
    } else { // 逆時針
      if (diff > 0) diff -= 32;
    }
    // 每個細分音符之間的平均角度差
    let averageAng = diff / this.density; 

    // 從當前時間到結束時間的剩餘毫秒數
    const remainingMs = this.triggerTimeEnd - time;

  
        for (let i = 0; i <= this.density; i++) {
        
            // 計算每個細分音符的觸發時間
            const everyDragTriggerTime = this.triggerTimeStart + averageMs * i;
            // 計算每個細分音符的落點角度
            const everyDragLand = this.noteLandStart + averageAng * i;
            // 從應該啟動的時間算起經過了多少毫秒
            const elapsedMs = time - (everyDragTriggerTime - requiredMs);

            let everyNotePosition;
            if (elapsedMs < 0) {
                // 還沒啟動
                everyNotePosition = this.startPosition;
            } else {
                // 已啟動，計算已下降的距離
                const elapsedFrames = elapsedMs / (1000 / CONFIG.display.frameRate);
                everyNotePosition = this.startPosition - this.noteSpeed * elapsedFrames;
            }

            if(!this.isJudged[i]) {

            // 如果超過生命線 (miss)不受角度干擾
            if (everyNotePosition <= this.lifePosition) {
                this.judgeStyle[i] = 3;
                this.isJudged[i] = true;
            } 
            // 進入判定區間 (judgeLine 到 lifeLine 之間)才開始判定角度
            else if (everyNotePosition < this.endPosition) {
                // 計算角度差異，並安全轉換為 0~360
                let noteAngleDeg = ((degrees(everyDragLand * (TWO_PI / 32)) % 360) + 360) % 360;
                // 玩家角度已經在 angleCount_360L() 中轉為 0~360 度
                
                let angleDiff = Math.abs(angleCount_360L() - noteAngleDeg);

                // 修正 0 度與 360 度跨越的最短差距
                if (angleDiff > 180) {
                    angleDiff = 360 - angleDiff;
                }
                
                if (angleDiff <= CONFIG.uslNoteSetting.prefectRange) {
                    this.judgeStyle[i] = 1;
                    this.isJudged[i] = true;
                } else if (angleDiff <= CONFIG.uslNoteSetting.greatRange) {
                    this.judgeStyle[i] = 2;
                    this.isJudged[i] = true;
                }
            }


            switch(this.judgeStyle[i]) {
                case 1:
                    this.isJudged[i] = true;
                    this.isActive[i] = false;
                    CONFIG.score.combo++;
                    CONFIG.score.prefect++;
                    addJudgeText(1);
                    playSound('hit');
                    break;
                case 2:
                    this.isJudged[i] = true;
                    this.isActive[i] = false;
                    CONFIG.score.combo++;
                    CONFIG.score.great++;
                    addJudgeText(2);
                    playSound('hit');
                    break;
                case 3:
                    this.isJudged[i] = true;
                    this.isActive[i] = false;
                    CONFIG.score.miss++;
                    CONFIG.score.combo = 0; // 重置連擊數
                    addJudgeText(3);
                    break;
                }
            }
                


            // 在有效範圍內且未被判定才繪製
            if (this.isJudged[i]) continue;
            if (everyNotePosition < this.lifePosition || everyNotePosition >= this.startPosition) continue;


            const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;  // 基礎弧寬
            const centerAngle = everyDragLand * (TWO_PI / 32);
            const startAngle = centerAngle - arcWidth / 2;
            const endAngle = centerAngle + arcWidth / 2;

            push();
            stroke(...CONFIG.drag.strokeColor);
            strokeWeight(this.noteStrokeWeight);
            arc(width / 2, height / 2, everyNotePosition, everyNotePosition, startAngle, endAngle);
            pop();
            
        }
    }
}