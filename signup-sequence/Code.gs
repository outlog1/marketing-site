/**
 * Outlog founding-guides signup sequence.
 *
 * Install in john@getoutlog.com's account, bound to the Tally signups sheet.
 * Sends a 3-email sequence from john@getoutlog.com, killing the sequence
 * the moment the signup replies.
 *
 * Sheet columns: A=Submission ID | B=Respondent ID | C=Submitted at
 *                D=Who are you? | E=Email
 * Script-managed columns (auto-created on first run):
 *                F=Status | G=Email1 sent | H=Email2 sent | I=Email3 sent
 */

const SHEET_NAME       = 'Sheet1';            // change if your tab is named differently
const SENDER_NAME      = 'John Martin';
const SENDER_EMAIL     = 'john@getoutlog.com';
const FOLLOWUP_2_DAYS  = 3;
const FOLLOWUP_3_DAYS  = 10;

// ─── Webhook entry point (instant on Tally submit) ───────────────────────────

/**
 * Tally posts here the instant a form is submitted. Writes the row + sends
 * email 1 with no wait. Deploy this script as a Web App (Deploy → New
 * deployment → Web app, execute as Me, anyone with link can access) and paste
 * the URL into the Tally form's webhook integration.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const fields  = (payload.data && payload.data.fields) || [];
    const get = (label) => {
      const f = fields.find(x => x.label === label);
      if (!f) return '';
      // Dropdown values come as array of option IDs — resolve via options[].
      if (Array.isArray(f.value)) {
        return f.value
          .map(id => (f.options || []).find(o => o.id === id))
          .filter(Boolean)
          .map(o => o.text)
          .join(', ');
      }
      return f.value || '';
    };

    const row = {
      submissionId: payload.data && payload.data.submissionId,
      respondentId: payload.data && payload.data.respondentId,
      submittedAt:  new Date(payload.createdAt || Date.now()),
      whoAreYou:    get('Who are you?'),
      email:        String(get('Email')).trim(),
    };
    if (!row.email) return ContentService.createTextOutput('skip: no email');

    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    ensureStatusColumns_(sh);

    // Dedupe: if this submissionId is already a row, do nothing.
    const existing = sh.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0] === row.submissionId) {
        return ContentService.createTextOutput('skip: dup');
      }
    }

    sh.appendRow([
      row.submissionId, row.respondentId, row.submittedAt,
      row.whoAreYou, row.email,
      'active', new Date(), '', '',
    ]);

    sendEmail1_(row);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('error: ' + err.message);
  }
}

// ─── Trigger entry points ────────────────────────────────────────────────────

/** Safety net. Runs every 10 min in case the webhook ever fails. */
function processNewSignups() {
  const rows = getRows_();
  rows.forEach(r => {
    if (r.status) return;                  // already processed
    if (!r.email) return;
    sendEmail1_(r);
    markSent_(r.rowIndex, 'email1', 'active');
  });
}

/** Run daily. Sends email 2 / 3 when due, unless the signup has replied. */
function processFollowups() {
  const now = new Date();
  const rows = getRows_();
  rows.forEach(r => {
    if (r.status !== 'active') return;
    if (hasReplied_(r.email, r.submittedAt)) {
      setStatus_(r.rowIndex, 'replied');
      return;
    }
    if (!r.email2Sent && daysSince_(r.submittedAt, now) >= FOLLOWUP_2_DAYS) {
      sendEmail2_(r);
      markSent_(r.rowIndex, 'email2', 'active');
      return;
    }
    if (r.email2Sent && !r.email3Sent && daysSince_(r.submittedAt, now) >= FOLLOWUP_3_DAYS) {
      sendEmail3_(r);
      markSent_(r.rowIndex, 'email3', 'done');
    }
  });
}

// ─── Email copy ──────────────────────────────────────────────────────────────

function sendEmail1_(r) {
  const subject = 'Welcome to Outlog — quick question';
  const body =
`Hey,

John here — founder of Outlog. Thanks for putting your name in for early access.

We're picking 10 founding guides this season to help shape the product before we open it up. The goal is simple: an outfitter app guides actually want to use, built with the people who'll live in it every day.

Two quick questions to make sure we're a fit:

  1. What outfit are you guiding for (or running)?
  2. What's the single biggest pain in your day right now — booking, scheduling, payments, follow-up, something else?

Just hit reply. Two sentences is plenty.

— John
john@getoutlog.com`;
  send_(r.email, subject, body);
}

function sendEmail2_(r) {
  const subject = 'Still saving you a spot';
  const body =
`Hey,

Following up on my note from a few days back. Wanted to give you a feel for where we are:

  • Founding guides are already in from Colorado, Montana, and Wyoming
  • First build focus: booking + payments in one flow, no double-entry
  • Founding guides get lifetime pricing and a direct line to me on what gets built next

If Outlog sounds like something you'd want to shape, hit reply with the outfit you're guiding for and I'll get you set up.

— John
john@getoutlog.com`;
  send_(r.email, subject, body);
}

function sendEmail3_(r) {
  const subject = 'Last check-in from Outlog';
  const body =
`Hey,

Last note from me — I don't want to clutter your inbox.

We're closing the founding-guide cohort soon. If now's not the right time, no worries at all; I'll keep you on the list for general access when we open it up.

If you do want one of the founding spots, just reply with a yes and I'll take it from there.

Either way, tight lines this season.

— John
john@getoutlog.com`;
  send_(r.email, subject, body);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function send_(to, subject, body) {
  GmailApp.sendEmail(to, subject, body, {
    name:    SENDER_NAME,
    from:    SENDER_EMAIL,         // requires "Send mail as" alias in Gmail
    replyTo: SENDER_EMAIL,
  });
}

function getRows_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  ensureStatusColumns_(sh);
  const values = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[4]) continue;                  // no email
    out.push({
      rowIndex:    i + 1,
      submissionId: row[0],
      respondentId: row[1],
      submittedAt:  row[2] instanceof Date ? row[2] : new Date(row[2]),
      whoAreYou:    row[3],
      email:        String(row[4]).trim(),
      status:       row[5] || '',
      email1Sent:   row[6] || '',
      email2Sent:   row[7] || '',
      email3Sent:   row[8] || '',
    });
  }
  return out;
}

function ensureStatusColumns_(sh) {
  const headers = sh.getRange(1, 1, 1, 9).getValues()[0];
  const expected = ['Submission ID','Respondent ID','Submitted at','Who are you?','Email',
                    'Status','Email1 sent','Email2 sent','Email3 sent'];
  expected.forEach((h, i) => {
    if (headers[i] !== h && i >= 5) sh.getRange(1, i + 1).setValue(h);
  });
}

function markSent_(rowIndex, which, status) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const col = { email1: 7, email2: 8, email3: 9 }[which];
  sh.getRange(rowIndex, 6).setValue(status);
  sh.getRange(rowIndex, col).setValue(new Date());
}

function setStatus_(rowIndex, status) {
  SpreadsheetApp.getActive().getSheetByName(SHEET_NAME)
    .getRange(rowIndex, 6).setValue(status);
}

function hasReplied_(email, since) {
  const q = `from:${email} after:${Math.floor(since.getTime()/1000)}`;
  return GmailApp.search(q, 0, 1).length > 0;
}

function daysSince_(date, now) {
  return (now - date) / (1000 * 60 * 60 * 24);
}

// ─── One-time setup ──────────────────────────────────────────────────────────

/** Run once, manually, after pasting this script in. */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('processNewSignups').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('processFollowups').timeBased().everyHours(6).create();
}
