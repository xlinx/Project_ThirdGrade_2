class drag{
    constructor(triggerTimeStart, noteLandStart, triggerTimeEnd, noteLandEnd, direction) {
        this.triggerTimeStart = triggerTimeStart;
        this.noteLandStart = noteLandStart;
        this.triggerTimeEnd = triggerTimeEnd;
        this.noteLandEnd = noteLandEnd;
        this.direction = direction;
        this.noteSpeed = CONFIG.universalNoteSettings.speed;
        this.startPosition = CONFIG.universalNoteSettings.initialPosition;
        this.endPosition = CONFIG.universalNoteSettings.lifeLine;
        this.noteStrokeWeight = CONFIG.drag.noteStrokeWeight;
        this.density = CONFIG.drag.density;
    }

    display(time) {
    const averageMs = (this.triggerTimeEnd - this.triggerTimeStart) / this.density;
    const dir = this.direction === 1 ? 1 : -1;
    let averageAng = (this.noteLandEnd - this.noteLandStart) / this.density * dir;

    // 從當前時間到結束時間的剩餘毫秒數
    const remainingMs = this.triggerTimeEnd - time;
    // 從 startPosition 走到 judgePosition 需要的時間（毫秒）
    const requiredMs = (this.startPosition - this.endPosition) / this.noteSpeed * (1000 / CONFIG.display.frameRate);

  
        for (let i = 0; i <= this.density; i++) {
            const everyDragTriggerTime = this.triggerTimeStart + averageMs * i;
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