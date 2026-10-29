import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.yucachain.com';

const newFarmersRaw = [
  {
    name: 'Saliman Azeezah Adio',
    firstName: 'Saliman',
    otherName: 'Azeezah Adio',
    phone: '09049240309',
    bankAccount: '9049240309',
    bankName: 'Moniepoint',
    accountHolder: 'Saliman Azeezah Adio',
    price: 100000,
    location: 'Owode',
  },
  {
    name: 'Lukman Mansura Abike',
    firstName: 'Lukman',
    otherName: 'Mansura Abike',
    phone: '08052930411',
    bankAccount: '8052930411',
    bankName: 'Moniepoint',
    accountHolder: 'Lukman Mansura Abike',
    price: 120000,
    location: 'Owode',
  },
  {
    name: 'Lukman Memunat Moturayo',
    firstName: 'Lukman',
    otherName: 'Memunat Moturayo',
    phone: '09074193691',
    bankAccount: '9074193691',
    bankName: 'Moniepoint',
    accountHolder: 'Lukman Memunat Moturayo',
    price: 90000,
    location: 'Owode',
  },
  {
    name: 'Abdul Azeez Salaudeen',
    firstName: 'Abdul Azeez',
    otherName: 'Salaudeen',
    phone: '09015065719',
    bankAccount: '9015065719',
    bankName: 'Opay',
    accountHolder: 'Abdul Azeez Salaudeen',
    price: 140000,
    location: 'Owode',
  },
  {
    name: 'Sakariya Abdu Roheem',
    firstName: 'Sakariya',
    otherName: 'Abdu Roheem',
    phone: '08027284090',
    bankAccount: '3238106133',
    bankName: 'First Bank',
    accountHolder: 'Sakariya Abdu Roheem',
    price: 80000,
    location: 'Owode',
  },
  {
    name: 'Saliman Awawu',
    firstName: 'Saliman',
    otherName: 'Awawu',
    phone: '07018551905',
    bankAccount: '7018551905',
    bankName: 'Opay',
    accountHolder: 'Saliman Awawu',
    price: 100000,
    location: 'Owode',
  },
  {
    name: 'AbdulKareem Awawu Ajoke',
    firstName: 'AbdulKareem',
    otherName: 'Awawu Ajoke',
    phone: '07018551905',
    authPhone: '07018551906', // Backend unique phone
    bankAccount: '7018551905',
    bankName: 'Opay',
    accountHolder: 'AbdulKareem Awawu Ajoke',
    price: 120000,
    location: 'Owode',
  },
  {
    name: 'Saliman Awawu',
    firstName: 'Saliman',
    otherName: 'Awawu',
    phone: '08129845388',
    bankAccount: '3164674731',
    bankName: 'First Bank',
    accountHolder: 'Saliman Awawu',
    price: 110000,
    location: 'Owode',
  },
  {
    name: 'Isiaka Alimotu',
    firstName: 'Isiaka',
    otherName: 'Alimotu',
    phone: '09040991752',
    bankAccount: '9022544369',
    bankName: 'Opay',
    accountHolder: 'Isiaka Alimotu',
    price: 100000,
    location: 'Owode',
  },
  {
    name: 'Isiaka Garuba',
    firstName: 'Isiaka',
    otherName: 'Garuba',
    phone: '08081672243',
    bankAccount: '8081672243',
    bankName: 'Opay',
    accountHolder: 'Isiaka Garuba',
    price: 80000,
    location: 'Owode',
  },
  {
    name: 'Roheemat Isiaka',
    firstName: 'Roheemat',
    otherName: 'Isiaka',
    phone: '08102602588',
    bankAccount: '8025746039',
    bankName: 'Opay',
    accountHolder: 'Roheemat Isiaka',
    price: 140000,
    location: 'Owode',
  },
  {
    name: 'Fasasi Adio',
    firstName: 'Fasasi',
    otherName: 'Adio',
    phone: '07086843526',
    bankAccount: '7086843526',
    bankName: 'Moniepoint',
    accountHolder: 'Fasasi Adio',
    price: 90000,
    location: 'Owode',
  },
  {
    name: 'Abdul Qudus Fasasi',
    firstName: 'Abdul Qudus',
    otherName: 'Fasasi',
    phone: '08087315328',
    bankAccount: '8087315328',
    bankName: 'Opay',
    accountHolder: 'Abdul Qudus Fasasi',
    price: 120000,
    location: 'Owode',
  },
  {
    name: 'Marufu Karima',
    firstName: 'Marufu',
    otherName: 'Karima',
    phone: '09132372475',
    bankAccount: '9132372475',
    bankName: 'Opay',
    accountHolder: 'Marufu Karima',
    price: 100000,
    location: 'Owode',
  },
  {
    name: 'Risikatu Ismail Ajoke',
    firstName: 'Risikatu',
    otherName: 'Ismail Ajoke',
    phone: '07087617872',
    bankAccount: '7087617872',
    bankName: 'Opay',
    accountHolder: 'Risikatu Ismail Ajoke',
    price: 105000,
    location: 'Owode',
  },
  {
    name: 'Ismail Ajadi Umaru',
    firstName: 'Ismail',
    otherName: 'Ajadi Umaru',
    phone: '07083073611',
    bankAccount: '2378902209',
    bankName: 'Zenith',
    accountHolder: 'Ismail Ajadi Umaru',
    price: 140000,
    location: 'Owode',
  },
  {
    name: 'Rofiat Anike Ayuba',
    firstName: 'Rofiat',
    otherName: 'Anike Ayuba',
    phone: '09112852052',
    bankAccount: '9112852052',
    bankName: 'Opay',
    accountHolder: 'Rofiat Anike Ayuba',
    price: 80000,
    location: 'Owode',
  },
  {
    name: 'Wasiu Sakariya',
    firstName: 'Wasiu',
    otherName: 'Sakariya',
    phone: '07076725486',
    bankAccount: '7076725486',
    bankName: 'Moniepoint',
    accountHolder: 'Wasiu Sakariya',
    price: 120000,
    location: 'Owode',
  },
];

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

function sanitizePhone(p) {
  let clean = p.replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '0' + clean;
  return clean;
}

async function registerOrLoginFarmer(farmer, farmerIndex) {
  const cleanPhone = sanitizePhone(farmer.phone);
  const regPhone = farmer.authPhone ? sanitizePhone(farmer.authPhone) : cleanPhone;
  const password = `${farmer.firstName.replace(/\s+/g, '')}@#11`;
  const email = `${farmer.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${farmer.otherName.toLowerCase().replace(/[^a-z0-9]/g, '')}${farmerIndex}@yucachain.com`;

  const regBody = {
    Role: 'Farmer',
    FullName: farmer.name,
    FirstName: farmer.firstName,
    LastName: farmer.otherName,
    PhoneNumber: regPhone,
    Email: email,
    Password: password,
    state: 'Oyo State',
    lga: 'Owode',
    farmAddress: `${farmer.location || 'Owode'}, Oyo State`,
    farmName: `${farmer.name} Farms`,
  };

  let token = '';
  let userId = '';

  try {
    const regRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regBody),
    });

    const regData = await regRes.json();
    if (regRes.ok && regData.successful) {
      token = regData.data?.token || '';
      userId = regData.data?.userId || regData.data?.user?.id || '';
      console.log(`[REGISTERED] Farmer ${farmerIndex}: ${farmer.name} (${cleanPhone}) -> ${userId}`);
    } else {
      console.log(`[INFO] ${farmer.name} status: ${regData.message}. Attempting login...`);
      const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: regPhone,
          password: password,
        }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.successful) {
        token = loginData.data?.accessToken || loginData.data?.token || '';
        userId = loginData.data?.user?.id || '';
        console.log(`[LOGGED IN] Farmer ${farmerIndex}: ${farmer.name} (${cleanPhone}) -> ${userId}`);
      } else {
        console.warn(`[WARN] Could not register/login ${farmer.name}:`, loginData?.message || regData?.message);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Network failed for ${farmer.name}:`, err.message);
  }

  if (token) {
    try {
      await fetch(`${API_BASE}/api/v1/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: farmer.name,
          firstName: farmer.firstName,
          lastName: farmer.otherName,
          phoneNumber: cleanPhone,
          address: `${farmer.location}, Oyo State`,
          bankName: farmer.bankName,
          accountNumber: farmer.bankAccount,
          accountName: farmer.accountHolder || farmer.name,
        }),
      });
    } catch {}
  }

  return {
    ...farmer,
    role: 'Farmer',
    phone: cleanPhone,
    password,
    email,
    token,
    userId: userId || `usr_Farmer_${farmerIndex}`,
  };
}

async function createFarmerBatch(farmer, batchCode) {
  if (!farmer.token) return null;

  try {
    const fd = new FormData();
    fd.append('Variety', '1');
    fd.append('EstimatedWeightKg', '5000');
    fd.append('PricePerKg', String(Math.round(farmer.price / 5000) || 25));
    fd.append('FarmLocation', farmer.location || 'Owode');
    fd.append('HarvestDate', '2026-10-29');
    fd.append('StorageDestination', 'YucaVault Storage');

    const res = await fetch(`${API_BASE}/api/v1/marketplace/farmer/batches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${farmer.token}`,
      },
      body: fd,
    });

    const data = await res.json();
    if (res.ok && data.successful) {
      const batchId = data.data?.id;
      console.log(`[BATCH CREATED] Farmer: ${farmer.name} -> Batch: ${data.data?.batchCode || batchCode} (${batchId})`);

      if (batchId) {
        await fetch(`${API_BASE}/api/v1/batches/${batchId}/pricing`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${farmer.token}`,
          },
          body: JSON.stringify({
            pricePerTonneNgn: farmer.price,
            intendedDestination: 'Storage',
          }),
        }).catch(() => {});
      }

      return data.data;
    }
  } catch (err) {
    console.warn(`[WARN] Failed to create live batch for ${farmer.name}:`, err.message);
  }
  return null;
}

// Generate 80 timestamps realistically spread throughout the day
function generateTimestamps(count) {
  const times = [];
  // Start 08:05 AM to 05:20 PM
  let currentMinutes = 8 * 60 + 5; // 485 mins
  const endMinutes = 17 * 60 + 20; // 1040 mins
  const step = (endMinutes - currentMinutes) / (count - 1);

  for (let i = 0; i < count; i++) {
    const totalMin = Math.round(currentMinutes + i * step);
    const h24 = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
    const timeStr = `Oct 27, 2026. ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    times.push(timeStr);
  }
  return times;
}

async function main() {
  const dataPath = path.resolve('app/data/registered_live_data.json');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`--- CURRENT STATE ---`);
  console.log(`Processors: ${existingData.processors.length}`);
  console.log(`Existing Farmers: ${existingData.farmers.length}`);

  // Register the 18 new farmers
  const registeredNewFarmers = [];
  let fIdx = existingData.farmers.length + 1; // 30

  for (const f of newFarmersRaw) {
    const res = await registerOrLoginFarmer(f, fIdx);
    const idNumber = `YC-FRM-${String(fIdx).padStart(4, '0')}`;
    const registeredObj = {
      idNumber,
      id: res.userId,
      userId: res.userId,
      name: res.name,
      role: 'Farmer',
      phone: res.phone,
      password: res.password,
      email: res.email,
      bankName: res.bankName,
      accountNumber: res.bankAccount,
      accountHolder: res.accountHolder,
      price: res.price,
      location: res.location,
      token: res.token,
    };
    registeredNewFarmers.push(registeredObj);

    // Create harvest batch
    const batchCode = `YC-2026-${String(fIdx).padStart(5, '0')}`;
    await createFarmerBatch(res, batchCode);

    fIdx++;
    await new Promise((r) => setTimeout(r, 350));
  }

  // Combine existing 29 farmers with new 18 farmers => 47 farmers
  const allFarmers = [
    ...existingData.farmers,
    ...registeredNewFarmers.map((f) => ({
      idNumber: f.idNumber,
      name: f.name,
      role: 'Farmer',
      phone: f.phone,
      password: f.password,
      bankName: f.bankName,
      accountNumber: f.accountNumber,
      accountHolder: f.accountHolder,
      price: f.price,
      location: f.location,
    })),
  ];

  const allProcessors = existingData.processors;

  console.log(`\nTotal Farmers: ${allFarmers.length}`);
  console.log(`Total Processors: ${allProcessors.length}`);

  // Build the complete registry mapping
  const registry = { ...(existingData.registry || {}) };
  allProcessors.forEach((p) => {
    if (p.idNumber) {
      if (p.phone) registry[p.phone] = p.idNumber;
      if (p.name) registry[p.name.toLowerCase()] = p.idNumber;
      if (p.id) registry[String(p.id).toLowerCase()] = p.idNumber;
      if (p.email) registry[p.email.toLowerCase()] = p.idNumber;
    }
  });

  allFarmers.forEach((f) => {
    if (f.idNumber) {
      if (f.phone) registry[f.phone] = f.idNumber;
      if (f.name) registry[f.name.toLowerCase()] = f.idNumber;
      if (f.id) registry[String(f.id).toLowerCase()] = f.idNumber;
      if (f.email) registry[String(f.email || '').toLowerCase()] = f.idNumber;
    }
  });

  // GENERATE 80 VARIED TRANSACTIONS
  // Requirements:
  // 1. Exactly 80 orders
  // 2. farmerId.slice(-4) !== processorId.slice(-4) (NEVER identical, e.g. 0001 never with 0001)
  // 3. User requested: "0001 CAN SELL TO 0013 LIKE THAT LIKE THAT"
  // 4. Processors buy from multiple different farmers
  // 5. Farmers sell to different processors

  const orderTimes = generateTimestamps(80);
  const orders = [];

  // Farmer index sequence for 80 orders:
  // 47 farmers: 33 sell twice (first 33), 14 sell once (last 14) -> 33*2 + 14 = 80
  const farmerSequence = [];
  for (let i = 0; i < 47; i++) {
    farmerSequence.push(i);
  }
  for (let i = 0; i < 33; i++) {
    farmerSequence.push(i);
  }

  // Processor index assignment:
  // 25 processors: each appears 3 or 4 times (5 appear 4 times, 20 appear 3 times -> 20 + 60 = 80)
  // We want to pair each (farmerIdx, processorIdx) such that:
  // - farmerIdx !== processorIdx (and id numbers don't match)
  // - farmer 0 (FRM-0001) pairs with processor 12 (PRS-0013) as requested!
  // - no processor buys from the same farmer twice
  // - no farmer sells to the same processor twice

  // Carefully planned offsets so farmer 0 -> processor 12 (YC-PRS-0013)
  // And all pairings are varied, distributed, and never identical indices!
  const pairs = [];
  const processorFarmerPairs = new Set();
  const processorCounts = new Array(allProcessors.length).fill(0);

  // Pre-seed order 0: Farmer 0 (YC-FRM-0001) with Processor 12 (YC-PRS-0013)
  pairs.push({ fIdx: 0, pIdx: 12 });
  processorFarmerPairs.add(`p12_f0`);
  processorCounts[12]++;

  // For the remaining 79 orders, distribute smoothly across processors
  // Using an offset coprime with 25 (e.g. 11 or 7 or 13) plus shift to ensure complete variety
  let pCursor = 0;
  for (let oIdx = 1; oIdx < 80; oIdx++) {
    const fIdx = farmerSequence[oIdx];
    const farmerIdNum = allFarmers[fIdx].idNumber;
    const fNum = parseInt(farmerIdNum.slice(-4), 10);

    // Find a valid processor that hasn't bought from this farmer yet and doesn't have same ID
    let candidatePIdx = -1;
    let bestScore = Infinity;

    // Check all 25 processors
    for (let attempt = 0; attempt < 25; attempt++) {
      const pIdx = (pCursor + attempt * 7 + (oIdx * 3)) % 25;
      const processorIdNum = allProcessors[pIdx].idNumber;
      const pNum = parseInt(processorIdNum.slice(-4), 10);

      // Must never match ID number!
      if (fNum === pNum) continue;

      // Must not already have this pair
      const pairKey = `p${pIdx}_f${fIdx}`;
      if (processorFarmerPairs.has(pairKey)) continue;

      // Prefer processors with fewer orders
      const count = processorCounts[pIdx];
      if (count < 4) {
        candidatePIdx = pIdx;
        break;
      }
    }

    if (candidatePIdx === -1) {
      // Fallback: take processor with lowest count where fNum !== pNum
      let minCount = Infinity;
      for (let pIdx = 0; pIdx < 25; pIdx++) {
        const pNum = parseInt(allProcessors[pIdx].idNumber.slice(-4), 10);
        if (fNum !== pNum && processorCounts[pIdx] < minCount) {
          minCount = processorCounts[pIdx];
          candidatePIdx = pIdx;
        }
      }
    }

    pairs.push({ fIdx, pIdx: candidatePIdx });
    processorFarmerPairs.add(`p${candidatePIdx}_f${fIdx}`);
    processorCounts[candidatePIdx]++;
    pCursor = (candidatePIdx + 1) % 25;
  }

  // Shuffle order display sequence slightly so that farmer numbers don't appear in strictly 0,1,2,3... order,
  // but instead look naturally interleaved throughout the day!
  // Keeping order 0 as ORD-100100 (FRM-0001 -> PRS-0013)
  const scheduledOrders = [pairs[0]];
  const rest = pairs.slice(1);

  // Interleave with a hop pattern
  const stride = 7;
  const visited = new Set();
  let curr = 0;
  while (visited.size < rest.length) {
    if (!visited.has(curr)) {
      scheduledOrders.push(rest[curr]);
      visited.add(curr);
    }
    curr = (curr + stride) % rest.length;
  }

  // Construct the 80 rich order records
  for (let i = 0; i < 80; i++) {
    const { fIdx, pIdx } = scheduledOrders[i];
    const farmer = allFarmers[fIdx];
    const processor = allProcessors[pIdx];
    const orderNum = `ORD-${String(100100 + i)}`;
    const lotNum = String(i + 1).padStart(2, '0');
    const variety = VARIETIES[i % VARIETIES.length];

    const totalAmount = farmer.price || 100000;
    // Quantity calculation matching existing convention
    const totalKg = Math.round(totalAmount / 2500);
    const quantity = Number((totalKg / 1000).toFixed(3));

    const isPaid = i % 5 !== 1 && i % 5 !== 3; // ~60% paid, ~40% pending
    const orderDate = orderTimes[i];
    const payoutDate = isPaid ? `Oct 27, 2026. 03:25 PM` : undefined;

    orders.push({
      id: `ord-${Date.now()}-${i}`,
      orderNumber: orderNum,
      productTitle: `Fresh Cassava Roots (${variety}) - Lot YC-2026-${lotNum}`,
      category: 'Produce',
      sellerName: farmer.name,
      sellerRole: 'farmer',
      sellerId: farmer.id || farmer.userId || `usr_Farmer_${fIdx + 1}`,
      sellerIdNumber: farmer.idNumber,
      buyerName: processor.name,
      buyerRole: 'processor',
      buyerId: processor.id || processor.userId || `usr_Processor_${pIdx + 1}`,
      buyerIdNumber: processor.idNumber,
      quantity,
      unit: 'Tonnes',
      totalAmount,
      date: orderDate,
      deliveryMethod: 'direct-delivery',
      paymentMethod: 'bank-transfer',
      paymentStatus: 'Paid to YucaChain Escrow',
      payoutStatus: isPaid ? 'Paid / Disbursed' : 'Pending Admin Payout',
      payoutDate,
      sellerBankDetails: {
        bankName: farmer.bankName || 'Commercial Bank',
        accountNumber: farmer.accountNumber || '',
        accountName: farmer.accountHolder || farmer.name,
      },
    });
  }

  console.log(`\nGenerated ${orders.length} orders.`);
  console.log('Sample pairings (first 10):');
  orders.slice(0, 10).forEach((o, i) => {
    console.log(`[Order ${i + 1}] ${o.orderNumber}: Seller ${o.sellerIdNumber} (${o.sellerName}) -> Buyer ${o.buyerIdNumber} (${o.buyerName}) | ₦${o.totalAmount.toLocaleString()} | Date: ${o.date}`);
  });

  // Verify none have identical IDs
  let identicalCount = 0;
  orders.forEach((o) => {
    if (o.sellerIdNumber.slice(-4) === o.buyerIdNumber.slice(-4)) {
      identicalCount++;
      console.error(`ERROR: Identical pairing found in order ${o.orderNumber}: ${o.sellerIdNumber} <-> ${o.buyerIdNumber}`);
    }
  });

  if (identicalCount === 0) {
    console.log('\n[VERIFIED] 0 identical index pairings found! All 80 pairings are varied and distinct.');
  }

  // Check processor diversity
  const procFarmerMap = {};
  orders.forEach((o) => {
    if (!procFarmerMap[o.buyerIdNumber]) procFarmerMap[o.buyerIdNumber] = new Set();
    procFarmerMap[o.buyerIdNumber].add(o.sellerIdNumber);
  });
  console.log('\nProcessor diversity check:');
  Object.keys(procFarmerMap).slice(0, 5).forEach((pId) => {
    console.log(`Processor ${pId} bought from ${procFarmerMap[pId].size} distinct farmers: ${Array.from(procFarmerMap[pId]).join(', ')}`);
  });

  // Write out payload
  const finalPayload = {
    processors: allProcessors,
    farmers: allFarmers,
    orders,
    registry,
  };

  fs.writeFileSync(dataPath, JSON.stringify(finalPayload, null, 2), 'utf8');
  console.log(`\n>>> SUCCESSFULLY SAVED ${allProcessors.length} Processors, ${allFarmers.length} Farmers, and ${orders.length} Orders to ${dataPath}`);
}

main().catch(console.error);

