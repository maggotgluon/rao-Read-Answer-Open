---
title: 'Cookies & On-Device Storage Notice'
slug: cookies
version: '1.0-draft'
effective_date: '{{effective_date}}'
lang: en
---

# Cookies and on-device storage

Rao (เรา) uses cookies and storage on your device **only as needed to make the app work and remember your settings**. We use no advertising cookies and no third-party trackers.

## What are cookies?

Cookies are small text files a website saves in your browser. "On-device storage" (such as localStorage and the service worker cache) is where the app remembers a few things on your own device.

## Necessary cookies

These are needed for signing in and for security. If you block them, the app won't work.

| Cookie                         | What it does                                           | Lifetime                              |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------- |
| Session cookie (`rao-session`) | Keeps you signed in while you use the app              | Ends after 2 hours without activity   |
| `XSRF-TOKEN`                   | Protects against forged requests (CSRF)                | Session                               |
| `remember_web_…`               | Remembers your sign-in, only if you tick "Remember me" | About 400 days, or until you sign out |

## Preference cookies and stored settings

| Name                  | Type                                                                  | What it does                                                                                                                    |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `appearance`, `theme` | Cookie and localStorage                                               | Remembers light/dark mode and theme so pages look right from the first load                                                     |
| `sidebar_state`       | Cookie                                                                | Remembers whether the side menu is open                                                                                         |
| Language              | Stored in your account (and in the session cookie before you sign in) | Remembers your Thai/English choice                                                                                              |
| `rao.loc.at`          | localStorage                                                          | Remembers when your location was last updated, so it's not updated more than every 30 minutes (only if you share your location) |
| `rao.ld.dismissed.…`  | localStorage                                                          | Remembers that you dismissed the "long-distance mode" suggestion                                                                |

## App cache (PWA)

When you open the app, the service worker stores the app's own files (code, icons and the "offline" page) on your device, so it loads faster and can show a notice when you're offline. **This cache does not store private content** such as your answers, moments or photos.

## What we don't use

- No advertising or cross-site tracking cookies.
- No third-party analytics (such as Google Analytics or Facebook Pixel).
- Our optional usage analytics are stored on our own server, linked to your account, and collected only if you consent in Settings — they don't use a separate cookie. The app only keeps a one-word marker (`rao-open`) in your browser's session storage, so an app opening is counted once per visit; it disappears when you close the tab.
- Fonts: served from our own server (no third-party font service).

## Why there's no cookie banner

We only use cookies and storage that are necessary to provide the service or that remember choices you made yourself, on the basis of providing the service under our terms and legitimate interest. Anything optional, such as usage analytics, we always ask you about separately.

## Managing cookies

You can delete or block cookies and site data in your browser settings, but if you block necessary cookies you won't be able to sign in. Clearing site data resets the settings on that device; it does not delete your account or your content on our server.

See the [Privacy Policy](/legal/privacy) for more. Questions? Contact {{contact_email}}.

If the Thai and English versions differ, the Thai version prevails.
