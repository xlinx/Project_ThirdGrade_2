// 各種遊戲中的效果

// 底圖片/遮罩
class GameEffect {
    constructor(config) {
        this.config=config
        this.maskImg = null; // 遊戲底圖遮罩
        this.initGameMaskAlpha = 255; 
        this.angValue = 0; // 用於控制旋轉的變量
    }

    // 新增：重置淡入控制變數
    reset() {
        this.initGameMaskAlpha = 255;
    }

    update(){
            if (img && status === 2) {
                this.angValue -= this.config.gameEffect.rotationSpeed*0.4; // 旋轉速度
                rectMode(CENTER);
                this.initGameMaskAlpha -= 255 * 0.005; // 逐漸淡出
                fill(0, this.initGameMaskAlpha);
                noStroke();
                rect(width / 2, height / 2, width, height);

            }
        }

    maskedGameImage() {
        if (!img) return;


        let d = CONFIG.uslNoteSetting.initialPosition; 
        this.maskImg = createGraphics(d, d);
        this.maskImg.fill(255);
        this.maskImg.noStroke();
        this.maskImg.circle(d / 2, d / 2, d);

        let gameMaskedImg = img.get();
        gameMaskedImg.mask(this.maskImg);
        this.maskImg.remove();

        push();
            translate(width / 2, height / 2);
            
            rotate(radians(this.angValue*0.3));
            
            imageMode(CENTER);
            tint(255, 20); 
            drawingContext.shadowBlur = 0; 

            image(gameMaskedImg, 0, 0, d, d);
        pop();

        this.update();
    }   

    resetGameEffect() {
        this.initGameMaskAlpha = 255;
    }
}