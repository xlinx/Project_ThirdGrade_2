function pushHint() {
    push();
    noStroke();
    textSize(30);
    fill(255);
    text("Press any Keyt", width / 2 - 100, height / 2);
    pop();

    if (keyIsPressed) {
        status = 0;
    }
}



function startLogic(){

    isplaying = false;

    // 取得累積角度，並取絕對值保持正向累加
    let accumulatedAngle = Math.abs(angleCount_360());
    
    // 將累積角度限制在一圈內 (0 ~ 365 )
    let displayAngle = accumulatedAngle % 365;

    let start = -HALF_PI;
    let stop = start + map(displayAngle, 0, 365, 0, TWO_PI);
    
    // console.log(displayAngle);

    push();

    let glow = map(sin(frameCount * 0.05), -1, 1, 0, 255);
    let starBlur = map(sin(frameCount * 0.05), -1, 1, 0, 20);
    drawingContext.shadowBlur = starBlur; 
    drawingContext.shadowColor = `rgb(255, 255, 255)`;
    fill(255, 255, 255,glow);
    noStroke();
    textSize(30);
    text("Rotate to Start", width / 2 - 100, height / 2);


    noFill();
    let starC = color(255, 255, 100); 
    let endC = color(255, 255, 255);  

    let amount = map(displayAngle, 0, 365, 0, 1);
    let Gradient = lerpColor(starC, endC, amount);

    strokeWeight(20);
    stroke(Gradient);

    arc(
        width/2,
        height/2,
        CONFIG.uslNoteSetting.lifeLine,
        CONFIG.uslNoteSetting.lifeLine,
        start,
        stop,
        OPEN
    );

    pop();

    // 改為檢查累積角度是否達到 365
    if (accumulatedAngle >= 365) {
        status = 1;
    }
}