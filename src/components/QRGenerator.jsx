import { QRCodeSVG } from 'qrcode.react';

export default function QRGenerator({ batchId }) {
  // Add this log right at the top
  console.log("DEBUG 5: QRGenerator Prop received:", batchId, "Type:", typeof batchId);

  const verifyUrl = `${window.location.origin}/verify/${batchId}`;

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl w-fit mx-auto mt-6">
      <QRCodeSVG value={verifyUrl} size={200} />
      <p className="mt-4 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
        ID: {batchId}
      </p>
    </div>
  );
}
