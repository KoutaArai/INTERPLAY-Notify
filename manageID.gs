// LINE Developersに書いてあるChannel Access Token
var access_token = PropertiesService.getScriptProperties().getProperty("CHANNEL_ACCESS_TOKEN");
var SPREADSHEET4MANAGER = PropertiesService.getScriptProperties().getProperty("SPREADSHEET4MANAGER");

function doPost(e) {
  console.log(e);
  // POSTで送られてきたJSONをパース
  var event = JSON.parse(e.postData.contents).events[0];

  var user_id = event.source.userId
  var eventType = event.type
  var nickname = getUserProfile(user_id);

  // botが友達追加された場合に起きる処理
  if (eventType == "follow") {
    console.log(eventType);
    var data = SpreadsheetApp.openById(SPREADSHEET4MANAGER).getSheetByName('Users');
    var last_row = data.getLastRow();
    for (var i = last_row; i >= 1; i--) {
      if (data.getRange(i, 1).getValue() != '') {
        var j = i + 1;
        data.getRange(j, 1).setValue(nickname);
        data.getRange(j, 2).setValue(user_id);
        data.getDataRange().removeDuplicates([2])
        break;
      }
    }

    // ついでに今週の施設を通知
    msg = createSheduleText(days = 7);
    console.log(msg);
    if (msg) {
      pushPrivateMessage(to = user_id, message = msg);
    }
  }
}

function pushPrivateMessage(to, message) {
  let postData = {
    "to": to,
    "messages": [{
      "type": "text",
      "text": message,
    }]
  };

  let url = "https://api.line.me/v2/bot/message/push";
  let headers = {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };

  let options = {
    "method": "POST",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  let response = UrlFetchApp.fetch(url, options);
  console.log(response.getResponseCode())
}

// profileを取得してくる関数（コピペでOK）
function getUserProfile(user_id) {
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + access_token,
    },
  })
  return JSON.parse(userProfile).displayName;
}