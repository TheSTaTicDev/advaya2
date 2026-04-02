import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { addressAgriChain, aBIAgriChain } from "../lib/contract";
import QRGenerator from "../components/QRGenerator";
import { Loader2, AlertTriangle } from "lucide-react";

export default function FarmerPage() {
  const [formData, setFormData] = useState({ cropName: "", quantity: "", location: "", price: "" });

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = () => {
    if (!formData.cropName || !formData.quantity || !formData.location || !formData.price) return;
    writeContract({
      address: addressAgriChain,
      abi: aBIAgriChain,
      functionName: "registerBatch",
      args: [
        formData.cropName,
        formData.quantity,
        formData.location,
        parseEther(formData.price || "0"),
      ],
    });
  };

  const getBatchIdFromLogs = () => {
    if (!receipt?.logs?.length) return "?";
    const log = receipt.logs.find(l => l.address.toLowerCase() === addressAgriChain.toLowerCase());
    return log ? BigInt(log.topics[1]).toString() : "?";
  };

  const isFormValid = formData.cropName && formData.quantity && formData.location && formData.price;
  const isLoading = isPending || isConfirming;

  // ✅ SUCCESS MODAL
  if (isSuccess) {
    const batchId = getBatchIdFromLogs();
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex w-[700px] rounded-[2rem] overflow-hidden shadow-2xl bg-white">

          {/* LEFT (GREEN) */}
          <div className="w-[45%] p-10 text-white flex flex-col items-center justify-center relative" style={{ background: 'var(--color-green-dark)' }}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Success!</h2>
            <p className="text-xs mb-8 font-medium opacity-90 tracking-wide">Batch ID: #{batchId}</p>
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <QRGenerator batchId={batchId} />
            </div>
            <p className="text-[9px] uppercase tracking-widest font-bold mt-4 opacity-70">SCAN TO VERIFY PROVENANCE</p>
          </div>

          {/* RIGHT (WHITE) */}
          <div className="w-[55%] p-10 flex flex-col justify-center bg-white">
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Batch Summary</h3>
            <div className="space-y-5 text-sm mb-10">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Product</span>
                <span className="font-semibold text-gray-900">{formData.cropName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Quantity</span>
                <span className="font-semibold text-gray-900">{formData.quantity} kg</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Origin</span>
                <span className="font-semibold text-gray-900">{formData.location}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Escrow Secure</span>
                <span className="font-bold text-sm" style={{ color: 'var(--color-green-dark)' }}>{formData.price} ETH Locked</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-auto w-full py-3.5 rounded-xl font-bold text-sm transition-colors hover:bg-gray-200"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              Dismiss Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ✅ MAIN PAGE
  return (
    <div className="min-h-screen">
      <main className="px-12 py-12 max-w-[1400px] mx-auto relative z-10">

        {/* HERO */}
        <div className="flex justify-between items-start mb-16 gap-10 mt-8">
          <div className="max-w-xl">
            <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: 'var(--color-green-dark)', opacity: 0.7 }}>AGRICULTURAL ARCHIVE</p>
            <h1 className="text-6xl font-extrabold leading-[1.1] tracking-tight mb-5" style={{ color: 'var(--color-green-dark)' }}>
              Register Your <br />
              <span className="italic" style={{ color: 'var(--color-green)' }}>Harvest.</span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Commit your seasonal yield to the AgriProof ledger. Secure provenance, automate certification, and connect directly with verified retailers.
            </p>
          </div>
          <div
            className="px-6 py-4 rounded-2xl border flex flex-col items-center justify-center min-w-[200px]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-green)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> ACTIVE NODE
            </p>
            <h2 className="font-bold text-lg mt-1" style={{ color: 'var(--color-text)' }}>Sepolia_TX</h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* FORM — col 7 */}
          <div className="col-span-12 lg:col-span-7 card p-10 space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <span style={{ color: 'var(--color-green-dark)' }}>🌿</span> Batch Manifest
            </h2>

            <div className="space-y-6">

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>Crop Name</label>
                  <input
                    name="cropName"
                    value={formData.cropName}
                    onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                    placeholder="e.g. Organic Arabica Coffee"
                    className="input-field"
                    style={{ background: 'var(--color-surface-2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>Quantity (KG)</label>
                  <div className="relative">
                    <input
                      name="quantity"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0.00"
                      className="input-field"
                      style={{ background: 'var(--color-surface-2)' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: 'var(--color-muted)' }}>KG</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>Farm Origin</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Green Valley Estate"
                    className="input-field"
                    style={{ background: 'var(--color-surface-2)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>Asking Price (ETH)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.001"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.0045"
                    className="input-field pr-10"
                    style={{ background: 'var(--color-surface-2)' }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>Sustainability Protocol</label>
                <div className="flex flex-wrap gap-3">
                  {['Non-GMO', 'Carbon Neutral', 'Regenerative Soil'].map(tag => (
                    <div
                      key={tag}
                      className="px-5 py-2 rounded-full text-xs font-semibold cursor-default transition-colors hover:border-green-600"
                      style={{
                        border: tag === 'Carbon Neutral' ? '1px solid var(--color-green)' : '1px solid var(--color-border)',
                        color: tag === 'Carbon Neutral' ? 'var(--color-green-dark)' : 'var(--color-muted)',
                        background: tag === 'Carbon Neutral' ? 'var(--color-green-light)' : 'transparent'
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3 relative">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !isFormValid}
                  className="btn-primary w-full py-4 rounded-xl justify-center text-lg disabled:opacity-40"
                  style={{ background: 'var(--color-green-dark)' }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      {isPending ? "Waiting for Wallet..." : "Mining..."}
                    </span>
                  ) : (
                    <>
                      <svg width="18" height="20" viewBox="0 0 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7 0L14 3.11111V7.77778C14 12.0789 11.025 16 7 16C2.975 16 0 12.0789 0 7.77778V3.11111L7 0ZM6.22222 11.6667L2.33333 7.77778L3.43778 6.67333L6.22222 9.44222L10.5622 5.10222L11.6667 6.22222L6.22222 11.6667Z" />
                      </svg>
                      Submit to Blockchain
                    </>
                  )}
                </button>
                <p className="text-[10px] uppercase font-bold tracking-widest text-center" style={{ color: 'var(--color-muted)' }}>
                  ESTIMATED GAS FEE: 0.00012 ETH • FINALIZED IN ~12S
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error.shortMessage || error.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — col 5 */}
          <div className="col-span-12 lg:col-span-5 relative h-full min-h-[500px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 group">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>

            {/* Gradients for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-green-900/40 to-transparent mix-blend-multiply"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
              <span className="w-fit px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/20 backdrop-blur-md border border-white/30 mb-4 inline-block">
                Regenerative Agriculture
              </span>
              <h3 className="text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
                Empowering the <br /> <span className="text-green-400 italic">Global Supply Chain.</span>
              </h3>
              <p className="text-sm opacity-90 leading-relaxed max-w-sm font-medium">
                Connect your harvest directly to retailers around the world through trustless escrow contracts. Your hard work, verified and valued.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}