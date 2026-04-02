import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import FarmerPage from './pages/FarmerPage';
import LogisticsPage from './pages/LogisticsPage';
import VerifyPage from './pages/VerifyPage';
import MarketplacePage from './pages/MarketplacePage';
import { useRole } from './context/RoleContext';

import Footer from './components/Footer';

function ProtectedRoute({ children, allowedRole }) {
  const { role } = useRole();
  if (!role) {
    return <Navigate to="/" replace />;
  }
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'farmer' ? '/farmer' : '/marketplace'} replace />;
  }
  return children;
}

function App() {
  const { role } = useRole();
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col" style={{ color: 'var(--color-text)' }}>
        {role && <Navbar />}
        <main className={role ? "pt-24 flex-1 relative z-10" : "flex-1 relative z-10"}>
          <Routes>
            <Route path="/" element={
              role === 'farmer' ? <Navigate to="/farmer" replace /> :
              role === 'retailer' ? <Navigate to="/marketplace" replace /> :
              <LandingPage />
            } />
            
            <Route path="/farmer" element={
              <ProtectedRoute allowedRole="farmer"><FarmerPage /></ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute allowedRole="retailer"><MarketplacePage /></ProtectedRoute>
            } />
            <Route path="/logistics" element={
              <ProtectedRoute><LogisticsPage /></ProtectedRoute>
            } />
            <Route path="/verify/:batchId" element={<VerifyPage />} />
          </Routes>
        </main>
        {role && <Footer />}
      </div>
    </Router>
  );
}

export default App;

