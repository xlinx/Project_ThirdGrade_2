function settlement() {
    scoreDisplay();

    if(botton === 1){
        // 回到選歌畫面
        status = 3.5;
        selectedSongIndex = -1;

        angleHistory = [];
    }

}

let radiusAnima = 0;
let angValue = 0; 
let imgAngValue = 0; 
let arcAngValue = 0; // 用於控制裝飾弧線旋轉的變量
let maskedImg = null; // 用來儲存裁切後的圖片
let stopRadius ;

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
    let currentDeg = angleCount_360L(); 

    // 1. 處理暫停邏輯 (僅在切換狀態時執行)
    if (song && !song.paused) {
        prepareMaskedImage();
        song.pause();
        stopRadius= CONFIG.pause.radius;
        radiusAnima = 0;
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
    noStroke();
    if(currentDeg > 90 && currentDeg <= 270){
        fill(233,208,194);
    } else {
        fill(100,100,100);
    }

    // 讓 radiusAnima 慢慢增加到 CONFIG.pause.radius，創造動畫效果
    if (radiusAnima < CONFIG.pause.selectRadius) {
        radiusAnima += (CONFIG.pause.selectRadius - radiusAnima) * 0.1;
    }


    arc(0, 0, radiusAnima, radiusAnima, HALF_PI, PI + HALF_PI);
// 右圓
    if(currentDeg > 0 && currentDeg <= 90 || currentDeg > 270 && currentDeg <= 360){
        fill(233,208,194);
    } else {
        fill(100,100,100);
    }
    arc(0, 0, radiusAnima, radiusAnima, -HALF_PI , HALF_PI);
//中間遮罩
    fill(0);
    circle(0, 0, CONFIG.pause.selectRadiusMask);
    rectMode(CENTER);
    rect(0, 0, 100, width);
//裝飾弧
    rotate(radians(arcAngValue));
    arcAngValue += 0.2;
    noFill();
    strokeWeight(2);
    stroke(255);
    arc(0, 0, radiusAnima + 30, radiusAnima + 30, radians(20), radians(160));
    arc(0, 0, radiusAnima + 30, radiusAnima + 30, radians(200), radians(340));

pop();


    // --- 旋轉核心層 ---
    push();

        if(currentDeg > 250 && currentDeg < 280){
            stopRadius += ((CONFIG.pause.radius + 100) - stopRadius) * 0.1;
        }else{
            stopRadius += (CONFIG.pause.radius - stopRadius) * 0.1;
        }
        translate(width / 2, CONFIG.pause.position);
        
        // A. 基礎外圈旋轉
        rotate(radians(angValue));
        angValue += CONFIG.pause.rotateSpeed;

        // 底圓
        fill(0);
        noStroke();
        circle(0 ,0 ,stopRadius + 10);

        // B. 圖片旋轉 
        push();
            rotate(radians(imgAngValue));
            imgAngValue -= CONFIG.pause.imgRotateSpeed;
            imageMode(CENTER);
            if (maskedImg) {
                image(maskedImg ,0 ,0 , stopRadius, stopRadius);
            }
        pop();

        // C. 裝飾弧線 (跟隨基礎外圈旋轉)
        noFill();
        strokeWeight(1);
        stroke(255, 200);
        let arcSize = stopRadius + 30;
        arc(0, 0, arcSize, arcSize, radians(20), radians(160));
        arc(0, 0, arcSize, arcSize, radians(200), radians(340));

        // D. 中心裝飾圓
            strokeWeight(0.5);
            stroke(0);
            fill(100);
            circle(0 ,0 ,stopRadius - 250);
            fill(0);
            noStroke();
            circle(0 ,0 ,stopRadius - 260);
    pop();

    // --- 文字層 (靜止) ---
    stopSelectText();

    playerMark();

    if (backToMenu() && botton === 1) {
        // 回到選歌畫面
        status = 1;
        selectedSongIndex = -1;
        botton = 0; // 重置按鈕
    }else if (backGame() && botton === 1) {
        status = 2;
        botton = 0; // 重置按鈕
    }

 
}




function backToMenu(){
    if(angleCount_360L() > 90 && angleCount_360L() <= 270){
        return true;
    }
}

function backGame(){
    if((angleCount_360L() >= 0 && angleCount_360L() <= 90) || (angleCount_360L() > 270 && angleCount_360L() <= 360)){
        return true;
    }
    return false;
}


function stopSelectText() {
    let r = radiusAnima / 2 - CONFIG.pause.selectRadiusTextDeValue;
    let totalAngle = radians(40); // 每個單字的展開弧度
    
    // 呼叫兩次輔助函式，分別處理左邊和右邊
    drawArcText("MENU", PI, r, totalAngle);   // 在左邊 (180度)
    drawArcText("RESUME", 0, r, totalAngle);  // 在右邊 (0度)
}

// 這是輔助函式，負責執行重複的繪製動作
function drawArcText(str, centerAngle, r, totalAngle) {
    push();
    translate(width / 2, height / 2);
    
    // 計算起始角度：中心點角度 - (總角度的一半)，確保單字居中
    let startAngle = centerAngle - (totalAngle / 2);

    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    textSize(CONFIG.pause.textSize);

    for (let i = 0; i < str.length; i++) {
        // 計算每個字母的角度位置
        let charAngle = startAngle + (i / (str.length - 1)) * totalAngle;

        push();
            // 旋轉到該字母的角度
            rotate(charAngle + HALF_PI); 
            // 移動到指定半徑
            translate(0, -r); 
            
            text(str[i], 0, 0);
        pop();
    }
    pop();
}