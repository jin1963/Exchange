// app.js

let web3;
let selectedAccount = null;
let usdtContract;
let thbcContract;
let exchangeContract;

let RATE_THBC_PER_USDT = 35; // default; จะปรับตามค่าใน contract หลังเชื่อม
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
let refFromUrl = null;

// ------------------- i18n -------------------
const I18N = {
  en: {
    app_title: "Kaojino THBC Exchange",
    app_tagline: "Utility gateway for THBC, KJC and CAT",
    connect_wallet: "Connect Wallet",
    nav_buy_thbc: "Buy THBC",
    nav_kjc_packages: "KJC Packages",
    nav_cat_packages: "CAT Packages",
    wallet_status_title: "Wallet Status",
    wallet_address: "Address",
    buy_thbc_title: "Buy THBC with USDT",
    buy_thbc_desc:
      "Enter the amount of USDT you want to spend. The system will calculate how much THBC you will receive at the fixed rate.",
    current_rate: "Current rate",
    label_usdt_amount: "USDT amount",
    label_thbc_receive: "You will receive (THBC)",
    btn_approve_usdt: "Approve USDT",
    btn_buy_thbc: "Buy THBC",
    ref_title: "Referral",
    ref_desc:
      "Share your referral link and earn a 3-level commission (10% / 3% / 2%) from your referrals' USDT purchases.",
    ref_link_label: "Your referral link",
    btn_copy: "Copy",
    ref_total_commission: "Total commission (USDT)",
    ref_pending: "Pending to claim",
    btn_claim_ref: "Claim Referral Rewards",
  },
  th: {
    app_title: "Kaojino THBC Exchange",
    app_tagline: "ศูนย์กลาง Utility สำหรับ THBC, KJC และ CAT",
    connect_wallet: "เชื่อมต่อกระเป๋า",
    nav_buy_thbc: "เติม THBC",
    nav_kjc_packages: "แพ็กเกจ KJC",
    nav_cat_packages: "แพ็กเกจ CAT",
    wallet_status_title: "สถานะกระเป๋า",
    wallet_address: "ที่อยู่กระเป๋า",
    buy_thbc_title: "ซื้อ THBC ด้วย USDT",
    buy_thbc_desc:
      "ใส่จำนวน USDT ที่ต้องการใช้ ระบบจะคำนวณจำนวน THBC ที่คุณจะได้รับตามเรทคงที่",
    current_rate: "อัตราแลกเปลี่ยนปัจจุบัน",
    label_usdt_amount: "จำนวน USDT",
    label_thbc_receive: "คุณจะได้รับ (THBC)",
    btn_approve_usdt: "อนุมัติ USDT",
    btn_buy_thbc: "ซื้อ THBC",
    ref_title: "ระบบแนะนำเพื่อน",
    ref_desc:
      "แชร์ลิงก์แนะนำของคุณและรับค่าคอมมิชชั่น 3 ชั้น (10% / 3% / 2%) จากยอดซื้อ THBC ด้วย USDT",
    ref_link_label: "ลิงก์แนะนำของคุณ",
    btn_copy: "คัดลอก",
    ref_total_commission: "ค่าคอมมิชชั่นรวม (USDT)",
    ref_pending: "รอเคลม",
    btn_claim_ref: "เคลมค่าคอมมิชชั่น",
  },
};

let currentLang = localStorage.getItem("thbc-lang") || "en";

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("thbc-lang", lang);

  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // ปรับข้อความปุ่ม Connect ถ้าเชื่อมแล้ว
  if (selectedAccount) {
    document.getElementById("btnConnect").textContent =
      lang === "th" ? "เชื่อมต่อแล้ว" : "Connected";
  }
}

// ------------------- helper -------------------

function shortenAddress(addr) {
  if (!addr) return "-";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatUnitsWeb3(value, decimals) {
  if (!value) return "0";
  const bn = web3.utils.toBN(value);
  const base = web3.utils.toBN(10).pow(web3.utils.toBN(decimals));
  const whole = bn.div(base).toString();
  const frac = bn.mod(base).toString().padStart(decimals, "0").slice(0, 4);
  return `${whole}.${frac}`.replace(/\.0+$/, "");
}

function parseUnitsWeb3(amountStr, decimals) {
  const [whole, fracRaw] = String(amountStr).split(".");
  const frac = (fracRaw || "").padEnd(decimals, "0").slice(0, decimals);
  return web3.utils
    .toBN(whole || "0")
    .mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)))
    .add(web3.utils.toBN(frac || "0"))
    .toString();
}

function setStatus(msg, type = "") {
  const el = document.getElementById("txStatus");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("error", "success");
  if (type) el.classList.add(type);
}

// อ่าน ?ref= จาก URL
function readRefFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const r = params.get("ref");
  if (!r) return;
  // ไม่เช็ค isAddress แบบ strict มากก็ได้ ปล่อยให้ contract ตรวจอีกที
  refFromUrl = r;
}

// ------------------- wallet connect -------------------

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask or a Web3 wallet.");
      return;
    }

    web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    selectedAccount = accounts[0];

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== THBC_CONFIG.BSC_CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: THBC_CONFIG.BSC_CHAIN_ID }],
      });
    }

    // init contracts
    usdtContract = new web3.eth.Contract(
      THBC_CONFIG.USDT_ABI,
      THBC_CONFIG.USDT_ADDRESS
    );
    thbcContract = new web3.eth.Contract(
      THBC_CONFIG.THBC_ABI,
      THBC_CONFIG.THBC_ADDRESS
    );
    exchangeContract = new web3.eth.Contract(
      THBC_CONFIG.EXCHANGE_ABI,
      THBC_CONFIG.EXCHANGE_ADDRESS
    );

    document.getElementById("walletAddress").textContent =
      shortenAddress(selectedAccount);

    document.getElementById("btnConnect").textContent =
      currentLang === "th" ? "เชื่อมต่อแล้ว" : "Connected";

    // อ่านเรทจาก contract
    await refreshRate();
    updateRateDisplay();
    updatePreview();

    await refreshBalances();
    await refreshReferralInfo();
    buildReferralLink();
    setStatus(
      currentLang === "th"
        ? "เชื่อมต่อกระเป๋าเรียบร้อย"
        : "Wallet connected",
      "success"
    );

    window.ethereum.on("accountsChanged", async (accs) => {
      if (accs.length > 0) {
        selectedAccount = accs[0];
        document.getElementById("walletAddress").textContent =
          shortenAddress(selectedAccount);
        await refreshBalances();
        await refreshReferralInfo();
        buildReferralLink();
      }
    });
  } catch (err) {
    console.error(err);
    setStatus("Error: " + (err?.message || err), "error");
  }
}

async function refreshRate() {
  if (!exchangeContract) return;
  try {
    const raw = await exchangeContract.methods.thbcPerUsdt().call();
    // raw เป็น 35e18 → แปลงเป็น float 35
    RATE_THBC_PER_USDT = Number(formatUnitsWeb3(raw, 18));
  } catch (e) {
    console.error("refreshRate error", e);
  }
}

function updateRateDisplay() {
  const el = document.getElementById("rateDisplay");
  if (el) {
    el.textContent = `1 USDT = ${RATE_THBC_PER_USDT} THBC`;
  }
}

async function refreshBalances() {
  if (!selectedAccount || !web3) return;
  try {
    const usdtBal = await usdtContract.methods
      .balanceOf(selectedAccount)
      .call();
    const thbcBal = await thbcContract.methods
      .balanceOf(selectedAccount)
      .call();

    document.getElementById("balanceUSDT").textContent = formatUnitsWeb3(
      usdtBal,
      18
    );
    document.getElementById("balanceTHBC").textContent = formatUnitsWeb3(
      thbcBal,
      18
    );
  } catch (err) {
    console.error("refreshBalances", err);
  }
}

// ------------------- BUY THBC -------------------

function updatePreview() {
  const input = document.getElementById("inputUsdt");
  const preview = document.getElementById("thbcPreview");
  if (!input || !preview) return;
  const val = parseFloat(input.value || "0");
  const thbc = val * RATE_THBC_PER_USDT;
  preview.textContent = isNaN(thbc) ? "0.00" : thbc.toFixed(2);
}

async function approveUSDT() {
  if (!web3 || !selectedAccount) {
    return alert(
      currentLang === "th"
        ? "กรุณาเชื่อมต่อกระเป๋าก่อน"
        : "Please connect wallet first."
    );
  }
  try {
    const inputVal = parseFloat(
      document.getElementById("inputUsdt").value || "0"
    );
    if (inputVal <= 0) {
      return alert(
        currentLang === "th"
          ? "กรุณาใส่จำนวน USDT ให้ถูกต้อง"
          : "Please enter a valid USDT amount."
      );
    }
    const usdtAmount = parseUnitsWeb3(inputVal.toString(), 18);
    setStatus(
      currentLang === "th"
        ? "กำลังส่งคำขออนุมัติ USDT..."
        : "Sending USDT approval transaction...",
      ""
    );

    await usdtContract.methods
      .approve(THBC_CONFIG.EXCHANGE_ADDRESS, usdtAmount)
      .send({ from: selectedAccount });

    setStatus(
      currentLang === "th"
        ? "อนุมัติ USDT สำเร็จ"
        : "USDT approved successfully.",
      "success"
    );
  } catch (err) {
    console.error(err);
    setStatus("Error: " + (err?.message || err), "error");
  }
}

async function buyTHBC() {
  if (!web3 || !selectedAccount) {
    return alert(
      currentLang === "th"
        ? "กรุณาเชื่อมต่อกระเป๋าก่อน"
        : "Please connect wallet first."
    );
  }
  try {
    const inputVal = parseFloat(
      document.getElementById("inputUsdt").value || "0"
    );
    if (inputVal <= 0) {
      return alert(
        currentLang === "th"
          ? "กรุณาใส่จำนวน USDT ให้ถูกต้อง"
          : "Please enter a valid USDT amount."
      );
    }

    const usdtAmount = parseUnitsWeb3(inputVal.toString(), 18);

    // เลือก referrer จาก ?ref= ถ้าไม่ใช่ตัวเอง
    let refToUse = refFromUrl;
    if (
      refToUse &&
      selectedAccount &&
      refToUse.toLowerCase() === selectedAccount.toLowerCase()
    ) {
      refToUse = null; // กัน self-ref
    }

    setStatus(
      currentLang === "th"
        ? "กำลังดำเนินการซื้อ THBC..."
        : "Processing THBC purchase...",
      ""
    );

    await exchangeContract.methods
      .buyTHBCWithUSDT(usdtAmount, refToUse || ZERO_ADDRESS)
      .send({ from: selectedAccount });

    setStatus(
      currentLang === "th"
        ? "ซื้อ THBC สำเร็จ!"
        : "THBC purchased successfully!",
      "success"
    );

    await refreshBalances();
    await refreshReferralInfo();
  } catch (err) {
    console.error(err);
    setStatus("Error: " + (err?.message || err), "error");
  }
}

// ------------------- REFERRAL INFO -------------------

function buildReferralLink() {
  const refInput = document.getElementById("refLink");
  if (!refInput) return;

  const baseUrl = window.location.origin + window.location.pathname;
  let url = baseUrl;
  if (selectedAccount) {
    url = `${baseUrl}?ref=${selectedAccount.toLowerCase()}`;
  }
  refInput.value = url;
}

function copyReferralLink() {
  const input = document.getElementById("refLink");
  if (!input || !input.value) return;
  input.select();
  document.execCommand("copy");
  setStatus(
    currentLang === "th"
      ? "คัดลอกลิงก์แนะนำแล้ว"
      : "Referral link copied.",
    "success"
  );
}

async function refreshReferralInfo() {
  if (!exchangeContract || !selectedAccount) return;
  try {
    const user = await exchangeContract.methods
      .users(selectedAccount)
      .call();
    const pending = await exchangeContract.methods
      .pendingCommissionUSDT(selectedAccount)
      .call();

    // totalCommissionUSDT อยู่ใน struct users
    const totalCommission = user.totalCommissionUSDT || "0";

    document.getElementById("refTotal").textContent = formatUnitsWeb3(
      totalCommission,
      18
    );
    document.getElementById("refPending").textContent = formatUnitsWeb3(
      pending,
      18
    );
  } catch (err) {
    console.error("refreshReferralInfo", err);
  }
}

async function claimReferral() {
  if (!exchangeContract || !selectedAccount) {
    return alert(
      currentLang === "th"
        ? "กรุณาเชื่อมต่อกระเป๋าก่อน"
        : "Please connect wallet first."
    );
  }
  try {
    setStatus(
      currentLang === "th"
        ? "กำลังเคลมค่าคอมมิชชั่น..."
        : "Claiming referral commission...",
      ""
    );
    await exchangeContract.methods
      .claimCommission()
      .send({ from: selectedAccount });

    setStatus(
      currentLang === "th"
        ? "เคลมค่าคอมมิชชั่นสำเร็จ"
        : "Referral commission claimed.",
      "success"
    );
    await refreshReferralInfo();
  } catch (err) {
    console.error(err);
    setStatus("Error: " + (err?.message || err), "error");
  }
}

// ------------------- INIT -------------------

window.addEventListener("DOMContentLoaded", () => {
  // อ่าน ref จาก URL
  readRefFromQuery();

  // ตั้งภาษาเริ่มต้น
  applyLanguage(currentLang);

  document.getElementById("year").textContent = new Date().getFullYear();

  document
    .querySelectorAll(".lang-btn")
    .forEach((b) => b.addEventListener("click", () => applyLanguage(b.dataset.lang)));

  document
    .getElementById("btnConnect")
    .addEventListener("click", () => connectWallet());

  document
    .getElementById("inputUsdt")
    .addEventListener("input", () => updatePreview());

  document
    .getElementById("btnApproveUSDT")
    .addEventListener("click", () => approveUSDT());

  document
    .getElementById("btnBuyTHBC")
    .addEventListener("click", () => buyTHBC());

  document
    .getElementById("btnCopyRef")
    .addEventListener("click", () => copyReferralLink());

  document
    .getElementById("btnClaimRef")
    .addEventListener("click", () => claimReferral());

  updateRateDisplay();
  updatePreview();
});
