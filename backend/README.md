# ZeroBite — Backend / Firebase Config

This folder contains Firebase project configuration files.

## Files

| File | Purpose |
|---|---|
| `firebase.json` | Firebase Hosting configuration (deploy target: `dist/`, SPA rewrites) |
| `.firebaserc` | Firebase project alias (`zerobite` project ID) |

## Firebase Services Used

The ZeroBite app uses the following Firebase services (configured via environment variables in `frontend/.env`):

- **Firebase Authentication** — Email/password login and registration
- **Cloud Firestore** — Real-time database for surplus alerts, NGO data, accepted pickups, and CSR stats
- **Firebase Hosting** — Deployment target for the production build

## Deploying

```bash
# Build the frontend first
cd ../frontend
npm run build

# Then deploy from the backend/ folder
cd ../backend
firebase deploy
```

> The `dist/` output folder referenced in `firebase.json` should be the build output from `frontend/npm run build`.
> Update the `public` path in `firebase.json` to `../frontend/dist` if deploying directly from this folder.
