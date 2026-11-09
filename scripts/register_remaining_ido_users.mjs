import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.yucachain.com';

const newIdoProcessors = [
  {
    idNumber: 'YC-PRS-0027',
    name: 'Busari Abiodun',
    firstName: 'Busari',
    otherName: 'Abiodun',
    role: 'Buyer / Processor',
    phone: '08035214781',
    password: 'Busari@#11',
    bankName: 'Opay',
    accountNumber: '08035214781',
    accountHolder: 'Busari Abiodun',
    price: 110000,
    location: 'Ido, Oyo',
    email: 'busari.abiodun27@yucachain.com',
  },
  {
    idNumber: 'YC-PRS-0028',
    name: 'Adeleke Jumoke',
    firstName: 'Adeleke',
    otherName: 'Jumoke',
    role: 'Buyer / Processor',
    phone: '08126749012',
    password: 'Adeleke@#11',
    bankName: 'Opay',
    accountNumber: '08126749012',
    accountHolder: 'Adeleke Jumoke',
    price: 125000,
    location: 'Ido, Oyo',
    email: 'adeleke.jumoke28@yucachain.com',
  },
  {
    idNumber: 'YC-PRS-0029',
    name: 'Alimi Kudirat',
    firstName: 'Alimi',
    otherName: 'Kudirat',
    role: 'Buyer / Processor',
    phone: '07038192044',
    password: 'Alimi@#11',
    bankName: 'Opay',
    accountNumber: '07038192044',
    accountHolder: 'Alimi Kudirat',
    price: 115000,
    location: 'Ido, Oyo',
    email: 'alimi.kudirat29@yucachain.com',
  },
  {
    idNumber: 'YC-PRS-0030',
    name: 'Ogundele Fatai',
    firstName: 'Ogundele',
    otherName: 'Fatai',
    role: 'Buyer / Processor',
    phone: '09021487653',
    password: 'Ogundele@#11',
    bankName: 'Opay',
    accountNumber: '09021487653',
    accountHolder: 'Ogundele Fatai',
    price: 130000,
    location: 'Ido, Oyo',
    email: 'ogundele.fatai30@yucachain.com',
  },
];

const newIdoFarmers = [
  {
    idNumber: 'YC-FRM-0053',
    name: 'Muritala Alani',
    firstName: 'Muritala',
    otherName: 'Alani',
    role: 'Farmer',
    phone: '08023456701',
    password: 'Muritala@#11',
    bankName: 'Opay',
    accountNumber: '08023456701',
    accountHolder: 'Muritala Alani',
    price: 100000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'muritala.alani53@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0054',
    name: 'Adebayo Taofeeq',
    firstName: 'Adebayo',
    otherName: 'Taofeeq',
    role: 'Farmer',
    phone: '08134567802',
    password: 'Adebayo@#11',
    bankName: 'Opay',
    accountNumber: '08134567802',
    accountHolder: 'Adebayo Taofeeq',
    price: 110000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'adebayo.taofeeq54@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0055',
    name: 'Bello Moruf',
    firstName: 'Bello',
    otherName: 'Moruf',
    role: 'Farmer',
    phone: '09045678903',
    password: 'Bello@#11',
    bankName: 'Opay',
    accountNumber: '09045678903',
    accountHolder: 'Bello Moruf',
    price: 95000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'bello.moruf55@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0056',
    name: 'Gbadamosi Lateef',
    firstName: 'Gbadamosi',
    otherName: 'Lateef',
    role: 'Farmer',
    phone: '07056789014',
    password: 'Gbadamosi@#11',
    bankName: 'Opay',
    accountNumber: '07056789014',
    accountHolder: 'Gbadamosi Lateef',
    price: 120000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'gbadamosi.lateef56@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0057',
    name: 'Adeleke Rasheed',
    firstName: 'Adeleke',
    otherName: 'Rasheed',
    role: 'Farmer',
    phone: '08067890125',
    password: 'Adeleke@#11',
    bankName: 'Opay',
    accountNumber: '08067890125',
    accountHolder: 'Adeleke Rasheed',
    price: 105000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'adeleke.rasheed57@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0058',
    name: 'Oladapo Samuel',
    firstName: 'Oladapo',
    otherName: 'Samuel',
    role: 'Farmer',
    phone: '08178901236',
    password: 'Oladapo@#11',
    bankName: 'Opay',
    accountNumber: '08178901236',
    accountHolder: 'Oladapo Samuel',
    price: 115000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'oladapo.samuel58@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0059',
    name: 'Tijani Mukaila',
    firstName: 'Tijani',
    otherName: 'Mukaila',
    role: 'Farmer',
    phone: '09089012347',
    password: 'Tijani@#11',
    bankName: 'Opay',
    accountNumber: '09089012347',
    accountHolder: 'Tijani Mukaila',
    price: 90000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'tijani.mukaila59@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0060',
    name: 'Sanusi Shakirat',
    firstName: 'Sanusi',
    otherName: 'Shakirat',
    role: 'Farmer',
    phone: '07090123458',
    password: 'Sanusi@#11',
    bankName: 'Opay',
    accountNumber: '07090123458',
    accountHolder: 'Sanusi Shakirat',
    price: 125000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'sanusi.shakirat60@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0061',
    name: 'Alao Monsuru',
    firstName: 'Alao',
    otherName: 'Monsuru',
    role: 'Farmer',
    phone: '08012345679',
    password: 'Alao@#11',
    bankName: 'Opay',
    accountNumber: '08012345679',
    accountHolder: 'Alao Monsuru',
    price: 100000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'alao.monsuru61@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0064',
    name: 'Babalola Olufemi',
    firstName: 'Babalola',
    otherName: 'Olufemi',
    role: 'Farmer',
    phone: '08123456780',
    password: 'Babalola@#11',
    bankName: 'Opay',
    accountNumber: '08123456780',
    accountHolder: 'Babalola Olufemi',
    price: 110000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'babalola.olufemi64@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0065',
    name: 'Ajayi Olawale',
    firstName: 'Ajayi',
    otherName: 'Olawale',
    role: 'Farmer',
    phone: '09034567891',
    password: 'Ajayi@#11',
    bankName: 'Opay',
    accountNumber: '09034567891',
    accountHolder: 'Ajayi Olawale',
    price: 130000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'ajayi.olawale65@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0066',
    name: 'Jimoh Musbau',
    firstName: 'Jimoh',
    otherName: 'Musbau',
    role: 'Farmer',
    phone: '07045678902',
    password: 'Jimoh@#11',
    bankName: 'Opay',
    accountNumber: '07045678902',
    accountHolder: 'Jimoh Musbau',
    price: 95000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'jimoh.musbau66@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0067',
    name: 'Akande Kudirat',
    firstName: 'Akande',
    otherName: 'Kudirat',
    role: 'Farmer',
    phone: '08056789013',
    password: 'Akande@#11',
    bankName: 'Opay',
    accountNumber: '08056789013',
    accountHolder: 'Akande Kudirat',
    price: 105000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'akande.kudirat67@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0068',
    name: 'Lawal Olayinka',
    firstName: 'Lawal',
    otherName: 'Olayinka',
    role: 'Farmer',
    phone: '08167890124',
    password: 'Lawal@#11',
    bankName: 'Opay',
    accountNumber: '08167890124',
    accountHolder: 'Lawal Olayinka',
    price: 120000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'lawal.olayinka68@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0069',
    name: 'Popoola Sunday',
    firstName: 'Popoola',
    otherName: 'Sunday',
    role: 'Farmer',
    phone: '09078901235',
    password: 'Popoola@#11',
    bankName: 'Opay',
    accountNumber: '09078901235',
    accountHolder: 'Popoola Sunday',
    price: 115000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'popoola.sunday69@yucachain.com',
  },
  {
    idNumber: 'YC-FRM-0070',
    name: 'Bakare Rukayat',
    firstName: 'Bakare',
    otherName: 'Rukayat',
    role: 'Farmer',
    phone: '07089012346',
    password: 'Bakare@#11',
    bankName: 'Opay',
    accountNumber: '07089012346',
    accountHolder: 'Bakare Rukayat',
    price: 100000,
    location: 'Ido, Oyo',
    joinedDate: 'Nov 9, 2026',
    email: 'bakare.rukayat70@yucachain.com',
  },
];

async function registerOnBackend(user, role) {
  const regBody = {
    Role: role,
    FullName: user.name,
    FirstName: user.firstName,
    LastName: user.otherName,
    PhoneNumber: user.phone,
    Email: user.email,
    Password: user.password,
    state: 'Oyo State',
    lga: 'Ido',
    farmAddress: role === 'Farmer' ? `${user.location || 'Ido'}, Oyo State` : undefined,
    facilityAddress: role !== 'Farmer' ? `${user.location || 'Ido'}, Oyo State` : undefined,
    farmName: role === 'Farmer' ? `${user.name} Farms` : undefined,
    companyName: role !== 'Farmer' ? `${user.name} Processing Mill` : undefined,
  };

  try {
    const regRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regBody),
    });
    const regData = await regRes.json();
    if (regRes.ok && regData.successful) {
      console.log(`[BACKEND REGISTERED] ${user.idNumber} - ${user.name}`);
      return regData.data?.token;
    } else {
      console.log(`[BACKEND NOTICE] ${user.idNumber} - ${user.name}: ${regData.message || 'Already exists'}`);
    }
  } catch (err) {
    console.warn(`[BACKEND WARN] ${user.idNumber} failed: ${err.message}`);
  }
  return null;
}

async function main() {
  console.log('--- Registering remaining Ido Processors & Farmers on Backend ---');
  for (const p of newIdoProcessors) {
    await registerOnBackend(p, 'Buyer');
  }
  for (const f of newIdoFarmers) {
    await registerOnBackend(f, 'Farmer');
  }

  // Load and merge into registered_live_data.json
  const dataFilePath = path.resolve('app/data/registered_live_data.json');
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  newIdoProcessors.forEach((p) => {
    const idx = data.processors.findIndex((x) => x.idNumber === p.idNumber);
    if (idx >= 0) data.processors[idx] = { ...data.processors[idx], ...p };
    else data.processors.push(p);
  });

  newIdoFarmers.forEach((f) => {
    const idx = data.farmers.findIndex((x) => x.idNumber === f.idNumber);
    if (idx >= 0) data.farmers[idx] = { ...data.farmers[idx], ...f };
    else data.farmers.push(f);
  });

  // Sort processors and farmers by idNumber
  data.processors.sort((a, b) => a.idNumber.localeCompare(b.idNumber));
  data.farmers.sort((a, b) => a.idNumber.localeCompare(b.idNumber));

  // Update registry
  if (!data.registry) data.registry = {};
  [...newIdoProcessors, ...newIdoFarmers].forEach((u) => {
    data.registry[u.phone] = u.idNumber;
    data.registry[u.name.toLowerCase().trim()] = u.idNumber;
    if (u.email) data.registry[u.email.toLowerCase().trim()] = u.idNumber;
    data.registry[u.idNumber.toLowerCase()] = u.idNumber;
  });

  // Add marketplace demo batches for newly added farmers
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
  ];

  const batchImages = [
    ['/images/batches/Batch1.png', '/images/batches/Batch2.png'],
    ['/images/batches/Batch2.png', '/images/batches/Batch3.png'],
    ['/images/batches/Batch3.png', '/images/batches/Batch4.png'],
    ['/images/batches/Batch4.png', '/images/batches/Batch1.png'],
    ['/images/trade-cassava.png', '/images/batches/Batch1.png'],
  ];

  if (!data.batches) data.batches = [];
  newIdoFarmers.forEach((farmer, idx) => {
    const existing = data.batches.find((b) => b.farmerIdNumber === farmer.idNumber);
    if (!existing) {
      data.batches.push({
        id: `bch-ido-${farmer.idNumber.toLowerCase()}`,
        batchCode: `BCH-IDO-${farmer.idNumber.slice(-4)}`,
        title: `Fresh Cassava Roots (${varietiesList[idx % varietiesList.length]})`,
        variety: varietiesList[idx % varietiesList.length],
        grade: idx % 2 === 0 ? 'A' : 'B',
        qualityGrade: idx % 2 === 0 ? 'A' : 'B',
        quantity: 20 + (idx % 6) * 5,
        unit: 'Tonnes',
        weightKg: (20 + (idx % 6) * 5) * 1000,
        pricePerTonne: farmer.price || 110000,
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
      });
    }
  });

  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

  console.log('\n--- UPDATE COMPLETE ---');
  console.log('Total Processors in System:', data.processors.length);
  console.log('Total Farmers in System:', data.farmers.length);
  console.log('Total Orders in System:', data.orders.length);
  console.log('Total Marketplace Batches:', data.batches.length);
}

main();
