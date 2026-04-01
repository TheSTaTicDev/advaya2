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
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="flex w-[750px] rounded-2xl overflow-hidden shadow-2xl">

          {/* LEFT */}
          <div className="bg-green-700 w-1/2 p-10 text-white flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 text-2xl">
              ✓
            </div>
            <h2 className="text-3xl font-bold mb-2">Success!</h2>
            <p className="text-sm mb-6 opacity-80">Batch ID: #{batchId}</p>
            <div className="bg-white p-4 rounded-xl">
              <QRGenerator batchId={batchId} />
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-[var(--color-surface)] w-1/2 p-10">
            <h3 className="text-xl font-bold mb-6">Batch Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Product</span>
                <span className="font-semibold">{formData.cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Quantity</span>
                <span className="font-semibold">{formData.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Origin</span>
                <span className="font-semibold">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Escrow</span>
                <span className="text-green-400 font-semibold">{formData.price} ETH Locked</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 w-full py-3 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors"
            >
              Register Another
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ✅ MAIN PAGE
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="px-12 py-12 max-w-[1400px] mx-auto">

        {/* HERO */}
        <div className="flex justify-between items-start mb-20 gap-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-widest text-green-400 mb-4">AGRICULTURAL ARCHIVE</p>
            <h1 className="text-5xl font-bold leading-tight">
              Register Your <span className="italic text-green-400">Harvest.</span>
            </h1>
            <p className="mt-4 text-[var(--color-muted)]">
              Register your crop batch and lock escrow payment on the blockchain.
            </p>
          </div>
          <div className="bg-[var(--color-surface)] px-6 py-4 rounded-xl border border-green-500 min-w-[220px]">
            <p className="text-xs text-[var(--color-muted)]">ACTIVE NODE</p>
            <h2 className="font-bold text-green-400">Sepolia Testnet</h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-12 gap-12 items-start">

          {/* FORM — col 7 */}
          <div className="col-span-7 card space-y-6">
            <h2 className="text-lg font-bold">Batch Manifest</h2>

            {/* No <form> tag — onClick only to prevent page reload */}
            <div className="space-y-5">
              <input
                name="cropName"
                value={formData.cropName}
                onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="Crop Name"
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="quantity"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Quantity"
                  className="input-field"
                />
                <input
                  name="price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Price (ETH)"
                  className="input-field"
                />
              </div>
              <input
                name="location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Farm Location"
                className="input-field"
              />

              <div className="text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                💡 Payment will be held in escrow and released upon delivery confirmation
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid}
                className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    {isPending ? "Waiting for Wallet..." : "Mining..."}
                  </span>
                ) : (
                  "🔒 Register Batch"
                )}
              </button>

              {error && (
                <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-400 font-mono">{error.shortMessage || error.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — col 5 */}
          <div className="col-span-5 space-y-6">

            <div className="card">
              <h3 className="font-bold mb-4">How It Works</h3>
              <ol className="space-y-3 text-sm text-[var(--color-muted)]">
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">01</span>
                  Fill in your crop details and set an asking price in ETH.
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">02</span>
                  Confirm the transaction in your wallet — batch is logged on Sepolia.
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">03</span>
                  Share the QR code with retailers so they can purchase directly.
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold flex-shrink-0">04</span>
                  ETH is held in escrow — released to you on delivery confirmation.
                </li>
              </ol>
            </div>

            <div className="card bg-green-900 text-white">
              <h3 className="text-3xl font-bold">94.8</h3>
              <p className="text-sm opacity-80 mt-1">Sustainability Score</p>
              <p className="text-xs opacity-50 mt-3">Based on blockchain-verified supply chain data</p>
            </div>

            {/* Live batch preview — shows as user types */}
            {(formData.cropName || formData.location) && (
              <div className="card border border-green-500/30">
                <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-3">Live Preview</p>
                <p className="font-bold text-lg">{formData.cropName || "—"}</p>
                <p className="text-sm text-[var(--color-muted)] mt-1">{formData.location || "—"}</p>
                {formData.price && (
                  <p className="text-green-400 font-bold mt-2">{formData.price} ETH</p>
                )}
                {formData.quantity && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">{formData.quantity}</p>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}