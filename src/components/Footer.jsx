export default function Footer() {
  return (
    <footer className="w-full mt-auto" style={{ background: 'var(--color-green-light)', borderTop: '1px solid rgba(6, 78, 59, 0.1)' }}>
      <div className="max-w-[1400px] mx-auto px-12 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold" style={{ color: 'var(--color-green-dark)' }}>AgriProof</span>
          <span className="font-bold tracking-tight" style={{ color: 'var(--color-green-dark)' }}>Directive</span>
        </div>

        <div className="flex flex-wrap gap-12 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-green-dark)', opacity: 0.6 }}>
          <a href="#" className="hover:opacity-100 transition-opacity">Provenance Protocol</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Sustainability Report</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Node Status</a>
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--color-green-dark)', opacity: 0.4 }}>
          &copy; 2026 AgriProof secured via Blockchain.
        </div>
      </div>
    </footer>
  );
}
