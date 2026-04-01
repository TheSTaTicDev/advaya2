import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FarmerPage from './pages/FarmerPage';
import LogisticsPage from './pages/LogisticsPage';
import VerifyPage from './pages/VerifyPage';
import MarketplacePage from './pages/MarketplacePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <Navbar />
        {/* pt-16 clears the fixed navbar; each page owns its own layout */}
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<FarmerPage />} />
            <Route path="/farmer" element={<FarmerPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/logistics" element={<LogisticsPage />} />
            <Route path="/verify/:batchId" element={<VerifyPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

