# Fault Ticket UAT update — 16 October 2026

**UAT only. Do not deploy this package to PROD until explicitly approved.**
PROD repository `Tikcet-Protal_PRO` and v0.1 are unchanged.

## Changes

1. Fault visibility: Infra, Infra TL, Infra Manager and Admin can select Public or Internal when reporting a new fault. Staff defaults to Internal. Requesters always create Public tickets. Public preserves existing requester visibility; it does not mean unauthenticated access. Internal tickets are hidden from every Requester, including direct ticket URLs, actions, attachment URLs and notification lists. Staff can still view them. Existing tickets remain Public; this release does not automatically reclassify historical records. Visibility selection is on creation, not a retroactive editing control.
2. WhatsApp new-fault notification has exactly seven lines: New Fault Ticket, Number, Subject, Category, Domain, Raised by, Reported (SGT). Description and Portal URL are removed. The delivery path also trims old queued payloads to seven lines; already-sent WhatsApp messages are unchanged. Updates still do not generate messages.
3. Report Issue uses a larger window and Description editor. Pasting Excel/Word/email HTML tables preserves rows, columns, header cells and supported row/column spans. Tab-separated plain text is converted into a table. Submitted descriptions retain table borders in ticket details and future offline archives. Ordinary descriptions and existing plain-text tickets continue to work. The plain-text counterpart remains available for archive summaries.

Scripts, pasted styles, external images, links and executable attributes are removed. This is a structured description editor, not a full Word document renderer. Paste screenshots through the existing attachment upload. Description limit remains 20,000 text characters, with an additional 100,000-character sanitized markup limit.

## Files to update

New:
- `app/fault_content.py`
- `app/static/fault-editor.js`

Replace:
- `app/main.py`
- `app/waha.py`
- `app/archive.py`
- `app/static/app.js`
- `app/static/index.html`
- `app/static/style.css`

Keep all current `.env`, Compose files, certificates, database volumes, attachments and archives. No extra Python dependency is needed; lxml is already present. Application startup automatically creates the new `fault_content` table. No manual ALTER or historical migration is required.

## Installation on UAT

Extract over the UAT project folder, preserving paths, then run:

```powershell
docker compose -f compose.yaml -f compose.override.yaml -f compose.ssl.yaml up -d --build --force-recreate web scheduler
```

Take a successful UAT backup before updating. Do not roll back to an older backend while Internal records exist: older code does not enforce the new visibility boundary.

Press Ctrl+F5 after deployment. Restart proxy only if access fails after application recreation; this update does not change proxy configuration.

## Acceptance checks

- Infra creates an Internal fault with an attachment. Infra/TL/Manager/Admin can open it; Requester list/dashboard cannot see it. A Requester opening a copied ticket/attachment URL receives Ticket not found.
- Infra explicitly creates Public; Requesters can see it, with existing update permissions unchanged.
- Requester reports a fault and does not see a visibility selector; it becomes Public.
- Historical tickets remain Public.
- Paste an Excel table into Description; verify rows/cells/borders before submitting and after reopening. Repeat with tab-separated clipboard text and an ordinary text description.
- Create a new fault with WAHA enabled on UAT; check the seven-line group message has no Description or Portal URL. Verify the normal group/session configuration first.
- Archived text retains the table; archived records stay read-only.

Validation: 33 SQLite and 33 isolated MySQL tests passed. Chromium checks passed for HTML/Excel TSV paste, cell borders after submission, requester/staff visibility defaults, enlarged dialog and unsafe paste filtering. PROD code and tag were not changed.
