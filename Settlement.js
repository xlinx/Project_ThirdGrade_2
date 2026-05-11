function settlement() {
    scoreDisplay();

    if(botton === 1){
        // 回到選歌畫面
        status = 1;
        selectedSongIndex = -1;
        botton = 0;  // 清除按鈕，防止立即觸發選歌

        angleHistory = [];
    }

}

let angValue = 0; 
let imgAngValue = 0; 
let maskedImg = null; // 用來儲存裁切後的圖片

// 專門處理圖片遮罩，只需在暫停那一刻執行一次
function prepareMaskedImage() {
    let r = CONFIG.pause.radius;
    let maskImg = createGraphics(r, r);
    maskImg.fill(255);
    maskImg.noStroke();
    maskImg.circle(r / 2, r / 2, r);

    maskedImg = img.get();
    maskedImg.mask(maskImg);
    maskImg.remove();
}

function pause() {
    // 1. 處理暫停邏輯 (僅在切換狀態時執行)
    if (song && !song.paused) {
        prepareMaskedImage();
        song.pause();
    }

    // --- 背景層 (靜止) ---
    // push();
    //     rectMode(CENTER);
    //     fill(255, 100);
    //     noStroke();
    //     rect(CONFIG.pause.selectDistance, 0, CONFIG.pause.selectWidth, CONFIG.pause.selectHeight);
    //     rect(-CONFIG.pause.selectDistance, 0, CONFIG.pause.selectWidth, CONFIG.pause.selectHeight);
    // pop();

    // 左圓
push();
    translate(width / 2 , height/2);
    fill(255, 100);
    noStroke();

    circle(0, 0, CONFIG.pause.selectRadius);
// 右圓
    circle(0, 0, CONFIG.pause.selectRadius);
//中間遮罩
    fill(0);
    circle(0, 0, CONFIG.pause.selectRadiusMask);
pop();


    // --- 旋轉核心層 ---
    push();
        translate(width / 2, CONFIG.pause.position);
        
        // A. 基礎外圈旋轉
        rotate(radians(angValue));
        angValue += CONFIG.pause.rotateSpeed;

        // 底圓
        fill(0);
        noStroke();
        circle(0 ,0 ,CONFIG.pause.radius + 10);

        // B. 圖片旋轉 (在此 push 內再次 rotate)
        push();
            rotate(radians(imgAngValue));
            imgAngValue -= CONFIG.pause.imgRotateSpeed;
            imageMode(CENTER);
            if (maskedImg) {
                image(maskedImg ,0 ,0 , CONFIG.pause.radius, CONFIG.pause.radius);
            }
        pop();

        // C. 裝飾弧線 (跟隨基礎外圈旋轉)
        noFill();
        strokeWeight(1);
        stroke(255, 200);
        let arcSize = CONFIG.pause.radius + 30;
        arc(0, 0, arcSize, arcSize, radians(20), radians(160));
        arc(0, 0, arcSize, arcSize, radians(200), radians(340));

        // D. 中心裝飾圓
            strokeWeight(0.5);
            stroke(0);
            fill(100);
            circle(0 ,0 ,CONFIG.pause.radius - 250);
            fill(0);
            noStroke();
            circle(0 ,0 ,CONFIG.pause.radius - 260);
    pop();

    // --- 文字層 (靜止) ---
    push();
        translate(width / 2, height / 2);
        textAlign(CENTER, CENTER);
        fill(255);
        noStroke();
        textSize(CONFIG.pause.textSize);
        text("turn",  500, 0);
    pop();
}