//timestamp
//加入一個index0~1000跑
//const timestamp = 1716717600000; 
//const date = new Date(timestamp);
//esp32有記憶體限制，時間跑到一定數會歸0
//realtme


let CONFIG = {}; // 用來存放設定參數

let table;      // 宣告變數table
let img;        // 宣告變數img

let CSVData = [];
let songList = []; // 用來存放從 MySQL 取得的歌曲資料的陣列
let CutsceneImg = [];
let cutsceneImgsList = []; // 用來存放從 過場圖片資料的陣列
let Notes = []; // 用來存放所有音符的陣列
let Drags = []; // 用來存放所有拖曳音符的陣列
let Rotates = []; // 用來存放所有旋轉音符的陣列
let songName = ""; // 用來存放當前歌曲名稱的變數
let opObj; // 用來存放op物件
let bgm1Obj; // 用來存放bgm1物件
let selectEffect; // 用來存放選歌特效物件 
let songJudgeText; // 用來存放歌曲判定文字物件
let songComboText; // 用來存放歌曲combo文字物件
let settlement;   // 用來存放結算物件
let gameEffect;   // 用來存放遊戲效果物件


let pass3_5Timer;
let passSongSelectPageTimer; //翻頁計時器
let statusEntryTimer          //翻頁初始冷卻計時器


let isplaying = false; // 用來追蹤status是否已經變成 2
let isLoad = false; // 用來追蹤過場動畫是否已經載入過

let angle = 0; // 用來存放玩家當前的角度
let botton = 0; // 用來存放玩家當前的按鈕狀態
let lastBotton = 0; // 用來偵測按鈕上升沿，只觸發一次

// 判定文字顯示系統
let JudgeTexts = []; // 存儲所有正在顯示的判定文字
let cutsceneTextData = null;
let CutsceneText = []; // 用於存儲正在顯示的字幕物件

let status = -1;
let isSandMySQL = false; // 用來追蹤是否已經向伺服器請求過 MySQL 資料

let isReSetTime = false; // 用來追蹤是否已經重置過時間
let perTime = 0; // 用來存放重置時間的值
let nowTime = 0; // 用來存放當前時間的值

let firstLineInt;
let song; // 用來存放音樂檔案的變數
let hit;
let op;
let bgm1;
let preMaskedImgs = []; // 用來存放預處理好的遮罩圖片

// 載入資料==========================================================
export function preloadY(p5) {
    CONFIG = p5.loadJSON('setting.json');   //載入設定檔案

    for (let i = 0; i < 11; i++) {
        let img = loadImage(`otherData/picturtGet/base${i}.jpg`,
            () => console.log(`圖片 ${i} 載入成功`),
            () => console.error(`圖片 ${i} 載入失敗`)
        );
        cutsceneImgsList.push(img);  //
    }
}


// Websocket setup==========================================================
let socket;
let sensorObj = { yaw: 0 }; // 預設資料結構

export function websocketSetup() {
    socket = new WebSocket(CONFIG.websocket.serverAddress);

    try {
        // 【偵查成功】
        socket.onopen = () => {
            console.log(" WebSocket 連線成功！");
            // 連線後執行一次註冊
            const registerMsg = { type: "Web" };
            socket.send(JSON.stringify(registerMsg));
        };

        // 【偵查失敗/錯誤】
        socket.onerror = (error) => {
            console.error(" WebSocket error）:", error);
        };

        // 【偵查斷開】
        socket.onclose = (event) => {
            console.warn(`WebSocket disconnect: ${event.code}, reason: ${event.reason}`);
            // 清理現有的 WebSocket 物件
            if (socket) {
                socket.onopen = null;
                socket.onerror = null;
                socket.onclose = null;
                socket = null;
            }

            //重連機制
            setTimeout(() => {
                console.log("Try reconnection...");
                websocketSetup();
            }, 5000);
        };

    } catch (e) {
        console.error(" WebSocket obj create error:", e);
    }

    // 讀取訊息的核心：onmessage
    socket.onmessage = (event) => {
        // 讀取從 server.js 廣播過來的內容
        // 將收到的 JSON 字串轉成 JS 物件
        try {
            sensorObj = JSON.parse(event.data);
            angle = -sensorObj.yaw; // 更新 angle 變量
            botton = sensorObj.bottonstatus; // 更新 botton 變量
        } catch (e) {
            console.log("收到非 JSON 格式的消息:", event.data);
        }
    };

    socket.onerror = (err) => console.log("Socket Error:", err);
    socket.onclose = () => console.log("WebSocket 連線已關閉");
}


// angle=====================================================================
let lastAngle = 0;
let totalAngle = 0;

export function angleCount_360(){     // 0~180~-180轉 累積角度計算函數
    // 檢查 angle 是否為有效數字
    if (!Number.isFinite(angle)) {
        return 0;
    }

    let delta = angle - lastAngle;

    if (delta > 180) {
        delta -= 360;
    } else if (delta < -180) {
        delta += 360;
    }

    totalAngle += delta;
    lastAngle = angle;

    return totalAngle;
}


function angleCount_360L(){
    let angle = ((angleCount_360() % 360) + 360) % 360; // 累計角度轉換為 0~360 度圓內
    return angle ;

}

function angleCount_360RL(){
    let angle = radians(angleCount_360L());  // 轉換為弧度
    return angle ;
}



// 抓取歌曲清單==========================================================
export async function loadSongMenu() {
    if (songList.length > 0) return; // 已經有歌曲就不再抓取
    try {
        // 發送 HTTP 請求
        const response = await fetch('http://localhost:3000/api/songs');
        const songs = await response.json(); // 拿到資料庫裡的陣列

        songs.forEach(data => {

            //建立歌曲物件，並存入 songList 陣列
            let newSong = new Song( data.id,
                data.name,
                data.song_artist,
                data.sheet_artist,
                data.level,
                data.bpm,
                data.mp3,
                data.csv,
                data.jpg
            );

            songList.push(newSong);
        });

        console.log("GetSongs success:", songList);
    } catch (error) {
        console.error("GetSongs error:", error);
    }
}


// 讀取CSV資料==========================================================
export function getCSVData() {
    if (!table) { return []; }

    // 讀取第一行的整數數字
    firstLineInt = table.getNum(0, 0);
    console.log("First line integer:", firstLineInt);

    let data = [];
    let rowCount = table.getRowCount();

    // 從第二行開始讀取資料 (i = 1)
    for (let i = 1; i < rowCount; i++) {
        let type = table.getString(i, 0);  // 第一欄：類型

        if(type === 'note') {
            let triggerTime = table.getNum(i, 1)+firstLineInt;  // 加上第一行的整數數字
            let noteLand = table.getNum(i, 2);
            data.push({ type, triggerTime, noteLand });
        }
        else if(type === 'drag') {
            let triggerTimeStart = table.getNum(i, 1)+firstLineInt;  // 加上第一行的整數數字
            let triggerTimeEnd = table.getNum(i, 2)+firstLineInt;  // 加上第一行的整數數字
            let noteLandStart = table.getNum(i, 3);
            let noteLandEnd = table.getNum(i, 4);
            let direction = table.getNum(i, 5);  // 方向
            data.push({ type, triggerTimeStart, triggerTimeEnd, noteLandStart, noteLandEnd, direction });
        }else if(type === 'rotate') {
            let triggerTime = table.getNum(i, 1)+firstLineInt;  // 加上第一行的整數數字
            let direction = table.getNum(i, 2);  // 方向
            data.push({ type, triggerTime, direction });
        }
    }

    return data;
}


// 載入音效==========================================================
let audioCtx;
let sounds = {}; // 用來存放所有載入好的音效
// 初始化 AudioContext 並預載入音效
export function setSounds() {
    audioCtx = getAudioContext();  // 使用 p5.js 的 getAudioContext() 來確保兼容性

    const soundFiles = {
        hit: 'otherData/picturtGet/hit.mp3',
        op:  'otherData/picturtGet/Cycotation.mp3',
        bgm1:'otherData/picturtGet/bgm1.mp3'
    };

    initAllSounds(soundFiles);
}

async function initAllSounds(files) {
    try {
        // 將所有 fetch 任務轉為 Promise 陣列
        const promises = Object.keys(files).map(async (key) => {
            const response = await fetch(files[key]);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            sounds[key] = audioBuffer; // 存入物件中
            console.log(`音效 [${key}] 載入成功`);
        });

        await Promise.all(promises);
        console.log("所有原生音訊已就緒！");
    } catch (e) {
        console.error("部分音訊載入失敗:", e);
    }
}


function playSound(name) {
    // 每次播放只建立一個簡單的 BufferSource，播完會自動銷毀
    if (!sounds[name] || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const source = audioCtx.createBufferSource();
    source.buffer = sounds[name];
    source.connect(audioCtx.destination);
    source.start(0);

    return source;
}

// 初始化音符==========================================================
export function initializeNotes() {
    Notes = [];      // 清空舊的音符
    Drags = [];      // 清空舊的拖曳
    Rotates = [];    // 清空舊的旋轉

    for (let i = 0; i < CSVData.length; i++) {
        const row = CSVData[i];

        if(row.type === 'note') {
            Notes.push(new note(row.triggerTime, row.noteLand));
        }
        else if(row.type === 'drag') {
            Drags.push(new drag(row.triggerTimeStart, row.noteLandStart, row.triggerTimeEnd, row.noteLandEnd, row.direction));
        }else if(row.type === 'rotate') {
            Rotates.push(new Rotate(row.triggerTime, row.direction));
        }
    }
}
// 基底類別：負責管理音訊節點的生命週期與狀態切換邏輯
class SoundStateObj {
    constructor(soundName) {
        this.soundName = soundName;
        this.isTrigger = false;
        this.source = null;
    }

    // 統一的停止邏輯
    stopSound() {
        if (this.source) {
            this.source.stop();
            this.source.disconnect(); // 斷開連接以釋放資源
            this.source = null;
        }
    }

    //
    update(targetStatus) {
        // 進入目標狀態
        if (status === targetStatus) {
            if (!this.isTrigger) { //
                this.stopSound();
                this.source = this.play(); // 呼叫子類別實作的播放細節
                this.isTrigger = true;
            }
        }else {
            if (this.isTrigger) {
                this.stopSound();
                this.isTrigger = false;
            }
        }
    }

    // 播放行為：預設行為，可被子類別覆寫
    play() {
        return playSound(this.soundName);
    }
}

// OP 物件：繼承後只需指定名稱
class OpObj extends SoundStateObj {
    constructor() {
        super('op');
    }
    play() {
        let src = playSound(this.soundName);
        if (src) {
            src.loop = true; // 只有 BGM 需要循環
        }
        return src;
    }
}

// BGM 物件：繼承後覆寫播放行為（加入循環）
class Bgm1Obj extends SoundStateObj {
    constructor() {
        super('bgm1');
    }

    play() {
        let src = playSound(this.soundName);
        if (src) {
            src.loop = true; // 只有 BGM 需要循環
        }
        return src;
    }
}
export function setupY(p5) {
    p5.createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);
    p5.noCursor();
    CSVData = getCSVData();
    websocketSetup(); // 初始化 WebSocket 連線

    setSounds(); // 預先載入聲音檔案

    let size = CONFIG.uslNoteSetting.judgeLine;
    let pg = p5.createGraphics(size, size);
    pg.ellipse(size / 2, size / 2, size, size);

    for (let rawImg of cutsceneImgsList) {
        let tempImg = rawImg.get();
        // 如果原始圖片比例不是 1:1，建議先 resize
        tempImg.resize(size, size);
        tempImg.mask(pg);
        preMaskedImgs.push(tempImg);
    }
    pg.remove(); // 釋放畫布


    pass3_5Timer = new Timer(); // 3.5過門計時器
    passSongSelectPageTimer = new Timer(); // 翻頁計時器
    statusEntryTimer = new Timer(); // 翻頁初始冷卻計時器

    opObj = new OpObj(); // 初始化op物件
    bgm1Obj = new Bgm1Obj(); // 初始化bgm1物件
    selectEffect = new SelectEffect(); // 初始化選歌特效物件
    songJudgeText = new SongJudgeText(); // 初始化歌曲判定文字物件
    songComboText = new SongComboText(); // 初始化歌曲combo文字物件
    gameEffect = new GameEffect(); // 初始化遊戲效果物件
}

let prevStatus= undefined;
export function drawY(p5) {
    p5.background(...CONFIG.display.backgroundColor);
    p5.frameRate(CONFIG.display.frameRate);

    // 狀態切換觸發器：當 status 變化時，觸發對應的音樂播放或停止
    if (typeof prevStatus === 'undefined') prevStatus = status;
    if (status !== prevStatus) {
        // if (opObj) opObj.update(1);
        if (bgm1Obj) bgm1Obj.update(3);
        if (status === 1) {
            loadSongMenu(); // 確保只在狀態切換時呼叫一次，而不是每個 frame 呼叫
        }
        prevStatus = status;
    }

    let time = millis();
    p5.push();
    p5.noFill();
    p5.stroke(50);
    p5.circle(p5.width / 2, p5.height / 2, CONFIG.uslNoteSetting.lifeLine);   //音符生命線
    p5.pop();

    console.log("status", status);

    const isHitPressed = botton === 1 && lastBotton !== 1;
    if (isHitPressed) {
        playSound('hit');
    }


    if (status == -1) {
        pushHint();
    }

    if (status == 0) {
        startLogic();
        endSong();
    }

    if (status == 1) {
        time = millis();

        selectSong();
        playerMark();
        if (songList.length > 0) {
            for (let i = 0; i < songList.length; i++) {
                songList[i].update();
            }
        }
        drawSongMenu(CONFIG.songSelectMenu.songPage, CONFIG.songSelectMenu.songQuantity);

        gameEffect.resetGameEffect(); // 重置遊戲效果的淡入狀態，為下一次進入做準備
    }

    if (status == 2 || status == 2.5) {

        isReSetTime = false; // 重置翻頁邏輯的時間重設定狀態，為下一次進入做準備

        if (!isplaying && song && status !== 2.5) {
            song.play();
            // settlementRadiusAnima = {}; // 重製結算頁面動畫的半徑變量
            isplaying = true;

            settlement.reset();
        }

        if (song && !song.paused) {
            time = song.currentTime * 1000;
        }

        if (status == 2 && botton == 1 && time > 3000) {
            status = 2.5;
            botton = 0; // 立即消耗按鈕狀態，防止同一幀內觸發 pause() 的選項
        }


        gameEffect.maskedGameImage(); // 顯示遊戲底圖

        push();
        noFill();

        // 更新和顯示判定文字
        for (let i = JudgeTexts.length - 1; i >= 0; i--) {
            if (!JudgeTexts[i].update()) {
                JudgeTexts.splice(i, 1); // 移除已過期的文字
            } else {
                JudgeTexts[i].display();
            }
        }

        if (song && !song.paused) {
            for (let i = 0; i < Notes.length; i++) {
                Notes[i].update(time);
                Notes[i].display();
            }

            // 更新和顯示 drag 音符
            for (let i = 0; i < Drags.length; i++) {
                Drags[i].display(time);  // 傳遞 time
            }

            for (let i = 0; i < Rotates.length; i++) {
                Rotates[i].update(time);
                Rotates[i].display();
            }

            playerMark();
        } else if (status == 2.5 && song && song.paused) {
            time = song.currentTime * 1000; // 使用暫停時的時間來更新音符位置
            // 暫停時也顯示音符，使用暫停時的時間
            for (let i = 0; i < Notes.length; i++) {
                Notes[i].update(time);
                Notes[i].display();
            }

            for (let i = 0; i < Drags.length; i++) {
                Drags[i].display(time);
            }

            for (let i = 0; i < Rotates.length; i++) {
                Rotates[i].update(time);
                Rotates[i].display();
            }
        }

        pop();

    }

    if (song && song.paused && status == 2) {
        status = 3;
    }


    if (status == 3) {
        drawSettlement();
        bgm1Obj.update(3);
        prevStatus = true;
        cutscene();
    }

    // 在 draw() 的 status == 3.5 邏輯中修改
    if (status == 3.5) {
        if (!isLoad) {
            CutsceneText[0] = new cutsceneText(-PI);
            CutsceneImg[0] = new cutsceneImg();
            isLoad = true;
        }
        CutsceneImg[0].display();
        song.pause();

        if (pass3_5Timer.upDate(CONFIG.cutsceneText.duration)) {
            // --- 修正處：進入 status 1 前的大掃除 ---
            status = 1;
            hasInitializedMenu = false; // 告訴 selectSong 需要重新初始化
            // ------------------------------------
            CutsceneText = [];
            CutsceneImg = [];
            isLoad = false;
        }
    }

    if (status == 2.5) {
        pause();
        isplaying = false;
    }
    lastBotton = botton; // 更新上一幀的按鈕狀態


    if (status !== 2 && status !== 3 && status !== 2.5) {
        CONFIG.score.combo = 0;
        CONFIG.score.prefect = 0;
        CONFIG.score.great = 0;
        CONFIG.score.miss = 0;
        isplaying = false;
    }


    console.log(CONFIG.songSelectMenu.songPage);
}


//================================================================
// 公用函數========================================================
// ===============================================================

// 用於結束歌曲的函數
function endSong() {
    if (song && !song.paused) {
        song.pause();
        song.currentTime = 0;
    }
}

// 用於計時的函數
class Timer {
    constructor() {
        this.perTime = 0;
        this.isRunning = false;
    }

    // 觸發一次性的計時 (類似你原本的邏輯)
    upDate(ms) {
        if (!this.isRunning) {
            this.perTime = millis();
            this.isRunning = true;
        }
        if (this.isRunning && millis() - this.perTime >= ms) {
            this.isRunning = false; // 自動重置
            return true;
        }
        return false;
    }
}


// 用於過場的黑幕
class OpacityMask {
    constructor(sp) {
        this.speed = sp;
        this.reset();
    }

    // 增加 reset 方法以便物件複用，避免 GC 壓力
    reset() {
        this.opacity = 255;
        this.isOut = false;
        this.isHolding = false;
        this.isFinished = false;
        this.startTime = 0;
    }

    update() {
        if (this.isFinished) return this.opacity;

        let currentTime = millis();

        if (!this.isOut) {
            if (!this.isHolding) {
                // 1. 淡入
                this.opacity -= this.speed;
                if (this.opacity <= 0) {
                    this.opacity = 0;
                    this.isHolding = true;
                    this.startTime = currentTime;
                }
            } else {
                // 2. 停留
                if (currentTime - this.startTime >= 1000) {
                    this.isOut = true;
                }
            }
        } else {
            // 3. 淡出
            this.opacity += this.speed;
            if (this.opacity >= 255) {
                this.opacity = 255;
                this.isFinished = true;
            }
        }
        return this.opacity;
    }
}

// 用於計算全局旋轉角度的函數 
let allAngle = 0;

function stillAllRun(s) {
    allAngle += s;

    return allAngle;
}