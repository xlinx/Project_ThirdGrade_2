function scoreDisplay(){
    push();
    noStroke();
    // textSize(CONFIG.score.textSize);

    CONFIG.score.scoreTotal = CONFIG.score.prefect + CONFIG.score.great + CONFIG.score.miss;
    let total = CONFIG.score.scoreTotal;
    // 三種判定比例
    let perfectP = total > 0 ? (CONFIG.score.prefect / total) * 100 : 0;
    let goodP    = total > 0 ? (CONFIG.score.great / total) * 100 : 0;
    let missP    = total > 0 ? (CONFIG.score.miss / total) * 100 : 0;

    // 沒被 miss（命中率）
    let hitRP     = total > 0 ? ((CONFIG.score.prefect + CONFIG.score.great) / total) * 100 : 0;


    // text("Score: " + CONFIG.score.scoreTotal, 0, 100);
    // text("Perfect: " + CONFIG.score.prefect, 0, 200);
    // text("Great: " + CONFIG.score.great, 0, 250);
    // text("Miss: " + CONFIG.score.miss, 0, 300);
    // text("total: " + CONFIG.score.scoreTotal, 0, 350);
    // text("Perfect%: " + perfectP.toFixed(1) + "%", 0, 400);
    // text("Great%: " + goodP.toFixed(1) + "%", 0, 450);
    // text("Miss%: " + missP.toFixed(1) + "%", 0, 500);
    // text("Hit%: " + hitRP.toFixed(1) + "%", 0, 550);

    textSize(50);
    fill(100, 100, 100);
    text("Perfect  " + CONFIG.score.prefect, 20, 200);
    text("Great  " + CONFIG.score.great, 20, 400);
    text("Miss  " + CONFIG.score.miss, 20, 600);
    textSize(100);
    fill(...CONFIG.score.textColor);
    text(CONFIG.score.combo, 1480 , height/2);

    pop();
}