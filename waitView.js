let initalAngle = 0;
let isinitAngleSet = false;
let rotationProgress = 0; // 用來追蹤旋轉進度

function waveView(){

    playerMark();// 顯示玩家標記


    // 如果還沒設置初始角度，先設置
    if(!isinitAngleSet) {
        initalAngle = angleCount_360();
        isinitAngleSet = true;
    }

    // 計算當前的旋轉進度（相對於初始角度）
    let currentAngle = angleCount_360();
    rotationProgress = currentAngle - initalAngle;

    // 計算進度百分比（0-360）
    let progressPercentage = Math.abs(rotationProgress) % 360;
    
    // 繪製圓形進度條
    push();
    translate(width / 2, height / 2);
    
    // 背景圓（灰色）
    stroke(30);
    strokeWeight(2);
    noFill();
    circle(0, 0, CONFIG.uslNoteSetting.judgeLine+100 ); // 稍微大於判定線的圓
    
    // 進度圓弧（白色）
    let progressColor = [255, 255, 255]; // 白色
    stroke(...progressColor);
    strokeWeight(8);
    
    // 將進度轉換為弧度，從上方開始（-PI/2）
    let startAngle = -PI / 2;
    let endAngle = startAngle + (progressPercentage / 360) * TWO_PI;
    
    // 繪製進度圓弧
    arc(0, 0, CONFIG.uslNoteSetting.judgeLine+100, CONFIG.uslNoteSetting.judgeLine+100, startAngle, endAngle);
    pop();

    // 檢查是否完成 360 度旋轉
    if (Math.abs(rotationProgress) >= 360) {
        status = 1; // 設定為遊戲進行中
        isinitAngleSet = false; // 重置初始角度標記
    }
}