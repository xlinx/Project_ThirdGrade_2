function startLogic(){

    song.stop();
    isplaying = false;

    // 取得累積角度，並取絕對值保持正向累加
    let accumulatedAngle = Math.abs(angleCount_360());
    
    // 將累積角度限制在一圈內 (0 ~ 365 )
    let displayAngle = accumulatedAngle % 365;

    let start = -HALF_PI;
    let stop = start + map(displayAngle, 0, 365, 0, TWO_PI);
    
    // console.log(displayAngle);

    push();
    noFill();
    strokeWeight(20);
    stroke(255);

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