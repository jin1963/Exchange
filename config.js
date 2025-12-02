// config.js

// BSC mainnet
const BSC_CHAIN_ID = "0x38";

// ✅ USDT จริงบน BSC
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

// ✅ THBC token ที่คุณสร้าง
const THBC_ADDRESS = "0xe8d4687b77B5611eF1828FDa7428034FA12a1Beb";

// ✅ KaojinoTHBCExchange contract ที่คุณ deploy แล้ว
const EXCHANGE_ADDRESS = "0xe584224ec67a1e6CC52B83023fc5336b12664a3d";

// -------------------- USDT ABI (ย่อ ๆ พอใช้) --------------------
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
];

// -------------------- THBC ABI (ใช้แค่ balanceOf) --------------------
const THBC_ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
];

// -------------------- EXCHANGE ABI (ตามที่คุณส่งมา) --------------------
const EXCHANGE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdt", type: "address" },
      { internalType: "address", name: "_thbc", type: "address" },
      { internalType: "address", name: "_usdtTreasury", type: "address" },
      { internalType: "uint256", name: "_thbcPerUsdt", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "usdtSpent", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "thbcReceived",
        type: "uint256",
      },
      { indexed: false, internalType: "address", name: "ref1", type: "address" },
      { indexed: false, internalType: "address", name: "ref2", type: "address" },
      { indexed: false, internalType: "address", name: "ref3", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "ref1Commission",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ref2Commission",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ref3Commission",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryUSDT",
        type: "uint256",
      },
    ],
    name: "BuyTHBC",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountUSDT",
        type: "uint256",
      },
    ],
    name: "ClaimCommission",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "fromBuyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toReferrer",
        type: "address",
      },
      { indexed: false, internalType: "uint256", name: "level", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountUSDT",
        type: "uint256",
      },
    ],
    name: "CommissionPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "thbcPerUsdt",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "ref1", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "ref2", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "ref3", type: "uint256" },
    ],
    name: "RatesUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
    ],
    name: "ReferrerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "treasury", type: "address" },
    ],
    name: "TreasuryUpdated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "usdtAmount", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" },
    ],
    name: "buyTHBCWithUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimCommission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getReferralRates",
    outputs: [
      { internalType: "uint256", name: "level1Bps", type: "uint256" },
      { internalType: "uint256", name: "level2Bps", type: "uint256" },
      { internalType: "uint256", name: "level3Bps", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getReferrers",
    outputs: [
      { internalType: "address", name: "ref1", type: "address" },
      { internalType: "address", name: "ref2", type: "address" },
      { internalType: "address", name: "ref3", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "pendingCommissionUSDT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "refRateLevel1",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "refRateLevel2",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "refRateLevel3",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_ref1", type: "uint256" },
      { internalType: "uint256", name: "_ref2", type: "uint256" },
      { internalType: "uint256", name: "_ref3", type: "uint256" },
    ],
    name: "setReferralRates",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_thbcPerUsdt", type: "uint256" }],
    name: "setThbcPerUsdt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "thbc",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "thbcPerUsdt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "usdt",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "usdtTreasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint256", name: "totalVolumeUSDT", type: "uint256" },
      { internalType: "uint256", name: "totalCommissionUSDT", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// export global
window.THBC_CONFIG = {
  BSC_CHAIN_ID,
  USDT_ADDRESS,
  THBC_ADDRESS,
  EXCHANGE_ADDRESS,
  USDT_ABI,
  THBC_ABI,
  EXCHANGE_ABI,
};
