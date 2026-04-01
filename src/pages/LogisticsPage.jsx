import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { addressAgriChain, aBIAgriChain, mapBatch } from '../lib/contract';
import QRScanner from '../components/QRScanner';
import BatchTimeline from '../components/BatchTimeline';
import {
  Truck, CheckCircle2, User, Loader2, AlertCircle,
  ShieldCheck, History, Lock, ArrowRight, MapPin,
} from 'lucide-react';

const statusMap = {
  0: "Harvested", 1: "In Transit", 2: "At Warehouse",
  3: "Out for Delivery", 4: "Delivered",
};
const statusAccent = {
  0: 'var(--color-green)', 1: 'var(--color-blue)',
  2: '#a855f7', 3: '#f97316', 4: 'var(--color-green)',
};
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

export default function LogisticsPage() {
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
  const isBuyer  = !!(batch?.buyer  && address && batch.buyer.toLowerCase()  === address.toLowerCase());
  const isPurchased = !!(batch?.buyer && batch.buyer !== ZERO_ADDR);
  const safePrice = batch?.price ?? 0n;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <main className="px-12 py-12 max-w-[1400px] mx-auto space-y-16 pb-32">

        {/* HERO */}
        <div className="flex justify-between items-start gap-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-widest font-bold mb-4" style={{ color: 'var(--color-blue)' }}>
              LOGISTICS CENTER
            </p>
            <h1 className="text-5xl font-bold leading-tight">
              Track a <span className="italic" style={{ color: 'var(--color-blue)' }}>Shipment.</span>
            </h1>
            <p className="mt-4" style={{ color: 'var(--color-muted)' }}>
              Scan or enter a batch ID to view its status, update its journey, or release escrow.
            </p>
          </div>
          <div
            className="px-6 py-4 rounded-xl min-w-[220px]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-blue)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>ACTIVE NODE</p>
            <h2 className="font-bold" style={{ color: 'var(--color-blue)' }}>Sepolia Testnet</h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-12 gap-12 items-start">

          {/* LEFT — Input panel */}
          <div className="col-span-5 card space-y-6">
            <h2 className="text-lg font-bold">Load Batch</h2>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
                Scan QR Code
              </p>
              <QRScanner onScanComplete={(id) => setBatchId(id)} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                or enter manually
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                Batch ID
              </label>
              <input
                type="number"
                value={batchId}
                onChange={e => setBatchId(e.target.value)}
                placeholder="e.g. 1"
                className="input-field text-2xl font-mono"
              />
            </div>

            {/* Role badge */}
            {isValidBatch && address && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
                style={
                  isFarmer ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--color-green)' } :
                  isBuyer  ? { background: 'rgba(99,102,241,0.08)',  border: '1px solid rgba(99,102,241,0.25)',  color: 'var(--color-indigo)' } :
                             { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',    color: 'var(--color-muted)' }
                }
              >
                {isFarmer ? <User size={12} /> : isBuyer ? <ShieldCheck size={12} /> : <Lock size={12} />}
                {isFarmer ? 'You are the Farmer for this batch' :
                 isBuyer  ? 'You are the Retailer for this batch' :
                            'Read-only — you are not a party to this batch'}
              </div>
            )}
          </div>

          {/* RIGHT — Action panel */}
          <div className="col-span-7 space-y-5">
            {/* Empty state */}
            {!isValidBatch && !isReading && (
              <div
                className="min-h-[360px] flex flex-col items-center justify-center rounded-2xl p-10 text-center"
                style={{ border: '2px dashed var(--color-border)' }}
              >
                <History className="w-10 h-10 mb-4" style={{ color: 'var(--color-border)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Scan or enter a batch ID to load controls
                </p>
              </div>
            )}

            {isReading && (
              <div className="min-h-[360px] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 mb-3" style={{ color: 'var(--color-blue)' }} />
                <p className="text-sm font-mono" style={{ color: 'var(--color-muted)' }}>Reading from Sepolia...</p>
              </div>
            )}

            {isValidBatch && (
              <div className="card space-y-0 overflow-hidden" style={{ padding: 0 }}>
                {/* Batch header strip */}
                <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold">{batch.cropName}</h3>
                      <p className="font-mono text-[10px] mt-1 uppercase" style={{ color: 'var(--color-muted)' }}>
                        {addressAgriChain.slice(0, 12)}... · Batch #{batchId}
                      </p>
                    </div>
                    <div
                      className="text-right px-5 py-3 rounded-xl"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
                        Status
                      </p>
                      <p className="font-black text-sm" style={{ color: statusAccent[batch.status] }}>
                        {statusMap[batch.status]}
                      </p>
                    </div>
                  </div>
                  {batch.location && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                      <MapPin size={11} />
                      <span>{batch.location}</span>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-5">
                  {/* FARMER: Update Status */}
                  {batch.status < 4 && (
                    <div
                      className="rounded-2xl p-5 space-y-4"
                      style={
                        isFarmer
                          ? { border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.04)' }
                          : { border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', opacity: 0.5, pointerEvents: 'none' }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-black uppercase"
                          style={{ color: isFarmer ? 'var(--color-green)' : 'var(--color-muted)' }}>
                          <User size={12} /> Farmer Controls
                        </span>
                        {!isFarmer && <Lock size={11} style={{ color: 'var(--color-border)' }} />}
                      </div>

                      <input
                        type="text"
                        placeholder="Checkpoint / Hub Name"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="input-field"
                      />

                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="input-field"
                      >
                        <option value={1}>In Transit</option>
                        <option value={2}>At Warehouse</option>
                        <option value={3}>Out for Delivery</option>
                      </select>

                      <button
                        onClick={() => updateStatus({
                          address: addressAgriChain,
                          abi: aBIAgriChain,
                          functionName: 'updateStatus',
                          args: [BigInt(batchId), Number(newStatus), location],
                        })}
                        disabled={!isFarmer || isUpdating || isUpdatingConfirm || !location}
                        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isUpdating || isUpdatingConfirm
                          ? <><Loader2 className="animate-spin w-4 h-4" /> Updating...</>
                          : <><span>Update Milestone</span><ArrowRight size={14} /></>}
                      </button>

                      {!isFarmer && (
                        <p className="text-[10px] text-center" style={{ color: 'var(--color-muted)' }}>
                          Only the origin farmer can update transit locations
                        </p>
                      )}
                    </div>
                  )}

                  {/* BUYER: Release Escrow */}
                  {isPurchased && batch.status < 4 && (
                    <div
                      className="rounded-2xl p-5 space-y-4"
                      style={
                        isBuyer
                          ? { border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)' }
                          : { border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', opacity: 0.5, pointerEvents: 'none' }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-black uppercase"
                          style={{ color: isBuyer ? 'var(--color-indigo)' : 'var(--color-muted)' }}>
                          <ShieldCheck size={12} /> Retailer — Escrow Release
                        </span>
                        {!isBuyer && <Lock size={11} style={{ color: 'var(--color-border)' }} />}
                      </div>

                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        Confirm physical receipt to release{' '}
                        <span className="font-bold font-mono" style={{ color: 'var(--color-text)' }}>
                          {formatEther(safePrice)} ETH
                        </span>{' '}
                        from escrow to the farmer's wallet.
                      </p>

                      <button
                        onClick={() => completeDeal({
                          address: addressAgriChain,
                          abi: aBIAgriChain,
                          functionName: 'completeDelivery',
                          args: [BigInt(batchId)],
                        })}
                        disabled={!isBuyer || isCompleting || isCompletingConfirm}
                        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        style={isBuyer ? { background: 'var(--color-indigo)', color: '#fff' } : {}}
                      >
                        {isCompleting || isCompletingConfirm
                          ? <><Loader2 className="animate-spin w-4 h-4" /> Releasing Funds...</>
                          : <><ShieldCheck size={14} /><span>Finalize &amp; Pay Farmer</span></>}
                      </button>

                      {!isBuyer && (
                        <p className="text-[10px] text-center" style={{ color: 'var(--color-muted)' }}>
                          Only the purchasing retailer can release escrow
                        </p>
                      )}
                    </div>
                  )}

                  {/* Not yet purchased */}
                  {!isPurchased && batch.status < 4 && (
                    <div
                      className="p-5 rounded-2xl flex items-start gap-3"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        Escrow controls locked — no retailer has purchased this batch yet.
                      </p>
                    </div>
                  )}

                  {/* Delivered */}
                  {batch.status === 4 && (
                    <div
                      className="p-6 rounded-2xl text-center space-y-3"
                      style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.25)' }}
                    >
                      <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: 'var(--color-green)' }} />
                      <div>
                        <h4 className="text-lg font-bold uppercase tracking-tight">Lifecycle Complete</h4>
                        <p className="text-xs font-mono mt-1" style={{ color: 'rgba(34,197,94,0.7)' }}>
                          Funds have been released to the farmer
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TIMELINE */}
        {isValidBatch && historyData && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-blue)', boxShadow: '0 0 12px rgba(59,130,246,0.6)' }} />
              <h2 className="text-xl font-bold uppercase tracking-tight">Supply Chain Timeline</h2>
            </div>
            <BatchTimeline history={historyData} batch={batch} />
          </div>
        )}
      </main>

      {/* Toast */}
      {(updateSuccess || completeSuccess) && (
        <div
          className="fixed bottom-8 right-8 px-5 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-2xl"
          style={{ background: 'var(--color-green)', color: '#000' }}
        >
          <CheckCircle2 size={16} />
          {completeSuccess ? 'Funds Released to Farmer!' : 'Sepolia Sync Complete!'}
        </div>
      )}
    </div>
  );
}