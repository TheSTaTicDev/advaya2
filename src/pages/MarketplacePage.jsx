import { useState } from "react";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { addressAgriChain, aBIAgriChain, mapBatch } from "../lib/contract";
import { Loader2, MapPin, Package, CheckCircle2, ArrowRight, AlertTriangle, Sprout } from "lucide-react";

// ── Per-card component so each card has isolated tx state ──────────────────────
function BatchCard({ batch }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const isProcessing = isPending || isConfirming;

  return (
    <div
      className="card flex flex-col gap-5 transition-all duration-200"
      style={{
        borderColor: isSuccess ? 'rgba(34,197,94,0.35)' : 'var(--color-border)',
      }}
    >
      {/* Header */}
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

      {/* Details */}
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

      {/* Farmer address */}
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

      {/* Price + action */}
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

      {/* Error */}
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

// ── Main page ──────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <main className="px-12 py-12 max-w-[1400px] mx-auto">

        {/* HERO */}
        <div className="flex justify-between items-start mb-20 gap-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-widest mb-4 font-bold" style={{ color: 'var(--color-green)' }}>
              RETAILER MARKETPLACE
            </p>
            <h1 className="text-5xl font-bold leading-tight">
              Secure a <span className="italic" style={{ color: 'var(--color-green)' }}>Harvest.</span>
            </h1>
            <p className="mt-4" style={{ color: 'var(--color-muted)' }}>
              Browse verified crop batches and lock in an escrow deal directly with the farmer.
            </p>
          </div>
          <div
            className="px-6 py-4 rounded-xl min-w-[220px]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-green)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>ACTIVE NODE</p>
            <h2 className="font-bold" style={{ color: 'var(--color-green)' }}>Sepolia Testnet</h2>
            {available.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                {available.length} active listing{available.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* LISTINGS */}
        {isLoading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <Loader2 className="animate-spin w-8 h-8" style={{ color: 'var(--color-green)' }} />
            <p className="text-sm font-mono" style={{ color: 'var(--color-muted)' }}>Syncing with Sepolia...</p>
          </div>
        ) : available.length === 0 ? (
          <div
            className="text-center py-32 rounded-2xl"
            style={{ border: '2px dashed var(--color-border)' }}
          >
            <Sprout className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
            <h3 className="font-bold text-lg">No active harvests</h3>
            <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: 'var(--color-muted)' }}>
              Farmers haven't registered any batches yet. Head to the Farmer Portal to list a harvest.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Toast */}
      {successCount > 0 && (
        <div
          className="fixed bottom-8 right-8 px-5 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl"
          style={{ background: 'var(--color-green)', color: '#000' }}
        >
          <CheckCircle2 size={18} />
          Deal Secured — Locked in Escrow!
        </div>
      )}
    </div>
  );
}