import { CheckCircle, Clock } from 'lucide-react';

const statusMap = {
  0: "Harvested",
  1: "In Transit",
  2: "At Warehouse",
  3: "Out for Delivery",
  4: "Delivered",
};

export default function BatchTimeline({ history, batch }) {
  if (!history || history.length === 0) return null;

  let displayHistory = [...history];

  // Insert synthetic event if buyer exists
  if (batch && batch.buyer && batch.buyer !== "0x0000000000000000000000000000000000000000") {
    const paymentTimestamp = displayHistory[0] ? Number(displayHistory[0].timestamp) + 1 : Date.now() / 1000;
    const paymentEvent = {
        status: "Payment Secured by Retailer",
        location: "Smart Contract Escrow",
        timestamp: paymentTimestamp,
        isSynthetic: true,
    };
    displayHistory.splice(1, 0, paymentEvent);
  }

  return (
    <div className="mx-auto w-full max-w-2xl bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl">
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500 mb-6">
        Journey History
      </h3>
      
      <div className="relative pl-6 space-y-8">
        {/* Timeline line connecting events */}
        <div className="absolute left-10 top-2 bottom-6 w-0.5 bg-neutral-700"></div>

        {displayHistory.map((event, index) => {
          const isLast = index === displayHistory.length - 1;
          const statusText = isNaN(event.status) ? event.status : statusMap[event.status];
          
          return (
            <div key={index} className="relative z-10 flex items-start group">
              <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-4 ${
                isLast ? 'bg-emerald-500 border-neutral-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-neutral-600 border-neutral-900 text-neutral-300'
              }`}>
                {isLast ? <CheckCircle className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4" />}
              </div>

              <div className="ml-6 w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800 transition-all hover:bg-neutral-800">
                <div className="flex justify-between items-center mb-1">
                  <p className={`font-semibold ${isLast ? 'text-emerald-400' : 'text-neutral-200'}`}>
                    {statusText}
                  </p>
                  <span className="text-xs text-neutral-500 font-mono bg-neutral-950 px-2 py-1 rounded">
                    {new Date(Number(event.timestamp) * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-neutral-400">
                  <span className="material-icons text-[14px] mr-1">location_on</span>
                  {event.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
