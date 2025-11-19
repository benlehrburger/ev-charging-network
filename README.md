# Claude Charge - EV Charging Station Finder

A modern React-based mobile application for finding and managing electric vehicle charging stations. Built with TypeScript, Vite, and Leaflet with OpenStreetMap for interactive mapping.

## Features

### 🗺️ Interactive Map
- **Leaflet + OpenStreetMap**: Real-time interactive map with smooth navigation (no API key required)
- **Station Markers**: Color-coded markers showing station availability
  - 🟢 Green: Available stations
  - 🟠 Orange: Busy stations
  - 🔴 Red: Offline stations
- **User Location**: Automatic geolocation with blue marker
- **Station Popups**: Click markers for detailed station information

### 📱 Mobile-First Design
- **Responsive UI**: Optimized for mobile devices
- **Bottom Navigation**: Easy access to Find, Scan, and Profile views
- **Touch-Friendly**: Large buttons and intuitive gestures

### 🔍 Station Discovery
- **Search Functionality**: Find stations by name or address
- **Station Details**: View availability, pricing, and amenities
- **Directions**: Get directions to selected stations
- **Real-time Status**: Live updates on port availability

### 📷 QR Code Scanning
- **Camera Integration**: Scan QR codes to start charging sessions
- **Session Management**: Track active charging sessions

### 👤 User Profile
- **Personal Dashboard**: View charging history and statistics
- **Usage Analytics**: Track energy consumption and costs
- **Carbon Impact**: Monitor environmental savings

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Mapping**: Leaflet + OpenStreetMap
- **Icons**: Lucide React
- **Camera**: React Webcam
- **QR Scanning**: jsQR

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EV
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Allow location access for the best experience

## Project Structure

```
src/
├── components/
│   ├── MapView.tsx          # Interactive Leaflet map component
│   ├── StationDetails.tsx   # Station information and booking
│   ├── QRScanner.tsx        # QR code scanning functionality
│   └── UserProfile.tsx      # User dashboard and statistics
├── App.tsx                  # Main application component
├── App.css                  # Global styles and component styling
└── main.tsx                 # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
