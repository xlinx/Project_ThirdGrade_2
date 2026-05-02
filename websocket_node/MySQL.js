var mysql      = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '0906468525',
  database : 'sheetMusicDatabase'
});

connection.connect(function(err) {
  if (err) {
    console.error('MySQL connection failed：', err);
    return;
  }
  console.log('MySQL connection');
});