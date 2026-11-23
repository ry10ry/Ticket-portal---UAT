# Ticket-portal---v2
Plan to add Change Management &amp; Service Management

## Change Request and Service Request availability

Set these independent switches in the server's existing `.env` file:

```dotenv
CHANGE_REQUEST_ENABLED=false
SERVICE_REQUEST_ENABLED=false
```

Set either switch to `true` to restore that module. An unset switch defaults to
`true`. Recreate the web container with the installation's existing Compose
files so it reads the new settings. The switches preserve existing requests,
workflow settings, approvals, attachments, and unread notifications.
