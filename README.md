# Doomsday Work

Personal work tracker app — track daily tasks, weekly goals, and personal projects.

## Features

- **Dashboard**: Today's tasks with quick stats and completion tracking
- **Weekly View**: Navigate weeks, set goals, see daily breakdowns with progress
- **Projects**: Organize tasks by project with color-coded badges
- **Dark/Light Mode**: System-aware theme with manual toggle
- **Dropbox Sync**: Auto-sync data via Dropbox API
- **Export/Import**: Manual JSON backup and restore
- **PWA**: Installable on any device, works offline

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Dropbox Sync Setup

1. Go to [Dropbox Developers](https://www.dropbox.com/developers/apps) and create an app
2. Generate an access token
3. Paste it in Settings > Dropbox Sync

## Tech Stack

- React 18 + TypeScript
- Vite + PWA plugin
- Tailwind CSS v4
- localStorage for persistence
- Dropbox HTTP API for cloud sync
