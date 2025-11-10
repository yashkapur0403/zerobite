# ZeroBite - Project Structure Documentation

This document provides a comprehensive overview of the ZeroBite project structure, explaining the purpose of each directory and key files.

## 📁 Root Directory Structure

```
zerobite/
├── src/                          # Source code
├── public/                       # Static assets
├── dist/                         # Production build output (generated)
├── node_modules/                 # Dependencies (generated)
├── .firebase/                    # Firebase cache (generated)
├── index.html                    # HTML entry point
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── vite.config.js                # Vite bundler configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── firebase.json                 # Firebase hosting configuration
├── .firebaserc                   # Firebase project settings
├── .gitignore                    # Git ignore rules
├── .env                          # Environment variables (not in git)
├── README.md                     # Project documentation
├── PROJECT_STRUCTURE.md          # This file
├── TESTING_REPORT.md             # Testing documentation
├── BUG_ANALYSIS_REPORT.md        # Bug tracking and analysis
├── FINAL_TEST_SUMMARY.md         # Test results summary
├── PRE_PRESENTATION_CHECKLIST.md # Presentation preparation
└── PROJECT_REPORT_ANSWERS.md     # Project report Q&A
```

---

## 📂 `/src` - Source Code Directory

The main application source code organized by functionality.

### Directory Tree

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.jsx
│   ├── Logo.jsx
│   ├── Navbar.jsx
│   ├── PageShell.jsx
│   └── Toast.jsx
├── pages/              # Page-level components (routes)
│   ├── Home.jsx
│   ├── EventPrediction.jsx
│   ├── NGOMatching.jsx
│   ├── CSRDashboard.jsx
│   ├── EmergencyMode.jsx
│   ├── DonationHistory.jsx
│   ├── NGODashboard.jsx
│   └── SurplusAlerts.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx
├── data/               # Static data and mock files
│   ├── ngos.json
│   └── surplus.json
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
├── index.css           # Global styles and Tailwind imports
└── firebase.js         # Firebase configuration and initialization
```

---

## 🧩 Component Details

### `/src/components` - Reusable Components

Shared UI components used across multiple pages.

#### **AuthModal.jsx**
- **Purpose:** Authentication modal for login/signup
- **Features:**
  - Email/password authentication
  - Role selection (Donor, NGO, Admin)
  - Form validation
  - Firebase integration
- **Used by:** All pages requiring authentication

#### **Logo.jsx**
- **Purpose:** Application logo component
- **Features:**
  - Consistent branding
  - Clickable navigation to home
  - Responsive sizing
- **Used by:** Navbar, authentication pages

#### **Navbar.jsx**
- **Purpose:** Top navigation bar
- **Features:**
  - Route navigation
  - User authentication status
  - Role-based menu items
  - Logout functionality
- **Routes:**
  - Home
  - Event Prediction
  - NGO Matching
  - CSR Dashboard
  - Emergency Mode
  - Donation History (Donor role)
  - NGO Dashboard (NGO role)

#### **PageShell.jsx**
- **Purpose:** Layout wrapper for pages
- **Features:**
  - Consistent page structure
  - Padding and spacing
  - Responsive container
- **Used by:** All page components

#### **Toast.jsx**
- **Purpose:** Notification/alert component
- **Features:**
  - Success, error, info, warning types
  - Auto-dismiss functionality
  - Customizable duration
  - Smooth animations
- **Used by:** Forms, API calls, user actions

---

## 📄 Page Components

### `/src/pages` - Route-Level Components

Each file represents a distinct route/page in the application.

#### **Home.jsx**
- **Route:** `/`
- **Purpose:** Landing page and dashboard
- **Features:**
  - Platform overview
  - Quick action buttons
  - Statistics display
  - Role-based content
- **Access:** Public

#### **EventPrediction.jsx**
- **Route:** `/event-prediction`
- **Purpose:** Predict events that may generate food surplus
- **Features:**
  - Event type selection (Wedding, Conference, Festival, etc.)
  - Date and location input
  - Predicted surplus calculation
  - NGO recommendation
  - Historical data visualization
- **Access:** Authenticated users
- **Key Functions:**
  - `predictSurplus()` - Calculate expected food waste
  - `recommendNGOs()` - Match with suitable NGOs

#### **NGOMatching.jsx**
- **Route:** `/ngo-matching`
- **Purpose:** Match donors with appropriate NGOs
- **Features:**
  - Food details form (type, quantity, expiry)
  - Location-based matching
  - NGO capacity checking
  - Match score calculation
  - Contact NGO functionality
- **Access:** Donor role
- **Algorithm:** Distance + capacity + food type compatibility

#### **CSRDashboard.jsx**
- **Route:** `/csr-dashboard`
- **Purpose:** Corporate Social Responsibility metrics
- **Features:**
  - Total food saved statistics
  - Meals served count
  - CO2 emissions reduced
  - Active donors and NGOs
  - Monthly trends chart (Recharts)
  - Impact breakdown by food type
- **Access:** Admin role
- **Data Visualization:** Line charts, bar charts, pie charts

#### **EmergencyMode.jsx**
- **Route:** `/emergency`
- **Purpose:** Urgent food surplus alerts
- **Features:**
  - Quick surplus reporting
  - Immediate NGO notification
  - Priority matching
  - Real-time status updates
  - One-click alert system
- **Access:** Donor role
- **Use Case:** Unexpected surplus, expiring food

#### **DonationHistory.jsx**
- **Route:** `/donation-history`
- **Purpose:** Track past donations
- **Features:**
  - Donation list with details
  - Filter by date, status, NGO
  - Impact metrics (meals, CO2 saved)
  - Export functionality
  - Donation receipts
- **Access:** Donor role
- **Data Source:** Firebase Firestore

#### **NGODashboard.jsx**
- **Route:** `/ngo-dashboard`
- **Purpose:** NGO management interface
- **Features:**
  - Pending pickup alerts
  - Accepted donations
  - Beneficiary statistics
  - Pickup schedule
  - Impact reports
- **Access:** NGO role
- **Actions:** Accept/reject donations, update status

#### **SurplusAlerts.jsx**
- **Route:** `/surplus-alerts`
- **Purpose:** Real-time surplus notifications
- **Features:**
  - Live alert feed
  - Filter by location and food type
  - Quick response actions
  - Alert history
  - Notification preferences
- **Access:** NGO role
- **Real-time:** Firebase listeners

---

## 🔧 Context & State Management

### `/src/context/AuthContext.jsx`

- **Purpose:** Global authentication state management
- **Provides:**
  - `currentUser` - Authenticated user object
  - `userRole` - User role (Donor, NGO, Admin)
  - `login()` - Login function
  - `signup()` - Registration function
  - `logout()` - Logout function
  - `loading` - Authentication loading state
- **Used by:** All components requiring auth state
- **Storage:** Firebase Auth + localStorage for role persistence

---

## 📊 Data Files

### `/src/data/ngos.json`

Mock NGO database for development and testing.

**Structure:**
```json
{
  "id": "ngo-001",
  "name": "Food Bank India",
  "location": "Mumbai",
  "capacity": 500,
  "foodTypes": ["cooked", "packaged", "raw"],
  "contact": "contact@foodbank.org",
  "rating": 4.8
}
```

### `/src/data/surplus.json`

Mock surplus food data for testing matching algorithms.

**Structure:**
```json
{
  "id": "surplus-001",
  "donor": "Hotel Taj",
  "foodType": "cooked",
  "quantity": 50,
  "location": "Mumbai",
  "expiry": "2024-11-10T18:00:00",
  "status": "pending"
}
```

---

## ⚙️ Configuration Files

### **package.json**
- Dependencies and devDependencies
- NPM scripts (dev, build, preview)
- Project metadata

### **vite.config.js**
- Vite build configuration
- React plugin setup
- Development server settings

### **tailwind.config.js**
- Tailwind CSS customization
- Color palette (green theme)
- Custom utilities
- Responsive breakpoints

### **postcss.config.js**
- PostCSS plugins
- Tailwind CSS processing
- Autoprefixer setup

### **firebase.json**
- Firebase Hosting configuration
- Rewrites for SPA routing
- Public directory settings

### **.firebaserc**
- Firebase project ID
- Deployment targets

### **.env** (Not in version control)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🎨 Styling Architecture

### **Global Styles** (`src/index.css`)
- Tailwind CSS imports
- Custom CSS variables
- Global resets
- Typography settings

### **Tailwind Utility Classes**
- Used throughout components
- Responsive design
- Green color scheme (#10b981, #059669)
- Consistent spacing and shadows

---

## 🔥 Firebase Integration

### **Authentication**
- Email/Password provider
- Role-based access control
- Session persistence

### **Firestore Database**
Collections:
- `users` - User profiles and roles
- `donations` - Donation records
- `ngos` - NGO information
- `surplusAlerts` - Real-time alerts
- `events` - Event predictions

### **Hosting**
- Deployed to Firebase Hosting
- Custom domain support
- SSL certificate

---

## 🚀 Build & Deployment

### **Development Build**
```bash
npm run dev
```
- Vite dev server on port 5173
- Hot module replacement
- Source maps enabled

### **Production Build**
```bash
npm run build
```
- Output to `/dist` folder
- Minified and optimized
- Code splitting
- Asset hashing

### **Preview Production**
```bash
npm run preview
```
- Test production build locally
- Verify before deployment

### **Deploy to Firebase**
```bash
firebase deploy
```
- Uploads `/dist` to Firebase Hosting
- Automatic SSL
- CDN distribution

---

## 🧪 Testing Structure

### **Test Reports**
- `TESTING_REPORT.md` - Comprehensive test documentation
- `BUG_ANALYSIS_REPORT.md` - Known issues and fixes
- `FINAL_TEST_SUMMARY.md` - Test results summary

### **Test Coverage**
- Unit tests for components
- Integration tests for pages
- E2E tests for critical flows
- Firebase emulator testing

---

## 📝 Code Conventions

### **File Naming**
- Components: PascalCase (e.g., `AuthModal.jsx`)
- Utilities: camelCase (e.g., `firebase.js`)
- Styles: kebab-case (e.g., `index.css`)

### **Component Structure**
```jsx
// 1. Imports
import React, { useState } from 'react';

// 2. Component definition
export default function ComponentName() {
  // 3. State and hooks
  const [state, setState] = useState();
  
  // 4. Event handlers
  const handleClick = () => {};
  
  // 5. Render
  return (
    <div>...</div>
  );
}
```

### **Styling Approach**
- Tailwind utility classes preferred
- Inline styles for dynamic values
- CSS modules for complex components

---

## 🔐 Security Considerations

### **Environment Variables**
- Never commit `.env` to git
- Use `VITE_` prefix for client-side vars
- Rotate API keys regularly

### **Authentication**
- Firebase Auth handles security
- Role verification on backend
- Protected routes in React Router

### **Data Validation**
- Input sanitization
- Form validation
- Firebase Security Rules

---

## 🤝 Contributing Guidelines

### **Adding New Pages**
1. Create component in `/src/pages/`
2. Add route in `App.jsx`
3. Update Navbar if needed
4. Add to this documentation

### **Adding New Components**
1. Create in `/src/components/`
2. Follow naming conventions
3. Add PropTypes if applicable
4. Document usage

### **Modifying Data Structure**
1. Update JSON files in `/src/data/`
2. Update Firestore schema
3. Update TypeScript interfaces (if using)
4. Test thoroughly

---

## 📞 Support & Resources

### **Key Files for Onboarding**
1. `README.md` - Start here
2. `PROJECT_STRUCTURE.md` - This file
3. `TESTING_REPORT.md` - Testing guide
4. `package.json` - Dependencies

### **Common Tasks**
- **Add a new page:** See "Adding New Pages" above
- **Modify styling:** Edit Tailwind config or component classes
- **Update Firebase:** Modify `src/firebase.js`
- **Change routes:** Edit `src/App.jsx`

---

## 🗺️ Feature Roadmap

### **Completed**
- ✅ Authentication system
- ✅ Event prediction
- ✅ NGO matching
- ✅ CSR Dashboard
- ✅ Emergency mode
- ✅ Firebase integration

### **Planned**
- 🔲 Mobile app (React Native)
- 🔲 SMS notifications
- 🔲 Advanced analytics
- 🔲 Multi-language support
- 🔲 Payment integration for donations

---

**Last Updated:** November 2025  
**Maintained by:** ZeroBite Development Team

For questions or clarifications, refer to the main README.md or contact the project lead.
