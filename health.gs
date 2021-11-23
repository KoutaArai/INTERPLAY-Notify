function search(search_name, search_id) {

  const HEALTHSHEET = PropertiesService.getScriptProperties().getProperty("HEALTHSHEET");

  let healthSheet = SpreadsheetApp.openById(HEALTHSHEET).getActiveSheet();
  let lastRow = healthSheet.getLastRow();
  //console.log(healthSheet.getName() + 'の最終行は' + lastRow + 'です。');

  let date = new Date();
  date.setDate(date.getDate());
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  console.log(date + ' から ' + search_name, search_id + ' を検索します。');

  for (let i = lastRow; i > 0; i--) {
    timestamp = healthSheet.getRange(i, 1).getValue();
    name = healthSheet.getRange(i, 2).getValue();
    id = healthSheet.getRange(i, 3).getValue();
    if (timestamp > date) {
      if (name == search_name || id == search_id) {
        console.log('見つかりました。');
        console.log('記録は ' + timestamp, name, id + ' です。');
        return true;
      }

    } else {
      console.log('見つかりませんでした。');
      return false;
    }
  }
}

function checkHealth() {

  delTrigger('checkHealth');
  setTrigger(interval = 1, funcName = 'checkHealth', hour = 20);
  const SPREADSHEET4MANAGER = PropertiesService.getScriptProperties().getProperty("SPREADSHEET4MANAGER");

  let friendSheet = SpreadsheetApp.openById(SPREADSHEET4MANAGER).getActiveSheet();
  let lastRow = friendSheet.getLastRow();
  console.log(friendSheet.getName() + 'の最終行は' + lastRow + 'です。');

  for (let i = 2; i <= lastRow; i++) {
    if (friendSheet.getRange(i, 3).getValue() == 'はい') {
      let studentName = friendSheet.getRange(i, 4).getValue();
      let studentID = friendSheet.getRange(i, 5).getValue();
      if (!search(search_name = studentName, search_id = studentID)) {
        pushPrivateMessage(friendSheet.getRange(i, 2).getValue(), '体温報告を忘れていませんか？');
      }
    }
  }

}
