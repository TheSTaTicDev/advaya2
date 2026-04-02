import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { User, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleSelectRole = (role) => {
    setRole(role);
    if (role === 'farmer') {
      navigate('/farmer');
    } else if (role === 'retailer') {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 relative z-10">
        
        
        <button 
          onClick={() => handleSelectRole('farmer')}
          className="group relative overflow-hidden rounded-3xl p-10 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-green-500/20"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <User className="w-8 h-8" style={{ color: 'var(--color-green)' }} />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Farmer</h2>
            <p className="text-sm leading-relaxed mb-8 opacity-80" style={{ color: 'var(--color-muted)' }}>
              Log crop yields, trace shipments, update milestones in transit, and receive funds securely from escrow.
            </p>
            
            <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-colors group-hover:text-green-400" style={{ color: 'var(--color-green)' }}>
              Enter Dashboard &rarr;
            </div>
          </div>
        </button>

        
        <button 
          onClick={() => handleSelectRole('retailer')}
          className="group relative overflow-hidden rounded-3xl p-10 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-indigo-500/20"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <ShieldCheck className="w-8 h-8" style={{ color: 'var(--color-indigo)' }} />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Retailer</h2>
            <p className="text-sm leading-relaxed mb-8 opacity-80" style={{ color: 'var(--color-muted)' }}>
              Browse the marketplace, purchase verified crop batches, and release escrow funds upon safe delivery.
            </p>
            
            <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-colors group-hover:text-indigo-400" style={{ color: 'var(--color-indigo)' }}>
              Enter Marketplace &rarr;
            </div>
          </div>
        </button>

      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.03) 0%, transparent 70%)' }}></div>
    </div>
  );
}
