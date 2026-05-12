class cutsceneText {
    constructor() {
        // --- 關鍵點：在這裡隨機選一個索引 ---
        let randomIndex = floor(random(0, CONFIG.cutsceneText.obj.length));
        this.angValue = 0; // 用於控制旋轉的變量
        this.centerAngle = random([0, 90 , 180 , 270]); // 隨機選擇旋轉中心角度（0 或 180 度）
        this.content = CONFIG.cutsceneText.obj[randomIndex].text; 
        this.textSize = CONFIG.cutsceneText.textSize;
        this.radians = CONFIG.uslNoteSetting.judgeLine / 2 + 30; 
    }

    display() {
        push();
        // translate(width / 2, height / 2);  // 在 cutsceneImg 中進行了平移，不需要再動一次
        rotate(radians(this.angValue)); 
        this.angValue += CONFIG.cutsceneText.rotationSpeed;

        // 根據字數自動調整間距，避免長句子重疊
        let spacing = radians(min(6, 100 / this.content.length)); 
        let totalAngle = spacing * (this.content.length - 1);
        let startAngle = this.centerAngle - (totalAngle / 2);

        textAlign(CENTER, CENTER);
        textSize(this.textSize);
        fill(CONFIG.cutsceneText.textColor);
        noStroke();

        for (let i = 0; i < this.content.length; i++) {
            let charAngle = startAngle + i * spacing;

            push();
                stroke(100);
                strokeWeight(2);
                rotate(charAngle + HALF_PI); 
                translate(0, -this.radians); 
                
                text(this.content[i], 0, 0);
            pop();
        }
        pop();
    }
}



class cutsceneImg {
    constructor() {
        // 直接從預處理好的陣列中隨機抽取
        this.maskedImg = random(preMaskedImgs); 
        
        this.isOut = false;
        this.isHolding = false;
        this.startTime = 0;
        this.isFinished = false;
        

        this.arcAngle = 0; // 用於控制弧形的旋轉

        this.opacityMask = new OpacityMask(2); // 初始化過場黑幕，傳入速度參數
        this.opacity = this.opacityMask.update(); // 獲取初始透明度
        
    }

    display() {
        if (!this.maskedImg || this.isFinished) return;
        this.opacity = this.opacityMask.update(); // 獲取初始透明度
       
        // --- 繪圖 包含所有cutscene元素 ---
        push();
        translate(width / 2, height / 2);
        imageMode(CENTER);
        
        tint(255); 
        image(this.maskedImg, 0, 0, CONFIG.uslNoteSetting.judgeLine, CONFIG.uslNoteSetting.judgeLine); 
        
        CutsceneText[0].display(); 

        this.arcAngle += CONFIG.cutsceneText.rotationSpeed * 5; // 旋轉弧形
        rotate(radians(this.arcAngle));
        stroke(255);
        strokeWeight(2);
        arc(0, 0, CONFIG.uslNoteSetting.judgeLine+25, CONFIG.uslNoteSetting.judgeLine+25, -PI, 0);
        arc(0, 0, CONFIG.uslNoteSetting.judgeLine+25, CONFIG.uslNoteSetting.judgeLine+25, PI, PI/2);
        
        noStroke();
        fill(0, this.opacity);
        circle(0, 0, CONFIG.uslNoteSetting.initialPosition);
        pop();
        
    }
}



