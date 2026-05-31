// 鍵盤除錯與手動切換功能
function keyPressed() {
    if (status === 1) {
        
        // Q 鍵：上一頁
        if (key === 'q' || key === 'Q') {
            CONFIG.songSelectMenu.songPage--;
            if (CONFIG.songSelectMenu.songPage < 0) {
                CONFIG.songSelectMenu.songPage = maxPage; 
            }
        }
        // E 鍵：下一頁
        if (key === 'e' || key === 'E') {
            CONFIG.songSelectMenu.songPage++;
            if (CONFIG.songSelectMenu.songPage > maxPage) {
                CONFIG.songSelectMenu.songPage = 0; 
            }
        }
    }

    // 各狀態手動切換偵錯
    if (key === 'a' || key === 'A') {
        isplaying = false;
        status = 0;
        endSong();
        CONFIG.songSelectMenu.selectedSongIndex = -1;
    }
    if (key === 's' || key === 'S') {
        status = 1;  
        endSong();
        CONFIG.songSelectMenu.selectedSongIndex = -1;  
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
    if (key === 'R' || key === 'r') {
        status = 3.5;
    }
}
