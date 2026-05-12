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

function drawSongMenu(page, quantity) {
    push();
    translate(width / 2, height / 2);

    let startIndex = page * quantity;
    let endIndex = startIndex + quantity;
    let currentDisplayList = songList.slice(startIndex, endIndex);
    let actualCount = currentDisplayList.length;

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
        let targetSize = isHovered ? 210 : 170;

        // 使用你習慣的公式：現在值 += (目標值 - 現在值) * 速度
        // 0.1 可以調整動畫的「黏度」
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

        // 如果被選中，畫出外框 (外框透明度也可以跟著縮放連動)
        if (isHovered) {
            noFill();
            stroke(255, 255, 0, map(finalSize, 170, 210, 0, 255)); // 漸漸顯現
            strokeWeight(5);
            rectMode(CENTER);
            rect(0, 0, finalSize + 15, finalSize + 15); 
        }

        if (currentSong && currentSong.isLoadJpg) {
            imageMode(CENTER);
            image(currentSong.jpg, 0, 0, finalSize, finalSize);

            fill(255);
            noStroke();
            textAlign(CENTER);
            // 文字大小也做一點微小的平滑變化
            textSize(map(finalSize, 170, 210, 16, 20));
            text(currentSong.name, 0, finalSize/2 + 25);
        } else {
            rectMode(CENTER);
            fill(map(finalSize, 170, 210, 100, 150)); 
            noStroke();
            rect(0, 0, finalSize, finalSize);
        }
        pop();
    }
    pop();
}


function selectSong() {
  if (status === 1) {
    fill(255);
    text(angleCount_360(), 100, 500);

    let maxPage = Math.ceil(songList.length / CONFIG.songSelectMenu.songQuantity) - 1;
    if (maxPage < 0) maxPage = 0;

    // --- 關鍵修改：只呼叫一次，把結果存起來 ---
    let rotationResult = diffAngle360(); 

    if (rotationResult === 1) {
        // 順時針：下一頁 (++)
        CONFIG.songSelectMenu.songPage++;
        if (CONFIG.songSelectMenu.songPage > maxPage) {
            CONFIG.songSelectMenu.songPage = 0; 
        }
    } else if (rotationResult === -1) {
        // 逆時針：上一頁 (--)
        CONFIG.songSelectMenu.songPage--;
        if (CONFIG.songSelectMenu.songPage < 0) {
            CONFIG.songSelectMenu.songPage = maxPage;
        }
    }
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

let isStatusJustChanged = true;    // 狀態變更標記
function diffAngle360() {
    if(status !== 1) {
        isStatusJustChanged = true; // 每次離開選歌狀態都重置標記
        return 0; // 不在選歌狀態，不進行旋轉檢測
    }

    if (isStatusJustChanged) {
        if (statusEntryTimer.upDate(2000)) { 
            // 一秒過後，更新目前的角度為初始基準，避免累積之前的位移
            perDiffAngle360 = angleCount_360();
            isStatusJustChanged = false; 
        }
        return 0;
    }

    // 2. 一秒過後，才開始執行原本的快撥偵測邏輯
    if (passSongSelectPageTimer.upDate(100)) {
        let currentAngle = angleCount_360();
        let delta = currentAngle - perDiffAngle360;

        perDiffAngle360 = currentAngle;

        if (delta > 60) return 1;
        if (delta < -60) return -1;
    }

    return 0;
}






