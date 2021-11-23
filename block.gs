function checkBlock() {
  
  const data = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
  const lastRow = data.getLastRow();

  // 2行目から名前とID
  for (let i = 2; i <= lastRow; i++) {
    userId = data.getRange(i, 2).getValue();

    let url = 'https://api.line.me/v2/bot/profile/' + userId;
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    };

    let options = {
      'method': 'GET',
      'headers': headers,
      'muteHttpExceptions': true,
    };

    // 公式アカウントと友達のユーザなら200，ブロックしているユーザなら404
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();

    if (code != 200){
      console.log(i + '行目 ' + code);
    }
  }
}
