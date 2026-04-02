import { useState } from "react";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { addressAgriChain, aBIAgriChain, mapBatch } from "../lib/contract";
import { Loader2, MapPin, Package, CheckCircle2, ArrowRight, AlertTriangle, Sprout } from "lucide-react";

import React, { useEffect } from "react";


function BatchCard({ batch, onPurchaseSuccess }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const isProcessing = isPending || isConfirming;

  useEffect(() => {
    if (isSuccess && onPurchaseSuccess) {
      onPurchaseSuccess();
    }
  }, [isSuccess, onPurchaseSuccess]);

  return (
    <div
      className="card flex flex-col gap-5 transition-all duration-200"
      style={{
        borderColor: isSuccess ? 'rgba(34,197,94,0.35)' : 'var(--color-border)',
      }}
    >
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs tracking-widest font-bold mb-2" style={{ color: 'var(--color-green)' }}>
            FRESH HARVEST
          </p>
          <h3 className="text-2xl font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
            {batch.cropName}
          </h3>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
        >
          #{batch.batchId?.toString()}
        </span>
      </div>

      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <MapPin size={13} />
          <span className="truncate">{batch.location || "Location unspecified"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <Package size={13} />
          <span>{batch.quantity || "N/A"}</span>
        </div>
      </div>

      
      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
          Farmer Wallet
        </p>
        <p className="font-mono text-[10px] truncate" style={{ color: 'rgba(45,212,191,0.75)' }}>
          {batch.farmer}
        </p>
      </div>

      
      <div
        className="mt-auto pt-4 flex items-center justify-between gap-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-muted)' }}>
            Escrow Price
          </p>
          <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-green)' }}>
            {formatEther(batch.price || 0n)} <span className="text-sm font-normal" style={{ color: 'var(--color-muted)' }}>ETH</span>
          </p>
        </div>

        <button
          onClick={() => writeContract({
            address: addressAgriChain,
            abi: aBIAgriChain,
            functionName: "purchaseBatch",
            args: [batch.batchId],
            value: batch.price,
          })}
          disabled={isProcessing || isSuccess}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          style={isSuccess ? { background: 'rgba(34,197,94,0.15)', color: 'var(--color-green)', border: '1px solid rgba(34,197,94,0.3)' } : {}}
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing</>
          ) : isSuccess ? (
            <><CheckCircle2 className="w-4 h-4" /> Secured</>
          ) : (
            <><span>Secure Deal</span><ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      
      {error && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-red)' }} />
          <p className="text-[10px] font-mono" style={{ color: 'var(--color-red)' }}>
            {error.shortMessage || "Transaction failed"}
          </p>
        </div>
      )}
    </div>
  );
}


export default function MarketplacePage() {
  const [successCount, setSuccessCount] = useState(0);

  const { data: count } = useReadContract({
    address: addressAgriChain,
    abi: aBIAgriChain,
    functionName: "batchCount",
  });

  const batchIds = Array.from({ length: Number(count || 0n) }, (_, i) => BigInt(i + 1));

  const { data: batchesResults, isLoading } = useReadContracts({
    contracts: batchIds.map(id => ({
      address: addressAgriChain,
      abi: aBIAgriChain,
      functionName: "getBatch",
      args: [id],
    })),
    query: { enabled: batchIds.length > 0 },
  });

  const available = batchesResults
    ?.map(r => mapBatch(r.result))
    .filter(b =>
      b && b.cropName &&
      b.buyer === "0x0000000000000000000000000000000000000000" &&
      b.status === 0
    ) || [];

  return (
    <div className="min-h-screen">
      <main className="px-12 py-12 max-w-[1400px] mx-auto space-y-12 pb-32">

        
        <div className="flex flex-col mb-10 mt-8">
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 text-green-700 opacity-80">
            RETAILER MARKETPLACE
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--color-green-dark)' }}>
            Secure a <span className="italic" style={{ color: 'var(--color-green)' }}>Harvest.</span>
          </h1>
          <div className="flex justify-between items-end">
            <p className="text-base max-w-2xl" style={{ color: 'var(--color-muted)' }}>
              Browse verified crop batches and lock in an escrow deal directly with the farmer.
            </p>
            <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">ACTIVE NODE</p>
                 <h2 className="font-bold text-sm text-gray-900">Sepolia Testnet</h2>
               </div>
               <div className="h-8 w-px bg-gray-100 mx-2"></div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-0.5">AVAILABLE</p>
                  <p className="font-bold text-sm text-green-700">{available.length || 0} Batches</p>
               </div>
            </div>
          </div>
        </div>

        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="animate-spin w-8 h-8 text-green-600" />
            <p className="text-sm font-mono text-gray-500">Syncing with Sepolia...</p>
          </div>
        ) : available.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Sprout className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">No Active Harvests</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Farmers haven't registered any batches yet. Check back soon or visit the Farmer Portal to simulate a listing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {available.map(batch => (
              <BatchCard
                key={batch.batchId.toString()}
                batch={batch}
                onPurchaseSuccess={() => setSuccessCount(c => c + 1)}
              />
            ))}
          </div>
        )}
      </main>

      
      {successCount > 0 && (
        <div className="fixed bottom-8 right-8 px-6 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl bg-green-500 text-white">
          <CheckCircle2 size={18} />
          Deal Secured — Locked in Escrow!
        </div>
      )}
    </div>
  );
}