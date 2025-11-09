# Vibeflow


An alternative Spotify player built with Next.js that delivers an immersive, visually rich listening experience featuring artist insights, playlist organization, and in-depth user stats. This project began as both a passion project and a personal challenge. It is a modern reimagining of an earlier Spotify app I built years ago but couldn’t fully complete.

![Vibeflow](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?style=flat-square&logo=spotify)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

## Features

- **Dynamic Backgrounds** - Album art creates beautiful blurred backgrounds
- **Full Playback Control** - Play, pause, skip, volume control, and seeking
- **Artist Facts** - Auto-rotating facts about the artists you're listening to
- **User Statistics** - View your top artists, tracks, and estimated listening hours
- **Playlist Management** - Browse and play your Spotify playlists
- **Recently Played** - See your listening history
- **User Profile** - Detailed profile with follower count and subscription info
- **Real-time Sync** - Automatically syncs with your Spotify playback

## Demo

[Live Demo](https://vibeflow.pixelforcelabs.com/login)

## Screenshots

![Login](https://i.imgur.com/HU0dTeL.png)
![Player](https://i.imgur.com/loFvZyd.png)
![Playlists](https://i.imgur.com/4D1CRRx.png)

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **API:** [Spotify Web API](https://developer.spotify.com/documentation/web-api)

## Prerequisites

Before you begin, ensure you have:

- Node.js 24+ installed
- A Spotify account (Premium recommended for full playback control)
- A Spotify Developer App (instructions below)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/vibeflow.git
cd vibeflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the details:
   - **App name:** Vibeflow
   - **App description:** Alternative Spotify player
   - **Redirect URI:** `http://127.0.0.1:3000/api/auth/callback/spotify`
   - **Which API/SDKs are you planning to use?** Check "Web API"
5. Click **Save**
6. Go to **Settings** and copy your **Client ID** and **Client Secret**

### 4. Environment Variables

Create a `.env.local` file in the root directory:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://127.0.0.1:3000
```

Generate `NEXTAUTH_SECRET` with:
```bash
openssl rand -base64 32
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

## Usage

1. **Login** - Click "Connect with Spotify" to authenticate
2. **Player** - Control playback with play/pause, skip, volume, and seeking
3. **Playlists** - Browse and play your Spotify playlists
4. **Profile** - View your listening statistics and top artists/tracks

## Features Breakdown

### Player Controls
- Play/Pause
- Skip forward/backward
- Volume control
- Progress bar with seeking
- Dynamic album art backgrounds

### Artist Information
- Auto-rotating facts about artists
- Genre information
- Popularity metrics
- Follower counts
- Top tracks

### User Profile
- Profile picture and basic info
- Estimated listening hours
- Top 5 artists (last 6 months)
- Top 5 tracks (last 6 months)
- Recently played tracks

### Playlists
- View all your playlists
- Play any playlist with one click
- Album art thumbnails
- Track counts

## Required Spotify Permission Scopes

Vibeflow requires the following Spotify permissions:
- `user-read-email`
- `user-read-private`
- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`
- `user-read-recently-played`
- `user-top-read`
- `streaming`
- `playlist-read-private`
- `playlist-read-collaborative`

## Disclaimer

**Vibeflow is an unofficial third-party app. We're not affiliated with or endorsed by Spotify. Spotify® is a registered trademark of Spotify AB.**
