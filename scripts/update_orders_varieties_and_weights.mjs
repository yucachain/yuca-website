import fs from 'fs';
import path from 'path';

const filePath = path.resolve('app/data/registered_live_data.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

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

// 29 distinct times distributed throughout TODAY (Oct 27, 2026)
const TODAY_ORDER_TIMES = [
  "Oct 27, 2026. 08:05 AM",
  "Oct 27, 2026. 08:22 AM",
  "Oct 27, 2026. 08:40 AM",
  "Oct 27, 2026. 08:58 AM",
  "Oct 27, 2026. 09:15 AM",
  "Oct 27, 2026. 09:32 AM",
  "Oct 27, 2026. 09:48 AM",
  "Oct 27, 2026. 10:05 AM",
  "Oct 27, 2026. 10:20 AM",
  "Oct 27, 2026. 10:38 AM",
  "Oct 27, 2026. 10:55 AM",
  "Oct 27, 2026. 11:12 AM",
  "Oct 27, 2026. 11:28 AM",
  "Oct 27, 2026. 11:45 AM",
  "Oct 27, 2026. 12:05 PM",
  "Oct 27, 2026. 12:20 PM",
  "Oct 27, 2026. 12:38 PM",
  "Oct 27, 2026. 12:55 PM",
  "Oct 27, 2026. 01:10 PM",
  "Oct 27, 2026. 01:25 PM",
  "Oct 27, 2026. 01:42 PM",
  "Oct 27, 2026. 01:58 PM",
  "Oct 27, 2026. 02:12 PM",
  "Oct 27, 2026. 02:25 PM",
  "Oct 27, 2026. 02:40 PM",
  "Oct 27, 2026. 02:52 PM",
  "Oct 27, 2026. 03:02 PM",
  "Oct 27, 2026. 03:10 PM",
  "Oct 27, 2026. 03:15 PM"
];

console.log("Updating all 29 orders to TODAY's date (Oct 27, 2026) with distinct AM/PM times...");

data.orders = data.orders.map((order, idx) => {
  const variety = VARIETIES[idx % VARIETIES.length];
  const lotNumber = String(idx + 1).padStart(2, '0');
  const totalAmount = Number(order.totalAmount) || 30000;
  
  // 1 kg = 2500 NGN
  const totalKg = Math.round(totalAmount / 2500);
  // Convert kg to Tonnes (1 Tonne = 1000 kg)
  const tonnes = Number((totalKg / 1000).toFixed(3));
  
  const productTitle = `Fresh Cassava Roots (${variety}) - Lot YC-2026-${lotNumber}`;
  const dateWithTime = TODAY_ORDER_TIMES[idx] || "Oct 27, 2026. 12:20 PM";

  return {
    ...order,
    productTitle,
    quantity: tonnes,
    unit: "Tonnes",
    date: dateWithTime,
    payoutDate: order.payoutStatus === "Paid / Disbursed" ? "Oct 27, 2026. 03:25 PM" : order.payoutDate,
  };
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log("Updated 29 orders to TODAY successfully! Sample output:");
data.orders.slice(0, 5).forEach((o, i) => {
  console.log(`Order ${i + 1} (${o.orderNumber}): Date: ${o.date} | ${o.productTitle} | ₦${o.totalAmount.toLocaleString()} | Qty: ${o.quantity} ${o.unit}`);
});
