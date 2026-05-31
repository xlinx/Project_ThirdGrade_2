function playerMark() {
    push();
    translate(width / 2, height / 2);

    strokeWeight(CONFIG.uslNoteSetting.playerMarkSize);
    drawingContext.shadowBlur = 25; 
    drawingContext.shadowColor = `rgb(255, 251, 228)`;
    stroke(`rgb(255, 227, 65)`);
    noFill();

    rotate(radians(angle)); 
    const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;

    const startAngle = -arcWidth / 2;
    const endAngle = arcWidth / 2;

    const markRadius = CONFIG.uslNoteSetting.lifeLine + 20; // 判定線半徑



    arc(0, 0, markRadius, markRadius, startAngle, endAngle);

    pop();
}