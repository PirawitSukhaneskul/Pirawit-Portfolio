/**
 * Partner enquiry endpoint for win-architect.com
 *
 * Receives the popup form on the portfolio home page, appends one row per
 * enquiry to this spreadsheet, and stores the attachment (if any) in a Drive
 * folder, linking it from the row.
 *
 * Works either way round: bound to a spreadsheet (Extensions > Apps Script), or
 * as a standalone script — in that case it creates its own spreadsheet on the
 * first enquiry and remembers it. Run showSheetUrl() to get the link.
 *
 * Deploy: Deploy > New deployment > type "Web app",
 *         Execute as "Me", Who has access "Anyone".
 */

var SPREADSHEET_ID = '';   // optional: paste a spreadsheet ID to write to that one
var SHEET_NAME   = 'Partner enquiries';
var FOLDER_NAME  = 'Partner enquiry files';
var NOTIFY_EMAIL = 'pirawit.win@gmail.com';   // '' to switch the alert email off
var MAX_BYTES    = 10 * 1024 * 1024;          // 10 MB, same limit as the form

var HEADERS = ['Received', 'First name', 'Last name', 'Email', 'Message',
               'File', 'File link', 'Page', 'Browser'];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ ok: false, error: 'empty request' });

    var body = JSON.parse(e.postData.contents);

    // Honeypot: bots fill every field, humans never see this one.
    if (body.company) return json({ ok: true });

    var first   = String(body.firstName || '').trim();
    var last    = String(body.lastName  || '').trim();
    var email   = String(body.email     || '').trim();
    var message = String(body.message   || '').trim();

    if (!first || !last || !message) return json({ ok: false, error: 'missing fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'invalid email' });

    var fileName = '', fileUrl = '';
    if (body.fileData) {
      var bytes = Utilities.base64Decode(body.fileData);
      if (bytes.length > MAX_BYTES) return json({ ok: false, error: 'file too large' });

      var blob = Utilities.newBlob(
        bytes,
        body.fileType || 'application/octet-stream',
        stamp() + ' - ' + first + ' ' + last + ' - ' + (body.fileName || 'attachment')
      );
      var file = folder().createFile(blob);
      fileName = body.fileName || file.getName();
      fileUrl  = file.getUrl();
    }

    sheet().appendRow([new Date(), first, last, email, message, fileName, fileUrl,
                       String(body.page || ''), String(body.userAgent || '')]);

    notify(first, last, email, message, fileName, fileUrl);
    return json({ ok: true });

  } catch (err) {
    // Keep the enquiry rather than lose it: log the raw payload for recovery.
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

/** Lets you confirm the deployment is live by opening the /exec URL in a browser. */
function doGet() {
  return json({ ok: true, service: 'partner enquiry endpoint' });
}

/** Run this once from the editor to print the spreadsheet link. */
function showSheetUrl() {
  var url = spreadsheet().getUrl();
  console.log(url);
  return url;
}

function spreadsheet() {
  var bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;

  var props = PropertiesService.getScriptProperties();
  var id = SPREADSHEET_ID || props.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);

  var created = SpreadsheetApp.create('Partner enquiries — win-architect.com');
  props.setProperty('SPREADSHEET_ID', created.getId());
  return created;
}

function sheet() {
  var ss = spreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(5, 420);   // message
    sh.getRange(1, 5, sh.getMaxRows()).setWrap(true);
  }
  return sh;
}

function folder() {
  var found = DriveApp.getFoldersByName(FOLDER_NAME);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
}

function stamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
}

function notify(first, last, email, message, fileName, fileUrl) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: 'Partner enquiry — ' + first + ' ' + last,
      body: first + ' ' + last + '\n' + email + '\n\n' + message +
            (fileName ? '\n\nFile: ' + fileName + '\n' + fileUrl : '') +
            '\n\nSheet: ' + spreadsheet().getUrl()
    });
  } catch (err) {
    console.error('notify failed: ' + err);   // the row is already saved
  }
}
