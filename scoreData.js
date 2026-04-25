function scoreDisplay(){
    push();
    fill(...CONFIG.score.textColor);
    textSize(CONFIG.score.textSize);

    CONFIG.score.scoreTotal = CONFIG.score.prefect + CONFIG.score.great;


    text("Score: " + CONFIG.score.scoreTotal, 500, 100);
    text("Combo: " + CONFIG.score.combo, 500, 150);
    text("Perfect: " + CONFIG.score.prefect, 500, 200);
    text("Great: " + CONFIG.score.great, 500, 250);
    text("Miss: " + CONFIG.score.miss, 500, 300);
    text("total: " + CONFIG.score.scoreTotal, 500, 350);
    
    pop();
}