export const MOCK_BATCH = {
  batchId: 1,
  farmer: "0xABC...",
  cropName: "Organic Coffee",
  quantity: "500 kg",
  location: "Coorg, Karnataka",
  price: "1000000000000000000",
  status: "Harvested",
  timestamp: 1711984000,
  statusHistory: [
    { status: "Harvested", location: "Coorg, Karnataka", timestamp: 1711984000 },
    { status: "In Transit", location: "Mysore Hub", timestamp: 1711994000 }
  ]
};

export const MOCK_HISTORY = MOCK_BATCH.statusHistory;
