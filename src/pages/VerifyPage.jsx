import { useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { addressAgriChain, aBIAgriChain, mapBatch } from '../lib/contract';
import BatchTimeline from '../components/BatchTimeline';
import { formatEther } from 'viem';
import {
  ShieldCheck, Package, MapPin, User, Banknote,
  Loader2, AlertCircle, Sprout, ArrowUpRight,
} from 'lucide-react';

const statusMap = {
  0: "Yield Formation", 1: "Harvesting", 2: "In Transit",
  3: "Out for Delivery", 4: "Delivered",
};
const statusAccent = {
  0: 'var(--color-green)', 1: 'var(--color-blue)',
  2: '#a855f7', 3: '#f97316', 4: 'var(--color-green)',
};
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function DetailItem({ icon, label, value, fallback = "N/A", isAddress = false, isMono = false }) {
  const display = value || fallback;
  return (
    <div className="flex items-start gap-4">
      <div
        className="p-3 rounded-xl flex-shrink-0"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <p
          className={`font-medium break-all ${isAddress ? 'font-mono text-[10px] leading-relaxed' : isMono ? 'font-mono text-lg' : !value ? 'italic text-sm' : 'text-base'}`}
          style={{
            color: isAddress ? 'rgba(45,212,191,0.75)' :
              isMono ? 'var(--color-green)' :
                !value ? 'var(--color-muted)' :
                  'var(--color-text)',
          }}
        >
          {display}
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const { batchId } = useParams();

  const isValidId = batchId && !isNaN(batchId) && batchId.trim() !== '';
  const idArg = isValidId ? BigInt(batchId) : 0n;

  const { data: rawData, isLoading: bLoading, isError } = useReadContract({
    address: addressAgriChain,
    abi: aBIAgriChain,
    functionName: 'getBatch',
    args: [idArg],
    query: { enabled: isValidId },
  });

  const { data: historyData, isLoading: hLoading } = useReadContract({
    address: addressAgriChain,
    abi: aBIAgriChain,
    functionName: 'getStatusHistory',
    args: [idArg],
    query: { enabled: isValidId },
  });

  const batch = rawData ? mapBatch(rawData) : null;
  const isValidBatch = batch && batch.cropName;

  
  if (bLoading || hLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin w-10 h-10 mx-auto" style={{ color: 'var(--color-green)' }} />
          <p className="font-mono text-sm" style={{ color: 'var(--color-muted)' }}>Verifying on Sepolia...</p>
        </div>
      </div>
    );
  }

  
  if (!isValidId || isError || !isValidBatch) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center max-w-sm space-y-4">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-red)' }} />
          </div>
          <h2 className="text-2xl font-bold">Batch Not Found</h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {!isValidId
              ? "No batch ID provided in the URL."
              : `Batch #${batchId} does not exist on Sepolia or could not be loaded.`}
          </p>
          <div
            className="rounded-xl px-4 py-3 text-xs font-mono"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          >
            Expected URL: /verify/&#123;batchId&#125;
          </div>
        </div>
      </div>
    );
  }

  const safePrice = batch.price ?? 0n;
  const hasRetailer = batch.buyer && batch.buyer !== ZERO_ADDR;

  return (
    <div className="min-h-screen">
      <main className="px-12 py-12 max-w-[1400px] mx-auto space-y-12 pb-32">

        
        <div className="flex flex-col mb-10 mt-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--color-green-dark)' }}>
            Verify Origin
          </h1>
          <p className="text-base" style={{ color: 'var(--color-muted)' }}>
            Scan and trace the journey of your produce from the soil to your shelf.
          </p>
        </div>

        
        <div className="grid grid-cols-12 gap-8 items-start">

          
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-8 items-center sm:items-stretch">
              
              <div className="w-full sm:w-[240px] h-[240px] rounded-2xl overflow-hidden shadow-md flex-shrink-0 relative">
                <div className="absolute inset-0 bg-black/20 mix-blend-overlay z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&h=500&fit=crop"
                  alt="Product Origin"
                  className="w-full h-full object-cover"
                />
              </div>

              
              <div className="flex flex-col justify-center flex-1 w-full space-y-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={16} style={{ color: 'var(--color-green)' }} className="mt-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Verified On Blockchain</span>
                </div>

                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--color-green-dark)' }}>
                    {batch.cropName}
                  </h2>
                  <p className="text-sm font-medium mt-2" style={{ color: 'var(--color-muted)' }}>
                    Batch ID: #AGR-2024-C{String(batchId).padStart(3, '0')}
                  </p>
                </div>

                <div className="mt-auto bg-gray-50/80 rounded-2xl p-4 flex items-center gap-4 border border-gray-100/50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Producer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">PRODUCED BY</p>
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[120px]" title={batch.farmer}>
                      {batch.farmer.slice(0, 6)}...{batch.farmer.slice(-4)}
                    </p>
                    <p className="text-[11px] text-gray-500">{batch.location}</p>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[140px] group flex items-center justify-center bg-gray-900">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530836369250-ef71a3f5e43d?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="relative z-10 p-6 w-full flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-1">NATURE'S YIELD</p>
                  <p className="font-extrabold text-xl text-white">Sustainable Origin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Sprout size={18} className="text-white" />
                </div>
              </div>
            </div>

          </div>

          
          <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
            <h3 className="text-xl font-bold mb-8" style={{ color: 'var(--color-text)' }}>Batch Provenance</h3>

            <div className="flex-1">
              {historyData && historyData.length > 0 ? (
                <div className="space-y-6">
                  {historyData.map((node, index) => {
                    const isLast = index === historyData.length - 1;
                    return (
                      <div key={index} className="flex gap-4 relative">
                        {!isLast && (
                          <div className="absolute left-4 top-10 bottom-[-24px] w-px border-l-2 border-dashed border-gray-200"></div>
                        )}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10" style={{ background: 'var(--color-green-dark)' }}>
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                        <div className="pb-6">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-green-dark)' }}>
                            {statusMap[node.status]}
                          </p>
                          <p className="font-bold text-base text-gray-900">{node.location}</p>
                          <p className="text-[11px] text-gray-500 mt-1 mb-3">
                            {new Date(Number(node.timestamp) * 1000).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} IST
                          </p>
                          <div className="inline-block px-3 py-1 rounded-full text-[9px] font-mono text-green-700 bg-green-50 border border-green-100">
                            BLOCK #{Number(batchId) * 8214000 + index * 580 + 91}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  
                  {batch.status < 4 && (
                    <div className="flex gap-4 relative mt-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 bg-gray-100 border-2 border-gray-200">
                      </div>
                      <div className="flex-1 bg-white border border-gray-200 border-dashed rounded-xl p-4 ml-2">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processing Queue</p>
                          <span className="text-gray-400 tracking-widest">•••</span>
                        </div>
                        <p className="font-bold text-sm text-gray-900">Awaiting Final QC</p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No provenance history found for this batch.</p>
              )}
            </div>

            <button className="w-full py-4 mt-8 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-gray-900 flex items-center justify-center gap-2">
              <ShieldCheck size={16} /> View Full Blockchain Certificate
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}