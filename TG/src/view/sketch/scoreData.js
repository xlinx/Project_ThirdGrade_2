function scoreDisplay(){
    push();
    fill(...CONFIG.score.textColor);
    textSize(CONFIG.score.textSize);

    CONFIG.score.scoreTotal = CONFIG.score.prefect + CONFIG.score.great ;
    let total = CONFIG.score.prefect + CONFIG.score.great + CONFIG.score.miss;

    // 命中率
    let hitRP     = total > 0 ? ((CONFIG.score.prefect + CONFIG.score.great) / total) * 100 : 0;
    CONFIG.score.hitRate = hitRP; // 儲存到全域的 CONFIG 中

    // --- 把結算畫面會被蓋到的偵錯文字註解掉，因為這些在結算畫面已經不用了 ---
    // text("Score: " + CONFIG.score.scoreTotal, 500, 100);
    // text("Combo: " + CONFIG.score.combo, 500, 150);
    // text("Perfect: " + CONFIG.score.prefect, 500, 200);
    // text("Great: " + CONFIG.score.great, 500, 250);
    // text("Miss: " + CONFIG.score.miss, 500, 300);
    // text("total: " + CONFIG.score.scoreTotal, 500, 350);
    // text("Hit%: " + hitRP.toFixed(1) + "%", 500, 550);
    
    pop();
}