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

    // 將玩家角度 (假設是 angleCount) 轉換為 0 ~ TWO_PI 弧度
    // 限制在 360 度內並轉弧度
    let playerRad = radians(angleCount_360() % 360);
    if (playerRad < 0) playerRad += TWO_PI;

    selectedSongIndex = -1; // 每幀重置

    for (let i = 0; i < actualCount; i++) {
        let currentSong = currentDisplayList[i];
        let btnAngle = TWO_PI * i / actualCount;

        let x = cos(btnAngle) * 300;
        let y = sin(btnAngle) * 300;

        // --- 判定重疊邏輯 ---
        // 計算玩家角度與方塊角度的最小差值
        let angleDiff = abs(playerRad - btnAngle);
        if (angleDiff > PI) angleDiff = TWO_PI - angleDiff;

        // 如果差值小於這首歌佔據的角度範圍 (PI / actualCount)
        let isHovered = (angleDiff < PI / actualCount);
        if (isHovered) {
            selectedSongIndex = startIndex + i; // 紀錄在總清單中的索引
        }

        push();
        translate(x, y);
        rotate(btnAngle + HALF_PI);

        // 如果被選中，畫出外框
        if (isHovered) {
            noFill();
            stroke(255, 255, 0); // 黃色外框
            strokeWeight(5);
            rectMode(CENTER);
            rect(0, 0, 185, 185); // 比圖片大一點點
        }

        if (currentSong && currentSong.isLoadJpg) {
            imageMode(CENTER);
            image(currentSong.jpg, 0, 0, 170, 170);

            fill(255);
            noStroke();
            textAlign(CENTER);
            textSize(16);
            text(currentSong.name, 0, 110);
        } else {
            rectMode(CENTER);
            fill(100);
            noStroke();
            rect(0, 0, 170, 170);
        }
        pop();
    }
    pop();
}

function selectSong() {
    if (botton === 1 && status === 1 ) {

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
        status = 0;
    }
    if (key === 's' || key === 'S') {
        status = 1;  // 改為 0，觸發停止邏輯
        if (song && !song.paused) {
            song.pause();
            song.currentTime = 0;
        }
        selectedSongIndex = -1;  // 清除選中的歌曲
        console.log("stop at", song?.currentTime || "unknown", "notes len", Notes.length);
    }
    if (key === 'd' || key === 'D') {
        status = 2;
    }
    if (key === 'p' || key === 'P') {
        status = 2.5;
    }
}






