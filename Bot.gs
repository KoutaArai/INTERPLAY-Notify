let CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("CHANNEL_ACCESS_TOKEN");
let USER_ID = PropertiesService.getScriptProperties().getProperty("USER_ID");
let SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
let CALENDAR_ID = PropertiesService.getScriptProperties().getProperty("CALENDAR_ID");

function pushMessage(message = "Test") {

  let data = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
  let last_row = data.getLastRow();

  // 2行目から名前とID
  for (let i = 2; i <= last_row; i++) {
    user_id = data.getRange(i, 2).getValue();

    let postData = {
      "to": user_id,
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

    console.log(i + '行目 ' + response.getResponseCode());
  }

}

function createSheduleText(days = 1) {

  let date = new Date();
  let values = [];

  let calendar = CalendarApp.getCalendarById(CALENDAR_ID);

  for (let i = 0; i < days; i++) {
    let day = parseInt(date.getDate());
    let month = parseInt(date.getMonth() + 1);
    let dayOfWeekStr = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

    let events = calendar.getEventsForDay(date);

    if (events.length) {
      values.push(month + '/' + day + ' (' + dayOfWeekStr + ') ')

      for (let event of events) {
        let startTime = event.getStartTime();
        let endTime = event.getEndTime();
        let startHour = (startTime.getHours() < 10 ? '0' : '') + startTime.getHours();
        let startMinute = (startTime.getMinutes() < 10 ? '0' : '') + startTime.getMinutes();
        let endHour = (endTime.getHours() < 10 ? '0' : '') + endTime.getHours();
        let endMinute = (endTime.getMinutes() < 10 ? '0' : '') + endTime.getMinutes();
        let title = event.getTitle();
        values.push(startHour + ':' + startMinute + '～' + endHour + ':' + endMinute + ' | ' + title);
      }
    }

    date.setDate(date.getDate() + 1);

  }

  if (days == 1) {
    text = '今日';
  } else if (days == 7) {
    text = '今週';
  } else {
    text = days + '日分';
  }

  if (values.length > 0) {
    let messageText = text + 'の施設\n' + values.join('\n');
    console.log(messageText);
    return messageText;
  }
  else {
    return null;
  }
}

function daily() {
  delTrigger('daily');
  setTrigger(interval = 1, 'daily');
  msg = createSheduleText(days = 1);
  if (msg) {
    pushMessage(message = msg);
  }
  console.log(msg);
}

function weekly() {
  delTrigger('weekly');
  setTrigger(interval = 7, 'weekly');
  msg = createSheduleText(days = 7);
  if (msg) {
    pushMessage(message = msg);
  }
  console.log(msg);
}

function custom() {
  pushMessage(message = 'シフトが更新されたようです。\n' + createSheduleText(days = 14));
  //delTrigger('custom');
  //setTrigger(interval = 7, 'custom');
}

function setTrigger(interval, funcName, hour = 8) {
  let date = new Date();
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setDate(date.getDate() + interval);
  console.log('トリガー ' + date);
  ScriptApp.newTrigger(funcName).timeBased().at(date).create();
}

function delTrigger(funcName) {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (~(trigger.getHandlerFunction().indexOf(funcName))) {
      ScriptApp.deleteTrigger(trigger);
      console.log('トリガーを削除しました。')
    }
  }
}