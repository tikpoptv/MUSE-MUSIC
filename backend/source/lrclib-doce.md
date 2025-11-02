# 🎵 LRCLIB API Documentation (Beta)

Welcome to the **beta API documentation** and specification of **LRCLIB's API**!  
Although we intend to maintain backward compatibility, please be aware that there may be breaking changes in future updates.  
Since this document is still in its early stages, it may lack information or contain inaccuracies in certain sections.

---

## ⚙️ Overview

- **No rate limiting:** The API is openly accessible to all users and applications.  
- **No API key required:** No registration or authentication needed.  
- **Recommended:** Include a `User-Agent` header with your application’s name, version, and homepage.  
  Example:
  ```
  User-Agent: LRCGET v0.2.0 (https://github.com/tranxuanthang/lrcget)
  ```

---

## 🎧 Get Lyrics with Track Signature

**GET** `/api/get`

Attempt to find the best match of lyrics for the track.  
You must provide the exact signature of the track (title, artist, album, and duration in seconds).

> ⚠️ Each new request may query external sources if lyrics are not found internally — response time may vary.  
> If you want faster responses, use `/api/get-cached` instead.

**Duration is crucial** — LRCLIB matches only when duration difference ≤ ±2 seconds.

### Query Parameters

| Field | Required | Type | Description |
|-------|-----------|------|-------------|
| `track_name` | ✅ | string | Title of the track |
| `artist_name` | ✅ | string | Artist name |
| `album_name` | ✅ | string | Album name |
| `duration` | ✅ | number | Track duration in seconds |

### Example Request
```
GET /api/get?artist_name=Borislav+Slavov&track_name=I+Want+to+Live&album_name=Baldur%27s+Gate+3+(Original+Game+Soundtrack)&duration=233
```

### Example Response
**200 OK**
```json
{
  "id": 3396226,
  "trackName": "I Want to Live",
  "artistName": "Borislav Slavov",
  "albumName": "Baldur's Gate 3 (Original Game Soundtrack)",
  "duration": 233,
  "instrumental": false,
  "plainLyrics": "I feel your breath upon my neck\n...The clock won't stop and this is what we get\n",
  "syncedLyrics": "[00:17.12] I feel your breath upon my neck\n...[03:20.31] The clock won't stop and this is what we get\n[03:25.72] "
}
```

**404 Not Found**
```json
{
  "code": 404,
  "name": "TrackNotFound",
  "message": "Failed to find specified track"
}
```

---

## ⚡ Get Lyrics (Cached Only)

**GET** `/api/get-cached`

Same as `/api/get`, but only retrieves lyrics from the **internal database** — no external lookup.

### Query Parameters
(Same as `/api/get`)

### Example Request
```
GET /api/get-cached?artist_name=Jeremy+Soule&track_name=Dragonborn&album_name=The+Elder+Scrolls+V:+Skyrim:+Original+Game+Soundtrack&duration=236
```

---

## 🆔 Get Lyrics by LRCLIB ID

**GET** `/api/get/{id}`

Retrieve a lyrics record using its **LRCLIB ID**.  
You can obtain IDs from `/api/search`.

### URL Parameters

| Field | Required | Type | Description |
|-------|-----------|------|-------------|
| `id` | ✅ | number | ID of the lyrics record |

### Example Request
```
GET /api/get/3396226
```

---

## 🔍 Search for Lyrics Records

**GET** `/api/search`

Search for lyrics records using keywords.  
Returns an array of lyrics records that match the search condition(s).

At least **one** of `q` or `track_name` must be provided.

> ⚠️ Returns max 20 results; pagination not supported (subject to change).

### Query Parameters

| Field | Required | Type | Description |
|-------|-----------|------|-------------|
| `q` | conditional | string | Search keyword across all fields |
| `track_name` | conditional | string | Search keyword in track title |
| `artist_name` | optional | string | Search keyword in artist name |
| `album_name` | optional | string | Search keyword in album name |

### Example Requests

**Search by keyword:**
```
GET /api/search?q=still+alive+portal
```

**Search by multiple fields:**
```
GET /api/search?track_name=22&artist_name=taylor+swift
```

### Example Response
Returns JSON array of lyric records with:
`id`, `trackName`, `artistName`, `albumName`, `duration`, `instrumental`, `plainLyrics`, `syncedLyrics`.

---

## 📝 Publish a New Lyrics

**POST** `/api/publish`

> ⚠️ Experimental API (subject to changes)

Publishes new lyrics to LRCLIB database. Anonymous publishing allowed.  
If both `plainLyrics` and `syncedLyrics` are empty → track marked as **instrumental**.

All previous revisions remain stored.

### 🔐 Publish Token Requirement

Every publish request must include a **valid Publish Token** in header:  
`X-Publish-Token: {prefix}:{nonce}`

Obtain this via `/api/request-challenge` (see below).

### Request Header

| Header | Required | Description |
|---------|-----------|-------------|
| `X-Publish-Token` | ✅ | Token obtained via challenge |

### Request Body (JSON)

| Field | Required | Type | Description |
|-------|-----------|------|-------------|
| `trackName` | ✅ | string | Track title |
| `artistName` | ✅ | string | Artist name |
| `albumName` | ✅ | string | Album name |
| `duration` | ✅ | number | Track duration (seconds) |
| `plainLyrics` | ✅ | string | Plain text lyrics |
| `syncedLyrics` | ✅ | string | Time-synced lyrics |

### Response

**201 Created** – Successfully published.

**400 Incorrect Token**
```json
{
  "code": 400,
  "name": "IncorrectPublishTokenError",
  "message": "The provided publish token is incorrect"
}
```

---

## 🧩 Request a Challenge

**POST** `/api/request-challenge`

> ⚠️ Experimental API (subject to changes)

Generates prefix and target for the **proof-of-work cryptographic challenge**.  
Each challenge expires in **5 minutes**.

### Example Response
```json
{
  "prefix": "VXMwW2qPfW2gkCNSl1i708NJkDghtAyU",
  "target": "000000FF00000000000000000000000000000000000000000000000000000000"
}
```

Use this prefix and target to compute a valid nonce, forming the Publish Token.

---

© 2025 LRCLIB. All rights reserved.
