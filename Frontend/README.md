# ShetNiyojan Frontend

<div align="center">
  <img src="src/assets/logo.png" alt="ShetNiyojan Logo" width="120">
  <h3>Modern Agricultural Management Platform</h3>
</div>

## Overview

This is the frontend application for ShetNiyojan, built with React, TypeScript, and Vite. It provides a responsive and intuitive user interface for farmers to manage their agricultural operations across all phases of farming.

## Features

- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Interactive Dashboard**: Centralized view of farm metrics and activities
- **Agricultural Tools**:
  - Crop Prediction using AI
  - Crop Health Monitoring with disease detection
  - Supply Chain Optimization
  - Lease Marketplace
  - Yield Management
- **Authentication**: Secure mobile number-based authentication
- **Multilingual Support**: Multiple language options

## Tech Stack

- **React 18**: UI library
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tooling and development server
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Component library built on Radix UI
- **React Router**: Client-side routing
- **Axios**: API communication
- **React Hook Form**: Form handling and validation
- **Lucide React**: Modern icon set

## Project Structure

```
src/
├── assets/           # Static assets, images, etc.
├── components/       # Reusable UI components
│   ├── common/       # Common components (headers, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   ├── ui/           # UI component library
│   └── yield/        # Yield management components
├── hooks/            # Custom React hooks
├── layouts/          # Page layouts
├── lib/              # Utilities, API calls, context
├── pages/            # Main page components
└── App.tsx           # Main application component
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running (see main project README)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ShetNiyojan.git
   ```

2. Navigate to the Frontend directory:
   ```bash
   cd ShetNiyojan/Frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

### Running the Application

#### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

#### Production Build

```bash
npm run build
# or
yarn build
```

#### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## Available Scripts

- `dev`: Start the development server
- `build`: Build for production
- `preview`: Preview the production build
- `lint`: Run ESLint
- `test`: Run tests (when implemented)

## Key Components

### Pages
- **Dashboard**: Main user interface with farm metrics and feature access
- **YieldDetails**: Detailed view of individual yields with activity tracking
- **CropPrediction**: AI-based crop recommendation system
- **CropHealthMonitoring**: Disease detection and treatment recommendations
- **SupplyChain**: Transport and logistics optimization
- **LeaseMarketPlace**: Equipment rental marketplace

### Reusable Components
- **DashboardHeader**: Navigation and search header
- **DashboardSidebar**: Feature navigation sidebar
- **YieldModal**: Yield creation and editing
- **ActivityLog**: Tracking recent activities
- **LanguageSelector**: Language switching component

## Environment Variables

The application expects the following environment variables:

```
VITE_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the main project README for more details.
