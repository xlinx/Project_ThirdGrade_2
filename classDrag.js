class drag{
    constructor(triggerTimeStart, noteLandStart, triggerTimeEnd, noteLandEnd, direction) {
        this.triggerTimeStart = triggerTimeStart;
        this.noteLandStart = noteLandStart;
        this.triggerTimeEnd = triggerTimeEnd;
        this.noteLandEnd = noteLandEnd;
        this.direction = direction;
        this.noteSpeed = CONFIG.uslNoteSetting.speed;
        this.startPosition = CONFIG.uslNoteSetting.initialPosition;
        this.endPosition = CONFIG.uslNoteSetting.lifeLine;
        this.noteStrokeWeight = CONFIG.drag.noteStrokeWeight;
        this.density = CONFIG.drag.density;  

        // 【新增】陣列來紀錄每一個 density 區段的判定狀態
        this.isJudged = new Array(this.density + 1).fill(false);  //建立一個長度為 density + 1 的陣列
        this.judgeStyle = new Array(this.density + 1).fill(0); // 0: 未判定, 1: Perfect, 2: Good, 3: Miss
        this.isActive = new Array(this.density + 1).fill(false); // 每個細分音符是否已啟動
    }

    display(time) {
    // 每個細分音符之間的平均毫秒數
    const averageMs = (this.triggerTimeEnd - this.triggerTimeStart) / this.density; 
    // 決定順逆時針
    const dir = this.direction === 1 ? 1 : -1;    
    // 每個細分音符之間的平均角度差
    let averageAng = (this.noteLandEnd - this.noteLandStart) / this.density * dir; 
    // 從當前時間到結束時間的剩餘毫秒數
    const remainingMs = this.triggerTimeEnd - time;
    // 從 startPosition 走到 judgePosition 需要的時間（毫秒）
    const requiredMs = (this.startPosition - this.endPosition) / this.noteSpeed * (1000 / CONFIG.display.frameRate);

  
        for (let i = 0; i <= this.density; i++) {

             if (this.isJudged[i]) continue; // 已經判定過的細分音符就跳過
             
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


            // 如果超過生命線 (miss)不受角度干擾
            if (everyNotePosition <= this.endPosition) {
                this.judgeStyle[i] = 3;
                this.isJudged[i] = true;
            } 
            // 進入判定區間 (judgeLine + judgeRange)
            else if (everyNotePosition < CONFIG.uslNoteSetting.judgeLine + CONFIG.uslNoteSetting.judgeRange) {
                // 計算角度差異
                let noteAngleDeg = degrees(everyDragLand * (TWO_PI / 32));
                let playerAngleDeg = ((angleCount_360() % 360) + 360) % 360;
                
                let angleDiff = Math.abs(playerAngleDeg - noteAngleDeg);
                // (選用) 修正 0 度與 360 度跨越的最短差距：angleDiff = Math.min(angleDiff, 360 - angleDiff);

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
                    console.log("Perfect!");
                    break;
                case 2:
                    this.isJudged[i] = true;
                    this.isActive[i] = false;
                    console.log("Good!");
                    break;
                case 3:
                    this.isJudged[i] = true;
                    this.isActive[i] = false;
                    console.log("Miss!");
                    break;
                }


            // 在有效範圍內才繪製
            if (everyNotePosition < this.endPosition || everyNotePosition >= this.startPosition) continue;


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