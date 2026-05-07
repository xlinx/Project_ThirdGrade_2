// 歌曲選擇菜單邏輯
//怎麼都是數學

function songSelectMenu(count) {

  translate(width / 2, height / 2);

    for (let i = 0; i < count; i++) {
        // 1. 計算角度 (將 360度/TWO_PI 分成 count 份)
        let btnAngle = TWO_PI * i / count;

        // 2. 使用三角函數計算方塊中心位置
        let x = cos(btnAngle) * CONFIG.uslNoteSetting.lifeLine*0.8;
        let y = sin(btnAngle) * CONFIG.uslNoteSetting.lifeLine*0.8;

        push();
        rectMode(CENTER); 
        translate(x, y);  
        rotate(btnAngle);     
        
        // 正規化玩家角度 (全局變數 angle 為度數)
        let playerRad = radians(angle) % TWO_PI;
        if (playerRad < 0) playerRad += TWO_PI;

        // 計算玩家角度與方塊角度的最小差值
        let diff = abs(playerRad - btnAngle);
        if (diff > PI) {
            diff = TWO_PI - diff;
        }

        // 判斷玩家角度是否剛好對準該方塊 (各佔據 PI/count 的範圍)
        if (diff <= PI / count) {
            fill(255, 0, 0); // 紅色
        } else {
            fill(255, 255, 255); // 預設白色
        }

        noStroke();

        rect(0, 0, CONFIG.songSelectMenu.songbuttonWidth, CONFIG.songSelectMenu.songbuttonHeight);
        
        pop();
    }
}
