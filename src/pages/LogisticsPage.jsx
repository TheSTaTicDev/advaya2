import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { addressAgriChain, aBIAgriChain, mapBatch } from '../lib/contract';
import QRScanner from '../components/QRScanner';
import BatchTimeline from '../components/BatchTimeline';
import { useRole } from '../context/RoleContext';
import {
  Truck, CheckCircle2, User, Loader2, AlertCircle,
  ShieldCheck, History, Lock, ArrowRight, MapPin,
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

export default function LogisticsPage() {
  const { role } = useRole();
  const { address } = useAccount();
  const [batchId, setBatchId] = useState('');
  const [newStatus, setNewStatus] = useState(1);
  const [location, setLocation] = useState('');

  const validId = batchId && !isNaN(batchId) && batchId !== '';

  const { data: rawData, isLoading: isReading } = useReadContract({
    address: addressAgriChain,
    abi: aBIAgriChain,
    functionName: 'getBatch',
    args: [validId ? BigInt(batchId) : 0n],
    query: { enabled: validId },
  });

  const { data: historyData } = useReadContract({
    address: addressAgriChain,
    abi: aBIAgriChain,
    functionName: 'getStatusHistory',
    args: [validId ? BigInt(batchId) : 0n],
    query: { enabled: validId },
  });

  const batch = rawData ? mapBatch(rawData) : null;
  const isValidBatch = batch && batch.cropName;

  const { writeContract: updateStatus, data: updateHash, isPending: isUpdating } = useWriteContract();
  const { writeContract: completeDeal, data: completeHash, isPending: isCompleting } = useWriteContract();
  const { isLoading: isUpdatingConfirm, isSuccess: updateSuccess } = useWaitForTransactionReceipt({ hash: updateHash });
  const { isLoading: isCompletingConfirm, isSuccess: completeSuccess } = useWaitForTransactionReceipt({ hash: completeHash });

  const isFarmer = !!(batch?.farmer && address && batch.farmer.toLowerCase() === address.toLowerCase());
  const isBuyer = !!(batch?.buyer && address && batch.buyer.toLowerCase() === address.toLowerCase());
  const isPurchased = !!(batch?.buyer && batch.buyer !== ZERO_ADDR);
  const safePrice = batch?.price ?? 0n;

  return (
    <div className="min-h-screen">
      <main className="px-12 py-12 max-w-[1400px] mx-auto space-y-12 pb-32">

        {/* HERO */}
        <div className="flex flex-col mb-10 mt-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-white dark:text-white" style={{ color: 'var(--color-green-dark)' }}>
            Crop Management
          </h1>
          <p className="text-base" style={{ color: 'var(--color-muted)' }}>
            Track and update crop lifecycle stages with blockchain-verified precision.
          </p>
        </div>

        {/* LOGISTICS DASHBOARD GRID */}
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR (Load Batch & Active) */}
          <div className="col-span-12 lg:col-span-4 bg-gray-950 text-white rounded-3xl p-8 space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495539406979-bf61750d38ad?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div>

            <div className="relative z-10 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest pl-1 text-gray-400">
                SCAN OR ENTER BATCH ID
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                  type="number"
                  value={batchId}
                  onChange={e => setBatchId(e.target.value)}
                  placeholder="Batch ID (e.g. 1)"
                  className="input-field pl-12 shadow-sm h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:bg-white/20"
                  style={{ color: 'white' }}
                />
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-lg text-white">Active Batches</h3>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  {validId ? "1 Found" : "0 Found"}
                </span>
              </div>

              {!validId ? (
                <div className="text-sm p-4 text-center rounded-xl border border-white/10 bg-white/5 text-gray-400">
                  Enter a Batch ID above to load details.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/10 p-4 rounded-2xl shadow-sm border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-md">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-green-400">
                      <Truck size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white">#AGRI-{batchId}</span>
                        <span className="text-[9px] font-black tracking-widest uppercase text-green-400">LOADED</span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1">{batch?.cropName || "Loading..."} • {batch?.quantity || "--"}kg</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

            {/* Main Batch Card Area */}
            {isValidBatch ? (
              <div className="card p-0 overflow-hidden border-none shadow-lg">
                {/* Hero Banner */}
                <div className="relative h-48 bg-gray-900 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-70"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">CURRENT FOCUS</p>
                    <div className="flex justify-between items-end">
                      <h2 className="text-3xl font-bold tracking-tight">Batch #{batchId} — {batch.cropName}</h2>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold font-mono border border-white/20">
                        {statusMap[batch.status]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Layout */}
                <div className="p-8 grid grid-cols-2 gap-8">
                  {/* Left Column: Update Status */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Update Status</h3>

                    {role === 'farmer' ? (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Status Dropdown</label>
                          <select
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value)}
                            className="input-field bg-gray-50 shadow-sm dark:bg-slate-800 dark:text-white dark:border-slate-700"
                          >
                            <option value={1}>Harvesting</option>
                            <option value={2}>In Transit</option>
                            <option value={3}>Out for Delivery</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Current Location/Notes</label>
                          <input
                            type="text"
                            placeholder="e.g. Greenhouse A - Temp 22°C"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="input-field bg-gray-50 shadow-sm dark:bg-slate-800 dark:text-white dark:border-slate-700"
                          />
                        </div>
                        <button
                          onClick={() => updateStatus({
                            address: addressAgriChain,
                            abi: aBIAgriChain,
                            functionName: 'updateStatus',
                            args: [BigInt(batchId), Number(newStatus), location],
                          })}
                          disabled={!isFarmer || isUpdating || isUpdatingConfirm || !location}
                          className="btn-primary w-full py-4 text-base mt-2"
                        >
                          {isUpdating || isUpdatingConfirm ? "Updating..." : "Update Status"}
                        </button>
                      </div>
                    ) : role === 'retailer' && isPurchased ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500">Retailer controls unlocked for this batch.</p>
                        <button
                          onClick={() => completeDeal({
                            address: addressAgriChain,
                            abi: aBIAgriChain,
                            functionName: 'completeDelivery',
                            args: [BigInt(batchId)],
                          })}
                          disabled={!isBuyer || isCompleting || isCompletingConfirm}
                          className="btn-primary w-full py-4 text-base mt-2"
                        >
                          {isCompleting ? "Releasing..." : "Release Escrow Funds"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
                        Appropriate roles required to update this batch's status.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Artifacts */}
                  <div className="bg-[var(--color-surface-2)] p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--color-text)' }}>Batch Artifacts</h3>
                    <div className="space-y-5">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5"><ShieldCheck size={14} /></div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">Origin Verified</p>
                          <p className="text-[11px] text-gray-500">{batch.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5"><div className="w-2.5 h-2.5 bg-green-700 rounded-sm"></div></div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">Chain of Custody</p>
                          <p className="text-[11px] text-gray-500">Nodes validated latest movement</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">METADATA HASH</label>
                        <div className="bg-white p-2 px-3 rounded text-[10px] font-mono text-gray-500 truncate">
                          0x892a...f92b45e812ac_BLOCK{batchId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl py-32 flex flex-col items-center justify-center shadow-sm overflow-hidden border border-gray-100 min-h-[400px]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/60 shadow-sm">
                    <Truck className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-bold text-gray-500 text-lg">No Active Batch Loaded</p>
                  <p className="text-xs text-gray-400 mt-2 max-w-xs text-center">Enter a valid Batch ID on the left to track and authorize supply chain movements.</p>
                </div>
              </div>
            )}

            {/* Bottom Row: Timeline & Network Efficiency */}
            {isValidBatch && (
              <div className="grid grid-cols-2 gap-8 mt-2">
                <div className="card p-8 bg-[var(--color-surface-2)] border-none">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <History size={18} /> Timeline
                  </h3>
                  {historyData ? (
                    <BatchTimeline history={historyData} batch={batch} />
                  ) : (
                    <p className="text-xs text-gray-400">Loading timeline...</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {(updateSuccess || completeSuccess) && (
        <div className="fixed bottom-8 right-8 px-6 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl" style={{ background: 'var(--color-green-dark)', color: 'white' }}>
          <CheckCircle2 size={18} className="text-green-400" />
          {completeSuccess ? 'Funds Released to Farmer!' : 'Transaction Synced!'}
        </div>
      )}
    </div>
  );
}