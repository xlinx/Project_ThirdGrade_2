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
            if (!this.isLoadMp3) {
                this.mp3 = loadSound(this.mp3);
                this.isLoadMp3 = true;
                console.log(`已載入 MP3: ${this.mp3}`);
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

function keyPressed() {
    if ((key === ' ' || keyCode === 32) && status === 1) {
        if (selectedSongIndex !== -1) {
            let targetSong = songList[selectedSongIndex];
            console.log(`準備遊玩: ${targetSong.name}`);

            // --- 處理 CSV 資料 ---
            if (targetSong.isLoadCsv && typeof targetSong.csv !== 'string') {
                // 如果已經是 Table 物件，直接給予全域變數 table
                table = targetSong.csv;
            } else {
                // 如果還是字串路徑，才載入
                table = loadTable(targetSong.csv, "csv");
            }
            
            // 重新解析音符
            CSVData = getCSVData();
            Notes = [];
            Drags = [];
            Rotates = [];
            for (let i = 0; i < CSVData.length; i++) {
                const row = CSVData[i];
                if(row.type === 'note') {
                    Notes.push(new note(row.triggerTime, row.noteLand));
                } else if(row.type === 'drag') {
                    Drags.push(new drag(row.triggerTimeStart, row.noteLandStart, row.triggerTimeEnd, row.noteLandEnd, row.direction));
                } else if(row.type === 'rotate') {
                    Rotates.push(new Rotate(row.triggerTime, row.direction));
                }
            }

            // --- 處理音樂播放 ---
            if (song && song.isPlaying()) {
                song.stop();
            }

            if (targetSong.isLoadMp3 && typeof targetSong.mp3 !== 'string') {
                // 如果已經是 Sound 物件，直接播放
                song = targetSong.mp3;
                startGame();
            } else {
                // 如果還沒載入，現場載入並在回呼函式中開始遊戲
                song = loadSound(targetSong.mp3, startGame);
            }
        }
    }

           // 按任意鍵開始播放
  if (!isplaying && song) {
    song.play();
    isplaying = true;
  }

  if (key === 'a' || key === 'A') {
    status = 0;
  }
  if (key === 's' || key === 'S') {
    status = 1;
  }
  if (key === 'd' || key === 'D') {
    status = 2;
  }
}

// 封裝一個開始遊戲的函式
function startGame() {
    if (song) {
        song.play();
        status = 2; // 切換到遊戲狀態
        console.log("遊戲開始！");
    }
}

 
    
