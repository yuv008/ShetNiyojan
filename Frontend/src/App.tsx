import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './lib/auth-context';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import YieldDetails from './pages/YieldDetails';
import CropPrediction from "./components/CropPrediction";
import CropHealthMonitoring from "./components/CropHealthMonitoring";
import CurrentYields from './components/dashboard/CurrentYields';
import ChatBot from './components/ChatBot';
import Marketplace from './components/Marketplace';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/yield/*" element={
            <ProtectedRoute>
              <YieldDetails />
            </ProtectedRoute>
          } />
          <Route path="/crop-prediction" element={<CropPrediction />} />
          <Route path="/crop-health" element={<CropHealthMonitoring />} />
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
        <ChatBot />
      </AuthProvider>
    </Router>
  );
}

export default App;
