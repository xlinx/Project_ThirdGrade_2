function playerMark(p5) {
    p5.push();
    p5.translate(width / 2, height / 2);

    p5.strokeWeight(CONFIG.uslNoteSetting.playerMarkSize);
    drawingContext.shadowBlur = 25; 
    drawingContext.shadowColor = `rgb(255, 251, 228)`;
    p5.stroke(`rgb(255, 227, 65)`);
    p5.noFill();

    p5.rotate(radians(angle));
    const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;

    const startAngle = -arcWidth / 2;
    const endAngle = arcWidth / 2;

    const markRadius = CONFIG.uslNoteSetting.lifeLine + 20; // 判定線半徑



    p5.arc(0, 0, markRadius, markRadius, startAngle, endAngle);

    p5.pop();
}