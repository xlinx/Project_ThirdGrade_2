// ==========================================
// 1. 類別定義 (Classes)
// ==========================================

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

        //試聽時間從哪裡開始
        this.previewStartTime = 10000;

        // 載入狀態標記
        this.isLoadJpg = false;
        this.isLoadMp3 = false;
        this.isLoadCsv = false;
        
        // 動態動畫數值
        this.sizeAnima = undefined; 
    }

    // 載入每首歌曲的資源
    update() {
        if (!this.isLoadJpg) {
            this.jpg = loadImage(this.jpg);
            this.isLoadJpg = true;
            console.log(`[Resource] 已載入圖片: ${this.name} (${this.jpg})`);
        }
        if (!this.isLoadCsv) {
            this.csv = loadTable(this.csv, "csv");
            this.isLoadCsv = true;
            console.log(`[Resource] 已載入 CSV: ${this.name}`);
        }
        if (!this.isLoadMp3) {
            this.isLoadMp3 = true;
            console.log(`[Resource] 已確認 MP3 路徑: ${this.mp3}`);
        }
    }
}

// 選歌畫面中央的環狀文字特效
class SelectEffect {
    constructor() {
        this.rotateAngle = 0;
        this.speed = CONFIG.songSelectMenu.speedE;
        this.topicText = CONFIG.songSelectMenu.topicTextE;
        this.undulate = 0;
        this.radius = CONFIG.songSelectMenu.arcRadiusE;
    }

    update() {
        push();
        textAlign(CENTER, CENTER);
        textSize(30);

        this.rotateAngle += radians(this.speed);
        rotate(this.rotateAngle);

        this.undulate = this.radius / 2 + sin(frameCount * 0.05) * 20;
        this.display(this.topicText, this.undulate);
        pop();
    }

    display(str, radius) {
        let chars = str.split("");
        let count = chars.length;

        for (let i = 0; i < count; i++) {
            let angle = TWO_PI * i / count;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;

            push();
            translate(x, y);
            rotate(angle + HALF_PI); // 讓文字垂直於圓周

            fill(255, 100);
            text(chars[i], 0, 0);
            pop();
        }
    }
}

// ==========================================
// 2. 全域變數定義
// ==========================================
let selectedSongIndex = -1;
let lastSelectedSongIndex = -1; // 用於追蹤選歌是否改變，以此觸發自動試聽
let selectSongSpeed = 0.2;       // 選歌動畫速度
let selectSongAniAng = 0;       // 選歌動畫角度
let previewAudio = null;         // 全域的試聽音訊物件
let hasInitializedMenu = false;
// isplaying 變數定義在 script.js 中，此處共用全域變數

// 音樂淡入控制變數
let targetPreviewVolume = 0.6;   // 試聽的最高目標音量
let fadeStartTime = 0;           // 紀錄開始淡入的時間點
let fadeDuration = 1000;         // 淡入持續時間：1000 毫秒 (1 秒)
let isFadingIn = false;          // 目前是否正在執行淡入

// ==========================================
// 3. 核心邏輯功能 (Functions)
// ==========================================

// 繪製選歌選單主視覺
function drawSongMenu(page, quantity) {
    push();    
    translate(width / 2, height / 2);

    selectEffect.update(); // 更新中央文字特效

    let startIndex = page * quantity;   
    let endIndex = startIndex + quantity;  
    let currentDisplayList = songList.slice(startIndex, endIndex); 
    let actualCount = currentDisplayList.length; 

    selectedSongIndex = -1;

    // 根據當前頁面的歌曲數量，動態計算每首歌的角度位置
    for (let i = 0; i < actualCount; i++) {
        let currentSong = currentDisplayList[i];
        let btnAngle = TWO_PI * i / actualCount;

        // 計算旋轉指針與歌曲按鈕的最短角度差
        let angleDiff = abs(angleCount_360RL() - btnAngle);
        if (angleDiff > PI) {
            angleDiff = TWO_PI - angleDiff;
        }
        
        // 判定滑鼠/指針是否懸停在該歌曲的「守備半徑」內
        let isHovered = (angleDiff < PI / actualCount);
        if (isHovered) {
            selectedSongIndex = startIndex + i;
        }

        // --- 緩動動畫邏輯 (Easing) ---
        if (currentSong.sizeAnima === undefined) {
            currentSong.sizeAnima = 170;
        }

        let targetSize = isHovered ? CONFIG.songSelectMenu.songbuttonWidth + 80 : CONFIG.songSelectMenu.songbuttonWidth;
        let nameOffset = isHovered ? 40 : 20;
        let levelOffset = isHovered ? -20 : -10;

        currentSong.sizeAnima += (targetSize - currentSong.sizeAnima) * 0.1;
        let finalSize = currentSong.sizeAnima;

        // 讓半徑跟著尺寸縮放連動，選中時會有向外推的效果
        let currentRadius = map(finalSize, 170, 210, CONFIG.songSelectMenu.songListRadius, CONFIG.songSelectMenu.songListRadius + 25);
        let x = cos(btnAngle) * currentRadius;
        let y = sin(btnAngle) * currentRadius;

        push();
        translate(x, y);
        rotate(btnAngle + HALF_PI);

        // 繪製選中時的外框裝飾
        if (isHovered) {
            noFill();
            stroke(255, 255, 0, map(finalSize, 170, 210, 0, 255));
            strokeWeight(5);
            circle(0, 0, finalSize + 20);
        }

        // 繪製歌曲封面與資訊
        if (currentSong && currentSong.isLoadJpg) {
            imageMode(CENTER);

            // ===== 圓形遮罩區塊 =====
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.arc(0, 0, finalSize / 2, 0, TWO_PI);
            drawingContext.closePath();
            drawingContext.clip();

            if (isHovered) {
                selectSongAniAng += selectSongSpeed * 0.05; 
                rotate(selectSongAniAng);
            }
            image(currentSong.jpg, 0, 0, finalSize, finalSize);
            drawingContext.restore();
            // ========================

            // 歌曲外圈細線
            stroke(100);
            strokeWeight(3);
            noFill();
            circle(0, 0, finalSize);

            // 文字資訊
            fill(255);
            noStroke();
            textAlign(CENTER);
            textSize(map(finalSize, 170, 210, 16, 20));
            text(currentSong.name, 0, finalSize / 2 + nameOffset);
            text("LEVEL " + currentSong.level, 0, -finalSize / 2 + levelOffset);

            // 圓形底座中心黑圈
            fill(0);
            circle(0, 0, finalSize - 190); 

            // 選中時的箭頭指標
            if (isHovered) {
                fill(200);
                triangle(
                    0, -finalSize + levelOffset + 100,
                    -60, -finalSize + levelOffset + 40,
                    60, -finalSize + levelOffset + 40
                );
            }
        } else {
            // 未載入圖片時的替代方塊
            rectMode(CENTER);
            fill(map(finalSize, 170, 210, 100, 150)); 
            noStroke();
            rect(0, 0, finalSize, finalSize);
        }
        pop();
    }

    // 繪裝飾性外圍裝飾弧線 (Arc)
    noFill(); 
    stroke(255, 100); 
    strokeWeight(2);
    rotate(-radians(stillAllRun(0.3)));
    
    let baseArcR = CONFIG.songSelectMenu.arcRadius;
    arc(0, 0, baseArcR, baseArcR, radians(15), radians(70));
    arc(0, 0, baseArcR, baseArcR, radians(210), radians(265));
    arc(0, 0, baseArcR + 30, baseArcR + 30, radians(10), radians(75));
    arc(0, 0, baseArcR - 30, baseArcR - 30, radians(215), radians(260));

    pop();
}


// 處理選歌選單的轉盤控制、自動試聽、以及確認進入遊戲邏輯
function selectSong() {
    if (status === 1) {
        if (!hasInitializedMenu) {
            CONFIG.songSelectMenu.songPage = 0;   
            perDiffAngle360 = angleCount_360();    
            hasInitializedMenu = true; 
            lastSelectedSongIndex = -1; 
            isFadingIn = false;
            console.log("選單重置：頁碼歸零，角度已對齊");
        }

        let maxPage = Math.ceil(songList.length / CONFIG.songSelectMenu.songQuantity) - 1;
        if (maxPage < 0) maxPage = 0;

        if (statusEntryTimer.upDate(200)) {
            let rotationResult = diffAngle360(); 
            if (rotationResult === 1) {
                CONFIG.songSelectMenu.songPage = (CONFIG.songSelectMenu.songPage + 1) % (maxPage + 1);
            } else if (rotationResult === -1) {
                CONFIG.songSelectMenu.songPage = (CONFIG.songSelectMenu.songPage - 1 + (maxPage + 1)) % (maxPage + 1);
            }
        }

        // ==========================================
        // 當選中歌曲改變時：切換歌曲、異步指定時間、開啟淡入
        // ==========================================
        if (selectedSongIndex !== lastSelectedSongIndex) {
            if (previewAudio) {
                previewAudio.pause();
                previewAudio = null;
                isFadingIn = false;
            }

            if (selectedSongIndex !== -1) {
                let currentSelectedSong = songList[selectedSongIndex];
                currentSelectedSong.update(); 

                let localAudio = new Audio(currentSelectedSong.mp3);
                localAudio.loop = true; 
                localAudio.volume = 0; // 初始化音量為 0，不直接殺出音樂

            
                let startSeconds = currentSelectedSong.previewStartTime;
                if (startSeconds > 1000) { 
                    startSeconds = startSeconds / 1000; // 如果誤填成毫秒 (10000)，自動修正為秒 (10秒)
                }

                // 【核心修正】等待音訊元資料載入完成後，才撥動時間軸並播放
                localAudio.addEventListener('loadedmetadata', function() {
                    // 防止在載入期間玩家又切換了別首歌
                    if (previewAudio === localAudio) {
                        localAudio.currentTime = startSeconds; 
                        
                        localAudio.play().then(() => {
                            // 確定成功播放後，才開始啟動淡入計時
                            fadeStartTime = millis(); 
                            isFadingIn = true;
                            console.log(`[Preview] 試聽 ${currentSelectedSong.name}，成功從第 ${startSeconds} 秒開始淡入`);
                        }).catch(err => {
                            console.log("自動試聽播放被瀏覽器阻擋，等待點擊：", err);
                        });
                    }
                });

                // 將當前控制權交給全域變數
                previewAudio = localAudio;
            }
            lastSelectedSongIndex = selectedSongIndex; 
        }

        // ==========================================
        // 處理淡入的音量漸變邏輯 (每影格執行)
        // ==========================================
        if (isFadingIn && previewAudio) {
            let elapsedTime = millis() - fadeStartTime; // 已經過了多少毫秒
            
            if (elapsedTime < fadeDuration) {
                let progress = elapsedTime / fadeDuration; // 0.0 ~ 1.0
                previewAudio.volume = progress * targetPreviewVolume; 
            } else {
                previewAudio.volume = targetPreviewVolume;
                isFadingIn = false; 
            }
        }

    } else {
        // 離開選歌畫面時的清空處理
        if (hasInitializedMenu) {
            if (previewAudio) {
                previewAudio.pause();
                previewAudio = null;
            }
            isFadingIn = false;
            hasInitializedMenu = false;
        }
    }

    // --- 按下確認鍵進入遊戲 ---
    if (botton === 1 && status === 1) {
        botton = 0; 

        if (selectedSongIndex !== -1) {
            let targetSong = songList[selectedSongIndex];
            targetSong.update();
            
            table = targetSong.csv;
            img = targetSong.jpg;  
            Notes = []; Drags = []; Rotates = [];
            
            CSVData = getCSVData();
            for (let i = 0; i < CSVData.length; i++) {
                const row = CSVData[i];
                if (row.type === 'note') Notes.push(new note(row.triggerTime, row.noteLand));
                else if (row.type === 'drag') Drags.push(new drag(row.triggerTimeStart, row.noteLandStart, row.triggerTimeEnd, row.noteLandEnd, row.direction));
                else if (row.type === 'rotate') Rotates.push(new Rotate(row.triggerTime, row.direction));
            }
            
            // 進入遊戲，確實關閉試聽
            if (previewAudio) {
                previewAudio.pause();
                previewAudio = null;
                isFadingIn = false;
            }

            song = new Audio(targetSong.mp3);
            if (!isplaying) {
                status = 2;
                isplaying = true;
                song.play(); 
            }
        }
    }
}


// 計算旋轉角速度差值
function diffAngle360() {
    if (passSongSelectPageTimer.upDate(100)) {
        let currentAngle = angleCount_360();
        let delta = currentAngle - perDiffAngle360;
        
        perDiffAngle360 = currentAngle; // 更新基準點

        if (delta > 80) return 1;
        if (delta < -80) return -1;
    }
    return 0;
}


