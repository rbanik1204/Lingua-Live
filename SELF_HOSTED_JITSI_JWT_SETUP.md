# Self‑Hosted Jitsi (JWT) Setup — Guaranteed Teacher Moderator

Goal: the teacher always joins as **moderator** (no “waiting for moderator” / no login required).

This project already supports that flow:
- The teacher’s browser requests a signed JWT from Firebase Functions (`getJitsiJwt`).
- The JWT is injected into the Jitsi IFrame (`jwt` option).
- Your self-hosted Jitsi is configured to trust JWTs and assign moderator based on token.

---

## 0) What you need

- A server/VPS (Ubuntu is the most common for Jitsi).
- A domain/subdomain pointing to it, e.g. `meet.yourdomain.com`.
- HTTPS certificates (Let’s Encrypt).
- A strong JWT secret (you generate it).

---

## 1) Install Jitsi Meet (server)

Follow the official Jitsi install for Ubuntu.
Typical flow:

- Set DNS: `meet.yourdomain.com` → your server IP.
- Install Jitsi Meet packages.
- Enable Let’s Encrypt during install.

At the end you should be able to open:
- `https://meet.yourdomain.com` and start a meeting.

---

## 2) Enable JWT auth in Prosody (server)

You will configure Prosody (XMPP server used by Jitsi) to accept JWT tokens.

### 2.1 Edit Prosody config

Open (path depends on your install):
- `/etc/prosody/conf.avail/meet.yourdomain.com.cfg.lua`

You want a **secure domain** with guests:

1) Main host uses JWT auth:

```lua
VirtualHost "meet.yourdomain.com"
    authentication = "token"
    app_id = "YOUR_APP_ID"        -- must match Firebase secret JITSI_JWT_APP_ID
    app_secret = "YOUR_APP_SECRET" -- must match Firebase secret JITSI_JWT_APP_SECRET
    allow_empty_token = false
```

2) Guest host is anonymous (students can join without JWT):

```lua
VirtualHost "guest.meet.yourdomain.com"
    authentication = "anonymous"
    c2s_require_encryption = false
```

3) Make sure the main host allows guests by setting the guest domain in Jitsi Meet config (next section).

### 2.2 Reload Prosody

```bash
sudo systemctl restart prosody
```

---

## 3) Configure Jitsi Meet to use the guest domain + roles from token

Edit:
- `/etc/jitsi/meet/meet.yourdomain.com-config.js`

Add/ensure these options:

```js
var config = {
  // ...existing...

  // Enable secure domain guests.
  anonymousdomain: 'guest.meet.yourdomain.com',

  // Make roles and features come from JWT.
  enableUserRolesBasedOnToken: true,
  enableFeaturesBasedOnToken: true,
};
```

Restart web components:

```bash
sudo systemctl restart jitsi-videobridge2
sudo systemctl restart jicofo
sudo systemctl restart prosody
sudo systemctl restart nginx
```

---

## 4) What JWT must contain (this project already does)

Our Firebase Function signs HS256 JWT with:
- `iss` = `JITSI_JWT_APP_ID`
- `sub` = `JITSI_DOMAIN` (your Jitsi domain)
- `aud` = `JITSI_JWT_AUD` (commonly `jitsi`)
- `room` = the room name
- `context.user.moderator = true`

That last field is what guarantees the teacher is moderator.

---

## 5) Configure Firebase Functions secrets (required)

This repo uses Firebase Functions v2 secrets (`defineSecret`).
Set them once in your Firebase project:

```bash
# From repo root
npx firebase-tools functions:secrets:set JITSI_DOMAIN
npx firebase-tools functions:secrets:set JITSI_JWT_APP_ID
npx firebase-tools functions:secrets:set JITSI_JWT_APP_SECRET
npx firebase-tools functions:secrets:set JITSI_JWT_AUD
```

Recommended values:
- `JITSI_DOMAIN` = `meet.yourdomain.com`
- `JITSI_JWT_APP_ID` = `lingualive` (or any string, must match Prosody `app_id`)
- `JITSI_JWT_APP_SECRET` = generate a strong secret (must match Prosody `app_secret`)
- `JITSI_JWT_AUD` = `jitsi`

Then deploy the function:

```bash
npx firebase-tools deploy --only functions
```

---

## 6) Configure the frontend to use your Jitsi domain

In `.env.local` (project root):

```bash
VITE_JITSI_DOMAIN=meet.yourdomain.com
# Usually empty for self-hosted
VITE_JITSI_ROOM_NAME_PREFIX=
```

Deploy hosting:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

---

## 7) Expected behavior

- Teacher clicks “Start Instant Class” → opens Live Class.
- Teacher’s app calls `getJitsiJwt` → receives a JWT.
- Teacher joins the Jitsi room as **moderator** automatically.
- Students can join the same room without a token (via guest domain).

If students are blocked, it usually means the guest domain / `anonymousdomain` isn’t configured correctly.

---

## Notes / Troubleshooting

- If you see "not authorized" in the Jitsi UI:
  - Verify `app_id`, `app_secret`, `JITSI_DOMAIN`, and `aud` match exactly.
- If teacher still isn’t moderator:
  - Ensure `enableUserRolesBasedOnToken: true` is enabled.
  - Ensure your Prosody host is using `authentication = "token"`.
- If students cannot join without token:
  - Ensure `anonymousdomain` points to `guest.<domain>` and the guest VirtualHost is `authentication = "anonymous"`.
