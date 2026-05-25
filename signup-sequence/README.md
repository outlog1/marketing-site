# Outlog founding-guide signup sequence

Google Apps Script that runs against the Tally signups sheet and sends a 3-email sequence from `john@getoutlog.com`. Kills the sequence the moment the signup replies (any reply to any of the three emails, detected via Gmail search).

## Sequence

| # | When           | Subject                              | Goal                                      |
|---|----------------|--------------------------------------|-------------------------------------------|
| 1 | Immediate      | Welcome to Outlog — quick question   | Personal intro, ask 2 questions → reply   |
| 2 | T + 3 days     | Still saving you a spot              | Signal traction + founding-guide perks    |
| 3 | T + 10 days    | Last check-in from Outlog            | Soft final nudge, low pressure            |

Any reply from the signup's address (Gmail search `from:<email> after:<submitted_at>`) flips status to `replied` and stops further sends.

## One-time setup (do this in John's Google account)

1. **Add the alias in Gmail.** Settings → Accounts → "Send mail as" → confirm `john@getoutlog.com` is set up so Apps Script can send `from:` that address. (Already done if John uses it day-to-day.)
2. **Open the signups sheet** as `john@getoutlog.com` → Extensions → Apps Script.
3. Paste contents of [`Code.gs`](Code.gs) into the editor. Save.
4. In the editor, select the function `installTriggers` and click **Run**. Approve the OAuth scopes (Sheets + Gmail) on first run.
5. The script will auto-add columns F–I (`Status`, `Email1 sent`, `Email2 sent`, `Email3 sent`) on the first execution.

## Triggers installed

- `processNewSignups` — every 10 min, sends email 1 to any new row.
- `processFollowups` — every 6 hr, sends email 2 / 3 when due, skipping any signup that has replied.

## Editing the copy

All three emails live in `sendEmail1_`, `sendEmail2_`, `sendEmail3_` at the top of `Code.gs`. Edit, save, no redeploy needed — next trigger run picks up the new copy.

## Manual sanity check before turning it on

1. Submit the Tally form once with a test email you control.
2. In the Apps Script editor, run `processNewSignups` manually — confirm email 1 lands and the row shows `Status=active`, `Email1 sent=<timestamp>`.
3. Reply to that email from the test address. Run `processFollowups` — status should flip to `replied`, no further emails sent.
