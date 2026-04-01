// Sepolia Contract Address — redeployed with escrow fix
export const addressAgriChain = "0xB25a227B80F058d54809d718f0750E36fFcF95F5";

/**
 * Safe Mapper Utility
 * Converts blockchain data into a standard object regardless of format.
 */
export const mapBatch = (data) => {
    if (!data) return null;

    // If data is an array (positional return)
    if (Array.isArray(data)) {
        return {
            batchId: data[0],
            farmer: data[1],
            buyer: data[2],
            cropName: data[3],
            quantity: data[4],
            location: data[5],
            price: data[6],
            status: Number(data[7]),
            timestamp: data[8]
        };
    }

    // If data is an object (named component return from hardcoded ABI)
    return {
        ...data,
        status: Number(data.status)
    };
};

export const aBIAgriChain = [
    {
        "inputs": [],
        "name": "batchCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
        "name": "getBatch",
        "outputs": [{
            "components": [
                { "internalType": "uint256", "name": "batchId", "type": "uint256" },
                { "internalType": "address", "name": "farmer", "type": "address" },
                { "internalType": "address", "name": "buyer", "type": "address" },
                { "internalType": "string", "name": "cropName", "type": "string" },
                { "internalType": "string", "name": "quantity", "type": "string" },
                { "internalType": "string", "name": "location", "type": "string" },
                { "internalType": "uint256", "name": "price", "type": "uint256" },
                { "internalType": "uint8", "name": "status", "type": "uint8" },
                { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "internalType": "struct AgriChain.CropBatch",
            "name": "",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
        "name": "purchaseBatch",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_cropName", "type": "string" },
            { "internalType": "string", "name": "_quantity", "type": "string" },
            { "internalType": "string", "name": "_location", "type": "string" },
            { "internalType": "uint256", "name": "_price", "type": "uint256" }
        ],
        "name": "registerBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_batchId", "type": "uint256" },
            { "internalType": "uint8", "name": "_newStatus", "type": "uint8" },
            { "internalType": "string", "name": "_location", "type": "string" }
        ],
        "name": "updateStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
        "name": "completeDelivery",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
        "name": "getStatusHistory",
        "outputs": [{
            "components": [
                { "internalType": "uint8", "name": "status", "type": "uint8" },
                { "internalType": "string", "name": "location", "type": "string" },
                { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "internalType": "struct AgriChain.StatusUpdate[]",
            "name": "",
            "type": "tuple[]"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];