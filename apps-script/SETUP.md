# Partner enquiries → Google Sheet

Where the popup form on the home page sends its data, and how to hook it up.

## What you get

One Google Sheet, in your own Drive, that fills a row per enquiry:

| Received | First name | Last name | Email | Message | File | File link | Page | Browser |
|---|---|---|---|---|---|---|---|---|

Attachments (max 10 MB) are uploaded to a Drive folder named **Partner enquiry files**,
and the row links to them. An alert email also goes to pirawit.win@gmail.com with
Reply-To set to the sender, so you can answer straight from the notification.

## Setup — about 5 minutes, done once

1. Go to <https://sheets.new> and name the sheet e.g. **Partner enquiries — win-architect.com**.
2. **Extensions → Apps Script**. Delete the sample `function myFunction() {}`.
3. Paste everything from [`Code.gs`](Code.gs), then save (💾).
4. **Deploy → New deployment → ⚙ → Web app**, with:
   - *Description*: anything, e.g. `partner form v1`
   - *Execute as*: **Me**
   - *Who has access*: **Anyone** ← must be "Anyone", not "Anyone with Google account"
5. Click **Deploy**, then **Authorize access** → pick your account → *Advanced* →
   *Go to (project name)* → **Allow**. (The "unverified app" screen is normal: it is
   your own script asking for your own Sheet and Drive.)
6. Copy the **Web app URL** — it ends in `/exec`.
7. Paste it into `index.html`, in this line near the partner popup script:

   ```js
   const PARTNER_ENDPOINT = '';   // ← paste the /exec URL between the quotes
   ```

8. Commit and push. Done — submissions now land in the Sheet.

## Check it works

- Open the `/exec` URL in a browser: it should print `{"ok":true,"service":"partner enquiry endpoint"}`.
- Submit the form on the live site. A row should appear within a second or two.

## Notes

- Until step 7 is done, the form still works: it falls back to opening the
  visitor's mail app, exactly as before.
- If the network call ever fails (script quota, deployment deleted, visitor
  offline), the form falls back to the mail app too, so an enquiry is never
  silently dropped.
- **After editing `Code.gs` you must deploy again** — *Deploy → New deployment*.
  Editing alone does not update the live `/exec` URL. If you use
  *Manage deployments → edit → Version: New version* instead, the URL stays the same
  and you do not have to touch `index.html` again.
- The form has a hidden honeypot field (`company`); bots that fill it are accepted
  and discarded, so they never reach the Sheet.
- Apps Script free quotas (roughly 20,000 URL calls and 100 emails a day for a
  consumer account) are far above what this form will ever use.
