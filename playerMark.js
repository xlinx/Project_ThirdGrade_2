function playerMark() {
    push();
    translate(width / 2, height / 2);

    strokeWeight(10);
    stroke(0);
    noFill();

    angle = map(mouseX, 0, width, 0, 360);  // 角度制
    rotate(radians(angle));  // 转换为弧度

    const arcWidth = TWO_PI / CONFIG.note.arcWidthValue;

    const startAngle = -arcWidth / 2;
    const endAngle = arcWidth / 2;



    arc(0, 0, CONFIG.universalNoteSettings.judgeLine, CONFIG.universalNoteSettings.judgeLine, startAngle, endAngle);

    pop();
}