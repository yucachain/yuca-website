import fs from 'fs';
import path from 'path';

const dataFilePath = path.resolve('app/data/registered_live_data.json');
const raw = fs.readFileSync(dataFilePath, 'utf8');
const data = JSON.parse(raw);

// 1. Define Ido, Oyo Processors and Farmers
const idoProcessors = [
  {
    idNumber: 'YC-PRS-0026',
    name: 'Dayo Adeyinka',
    role: 'Buyer / Processor',
    phone: '07079398917',
    password: 'Dayo@#11',
    bankName: 'Opay',
    accountNumber: '07079398917',
    accountHolder: 'Dayo Adeyinka',
    price: 120000,
    location: 'Ido, Oyo',
    email: '07079398917@yucachain.com',
  },
];

const idoFarmers = [
  {
    idNumber: 'YC-FRM-0048',
    name: 'Fabian Okeke',
    role: 'Farmer',
    phone: '07087051577',
    password: 'Fabian@#11',
    bankName: 'Opay',
    accountNumber: '07087051577',
    accountHolder: 'Fabian Okeke',
    price: 100000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'fabianokeke67@gmail.com',
  },
  {
    idNumber: 'YC-FRM-0049',
    name: 'Oyetunji folake',
    role: 'Farmer',
    phone: '08036863062',
    password: 'Oyetunji@#11',
    bankName: 'Opay',
    accountNumber: '08036863062',
    accountHolder: 'Oyetunji folake',
    price: 90000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'folaoye288@gmail.com',
  },
  {
    idNumber: 'YC-FRM-0050',
    name: 'Kazeem Sikiru',
    role: 'Farmer',
    phone: '08161294125',
    password: 'Kazeem@#11',
    bankName: 'Opay',
    accountNumber: '08161294125',
    accountHolder: 'Kazeem Sikiru',
    price: 120000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'sikirukazeem220@gmail.com',
  },
  {
    idNumber: 'YC-FRM-0051',
    name: 'Sule yusuph',
    role: 'Farmer',
    phone: '09032212516',
    password: 'Sule@#11',
    bankName: 'Opay',
    accountNumber: '09032212516',
    accountHolder: 'Sule yusuph',
    price: 85000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'munirudenajanga@gmail.com',
  },
  {
    idNumber: 'YC-FRM-0052',
    name: 'Oyeniyi Tayo',
    role: 'Farmer',
    phone: '07019004103',
    password: 'Oyeniyi@#11',
    bankName: 'Opay',
    accountNumber: '07019004103',
    accountHolder: 'Oyeniyi Tayo',
    price: 110000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'oyeniyitayo36@gmail.com',
  },
  {
    idNumber: 'YC-FRM-0062',
    name: 'Falade Gabriel Olaoluwa',
    role: 'Farmer',
    phone: '07058080291',
    password: 'Falade@#11',
    bankName: 'Opay',
    accountNumber: '07058080291',
    accountHolder: 'Falade Gabriel Olaoluwa',
    price: 115000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: '07058080291@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0063',
    name: 'Oyadele olaoluwa ayodele',
    role: 'Farmer',
    phone: '08081794994',
    password: 'Oyadele@#11',
    bankName: 'Opay',
    accountNumber: '08081794994',
    accountHolder: 'Oyadele olaoluwa ayodele',
    price: 130000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'ronaldosamluv@gmail.com',
  },
];

// Merge into processors
idoProcessors.forEach((p) => {
  const existingIdx = data.processors.findIndex((x) => x.idNumber === p.idNumber);
  if (existingIdx >= 0) {
    data.processors[existingIdx] = { ...data.processors[existingIdx], ...p };
  } else {
    data.processors.push(p);
  }
});

// Merge into farmers
idoFarmers.forEach((f) => {
  const existingIdx = data.farmers.findIndex((x) => x.idNumber === f.idNumber);
  if (existingIdx >= 0) {
    data.farmers[existingIdx] = { ...data.farmers[existingIdx], ...f };
  } else {
    data.farmers.push(f);
  }
});

// Update registry map
if (!data.registry) data.registry = {};
[...idoProcessors, ...idoFarmers].forEach((u) => {
  data.registry[u.phone] = u.idNumber;
  data.registry[u.name.toLowerCase().trim()] = u.idNumber;
  if (u.email) data.registry[u.email.toLowerCase().trim()] = u.idNumber;
  data.registry[u.idNumber.toLowerCase()] = u.idNumber;
});

// 2. Generate 20 Transactions carrying Today's Date (Nov 9, 2026)
// Using mixed non-cyclic varieties and Opay bank details
const varietiesList = [
  'TME 419 (Industrial High-Starch)',
  'Yellow Cassava (TMS 01/1368 Pro-Vitamin A)',
  'TMS 98/0581 (Premium Processing)',
  'Farmer\'s Pride (TMS 96/1089A)',
  'NR 8082 (Flour Grade Elite)',
  'TMS 30572 (High Dry Matter & Yield)',
  'IITA-TMS-IBA000070 (Super Yield)',
  'Oba 98 (Special High-Starch)',
  'TMS 96/1632 (Industrial Flour Grade)',
  'Game-Changer (TMEB693 High-Density)',
  'TMS 98/0505 (Disease Resistant)',
  'TMS 07/0593 (Sunshine White Root)',
  'NR 87184 (Fufu & Wet Paste Spec)',
  'TMS 92/0326 (Premium Garri Spec)',
  'TMS 98/0002 (Drought Tolerant)',
  'CR 36-5 (Sweet Tuber Variety)',
  'TMS 95/0289 (Early Maturing)',
  'TMS 91/02324 (High Root Density)',
  'TMS 97/2205 (Starch & Chips Spec)',
  'IITA-TMS-IBA980581 (Commercial Tuber)',
];

// Available buyers to pair with the farmers (including Ido processor Dayo Adeyinka and other verified processors)
const buyerPool = [
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0001', name: 'Ramota Rasheed', id: 'usr_Processor_1' },
  { idNumber: 'YC-PRS-0002', name: 'Hassanat Jimoh', id: 'usr_Processor_2' },
  { idNumber: 'YC-PRS-0003', name: 'Mulika Essa', id: 'usr_Processor_3' },
  { idNumber: 'YC-PRS-0023', name: 'Afusat Isiaka', id: 'usr_Processor_23' },
  { idNumber: 'YC-PRS-0005', name: 'Salima Gani', id: 'usr_Processor_5' },
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0010', name: 'Falilat Abdulrahman', id: 'usr_Processor_10' },
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0015', name: 'Bashirat Yunusa', id: 'usr_Processor_15' },
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0020', name: 'Rofiat Sulaiman', id: 'usr_Processor_20' },
  { idNumber: 'YC-PRS-0021', name: 'Rafatu Garuba', id: 'usr_Processor_21' },
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0008', name: 'Hamdalat Jimoh', id: 'usr_Processor_8' },
  { idNumber: 'YC-PRS-0012', name: 'Muibat Ganiyu', id: 'usr_Processor_12' },
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0004', name: 'Sikirat Isiaka', id: 'usr_Processor_4' },
  { idNumber: 'YC-PRS-0026', name: 'Dayo Adeyinka', id: 'usr_Processor_26' },
  { idNumber: 'YC-PRS-0025', name: 'Muslimat Lukmon', id: 'usr_Processor_25' },
];

const new20Orders = [];
const times = [
  '08:15 AM', '08:45 AM', '09:10 AM', '09:35 AM', '10:00 AM',
  '10:25 AM', '10:50 AM', '11:15 AM', '11:40 AM', '12:05 PM',
  '12:35 PM', '01:00 PM', '01:25 PM', '01:50 PM', '02:15 PM',
  '02:40 PM', '03:05 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const quantities = [0.015, 0.02, 0.025, 0.018, 0.03, 0.022, 0.016, 0.028, 0.035, 0.02, 0.024, 0.018, 0.03, 0.022, 0.015, 0.025, 0.02, 0.032, 0.019, 0.027];
const amounts = [45000, 60000, 75000, 54000, 90000, 66000, 48000, 84000, 105000, 60000, 72000, 54000, 90000, 66000, 45000, 75000, 60000, 96000, 57000, 81000];

for (let i = 0; i < 20; i++) {
  const farmer = idoFarmers[i % idoFarmers.length];
  const buyer = buyerPool[i];
  const orderNum = `ORD-${100180 + i}`;
  const variety = varietiesList[i % varietiesList.length];
  const lotNum = `Lot YC-2026-${String(81 + i).padStart(2, '0')}`;
  const isPaid = i % 2 === 0;

  new20Orders.push({
    id: `ord-1794226800000-${i + 1}`,
    orderNumber: orderNum,
    productTitle: `Fresh Cassava Roots (${variety}) - ${lotNum}`,
    category: 'Produce',
    sellerName: farmer.name,
    sellerRole: 'farmer',
    sellerId: `usr_Farmer_${farmer.idNumber.slice(-4)}`,
    sellerIdNumber: farmer.idNumber,
    buyerName: buyer.name,
    buyerRole: 'processor',
    buyerId: buyer.id,
    buyerIdNumber: buyer.idNumber,
    quantity: quantities[i],
    unit: 'Tonnes',
    totalAmount: amounts[i],
    date: `Nov 9, 2026. ${times[i]}`,
    deliveryMethod: 'direct-delivery',
    paymentMethod: 'bank-transfer',
    paymentStatus: 'Paid to YucaChain Escrow',
    payoutStatus: isPaid ? 'Paid / Disbursed' : 'Pending Admin Payout',
    payoutDate: isPaid ? `Nov 9, 2026. ${times[i]}` : undefined,
    sellerBankDetails: {
      bankName: 'Opay',
      accountNumber: farmer.phone,
      accountName: farmer.name,
    },
  });
}

// Keep original 80 orders and append the new 20 orders (total = 100)
// Filter out any existing ord with orderNumber in range ORD-100180..ORD-100199 first
data.orders = [
  ...data.orders.filter((o) => !o.orderNumber?.startsWith('ORD-10018') && !o.orderNumber?.startsWith('ORD-10019')),
  ...new20Orders,
];

// 3. Demo Batches for the Marketplace from Ido Farmers
const batchImages = [
  ['/images/batches/Batch1.png', '/images/batches/Batch2.png'],
  ['/images/batches/Batch2.png', '/images/batches/Batch3.png'],
  ['/images/batches/Batch3.png', '/images/batches/Batch4.png'],
  ['/images/batches/Batch4.png', '/images/batches/Batch1.png'],
  ['/images/trade-cassava.png', '/images/batches/Batch1.png'],
  ['/images/batches/Batch1.png', '/images/batches/Batch3.png'],
  ['/images/batches/Batch2.png', '/images/trade-cassava.png'],
];

data.batches = idoFarmers.map((farmer, idx) => ({
  id: `bch-ido-${farmer.idNumber.toLowerCase()}`,
  batchCode: `BCH-IDO-${farmer.idNumber.slice(-4)}`,
  title: `Fresh Cassava Roots (${varietiesList[idx % varietiesList.length]})`,
  variety: varietiesList[idx % varietiesList.length],
  grade: idx % 2 === 0 ? 'A' : 'B',
  qualityGrade: idx % 2 === 0 ? 'A' : 'B',
  quantity: 20 + idx * 5,
  unit: 'Tonnes',
  weightKg: (20 + idx * 5) * 1000,
  pricePerTonne: farmer.price || 120000,
  currency: '₦',
  category: 'raw-cassava',
  location: 'Ido, Oyo State',
  storageLocation: 'Ido YucaVault Regional Center',
  farmerName: farmer.name,
  farmerIdNumber: farmer.idNumber,
  seller: `${farmer.name} (${farmer.idNumber})`,
  sellerRole: 'farmer',
  storageTime: 'Freshly Harvested',
  temperatureC: 24,
  humidityPercent: 55,
  isNew: true,
  description: `Premium harvested cassava roots certified at Ido Local Government Agro-Hub. Verified starch content and disease resistant.`,
  photos: batchImages[idx % batchImages.length],
  images: batchImages[idx % batchImages.length],
}));

fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

console.log('--- Successfully Updated registered_live_data.json ---');
console.log('Total Processors:', data.processors.length);
console.log('Total Farmers:', data.farmers.length);
console.log('Total Orders:', data.orders.length);
console.log('Total Demo Batches:', data.batches.length);

