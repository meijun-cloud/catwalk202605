'use client';

import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import CameraScreen from '../screens/CameraScreen';
import CatSelectScreen from '../screens/CatSelectScreen';
import EnvironmentScreen from '../screens/EnvironmentScreen';
import ConfirmReportScreen from '../screens/ConfirmReportScreen';
import ResultScreen from '../screens/ResultScreen';
import DexScreen from '../screens/DexScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BottomNav from '../components/BottomNav';

const ScreenRenderer: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login': return <LoginScreen />;
      case 'Map': return <MapScreen />;
      case 'Camera': return <CameraScreen />;
      case 'CatSelect': return <CatSelectScreen />;
      case 'Environment': return <EnvironmentScreen />;
      case 'ConfirmReport': return <ConfirmReportScreen />;
      case 'Result': return <ResultScreen />;
      case 'Dex': return <DexScreen />;
      case 'Profile': return <ProfileScreen />;
      default: return <MapScreen />;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-full bg-white shadow-2xl overflow-hidden flex flex-col">
      <div className="relative flex-1 w-full overflow-hidden">
        {renderScreen()}
      </div>
      <BottomNav />
    </div>
  );
};

export default function CatwalkApp() {
  return (
    <AppProvider>
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center overflow-hidden">
        <ScreenRenderer />
      </div>
    </AppProvider>
  );
}
