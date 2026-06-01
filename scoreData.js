function scoreDisplay(){
    push();
    fill(...CONFIG.score.textColor);
    textSize(CONFIG.score.textSize);

    CONFIG.score.scoreTotal = CONFIG.score.prefect + CONFIG.score.great ;
    let total = CONFIG.score.prefect + CONFIG.score.great + CONFIG.score.miss;
    // // 三種判定比例
    // let perfectP = total > 0 ? (CONFIG.score.prefect / total) * 100 : 0; 
    // let goodP    = total > 0 ? (CONFIG.score.great / total) * 100 : 0;
    // let missP    = total > 0 ? (CONFIG.score.miss / total) * 100 : 0;

    // 命中率
    let hitRP     = total > 0 ? ((CONFIG.score.prefect + CONFIG.score.great) / total) * 100 : 0;
    CONFIG.score.hitRate = hitRP; // 儲存到全域的 CONFIG 中

    text("Score: " + CONFIG.score.scoreTotal, 500, 100);
    text("Combo: " + CONFIG.score.combo, 500, 150);
    text("Perfect: " + CONFIG.score.prefect, 500, 200);
    text("Great: " + CONFIG.score.great, 500, 250);
    text("Miss: " + CONFIG.score.miss, 500, 300);
    text("total: " + CONFIG.score.scoreTotal, 500, 350);
    // text("Perfect%: " + perfectP.toFixed(1) + "%", 500, 400);
    // text("Great%: " + goodP.toFixed(1) + "%", 500, 450);
    // text("Miss%: " + missP.toFixed(1) + "%", 500, 500);
    text("Hit%: " + hitRP.toFixed(1) + "%", 500, 550);
    
    pop();
}