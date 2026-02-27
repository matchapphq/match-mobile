# Match Mobile App

A React Native Expo app for finding the best sports bars and venues to watch matches in real-time.

## 🚀 Features

- **Onboarding Flow**: Personalize your experience by selecting preferred sports, ambiance, food types, and budget
- **Interactive Map**: Find venues near you with real-time location tracking
- **Advanced Filtering**: Filter venues by sports, price, ambiance, and food options
- **Match Listings**: Browse upcoming matches and see which venues are showing them
- **Venue Details**: View detailed information about each venue including photos, ratings, and amenities
- **Reservations**: Book tables at your favorite venues directly from the app
- **User Profile**: Manage your preferences, reservations, and notifications
- **Search**: Quick search for venues and matches with history and trending suggestions
- **Account Privacy**: Request a GDPR data export and manage account deactivation from the profile
- **Session Security**: Automatic session heartbeat and logout handling aligned with backend session revocation

## 📱 Screens Implemented

1. **Splash Screen** - App launch screen with animation
2. **Welcome Screen** - Initial welcome message
3. **Onboarding Screen** - Multi-step preference selection
4. **Map Screen** - Main map view with venue markers and filters
5. **Matches Screen** - List of upcoming matches
6. **Profile Screen** - User profile and settings
7. **Venue Details Screen** - Detailed venue information
8. **Match Details Screen** - Match information and venues showing it
9. **Reservations Screen** - Manage your reservations
10. **Notifications Screen** - Configure notification preferences
11. **Search Screen** - Search for venues and matches
12. **Data Privacy Screen** - GDPR export request and account deactivation entry point
13. **Delete Account Flow** - Warning, reason, confirmation, and success screens

## 🛠️ Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Zustand** for state management
- **React Native Maps** for map functionality
- **Expo Location** for geolocation
- **AsyncStorage** for local data persistence

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd /Users/rafaelsapaloesteves/Developer/Match-Project/match/match-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed)**
   ```bash
   npm install -g expo-cli
   ```

## 🏃‍♂️ Running the App

### Development Mode

```bash
# Start the Expo development server
npm start

# Or run directly on specific platform
npm run ios      # For iOS
npm run android  # For Android
npm run web      # For Web
```

### Using Expo Go

1. Install the Expo Go app on your iOS or Android device
2. Run `npm start` in your terminal
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## 🗂️ Project Structure

```
match-mobile/
├── src/
│   ├── screens/          # All app screens
│   ├── navigation/        # Navigation configuration
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # Theme and constants
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
├── assets/               # Images and static assets
├── app-designs/          # Design mockups
├── App.tsx              # Main app component
├── package.json         # Dependencies
└── README.md           # This file
```

## 🎨 Design System

The app follows a consistent design system with:
- **Primary Color**: Purple (#7B2FFE)
- **Secondary Color**: Neon Green (#A3FF00)
- **Background**: Black (#000000)
- **Text**: White (#FFFFFF)

## 📱 App Flow

1. **First Launch**:
   - Splash Screen → Welcome → Onboarding (Sports → Ambiance → Food → Budget)
   
2. **Main Navigation**:
   - Map (Explorer) → Search → Matches → Profile
   
3. **User Journey**:
   - Browse venues on map → Apply filters → View venue details → Make reservation
   - Or: Browse matches → Find venues showing match → Reserve table

## 🔧 Configuration

### API Configuration
The app is configured to use mock data by default. To connect to a real API:

1. Update `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'YOUR_API_URL';
   ```

2. Set environment variable:
   ```bash
   EXPO_PUBLIC_API_URL=your-api-url
   ```

### Account Deactivation Grace Period

The mobile app does not configure the deactivation/reactivation delay locally.
It reads `account_deletion_grace_days` from `GET /users/me/privacy-preferences`,
which is controlled by the backend env variable `ACCOUNT_DELETION_GRACE_DAYS`.

### Google Maps (for iOS)
Add your Google Maps API key in `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

## 🧪 Testing

Run the app in development mode and test the following flows:

1. **Onboarding Flow**: Complete all preference selections
2. **Map Navigation**: Browse venues and apply filters
3. **Venue Details**: Tap on venue markers to view details
4. **Match Browsing**: Navigate to matches and view details
5. **Profile Management**: Access profile and settings
6. **Data Export Request**: Open Données personnelles and submit a GDPR export request
7. **Account Deactivation**: Verify grace-period copy matches backend configuration

## 📝 Notes

- The app currently uses mock data for venues and matches
- Location permissions are required for the map feature
- The app stores user preferences locally using AsyncStorage
- All designs from the app-designs folder have been implemented

## 🚀 Next Steps

1. Connect to the match-api backend
2. Implement real authentication
3. Add push notifications
4. Implement social features
5. Add payment integration for reservations

## 📄 License

This project is proprietary and confidential.

## 🤝 Support

For any questions or issues, please contact the development team.
