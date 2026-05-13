class Song {
    constructor(id, name, song_artist, sheet_artist, level, bpm, mp3, csv, jpg) {
        this.id = id;
        this.name = name;
        this.song_artist = song_artist;
        this.sheet_artist = sheet_artist;
        this.level = level;
        this.bpm = bpm;
        this.mp3 = mp3;
        this.csv = csv;
        this.jpg = jpg;

        this.isLoadJpg = false;
        this.isLoadMp3 = false;
        this.isLoadCsv = false;
    }

    update() {

        // 載入每首歌曲的資源
        if (!this.isLoadJpg) {
            this.jpg = loadImage(this.jpg);
            this.isLoadJpg = true;
            console.log(`已載入圖片: ${this.jpg}`);
        }
        if (!this.isLoadCsv) {
            this.csv = loadTable(this.csv, "csv"); // 移除 "header"，因為譜面沒有標頭
            this.isLoadCsv = true;
            console.log(`已載入 CSV: ${this.csv}`);
        }
        // MP3 路徑保持為字符串，在 selectSong() 中需要時才創建 Audio 對象
        if (!this.isLoadMp3) {
            this.isLoadMp3 = true;
            console.log(`已載入 MP3 路徑: ${this.mp3}`);
        }

    }

}

// 在 drawSongMenu 外部定義一個變數，方便 keyPressed 使用
let selectedSongIndex = -1;
let selectSongSpeed = 0.2; // 選歌動畫速度
let selectSongAniAng = 0; // 選歌動畫角度


function drawSongMenu(page, quantity) {
push();    
    translate(width / 2, height / 2);

    selectEffect.update(); // 更新選歌特效

    let startIndex = page * quantity;
    let endIndex = startIndex + quantity;
    let currentDisplayList = songList.slice(startIndex, endIndex);  // 確保不會超出陣列範圍
    let actualCount = currentDisplayList.length;  // 實際顯示的歌曲數量

    selectedSongIndex = -1;

    // 根據 actualCount 動態計算每首歌的角度位置
    for (let i = 0; i < actualCount; i++) {
        let currentSong = currentDisplayList[i];
        let btnAngle = TWO_PI * i / actualCount;

        // --- 1. 判定選中狀態 ---
        let angleDiff = abs(angleCount_360RL() - btnAngle);
        if (angleDiff > PI) angleDiff = TWO_PI - angleDiff;
        let isHovered = (angleDiff < PI / actualCount);

        if (isHovered) {
            selectedSongIndex = startIndex + i;
        }

        // --- 2. 緩動動畫邏輯 (Easing) ---
        // 為每首歌初始化一個動畫數值，如果還沒有的話就設為 170
        if (currentSong.sizeAnima === undefined) {
            currentSong.sizeAnima = 170;
        }

        // 定義目標尺寸
        let targetSize = isHovered ? CONFIG.songSelectMenu.songbuttonWidth + 80: CONFIG.songSelectMenu.songbuttonWidth;
        let nameOffset = isHovered ? 40 : 20;
        let levelOffset = isHovered ? -20 : -10;

        currentSong.sizeAnima += (targetSize - currentSong.sizeAnima) * 0.1;
        
        let finalSize = currentSong.sizeAnima;

        // --- 3. 繪製邏輯 (根據 finalSize 連動) ---
        // 讓半徑也跟著尺寸縮放連動，選中時會平滑地往外推
        let currentRadius = map(finalSize, 170, 210, CONFIG.songSelectMenu.songListRadius, CONFIG.songSelectMenu.songListRadius + 25);
        
        let x = cos(btnAngle) * currentRadius;
        let y = sin(btnAngle) * currentRadius;

    

push();
        translate(x, y);
        rotate(btnAngle + HALF_PI);

         // 如果被選中_裝飾
        if (isHovered) {
            noFill();
            stroke(255, 255, 0, map(finalSize, 170, 210, 0, 255)); // 漸漸顯現
            strokeWeight(5);
            rectMode(CENTER);
            circle(0, 0, finalSize + 20); // 外框比圖片大一點
        }

        
        if (currentSong && currentSong.isLoadJpg) {
            imageMode(CENTER);

            if (currentSong && currentSong.isLoadJpg) {
                    imageMode(CENTER);

                    // ===== 圓形遮罩 =====
                    drawingContext.save();

                    drawingContext.beginPath();
                    drawingContext.arc(0, 0, finalSize / 2, 0, TWO_PI);
                    drawingContext.closePath();
                    drawingContext.clip();

                    // 如果被選中，畫出外框 (外框透明度也可以跟著縮放連動)
                    if (isHovered) {
                        selectSongAniAng += selectSongSpeed * 0.05; 
                        rotate(selectSongAniAng);
                        image(currentSong.jpg, 0, 0, finalSize, finalSize);

                    }

                    image(currentSong.jpg, 0, 0, finalSize, finalSize);

                    drawingContext.restore();
                    // ===================

                    // 可選：外圈
                    stroke(100);
                    strokeWeight(3);
                    noFill();
                    circle(0, 0, finalSize);

                    fill(255);
                    noStroke();
                    textAlign(CENTER);
                    textSize(map(finalSize, 170, 210, 16, 20));
                    text(currentSong.name, 0, finalSize / 2 + nameOffset);
                    text("LEVEL " + currentSong.level, 0, -finalSize / 2 + levelOffset);

                    fill(0);
                    circle(0, 0, finalSize - 190); // 繪製歌曲圖片的圓形底座

                    if (isHovered) {
                        fill(200);
                        triangle(
                            0, -finalSize + levelOffset+ 100,
                            -60, -finalSize + levelOffset + 40,
                            60, -finalSize + levelOffset + 40
                        );
                    }

                }

        } else {
            rectMode(CENTER);
            fill(map(finalSize, 170, 210, 100, 150)); 
            noStroke();
            rect(0, 0, finalSize, finalSize);
        }
pop();
    }
    noFill(); stroke(255,100); strokeWeight(2);
    rotate(-radians(stillAllRun(0.3)));
    arc(0,0,
        CONFIG.songSelectMenu.arcRadius ,
        CONFIG.songSelectMenu.arcRadius ,
        radians(15),
        radians(70)
    );

    arc(0,0,
        CONFIG.songSelectMenu.arcRadius ,
        CONFIG.songSelectMenu.arcRadius ,
        radians(210),
        radians(265)
    );

    arc(0,0,
        CONFIG.songSelectMenu.arcRadius+30 ,
        CONFIG.songSelectMenu.arcRadius+30 ,
        radians(10),
        radians(75)
    );

    arc(0,0,
        CONFIG.songSelectMenu.arcRadius-30 ,
        CONFIG.songSelectMenu.arcRadius-30 ,
        radians(215),
        radians(260)
    );

pop();


    


}



let hasInitializedMenu = false;

function selectSong() {
  if (status === 1) {
    // --- 進入狀態 1 的那一刻，強制同步所有數值 ---
    if (!hasInitializedMenu) {
      CONFIG.songSelectMenu.songPage = 0;   // 強制回第一頁
      perDiffAngle360 = angleCount_360();    // 立即同步角度基準
      hasInitializedMenu = true; 
      console.log("選單重置：頁碼歸零，角度已對齊");
    }

    let maxPage = Math.ceil(songList.length / CONFIG.songSelectMenu.songQuantity) - 1;
    if (maxPage < 0) maxPage = 0;

    // 只有在進入 0.5 秒後，才開始允許旋轉換頁，避免切換瞬間的抖動
    if (statusEntryTimer.upDate(200)) {
        let rotationResult = diffAngle360(); 
        if (rotationResult === 1) {
            CONFIG.songSelectMenu.songPage = (CONFIG.songSelectMenu.songPage + 1) % (maxPage + 1);
        } else if (rotationResult === -1) {
            CONFIG.songSelectMenu.songPage = (CONFIG.songSelectMenu.songPage - 1 + (maxPage + 1)) % (maxPage + 1);
        }
    }
  } else {
    // 離開狀態 1 時，重置標記
    hasInitializedMenu = false;
  }

    
    
    if (botton === 1 && status === 1 ) {

        botton = 0; // 消費按鈕，防止帶入下一個場景

        if (selectedSongIndex !== -1) {
            let targetSong = songList[selectedSongIndex];
            console.log(`準備遊玩: ${targetSong.name}`);

            // 確保資源都已載入
            targetSong.update();
            
            // 1. 先建立音符
            table = targetSong.csv;
            img = targetSong.jpg;  // 設置全局圖片變數
            Notes = [];
            Drags = [];
            Rotates = [];
            
            CSVData = getCSVData();
            for (let i = 0; i < CSVData.length; i++) {
                const row = CSVData[i];
                if (row.type === 'note') {
                    Notes.push(new note(row.triggerTime, row.noteLand));
                } else if (row.type === 'drag') {
                    Drags.push(new drag(row.triggerTimeStart, row.noteLandStart, row.triggerTimeEnd, row.noteLandEnd, row.direction));
                } else if (row.type === 'rotate') {
                    Rotates.push(new Rotate(row.triggerTime, row.direction));
                }
            }
            
            // 2. 改用原生 Audio（每次都創建新的 Audio 對象）
            song = new Audio(targetSong.mp3);
            if(!isplaying){
            status = 2;
            islaying = true;
            }
            
        }
    }
}
   



function keyPressed() {

    if (status === 1) {
        let maxPage = Math.ceil(songList.length / CONFIG.songSelectMenu.songQuantity) - 1;
        if (maxPage < 0) maxPage = 0;
        
        if ((key === 'q' || key === 'Q')) {
            CONFIG.songSelectMenu.songPage--;
            if (CONFIG.songSelectMenu.songPage < 0) {
                CONFIG.songSelectMenu.songPage = maxPage; // 循環到最後一頁
            }
        }
        if ((key === 'e' || key === 'E')) {
            CONFIG.songSelectMenu.songPage++;
            if (CONFIG.songSelectMenu.songPage > maxPage) {
                CONFIG.songSelectMenu.songPage = 0; // 循環到第一頁
            }
        }
    }

    if (key === 'a' || key === 'A') {
            isplaying = false;
            status = 0;
            endSong();
            selectedSongIndex = -1;
    }

    if (key === 's' || key === 'S') {
        status = 1;  // 改為 0，觸發停止邏輯
        endSong();
        selectedSongIndex = -1;  // 清除選中的歌曲
        console.log("stop at", song?.currentTime || "unknown", "notes len", Notes.length);
    }
    if (key === 'd' || key === 'D') {
        status = 2;
    }
    if (key === 'p' || key === 'P') {
        status = 2.5;
    }
    if (key === 'T' || key === 't') {
        status = 3;
    }
    if(key === 'R' || key === 'r'){
        status = 3.5;
    }
}

function diffAngle360() {
    // 移除所有 if(status !== 1) 的判斷
    if (passSongSelectPageTimer.upDate(100)) {
        let currentAngle = angleCount_360();
        let delta = currentAngle - perDiffAngle360;
        
        perDiffAngle360 = currentAngle; // 每次執行都更新基準

        if (delta > 80) return 1;
        if (delta < -80) return -1;
    }
    return 0;
}



class SelectEffect {
    constructor(){
        this.rotateAngle = 0;
        this.speed = CONFIG.songSelectMenu.speedE;
        this.topicText = CONFIG.songSelectMenu.topicTextE;
        this.undulate = 0;
        this.radius = CONFIG.songSelectMenu.arcRadiusE;

    }

    update(){
    push();
        textAlign(CENTER, CENTER);
        textSize(30);

        this.rotateAngle += radians(this.speed);
        rotate(this.rotateAngle,this.rotateAngle);
  
        this.undulate = this.radius/2 + sin(frameCount*0.05)*20;

        this.display(this.topicText, this.undulate);
    pop();
    }

    display(str, radius) {
        let chars = str.split("");
        let count = chars.length;

        for (let i = 0; i < count; i++) {
            // 1. 計算每個字的正弦/餘弦角度
            let angle = TWO_PI * i / count;

            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            
            push();
            translate(x, y);

            // 2. 讓文字旋轉（HALF_PI 是為了讓文字垂直於圓周）
            rotate(angle + HALF_PI);

            // 3. 繪製文字
            fill(255,100);
            text(chars[i], 0, 0);
            pop();
        }
     }
}


// class songViewNoisw extends Song{
//     constructor( id,mp3) {
//         super(id, mp3);
//     }

//     update() {
//         if (!this.isLoadMp3) {
//             this.isLoadMp3 = true;
//             console.log(`已載入 MP3 路徑: ${this.mp3}`);
//         }
//     }




// }



