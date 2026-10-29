import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('app/data/registered_live_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const VARIETIES = [
  "TME 419 (Industrial High-Starch)",
  "TMS 30572 (High Dry Matter)",
  "Yellow Cassava (TMS 01/1368 Vitamin A)",
  "TMS 98/0505 (Disease Resistant)",
  "NR 8082 (Flour Grade Elite)",
  "TMS 98/0581 (Premium Processing)",
  "Farmer's Pride (TMS 96/1089A)",
  "TMS 07/0593 (Sunshine White Root)",
  "Game-Changer (TMEB693 High-Density)",
  "Oba 98 (Special High-Starch)"
];

// Historical order times on Oct 27, 2026 (29 orders)
const OCT_27_TIMES = [
  "Oct 27, 2026. 08:05 AM", "Oct 27, 2026. 08:20 AM", "Oct 27, 2026. 08:35 AM",
  "Oct 27, 2026. 08:50 AM", "Oct 27, 2026. 09:05 AM", "Oct 27, 2026. 09:20 AM",
  "Oct 27, 2026. 09:35 AM", "Oct 27, 2026. 09:50 AM", "Oct 27, 2026. 10:05 AM",
  "Oct 27, 2026. 10:20 AM", "Oct 27, 2026. 10:35 AM", "Oct 27, 2026. 10:50 AM",
  "Oct 27, 2026. 11:05 AM", "Oct 27, 2026. 11:20 AM", "Oct 27, 2026. 11:35 AM",
  "Oct 27, 2026. 11:50 AM", "Oct 27, 2026. 12:05 PM", "Oct 27, 2026. 12:20 PM",
  "Oct 27, 2026. 12:35 PM", "Oct 27, 2026. 12:50 PM", "Oct 27, 2026. 01:10 PM",
  "Oct 27, 2026. 01:30 PM", "Oct 27, 2026. 01:50 PM", "Oct 27, 2026. 02:10 PM",
  "Oct 27, 2026. 02:25 PM", "Oct 27, 2026. 02:40 PM", "Oct 27, 2026. 02:55 PM",
  "Oct 27, 2026. 03:05 PM", "Oct 27, 2026. 03:15 PM"
];

// Today's order times on Oct 29, 2026 (51 orders)
function generateOct29Times(count) {
  const times = [];
  // From 08:10 AM to 11:45 AM (or into early afternoon)
  const startMins = 8 * 60 + 10; // 490 mins (08:10)
  const endMins = 12 * 60 + 30;  // 750 mins (12:30)
  const step = (endMins - startMins) / (count - 1);

  for (let i = 0; i < count; i++) {
    const totalMin = Math.round(startMins + i * step);
    const h24 = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
    times.push(`Oct 29, 2026. ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`);
  }
  return times;
}

const OCT_29_TIMES = generateOct29Times(51);

const allFarmers = data.farmers;
const allProcessors = data.processors;

// Update farmer records: new farmers (30-47) have joinedDate: "Oct 29, 2026"
allFarmers.forEach((f, idx) => {
  if (idx >= 29) {
    f.joinedDate = "Oct 29, 2026";
  } else {
    f.joinedDate = f.joinedDate || "Oct 19, 2026";
  }
});

// Build 80 orders:
// - Orders 0 to 28 (29 orders): from Oct 27, 2026, using original farmers (0 to 28)
// - Orders 29 to 79 (51 orders): from Oct 29, 2026 (TODAY!), featuring ALL 18 newly registered farmers (29 to 46) + repeats

const orders = [];
const processorCounts = new Array(25).fill(0);
const usedPairs = new Set();

// 1. OCT 27 ORDERS (29 orders)
// Farmer 0 (YC-FRM-0001) sells to Processor 12 (YC-PRS-0013) as requested
for (let i = 0; i < 29; i++) {
  const fIdx = i; // Farmer 0..28
  const farmer = allFarmers[fIdx];
  const fNum = parseInt(farmer.idNumber.slice(-4), 10);

  // Pick processor
  let pIdx = (12 + i * 7) % 25;
  if (parseInt(allProcessors[pIdx].idNumber.slice(-4), 10) === fNum) {
    pIdx = (pIdx + 3) % 25;
  }
  const processor = allProcessors[pIdx];
  processorCounts[pIdx]++;
  usedPairs.add(`p${pIdx}_f${fIdx}`);

  const orderNum = `ORD-${String(100100 + i)}`;
  const variety = VARIETIES[i % VARIETIES.length];
  const lotNum = String(i + 1).padStart(2, '0');
  const totalAmount = farmer.price || 100000;
  const totalKg = Math.round(totalAmount / 2500);
  const quantity = Number((totalKg / 1000).toFixed(3));

  // Completed on 27th: 80% paid/disbursed on Oct 27
  const isPaid = i % 4 !== 1;
  const orderDate = OCT_27_TIMES[i];
  const payoutDate = isPaid ? "Oct 27, 2026. 03:25 PM" : undefined;

  orders.push({
    id: `ord-1793102581535-${i}`,
    orderNumber: orderNum,
    productTitle: `Fresh Cassava Roots (${variety}) - Lot YC-2026-${lotNum}`,
    category: "Produce",
    sellerName: farmer.name,
    sellerRole: "farmer",
    sellerId: farmer.id || farmer.userId || `usr_Farmer_${fIdx + 1}`,
    sellerIdNumber: farmer.idNumber,
    buyerName: processor.name,
    buyerRole: "processor",
    buyerId: processor.id || processor.userId || `usr_Processor_${pIdx + 1}`,
    buyerIdNumber: processor.idNumber,
    quantity,
    unit: "Tonnes",
    totalAmount,
    date: orderDate,
    deliveryMethod: "direct-delivery",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: isPaid ? "Paid / Disbursed" : "Pending Admin Payout",
    payoutDate,
    sellerBankDetails: {
      bankName: farmer.bankName || "Commercial Bank",
      accountNumber: farmer.accountNumber || "",
      accountName: farmer.accountHolder || farmer.name,
    },
  });
}

// 2. OCT 29 ORDERS (TODAY! 51 orders: index 29 to 79)
// Every new farmer (fIdx 29 to 46: 18 farmers) MUST appear!
// Let's create farmer list for these 51 orders:
// First: all 18 new farmers (29..46)
// Second: all 18 new farmers again for a 2nd lot (29..46)
// Third: 15 active co-op farmers (0..14) selling fresh lots today
// Total = 18 + 18 + 15 = 51 orders!
const oct29Farmers = [];
for (let f = 29; f < 47; f++) oct29Farmers.push(f); // 18
for (let f = 29; f < 47; f++) oct29Farmers.push(f); // 18
for (let f = 0; f < 15; f++) oct29Farmers.push(f);  // 15
// Total = 51

// Shuffle/interleave oct29Farmers so farmers are nicely distributed
const interleavedFarmers = [];
for (let i = 0; i < 51; i++) {
  const pick = (i * 11) % 51;
  interleavedFarmers.push(oct29Farmers[pick]);
}

for (let i = 0; i < 51; i++) {
  const oIdx = 29 + i;
  const fIdx = interleavedFarmers[i];
  const farmer = allFarmers[fIdx];
  const fNum = parseInt(farmer.idNumber.slice(-4), 10);

  // Find processor with lowest count that doesn't match ID
  let candidatePIdx = -1;
  let minCount = Infinity;
  for (let attempt = 0; attempt < 25; attempt++) {
    const pIdx = (i * 3 + attempt * 5) % 25;
    const pNum = parseInt(allProcessors[pIdx].idNumber.slice(-4), 10);
    if (fNum === pNum) continue;

    const pairKey = `p${pIdx}_f${fIdx}`;
    if (!usedPairs.has(pairKey) && processorCounts[pIdx] < minCount) {
      minCount = processorCounts[pIdx];
      candidatePIdx = pIdx;
    }
  }

  if (candidatePIdx === -1) {
    for (let p = 0; p < 25; p++) {
      const pNum = parseInt(allProcessors[p].idNumber.slice(-4), 10);
      if (fNum !== pNum) {
        candidatePIdx = p;
        break;
      }
    }
  }

  const processor = allProcessors[candidatePIdx];
  processorCounts[candidatePIdx]++;
  usedPairs.add(`p${candidatePIdx}_f${fIdx}`);

  const orderNum = `ORD-${String(100100 + oIdx)}`;
  const variety = VARIETIES[oIdx % VARIETIES.length];
  const lotNum = String(oIdx + 1).padStart(2, '0');
  const totalAmount = farmer.price || 100000;
  const totalKg = Math.round(totalAmount / 2500);
  const quantity = Number((totalKg / 1000).toFixed(3));

  // Today's orders: 50% paid/disbursed today, 50% pending payout
  const isPaid = i % 2 === 0;
  const orderDate = OCT_29_TIMES[i];
  const payoutDate = isPaid ? "Oct 29, 2026. 11:20 AM" : undefined;

  orders.push({
    id: `ord-1793260000000-${oIdx}`,
    orderNumber: orderNum,
    productTitle: `Fresh Cassava Roots (${variety}) - Lot YC-2026-${lotNum}`,
    category: "Produce",
    sellerName: farmer.name,
    sellerRole: "farmer",
    sellerId: farmer.id || farmer.userId || `usr_Farmer_${fIdx + 1}`,
    sellerIdNumber: farmer.idNumber,
    buyerName: processor.name,
    buyerRole: "processor",
    buyerId: processor.id || processor.userId || `usr_Processor_${candidatePIdx + 1}`,
    buyerIdNumber: processor.idNumber,
    quantity,
    unit: "Tonnes",
    totalAmount,
    date: orderDate,
    deliveryMethod: "direct-delivery",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: isPaid ? "Paid / Disbursed" : "Pending Admin Payout",
    payoutDate,
    sellerBankDetails: {
      bankName: farmer.bankName || "Commercial Bank",
      accountNumber: farmer.accountNumber || "",
      accountName: farmer.accountHolder || farmer.name,
    },
  });
}

// Verification
let matchingSuffixCount = 0;
let oct27Count = 0;
let oct29Count = 0;
const newFarmerOrdersCount = new Map();

orders.forEach((o) => {
  if (o.sellerIdNumber.slice(-4) === o.buyerIdNumber.slice(-4)) {
    matchingSuffixCount++;
  }
  if (o.date.includes("Oct 27")) oct27Count++;
  if (o.date.includes("Oct 29")) oct29Count++;

  const fNum = parseInt(o.sellerIdNumber.slice(-4), 10);
  if (fNum >= 30) {
    newFarmerOrdersCount.set(o.sellerIdNumber, (newFarmerOrdersCount.get(o.sellerIdNumber) || 0) + 1);
    // CRITICAL: verify all new farmers have Oct 29 date!
    if (!o.date.includes("Oct 29")) {
      console.error(`ERROR: New farmer ${o.sellerIdNumber} has wrong date: ${o.date}`);
    }
  }
});

console.log(`\n--- VERIFICATION RESULTS ---`);
console.log(`Total orders: ${orders.length}`);
console.log(`Oct 27 orders (completed on 27th): ${oct27Count}`);
console.log(`Oct 29 orders (TODAY!): ${oct29Count}`);
console.log(`Matching suffix pairs: ${matchingSuffixCount}`);
console.log(`New farmers (30-47) with orders today: ${newFarmerOrdersCount.size} / 18`);

// Save updated data
data.farmers = allFarmers;
data.orders = orders;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n>>> SUCCESSFULLY UPDATED ${dataPath} WITH REALISTIC DATES!`);

