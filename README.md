# ZeroBite: Smart Food Waste Management Platform

A comprehensive web application for reducing food waste by connecting food donors (restaurants, hotels, event organizers) with NGOs and beneficiaries. Built with modern web technologies and Firebase integration.

## 🌟 Overview

ZeroBite is a food waste reduction platform that enables:
- **Donors** to report surplus food and track donations
- **NGOs** to receive food alerts and manage pickups
- **Admins** to monitor CSR impact and system analytics
- **Emergency Mode** for urgent food surplus situations
- **AI-powered Event Prediction** for proactive food waste management

## 🚀 Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **React Router DOM 6.22.3** - Client-side routing
- **Vite 5.1.0** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Recharts 2.12.7** - Data visualization library

### Backend & Services
- **Firebase 12.5.0** - Authentication, Firestore database, and hosting
- **Firebase Hosting** - Deployment platform

### Development Tools
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## ✨ Key Features

### For Donors
- Report surplus food with details (quantity, type, expiry)
- Track donation history and impact metrics
- Real-time NGO matching based on location and capacity
- Emergency alert system for urgent donations

### For NGOs
- Receive surplus food alerts
- Manage pickup schedules
- View donation history and beneficiary impact
- Dashboard with analytics

### For Admins
- CSR Dashboard with comprehensive metrics
- Monitor platform-wide food waste reduction
- Track donor and NGO performance
- Generate impact reports

### Core Modules
- **Event Prediction** - ML-based forecasting for events likely to generate food surplus
- **NGO Matching** - Smart algorithm to match donors with nearby NGOs
- **Emergency Mode** - Rapid response system for urgent food donations
- **Analytics Dashboard** - Real-time metrics and visualizations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (LTS version 18.x or higher) - [Download here](https://nodejs.org)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for version control)
- A modern web browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/zerobite.git
cd zerobite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
Create a `.env` file in the root directory with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build in `dist/` folder |
| `npm run preview` | Preview production build locally |
| `firebase deploy` | Deploy to Firebase Hosting |

## 🏗️ Project Structure

```
zerobite/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components (routes)
│   ├── context/        # React Context providers
│   ├── data/           # Static data and mock files
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── dist/              # Production build output
├── .env               # Environment variables (not in git)
├── .gitignore         # Git ignore rules
├── firebase.json      # Firebase configuration
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.js     # Vite configuration
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

## 🔐 Authentication

The app uses Firebase Authentication with support for:
- Email/Password login
- Role-based access (Donor, NGO, Admin)
- Protected routes
- Session persistence

**Test Accounts:**
- Donor: `donor@test.com` / `password123`
- NGO: `ngo@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

## 🌐 Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## 📊 Features Documentation

### Event Prediction
Uses historical data to predict events (weddings, conferences, festivals) that may generate food surplus, allowing proactive NGO coordination.

### NGO Matching Algorithm
Matches donors with NGOs based on:
- Geographic proximity
- NGO capacity and availability
- Food type compatibility
- Historical performance

### Emergency Mode
Fast-track system for urgent food donations with:
- One-click alert to all nearby NGOs
- Priority notification system
- Real-time status tracking

## 🤝 Team Collaboration

### Setting Up for Development
1. Each team member should clone the repo
2. Create their own Firebase project for testing (or use shared project)
3. Copy `.env.example` to `.env` and add credentials
4. Run `npm install` and `npm run dev`

### Git Workflow
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Firebase Connection Issues
- Verify `.env` file exists and has correct credentials
- Check Firebase project settings match your configuration
- Ensure Firebase services are enabled in console

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 📝 License

This project is developed for educational purposes as part of SE Lab coursework.

## 👥 Contributors

- Yash Kapur
- Aaditya Upadhyay

## 📞 Support

For issues or questions:
- Check existing documentation in `/docs` folder
- Review test reports: `TESTING_REPORT.md`, `BUG_ANALYSIS_REPORT.md`
- Contact team lead or project supervisor

---

**Built with ❤️ for reducing food waste and helping communities**
