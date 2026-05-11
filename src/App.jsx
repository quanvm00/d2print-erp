import { useState, useEffect, useMemo, useCallback, useReducer } from "react";

// ============================================================
// D2PRINT ERP - PRICING ENGINE & QUOTATION MANAGEMENT SYSTEM
// ============================================================

// ---- DATA: Material Database ----
const PAPER_TYPES = [
  { id: "c150", name: "Couché 150gsm", gsm: 150, pricePerKg: 32000, category: "couche" },
  { id: "c200", name: "Couché 200gsm", gsm: 200, pricePerKg: 32000, category: "couche" },
  { id: "c250", name: "Couché 250gsm", gsm: 250, pricePerKg: 33000, category: "couche" },
  { id: "c300", name: "Couché 300gsm", gsm: 300, pricePerKg: 33000, category: "couche" },
  { id: "c350", name: "Couché 350gsm", gsm: 350, pricePerKg: 34000, category: "couche" },
  { id: "ivory250", name: "Ivory 250gsm", gsm: 250, pricePerKg: 42000, category: "ivory" },
  { id: "ivory300", name: "Ivory 300gsm", gsm: 300, pricePerKg: 42000, category: "ivory" },
  { id: "ivory350", name: "Ivory 350gsm", gsm: 350, pricePerKg: 43000, category: "ivory" },
  { id: "kraft150", name: "Kraft 150gsm", gsm: 150, pricePerKg: 28000, category: "kraft" },
  { id: "kraft300", name: "Kraft 300gsm", gsm: 300, pricePerKg: 29000, category: "kraft" },
  { id: "art120", name: "Mỹ thuật 120gsm", gsm: 120, pricePerKg: 65000, category: "art" },
  { id: "art250", name: "Mỹ thuật 250gsm", gsm: 250, pricePerKg: 70000, category: "art" },
  { id: "art300", name: "Mỹ thuật 300gsm", gsm: 300, pricePerKg: 72000, category: "art" },
  { id: "bristol250", name: "Bristol 250gsm", gsm: 250, pricePerKg: 36000, category: "bristol" },
  { id: "bristol300", name: "Bristol 300gsm", gsm: 300, pricePerKg: 37000, category: "bristol" },
];

const PRODUCT_TYPES = [
  { id: "namecard", name: "Name Card", defaultSize: { w: 90, h: 54 }, unit: "hộp", defaultQty: 2, pages: 2, hasBinding: false },
  { id: "brochure", name: "Brochure", defaultSize: { w: 210, h: 297 }, unit: "tờ", defaultQty: 500, pages: 4, hasBinding: false },
  { id: "catalogue", name: "Catalogue", defaultSize: { w: 210, h: 297 }, unit: "cuốn", defaultQty: 200, pages: 16, hasBinding: true },
  { id: "flyer", name: "Tờ rơi", defaultSize: { w: 148, h: 210 }, unit: "tờ", defaultQty: 1000, pages: 2, hasBinding: false },
  { id: "paperbag", name: "Túi giấy", defaultSize: { w: 250, h: 350, d: 100 }, unit: "cái", defaultQty: 500, pages: 1, hasBinding: false, is3D: true },
  { id: "box", name: "Hộp giấy", defaultSize: { w: 200, h: 200, d: 100 }, unit: "cái", defaultQty: 500, pages: 1, hasBinding: false, is3D: true },
  { id: "sticker", name: "Sticker", defaultSize: { w: 50, h: 50 }, unit: "cái", defaultQty: 1000, pages: 1, hasBinding: false },
  { id: "invitation", name: "Thiệp mời", defaultSize: { w: 120, h: 180 }, unit: "cái", defaultQty: 200, pages: 2, hasBinding: false },
];

const FINISHING_OPTIONS = [
  { id: "lam_glossy", name: "Cán màng bóng", pricePerSqm: 4500, category: "lamination" },
  { id: "lam_matte", name: "Cán màng mờ", pricePerSqm: 5000, category: "lamination" },
  { id: "lam_soft", name: "Cán màng nhung (Soft Touch)", pricePerSqm: 12000, category: "lamination" },
  { id: "foil_gold", name: "Ép kim vàng", pricePerSqm: 85000, setupFee: 350000, category: "foil" },
  { id: "foil_silver", name: "Ép kim bạc", pricePerSqm: 80000, setupFee: 350000, category: "foil" },
  { id: "foil_rose", name: "Ép kim rose gold", pricePerSqm: 95000, setupFee: 350000, category: "foil" },
  { id: "emboss", name: "Dập nổi (Embossing)", pricePerSqm: 70000, setupFee: 500000, category: "emboss" },
  { id: "deboss", name: "Dập chìm (Debossing)", pricePerSqm: 65000, setupFee: 500000, category: "emboss" },
  { id: "diecut", name: "Bế thành phẩm (Die-cut)", pricePerUnit: 200, setupFee: 800000, category: "diecut" },
  { id: "spot_uv", name: "UV cục bộ (Spot UV)", pricePerSqm: 35000, setupFee: 450000, category: "uv" },
  { id: "bind_staple", name: "Đóng ghim giữa", pricePerUnit: 800, category: "binding" },
  { id: "bind_perfect", name: "Đóng keo nhiệt", pricePerUnit: 2500, category: "binding" },
  { id: "bind_spiral", name: "Đóng lò xo", pricePerUnit: 5000, category: "binding" },
  { id: "glue_bag", name: "Dán túi giấy", pricePerUnit: 3000, category: "assembly" },
  { id: "glue_box", name: "Dán hộp giấy", pricePerUnit: 4000, category: "assembly" },
];

const CUSTOMER_TIERS = [
  { id: "retail", name: "Khách lẻ", discount: 0, color: "#6b7280" },
  { id: "regular", name: "Khách thường", discount: 5, color: "#3b82f6" },
  { id: "agent", name: "Đại lý", discount: 12, color: "#f59e0b" },
  { id: "vvip", name: "VVIP", discount: 18, color: "#ef4444" },
];

const ORDER_STATUSES = [
  { id: "quote", name: "Báo giá", icon: "📋", color: "#6b7280" },
  { id: "approved", name: "Đã duyệt", icon: "✅", color: "#10b981" },
  { id: "design", name: "Chờ thiết kế", icon: "🎨", color: "#8b5cf6" },
  { id: "printing", name: "Đang in", icon: "🖨️", color: "#3b82f6" },
  { id: "finishing", name: "Gia công", icon: "⚙️", color: "#f59e0b" },
  { id: "delivery", name: "Giao hàng", icon: "🚚", color: "#ec4899" },
  { id: "completed", name: "Hoàn tất", icon: "🏁", color: "#059669" },
];

// ---- OFFSET PRICING CONSTANTS ----
const OFFSET = {
  platePrice: 180000,       // VND per plate (kẽm)
  plateSets: { "1c": 1, "2c": 2, "4c": 4, "4c1c": 5, "4c4c": 8 },
  makereadyFee: 350000,     // bài in (per color set)
  machineHourly: 450000,    // tiền máy / giờ
  spoilagePercent: 3,       // % giấy bù hao
  runCostPer1000: 120000,   // tiền công chạy / 1000 tờ
  minSheets: 500,
  sheetSizes: [
    { id: "sra3", name: "SRA3 (320x450mm)", w: 320, h: 450 },
    { id: "a2", name: "A2 (420x594mm)", w: 420, h: 594 },
    { id: "sra2", name: "SRA2 (450x640mm)", w: 450, h: 640 },
    { id: "sra1", name: "SRA1 (640x900mm)", w: 640, h: 900 },
    { id: "b1", name: "B1 (700x1000mm)", w: 700, h: 1000 },
  ],
};

// ---- DIGITAL PRICING CONSTANTS ----
const DIGITAL = {
  clickPriceColor: 1800,    // VND per A3 click (4 color)
  clickPriceBW: 350,        // VND per A3 click (BW)
  setupFee: 50000,          // per job
  minCharge: 150000,        // minimum charge
  paperHandlingFee: 500,    // per sheet (thick paper surcharge > 250gsm)
};

// ---- PRICING ENGINE ----
function calcImposition(productW, productH, sheetW, sheetH) {
  const fit1 = Math.floor(sheetW / productW) * Math.floor(sheetH / productH);
  const fit2 = Math.floor(sheetW / productH) * Math.floor(sheetH / productW);
  return Math.max(fit1, fit2, 1);
}

function findBestSheet(productW, productH) {
  let best = null;
  let bestUp = 0;
  for (const sheet of OFFSET.sheetSizes) {
    const up = calcImposition(productW, productH, sheet.w, sheet.h);
    if (up > bestUp) {
      bestUp = up;
      best = { ...sheet, up };
    }
  }
  return best || { ...OFFSET.sheetSizes[0], up: 1 };
}

function calcPaperWeight(sheetW, sheetH, gsm) {
  return (sheetW / 1000) * (sheetH / 1000) * gsm / 1000; // kg per sheet
}

function calcOffsetCost(params) {
  const { quantity, productW, productH, paper, colorMode = "4c4c", pages = 2 } = params;
  const sheet = findBestSheet(productW, productH);
  const ups = sheet.up;
  const sheetsNeeded = Math.ceil(quantity / ups);
  const totalSheets = Math.ceil(sheetsNeeded * (1 + OFFSET.spoilagePercent / 100));
  const sides = pages > 1 ? 2 : 1;
  const numPlates = OFFSET.plateSets[colorMode] || 4;

  const costPlates = numPlates * OFFSET.platePrice;
  const costMakeready = (numPlates / (sides > 1 ? 2 : 1)) * OFFSET.makereadyFee;
  const costMachine = Math.ceil(totalSheets / 2000) * OFFSET.machineHourly;
  const costSetup = costPlates + costMakeready + costMachine;

  const sheetWeight = calcPaperWeight(sheet.w, sheet.h, paper.gsm);
  const costPaper = totalSheets * sheetWeight * paper.pricePerKg;
  const costRunning = Math.ceil(totalSheets / 1000) * OFFSET.runCostPer1000;
  const costVariable = costPaper + costRunning;

  return {
    method: "offset",
    sheet,
    ups,
    sheetsNeeded,
    totalSheets,
    numPlates,
    breakdown: {
      plates: costPlates,
      makeready: costMakeready,
      machine: costMachine,
      paper: costPaper,
      running: costRunning,
    },
    costSetup,
    costVariable,
    totalCost: costSetup + costVariable,
    costPerUnit: Math.round((costSetup + costVariable) / quantity),
  };
}

function calcDigitalCost(params) {
  const { quantity, productW, productH, pages = 2, isColor = true, paper } = params;
  // How many product pages fit on one A3 side
  const a3W = 297, a3H = 420;
  const pagesPerA3 = calcImposition(productW, productH, a3W, a3H) * 2; // both sides
  const totalPages = quantity * pages;
  const a3Clicks = Math.ceil(totalPages / Math.max(pagesPerA3, 1));

  const clickPrice = isColor ? DIGITAL.clickPriceColor : DIGITAL.clickPriceBW;
  const costClicks = a3Clicks * clickPrice;
  const costSetup = DIGITAL.setupFee;
  const surcharge = paper.gsm > 250 ? a3Clicks * DIGITAL.paperHandlingFee : 0;
  const subtotal = Math.max(costClicks + costSetup + surcharge, DIGITAL.minCharge);

  return {
    method: "digital",
    a3Clicks,
    pagesPerA3,
    breakdown: {
      clicks: costClicks,
      setup: costSetup,
      surcharge,
    },
    costSetup,
    costVariable: costClicks + surcharge,
    totalCost: subtotal,
    costPerUnit: Math.round(subtotal / quantity),
  };
}

function calcFinishingCost(quantity, productW, productH, selectedFinishing) {
  const areaSqm = (productW / 1000) * (productH / 1000);
  let total = 0;
  const details = [];

  selectedFinishing.forEach(fId => {
    const f = FINISHING_OPTIONS.find(x => x.id === fId);
    if (!f) return;
    let cost = 0;
    if (f.pricePerSqm) {
      cost = Math.round(quantity * areaSqm * f.pricePerSqm);
    } else if (f.pricePerUnit) {
      cost = quantity * f.pricePerUnit;
    }
    const setup = f.setupFee || 0;
    total += cost + setup;
    details.push({ name: f.name, cost, setup, subtotal: cost + setup });
  });

  return { total, details };
}

function findBreakeven(params) {
  // Binary search for break-even quantity
  let low = 50, high = 10000;
  const testParams = { ...params };
  for (let i = 0; i < 20; i++) {
    const mid = Math.floor((low + high) / 2);
    testParams.quantity = mid;
    const dCost = calcDigitalCost(testParams);
    const oCost = calcOffsetCost(testParams);
    if (dCost.totalCost > oCost.totalCost) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return Math.ceil((low + high) / 2);
}

// ---- QUOTE ID GENERATOR ----
let quoteCounter = 1;
function genQuoteId() {
  const d = new Date();
  const prefix = `D2P-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}`;
  return `${prefix}-${String(quoteCounter++).padStart(4,"0")}`;
}

// ---- FORMAT HELPERS ----
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
const fmtVND = (n) => fmt(n) + " ₫";

// ---- ICONS (inline SVG) ----
const Icons = {
  printer: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  quote: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  orders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function D2PrintERP() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([
    { id: 1, name: "Công ty ABC", tier: "vvip", email: "abc@corp.vn", phone: "0901234567", quoteCount: 12 },
    { id: 2, name: "Đại lý Minh Phát", tier: "agent", email: "minhphat@dl.vn", phone: "0912345678", quoteCount: 8 },
    { id: 3, name: "Nguyễn Văn A", tier: "retail", email: "nva@gmail.com", phone: "0923456789", quoteCount: 2 },
  ]);

  const tabs = [
    { id: "calculator", name: "Tính giá", icon: Icons.printer },
    { id: "quotes", name: "Báo giá", icon: Icons.quote },
    { id: "crm", name: "Khách hàng", icon: Icons.users },
    { id: "orders", name: "Đơn hàng", icon: Icons.orders },
    { id: "analytics", name: "Phân tích", icon: Icons.chart },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "linear-gradient(145deg, #0a0e1a 0%, #111827 50%, #0f172a 100%)",
      color: "#e2e8f0",
      minHeight: "100vh",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input, select, textarea { font-family: inherit; }
        input[type="number"]::-webkit-inner-spin-button { opacity: 1; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .card {
          background: linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%);
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.4s ease;
        }
        .card-glow {
          box-shadow: 0 0 30px rgba(59,130,246,0.05), 0 4px 20px rgba(0,0,0,0.3);
        }
        .btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 14px rgba(59,130,246,0.3);
        }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(59,130,246,0.4); }
        .btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(148,163,184,0.2);
          color: #94a3b8;
        }
        .btn-outline:hover { border-color: #3b82f6; color: #3b82f6; }
        .input {
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(148,163,184,0.15);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 14px;
          width: 100%;
          transition: border-color 0.2s;
          font-family: inherit;
          outline: none;
        }
        .input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .label {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          display: block;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .tab-active {
          background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05));
          border-color: rgba(59,130,246,0.3) !important;
          color: #60a5fa !important;
        }
        .chip {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid rgba(148,163,184,0.15);
          background: rgba(15,23,42,0.4);
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .chip:hover { border-color: rgba(59,130,246,0.3); color: #cbd5e1; }
        .chip-active {
          border-color: rgba(59,130,246,0.5) !important;
          background: rgba(59,130,246,0.1) !important;
          color: #60a5fa !important;
        }
        .table-row:hover { background: rgba(59,130,246,0.05); }
        .glow-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
          margin: 20px 0;
        }
      `}</style>

      {/* HEADER */}
      <header style={{
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        background: "rgba(10,14,26,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 16, color: "white",
          }}>D2</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>D2Print ERP</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Hệ thống Quản lý In ấn
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={activeTab === t.id ? "tab-active" : ""}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 10,
                border: "1px solid transparent",
                background: "transparent", color: "#94a3b8",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.2s", fontFamily: "inherit",
              }}>
              {t.icon}
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ padding: "24px 32px", maxHeight: "calc(100vh - 73px)", overflowY: "auto" }}>
        {activeTab === "calculator" && (
          <PricingCalculator quotes={quotes} setQuotes={setQuotes} customers={customers} />
        )}
        {activeTab === "quotes" && (
          <QuotesList quotes={quotes} setQuotes={setQuotes} orders={orders} setOrders={setOrders} />
        )}
        {activeTab === "crm" && (
          <CRMPanel customers={customers} setCustomers={setCustomers} quotes={quotes} />
        )}
        {activeTab === "orders" && (
          <OrdersPanel orders={orders} setOrders={setOrders} />
        )}
        {activeTab === "analytics" && (
          <AnalyticsPanel quotes={quotes} orders={orders} />
        )}
      </main>
    </div>
  );
}

// ============================================================
// PRICING CALCULATOR TAB
// ============================================================
function PricingCalculator({ quotes, setQuotes, customers }) {
  const [productType, setProductType] = useState("namecard");
  const [printMethod, setPrintMethod] = useState("auto");
  const [colorMode, setColorMode] = useState("4c4c");
  const [paperType, setPaperType] = useState("c300");
  const [width, setWidth] = useState(90);
  const [height, setHeight] = useState(54);
  const [depth, setDepth] = useState(0);
  const [pages, setPages] = useState(2);
  const [quantities, setQuantities] = useState([200, 500, 1000, 2000]);
  const [finishing, setFinishing] = useState([]);
  const [markup, setMarkup] = useState(35);
  const [customerTier, setCustomerTier] = useState("retail");
  const [showBreakdown, setShowBreakdown] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const product = PRODUCT_TYPES.find(p => p.id === productType);
  const paper = PAPER_TYPES.find(p => p.id === paperType);

  useEffect(() => {
    if (product) {
      setWidth(product.defaultSize.w);
      setHeight(product.defaultSize.h);
      setDepth(product.defaultSize.d || 0);
      setPages(product.pages);
    }
  }, [productType]);

  const results = useMemo(() => {
    if (!paper) return [];
    return quantities.map(qty => {
      const params = { quantity: qty, productW: width, productH: height, paper, colorMode, pages };
      const digital = calcDigitalCost(params);
      const offset = calcOffsetCost(params);
      const breakeven = findBreakeven(params);
      const finishCost = calcFinishingCost(qty, width, height, finishing);

      let best;
      if (printMethod === "digital") best = digital;
      else if (printMethod === "offset") best = offset;
      else best = digital.totalCost <= offset.totalCost ? digital : offset;

      const subtotal = best.totalCost + finishCost.total;
      const markupAmt = subtotal * markup / 100;
      const tier = CUSTOMER_TIERS.find(t => t.id === customerTier);
      const discountAmt = (subtotal + markupAmt) * (tier?.discount || 0) / 100;
      const total = subtotal + markupAmt - discountAmt;

      return {
        qty,
        digital,
        offset,
        best,
        breakeven,
        finishing: finishCost,
        subtotal,
        markupAmt,
        discountAmt,
        total,
        costPerUnit: Math.round(total / qty),
      };
    });
  }, [quantities, width, height, paper, colorMode, pages, finishing, markup, customerTier, printMethod]);

  const handleSaveQuote = () => {
    const cust = customers.find(c => c.id === parseInt(selectedCustomer)) || { name: "Khách vãng lai" };
    const newQuote = {
      id: genQuoteId(),
      date: new Date().toISOString(),
      customer: cust.name,
      customerId: cust.id,
      product: product?.name,
      specs: { width, height, depth, pages, paper: paper?.name, colorMode, finishing: finishing.map(f => FINISHING_OPTIONS.find(x=>x.id===f)?.name) },
      results: results.map(r => ({ qty: r.qty, method: r.best.method, total: r.total, perUnit: r.costPerUnit })),
      status: "pending",
      markup,
      customerTier,
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, animation: "fadeIn 0.4s ease" }}>
      {/* LEFT: Input Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Product Type */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            📦 Sản phẩm
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {PRODUCT_TYPES.map(p => (
              <button key={p.id}
                className={`chip ${productType === p.id ? "chip-active" : ""}`}
                onClick={() => setProductType(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Print Method */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🖨️ Phương thức in</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "auto", name: "Tự động" },
              { id: "digital", name: "Kỹ thuật số" },
              { id: "offset", name: "Offset" },
            ].map(m => (
              <button key={m.id}
                className={`chip ${printMethod === m.id ? "chip-active" : ""}`}
                style={{ flex: 1 }}
                onClick={() => setPrintMethod(m.id)}>
                {m.name}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Màu in</label>
            <select className="input" value={colorMode} onChange={e => setColorMode(e.target.value)}>
              <option value="4c4c">4 màu 2 mặt (4C+4C)</option>
              <option value="4c1c">4 màu + 1 màu (4C+1C)</option>
              <option value="4c">4 màu 1 mặt (4C)</option>
              <option value="2c">2 màu (2C)</option>
              <option value="1c">1 màu (1C)</option>
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📐 Kích thước (mm)</h3>
          <div style={{ display: "grid", gridTemplateColumns: product?.is3D ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
            <div>
              <label className="label">Rộng</label>
              <input className="input" type="number" value={width} onChange={e => setWidth(+e.target.value)} />
            </div>
            <div>
              <label className="label">Cao</label>
              <input className="input" type="number" value={height} onChange={e => setHeight(+e.target.value)} />
            </div>
            {product?.is3D && (
              <div>
                <label className="label">Sâu</label>
                <input className="input" type="number" value={depth} onChange={e => setDepth(+e.target.value)} />
              </div>
            )}
          </div>
          {product?.hasBinding && (
            <div style={{ marginTop: 10 }}>
              <label className="label">Số trang</label>
              <input className="input" type="number" value={pages} onChange={e => setPages(+e.target.value)} step={4} min={4} />
            </div>
          )}
        </div>

        {/* Paper */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📄 Giấy</h3>
          <select className="input" value={paperType} onChange={e => setPaperType(e.target.value)}>
            {PAPER_TYPES.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {fmt(p.pricePerKg)}₫/kg</option>
            ))}
          </select>
        </div>

        {/* Finishing */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>✨ Gia công sau in</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FINISHING_OPTIONS.map(f => (
              <button key={f.id}
                className={`chip ${finishing.includes(f.id) ? "chip-active" : ""}`}
                style={{ fontSize: 12 }}
                onClick={() => setFinishing(prev =>
                  prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                )}>
                {finishing.includes(f.id) && <span style={{marginRight:4}}>✓</span>}
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Options */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>💰 Định giá</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="label">Markup (%)</label>
              <input className="input" type="number" value={markup} onChange={e => setMarkup(+e.target.value)} />
            </div>
            <div>
              <label className="label">Loại KH</label>
              <select className="input" value={customerTier} onChange={e => setCustomerTier(e.target.value)}>
                {CUSTOMER_TIERS.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (-{t.discount}%)</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">Khách hàng</label>
            <select className="input" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">— Chọn khách hàng —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RIGHT: Results Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Break-even Alert */}
        {results.length > 0 && results[0].breakeven && (
          <div className="card" style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.05))",
            border: "1px solid rgba(245,158,11,0.2)",
            padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#f59e0b" }}>Điểm hòa vốn Digital → Offset</div>
                <div style={{ fontSize: 13, color: "#fbbf24", marginTop: 2 }}>
                  Từ <strong>{fmt(results[0].breakeven)}</strong> {product?.unit || "đơn vị"} trở lên, in Offset sẽ tiết kiệm hơn Digital
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Comparison Table */}
        <div className="card card-glow">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>Bảng giá theo số lượng</h3>
            <button className="btn btn-primary" onClick={handleSaveQuote}>
              {Icons.quote} Lưu báo giá
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Số lượng", "Phương thức", "In ấn", "Gia công", "Markup", "Chiết khấu", "Tổng cộng", "Đơn giá"].map((h,i) => (
                    <th key={i} style={{
                      padding: "12px 14px", textAlign: i > 1 ? "right" : "left",
                      fontSize: 11, fontWeight: 600, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      borderBottom: "1px solid rgba(148,163,184,0.1)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.qty} className="table-row"
                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => setShowBreakdown(showBreakdown === i ? null : i)}>
                    <td style={{ padding: "14px", fontWeight: 600, fontSize: 15, color: "#f1f5f9" }}>
                      {fmt(r.qty)} <span style={{fontSize:11, color:"#64748b"}}>{product?.unit}</span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span className="badge" style={{
                        background: r.best.method === "digital" ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)",
                        color: r.best.method === "digital" ? "#a78bfa" : "#60a5fa",
                      }}>
                        {r.best.method === "digital" ? "Digital" : "Offset"}
                      </span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "right", color: "#cbd5e1", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      {fmtVND(r.best.totalCost)}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right", color: "#cbd5e1", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      {fmtVND(r.finishing.total)}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right", color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      +{fmtVND(r.markupAmt)}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right", color: "#34d399", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      {r.discountAmt > 0 ? `-${fmtVND(r.discountAmt)}` : "—"}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right", fontWeight: 700, fontSize: 15, color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmtVND(r.total)}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <span style={{
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        fontWeight: 700, fontSize: 15, fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {fmtVND(r.costPerUnit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Breakdown Detail */}
          {showBreakdown !== null && results[showBreakdown] && (
            <div style={{
              marginTop: 16, padding: 20,
              background: "rgba(15,23,42,0.5)", borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.08)",
              animation: "fadeIn 0.3s ease",
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa", marginBottom: 16 }}>
                Chi tiết giá — {fmt(results[showBreakdown].qty)} {product?.unit}
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Digital breakdown */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 10, textTransform: "uppercase" }}>
                    In Kỹ thuật số (Digital)
                  </div>
                  {Object.entries(results[showBreakdown].digital.breakdown).map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                      <span style={{color:"#94a3b8"}}>{k === "clicks" ? "Click phí" : k === "setup" ? "Phí thiết lập" : "Phụ phí giấy dày"}</span>
                      <span style={{fontFamily:"'JetBrains Mono'", fontSize: 12}}>{fmtVND(v)}</span>
                    </div>
                  ))}
                  <div className="glow-line" style={{margin:"8px 0"}}/>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14 }}>
                    <span>Tổng Digital</span>
                    <span style={{color:"#a78bfa"}}>{fmtVND(results[showBreakdown].digital.totalCost)}</span>
                  </div>
                  <div style={{fontSize:11, color:"#64748b", marginTop: 4}}>
                    {results[showBreakdown].digital.a3Clicks} click A3 × {fmtVND(DIGITAL.clickPriceColor)}/click
                  </div>
                </div>

                {/* Offset breakdown */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa", marginBottom: 10, textTransform: "uppercase" }}>
                    In Offset
                  </div>
                  <div style={{fontSize:11, color:"#64748b", marginBottom: 8}}>
                    Kẽm: {OFFSET.sheetSizes.find(s => s.id === results[showBreakdown].offset.sheet.id)?.name || "SRA3"} • {results[showBreakdown].offset.ups} up/tờ • {fmt(results[showBreakdown].offset.totalSheets)} tờ in
                  </div>
                  {Object.entries(results[showBreakdown].offset.breakdown).map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                      <span style={{color:"#94a3b8"}}>
                        {k === "plates" ? `Kẽm (${results[showBreakdown].offset.numPlates} bộ)` :
                         k === "makeready" ? "Bình bài" :
                         k === "machine" ? "Tiền máy" :
                         k === "paper" ? "Giấy" : "Công chạy"}
                      </span>
                      <span style={{fontFamily:"'JetBrains Mono'", fontSize: 12}}>{fmtVND(v)}</span>
                    </div>
                  ))}
                  <div className="glow-line" style={{margin:"8px 0"}}/>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14 }}>
                    <span>Tổng Offset</span>
                    <span style={{color:"#60a5fa"}}>{fmtVND(results[showBreakdown].offset.totalCost)}</span>
                  </div>
                  <div style={{fontSize:11, color:"#64748b", marginTop: 4}}>
                    Cố định: {fmtVND(results[showBreakdown].offset.costSetup)} • Biến đổi: {fmtVND(results[showBreakdown].offset.costVariable)}
                  </div>
                </div>
              </div>

              {/* Finishing breakdown */}
              {results[showBreakdown].finishing.details.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 10, textTransform: "uppercase" }}>
                    Gia công sau in
                  </div>
                  {results[showBreakdown].finishing.details.map((d,i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                      <span style={{color:"#94a3b8"}}>{d.name} {d.setup > 0 ? `(+setup ${fmtVND(d.setup)})` : ""}</span>
                      <span style={{fontFamily:"'JetBrains Mono'", fontSize: 12}}>{fmtVND(d.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visual Cost Comparison */}
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>So sánh Digital vs Offset</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map(r => {
              const maxCost = Math.max(r.digital.totalCost, r.offset.totalCost);
              return (
                <div key={r.qty} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{fmt(r.qty)}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        height: 20, borderRadius: 4,
                        width: `${(r.digital.totalCost / maxCost) * 100}%`,
                        background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                        transition: "width 0.5s ease",
                        minWidth: 20,
                        display: "flex", alignItems: "center", justifyContent: "flex-end",
                        paddingRight: 6, fontSize: 10, fontWeight: 600, color: "white",
                      }}>
                        {r.digital.totalCost < r.offset.totalCost ? "✦" : ""}
                      </div>
                      <span style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap" }}>
                        {fmtVND(r.digital.totalCost)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        height: 20, borderRadius: 4,
                        width: `${(r.offset.totalCost / maxCost) * 100}%`,
                        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                        transition: "width 0.5s ease",
                        minWidth: 20,
                        display: "flex", alignItems: "center", justifyContent: "flex-end",
                        paddingRight: 6, fontSize: 10, fontWeight: 600, color: "white",
                      }}>
                        {r.offset.totalCost < r.digital.totalCost ? "✦" : ""}
                      </div>
                      <span style={{ fontSize: 11, color: "#60a5fa", fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap" }}>
                        {fmtVND(r.offset.totalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8, fontSize: 12 }}>
              <span style={{ color: "#a78bfa" }}>■ Digital</span>
              <span style={{ color: "#60a5fa" }}>■ Offset</span>
              <span style={{ color: "#94a3b8" }}>✦ Tối ưu</span>
            </div>
          </div>
        </div>

        {/* Quantity Editor */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Mốc số lượng:</span>
            {quantities.map((q, i) => (
              <input key={i} className="input" type="number" value={q}
                style={{ width: 90, textAlign: "center", fontSize: 13, padding: "6px 10px" }}
                onChange={e => {
                  const nq = [...quantities];
                  nq[i] = +e.target.value;
                  setQuantities(nq);
                }} />
            ))}
            <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => setQuantities([...quantities, quantities[quantities.length-1] * 2])}>
              + Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUOTES LIST TAB
// ============================================================
function QuotesList({ quotes, setQuotes, orders, setOrders }) {
  const [selectedQuote, setSelectedQuote] = useState(null);

  const convertToOrder = (quote) => {
    const order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      quoteId: quote.id,
      customer: quote.customer,
      product: quote.product,
      specs: quote.specs,
      status: "design",
      createdAt: new Date().toISOString(),
      history: [{ status: "approved", date: new Date().toISOString(), note: "Duyệt từ báo giá" }],
      selectedQty: quote.results[0],
    };
    setOrders(prev => [order, ...prev]);
    setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: "converted" } : q));
  };

  if (quotes.length === 0) {
    return (
      <div className="card card-glow" style={{ textAlign: "center", padding: 60, animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chưa có báo giá nào</div>
        <div style={{ color: "#64748b", fontSize: 14 }}>Sử dụng công cụ Tính giá để tạo báo giá đầu tiên</div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Danh sách Báo giá ({quotes.length})</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {quotes.map((q, i) => (
          <div key={q.id} className="card card-glow" style={{
            padding: 18, cursor: "pointer",
            animation: `slideIn 0.3s ease ${i * 0.05}s both`,
            border: selectedQuote === q.id ? "1px solid rgba(59,130,246,0.3)" : undefined,
          }}
            onClick={() => setSelectedQuote(selectedQuote === q.id ? null : q.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: q.status === "converted" ? "linear-gradient(135deg, #059669, #10b981)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {q.status === "converted" ? "✅" : "📋"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{q.id}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {q.customer} • {q.product} • {new Date(q.date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'JetBrains Mono'", color: "#f1f5f9" }}>
                  {q.results.length > 0 ? fmtVND(q.results[0].total) : "—"}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {q.results.length > 0 ? `${fmt(q.results[0].qty)} ${q.results[0].method}` : ""}
                </div>
              </div>
            </div>

            {selectedQuote === q.id && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(148,163,184,0.1)", animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                  <div><span className="label">Kích thước</span><span style={{fontSize:14}}>{q.specs.width}×{q.specs.height}mm</span></div>
                  <div><span className="label">Giấy</span><span style={{fontSize:14}}>{q.specs.paper}</span></div>
                  <div><span className="label">Màu</span><span style={{fontSize:14}}>{q.specs.colorMode}</span></div>
                  <div><span className="label">Trang</span><span style={{fontSize:14}}>{q.specs.pages}</span></div>
                </div>
                {q.specs.finishing?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span className="label">Gia công</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                      {q.specs.finishing.map((f,i) => (
                        <span key={i} className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                  <thead>
                    <tr>
                      {["Số lượng", "Phương thức", "Tổng cộng", "Đơn giá"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, color: "#64748b", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {q.results.map(r => (
                      <tr key={r.qty}>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(r.qty)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <span className="badge" style={{
                            background: r.method === "digital" ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)",
                            color: r.method === "digital" ? "#a78bfa" : "#60a5fa",
                          }}>{r.method}</span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'JetBrains Mono'", fontSize: 13 }}>{fmtVND(r.total)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 600 }}>{fmtVND(r.perUnit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {q.status !== "converted" && (
                  <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); convertToOrder(q); }}>
                    ✅ Duyệt → Tạo Lệnh sản xuất
                  </button>
                )}
                {q.status === "converted" && (
                  <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "6px 14px" }}>
                    Đã chuyển thành đơn hàng
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CRM PANEL
// ============================================================
function CRMPanel({ customers, setCustomers, quotes }) {
  const [showForm, setShowForm] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", tier: "retail", email: "", phone: "" });

  const addCustomer = () => {
    if (!newCust.name.trim()) return;
    setCustomers(prev => [...prev, { ...newCust, id: Date.now(), quoteCount: 0 }]);
    setNewCust({ name: "", tier: "retail", email: "", phone: "" });
    setShowForm(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Quản lý Khách hàng ({customers.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Đóng" : "+ Thêm khách"}
        </button>
      </div>

      {showForm && (
        <div className="card card-glow" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label className="label">Tên</label>
              <input className="input" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} placeholder="Tên khách hàng" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={newCust.email} onChange={e => setNewCust({...newCust, email: e.target.value})} placeholder="email@..." />
            </div>
            <div>
              <label className="label">Điện thoại</label>
              <input className="input" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} placeholder="09..." />
            </div>
            <div>
              <label className="label">Phân loại</label>
              <select className="input" value={newCust.tier} onChange={e => setNewCust({...newCust, tier: e.target.value})}>
                {CUSTOMER_TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button className="btn btn-success" onClick={addCustomer}>Lưu</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {customers.map((c, i) => {
          const tier = CUSTOMER_TIERS.find(t => t.id === c.tier);
          const custQuotes = quotes.filter(q => q.customerId === c.id);
          return (
            <div key={c.id} className="card card-glow" style={{ animation: `slideIn 0.3s ease ${i * 0.05}s both` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `linear-gradient(135deg, ${tier?.color}33, ${tier?.color}11)`,
                  border: `1px solid ${tier?.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: tier?.color,
                }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                  <span className="badge" style={{ background: `${tier?.color}22`, color: tier?.color, marginTop: 4 }}>
                    {tier?.name} • CK {tier?.discount}%
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                <div>📧 {c.email || "—"}</div>
                <div>📱 {c.phone || "—"}</div>
                <div>📋 {custQuotes.length} báo giá</div>
                <div>💰 {custQuotes.length > 0 ? fmtVND(custQuotes.reduce((s,q) => s + (q.results[0]?.total || 0), 0)) : "—"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// ORDERS PANEL (Job Ticket / Workflow)
// ============================================================
function OrdersPanel({ orders, setOrders }) {
  const advanceStatus = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const statusIds = ORDER_STATUSES.map(s => s.id);
      const idx = statusIds.indexOf(o.status);
      if (idx < statusIds.length - 1) {
        const newStatus = statusIds[idx + 1];
        return {
          ...o,
          status: newStatus,
          history: [...o.history, { status: newStatus, date: new Date().toISOString(), note: "" }],
        };
      }
      return o;
    }));
  };

  if (orders.length === 0) {
    return (
      <div className="card card-glow" style={{ textAlign: "center", padding: 60, animation: "fadeIn 0.4s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chưa có đơn hàng</div>
        <div style={{ color: "#64748b", fontSize: 14 }}>Duyệt báo giá để tạo Lệnh sản xuất</div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Quản lý Đơn hàng ({orders.length})</h2>

      {/* Status Pipeline */}
      <div className="card card-glow" style={{ marginBottom: 24, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#94a3b8" }}>PIPELINE SẢN XUẤT</h3>
        <div style={{ display: "flex", gap: 4 }}>
          {ORDER_STATUSES.filter(s => s.id !== "quote").map(s => {
            const count = orders.filter(o => o.status === s.id).length;
            return (
              <div key={s.id} style={{
                flex: 1, padding: "12px 8px", borderRadius: 10, textAlign: "center",
                background: count > 0 ? `${s.color}15` : "rgba(15,23,42,0.3)",
                border: `1px solid ${count > 0 ? s.color + "33" : "rgba(148,163,184,0.08)"}`,
              }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginTop: 4 }}>{s.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: count > 0 ? "#f1f5f9" : "#334155", marginTop: 4 }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((o, i) => {
          const status = ORDER_STATUSES.find(s => s.id === o.status);
          const statusIdx = ORDER_STATUSES.findIndex(s => s.id === o.status);
          return (
            <div key={o.id} className="card card-glow" style={{
              padding: 20, animation: `slideIn 0.3s ease ${i * 0.05}s both`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{o.id}</span>
                    <span className="badge" style={{ background: `${status?.color}22`, color: status?.color }}>
                      {status?.icon} {status?.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    {o.customer} • {o.product} • BG: {o.quoteId}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {o.status !== "completed" && (
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}
                      onClick={() => advanceStatus(o.id)}>
                      Chuyển → {ORDER_STATUSES[statusIdx + 1]?.name || ""}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 16, display: "flex", gap: 2 }}>
                {ORDER_STATUSES.filter(s => s.id !== "quote").map((s, si) => (
                  <div key={s.id} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: si <= statusIdx - 1 ? status?.color : "rgba(148,163,184,0.1)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>

              {/* History */}
              {o.history.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {o.history.map((h, hi) => {
                    const hs = ORDER_STATUSES.find(s => s.id === h.status);
                    return (
                      <span key={hi} style={{ fontSize: 11, color: "#64748b" }}>
                        {hs?.icon} {hs?.name} ({new Date(h.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })})
                        {hi < o.history.length - 1 && <span style={{ margin: "0 4px" }}>→</span>}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS PANEL
// ============================================================
function AnalyticsPanel({ quotes, orders }) {
  const totalRevenue = quotes.reduce((s, q) => s + (q.results[0]?.total || 0), 0);
  const digitalCount = quotes.filter(q => q.results.some(r => r.method === "digital")).length;
  const offsetCount = quotes.filter(q => q.results.some(r => r.method === "offset")).length;
  const conversionRate = quotes.length > 0 ? Math.round(orders.length / quotes.length * 100) : 0;

  const stats = [
    { label: "Tổng báo giá", value: quotes.length, icon: "📋", color: "#3b82f6" },
    { label: "Đơn hàng", value: orders.length, icon: "📦", color: "#10b981" },
    { label: "Tỷ lệ chuyển đổi", value: `${conversionRate}%`, icon: "📈", color: "#f59e0b" },
    { label: "Doanh thu dự kiến", value: fmtVND(totalRevenue), icon: "💰", color: "#8b5cf6" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Phân tích & Thống kê</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="card card-glow" style={{ animation: `slideIn 0.3s ease ${i * 0.08}s both` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${s.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono'" }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Phương thức in</h3>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 120, height: 120, position: "relative" }}>
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3"
                  strokeDasharray={`${(digitalCount / Math.max(quotes.length, 1)) * 100} 100`} strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                  strokeDasharray={`${(offsetCount / Math.max(quotes.length, 1)) * 100} 100`}
                  strokeDashoffset={`-${(digitalCount / Math.max(quotes.length, 1)) * 100}`} strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#8b5cf6" }} />
                <span style={{ fontSize: 14 }}>Digital: {digitalCount}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#3b82f6" }} />
                <span style={{ fontSize: 14 }}>Offset: {offsetCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-glow">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Trạng thái đơn hàng</h3>
          {ORDER_STATUSES.filter(s => s.id !== "quote").map(s => {
            const count = orders.filter(o => o.status === s.id).length;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16, width: 28 }}>{s.icon}</span>
                <span style={{ fontSize: 13, width: 100, color: "#94a3b8" }}>{s.name}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: s.color,
                    width: `${(count / Math.max(orders.length, 1)) * 100}%`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, width: 24, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Schema Info */}
      <div className="card" style={{ marginTop: 16, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📊 Sơ đồ Dữ liệu Hệ thống</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { name: "Customers", fields: "id, name, tier, email, phone, history[]", color: "#3b82f6" },
            { name: "Quotes", fields: "id, date, customer, product, specs{}, results[], status", color: "#8b5cf6" },
            { name: "Orders", fields: "id, quoteId, customer, status, history[], specs{}", color: "#10b981" },
            { name: "Products", fields: "id, name, defaultSize{}, pages, binding, unit", color: "#f59e0b" },
          ].map(t => (
            <div key={t.name} style={{
              padding: 14, borderRadius: 10,
              background: `${t.color}08`, border: `1px solid ${t.color}22`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: t.color, marginBottom: 6 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono'", lineHeight: 1.6 }}>{t.fields}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
