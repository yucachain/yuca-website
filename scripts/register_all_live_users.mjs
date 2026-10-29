import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.yucachain.com';

const processorsRaw = [
  { id: 2, name: 'Ramota Rasheed', firstName: 'Ramota', otherName: 'Rasheed', phone: '09116524365', location: 'Owode', company: 'Ramota Agro Processing', price: 100000, bankAccount: '3087127208', bankName: 'First Bank', accountHolder: 'Rasheed Ramota Ejide' },
  { id: 4, name: 'Hassanat Jimoh', firstName: 'Hassanat', otherName: 'Jimoh', phone: '08120429121', location: 'Owode', company: 'Hassanat Processing Mill', price: 120000, bankAccount: '8120429121', bankName: 'Opay', accountHolder: 'Hassanat Jimoh' },
  { id: 5, name: 'Mulika Essa', firstName: 'Mulika', otherName: 'Essa', phone: '09016416981', location: 'Owode', company: 'Mulika Agro Ventures', price: 120000, bankAccount: '9016416981', bankName: 'Opay', accountHolder: 'Essa Mulika' },
  { id: 6, name: 'Sikirat Isiaka', firstName: 'Sikirat', otherName: 'Isiaka', phone: '09116524366', location: 'Owode', company: 'Sikirat Cassava Processing', price: 30000, bankAccount: '9116524365', bankName: 'Opay', accountHolder: 'Isiaka Sikirat' },
  { id: 7, name: 'Salima Gani', firstName: 'Salima', otherName: 'Gani', phone: '09077344908', location: 'Owode', company: 'Salima Mills', price: 120000, bankAccount: '9077344908', bankName: 'Opay', accountHolder: 'Salima Gani' },
  { id: 8, name: 'Adijatu Jimoh', firstName: 'Adijatu', otherName: 'Jimoh', phone: '09028052131', location: 'Owode', company: 'Adijatu Garri Processing', price: 140000, bankAccount: '9028052131', bankName: 'Opay', accountHolder: 'Adijatu Jimoh' },
  { id: 9, name: 'Bashirat Abdulrosheed', firstName: 'Bashirat', otherName: 'Abdulrosheed', phone: '09046011207', location: 'Owode', company: 'Bashirat Starch Mill', price: 80000, bankAccount: '9046011207', bankName: 'Opay', accountHolder: 'Abdulrosheed Bashirat' },
  { id: 10, name: 'Hamdalat Jimoh', firstName: 'Hamdalat', otherName: 'Jimoh', phone: '09119103074', location: 'Owode', company: 'Hamdalat Agro Processing', price: 120000, bankAccount: '9119103074', bankName: 'Moniepoint', accountHolder: 'Hamdalat Jimoh' },
  { id: 11, name: 'Silifat Saliu', firstName: 'Silifat', otherName: 'Saliu', phone: '08029509248', location: 'Owode', company: 'Silifat Cassava Flour Mills', price: 120000, bankAccount: '8029509248', bankName: 'Moniepoint', accountHolder: 'Saliu Silifat' },
  { id: 12, name: 'Falilat Abdulrahman', firstName: 'Falilat', otherName: 'Abdulrahman', phone: '09076869011', location: 'Owode', company: 'Falilat Processing Hub', price: 90000, bankAccount: '9076869011', bankName: 'Opay', accountHolder: 'Abdulrahman Falilat' },
  { id: 13, name: 'Taibat Ayinde', firstName: 'Taibat', otherName: 'Ayinde', phone: '08133031242', location: 'Owode', company: 'Taibat Food Mills', price: 80000, bankAccount: '106841429', bankName: 'Access Bank', accountHolder: 'Ayinde Taibat Adeshina' },
  { id: 14, name: 'Muibat Ganiyu', firstName: 'Muibat', otherName: 'Ganiyu', phone: '09017265747', location: 'Owode', company: 'Muibat Cassava Mill', price: 140000, bankAccount: '9017265747', bankName: 'Opay', accountHolder: 'Muibat Ganiyu' },
  { id: 15, name: 'Bashirat Yunusa', firstName: 'Bashirat', otherName: 'Yunusa', phone: '09116497868', location: 'Owode', company: 'Bashirat Yunusa Processing', price: 140000, bankAccount: '1227046800', bankName: 'Access Bank', accountHolder: 'Bashirat Yunusa' },
  { id: 16, name: 'Wosilat Abdulrasaq', firstName: 'Wosilat', otherName: 'Abdulrasaq', phone: '08024235304', location: 'Owode', company: 'Wosilat Commodity Processing', price: 140000, bankAccount: '8024235304', bankName: 'Opay', accountHolder: 'Abdulrasaq Wosilat Asabi' },
  { id: 17, name: 'Safurat Ibrahim', firstName: 'Safurat', otherName: 'Ibrahim', phone: '08121513259', location: 'Owode', company: 'Safurat Garri Mill', price: 30000, bankAccount: '8121513259', bankName: 'Opay', accountHolder: 'Ibrahim Safurat' },
  { id: 18, name: 'Sabitiyu Rasaki', firstName: 'Sabitiyu', otherName: 'Rasaki', phone: '09022816811', location: 'Owode', company: 'Sabitiyu Processing', price: 120000, bankAccount: '9022816811', bankName: 'Opay', accountHolder: 'Rasaki Sabitiyu' },
  { id: 19, name: 'Suliyat Kehinde', firstName: 'Suliyat', otherName: 'Kehinde', phone: '08121555073', location: 'Owode', company: 'Suliyat Cassava Hub', price: 30000, bankAccount: '8121555073', bankName: 'Opay', accountHolder: 'Suliyat Kehinde' },
  { id: 20, name: 'Fausat Ganiyu', firstName: 'Fausat', otherName: 'Ganiyu', phone: '09025907352', location: 'Owode', company: 'Fausat Garri Mills', price: 100000, bankAccount: '9025907352', bankName: 'Opay', accountHolder: 'Ganiyu Fausat' },
  { id: 21, name: 'Adijatu Abdulganiyu', firstName: 'Adijatu', otherName: 'Abdulganiyu', phone: '09040129189', location: 'Owode', company: 'Adijatu Agro Mills', price: 100000, bankAccount: '9040129189', bankName: 'Moniepoint', accountHolder: 'Abdulganiyu Adijatu' },
  { id: 22, name: 'Rofiat Sulaiman', firstName: 'Rofiat', otherName: 'Sulaiman', phone: '07014880111', location: 'Owode', company: 'Rofiat Processing', price: 80000, bankAccount: '7014880111', bankName: 'Pampay', accountHolder: 'Sulaiman Rofiat' },
  { id: 23, name: 'Rafatu Garuba', firstName: 'Rafatu', otherName: 'Garuba', phone: '09075069121', location: 'Owode', company: 'Rafatu Garuba Mills', price: 105000, bankAccount: '9075069121', bankName: 'Opay', accountHolder: 'Garuba Rafatu' },
  { id: 24, name: 'Taibat Sulaiman', firstName: 'Taibat', otherName: 'Sulaiman', phone: '09128473270', location: 'Owode', company: 'Taibat Sulaiman Processing', price: 80000, bankAccount: '9128473270', bankName: 'Opay', accountHolder: 'Taibat Sulaiman' },
  { id: 25, name: 'Afusat Isiaka', firstName: 'Afusat', otherName: 'Isiaka', phone: '09127182972', location: 'Owode', company: 'Afusat Agro Processors', price: 100000, bankAccount: '9127182972', bankName: 'Opay', accountHolder: 'Isiaka Afusat' },
  { id: 26, name: 'Sikirat Idris', firstName: 'Sikirat', otherName: 'Idris', phone: '09026706867', location: 'Owode', company: 'Sikirat Idris Mills', price: 100000, bankAccount: '9026706867', bankName: 'Opay', accountHolder: 'Idris Sikirat' },
  { id: 27, name: 'Muslimat Lukmon', firstName: 'Muslimat', otherName: 'Lukmon', phone: '09015141227', location: 'Owode', company: 'Muslimat Processing Industry', price: 240000, bankAccount: '9015141227', bankName: 'Opay', accountHolder: 'Muslimat Lukmon' },
];

const farmersRaw = [
  { id: 1, name: 'Dauda Saka', firstName: 'Dauda', otherName: 'Saka', location: 'Owode', phone: '07019107977', bankAccount: '3176291805', bankName: 'First Bank', accountHolder: 'Saka Dauda', price: 30000 },
  { id: 2, name: 'Lukman Yusuf', firstName: 'Lukman', otherName: 'Yusuf', location: 'Owode', phone: '07081376739', bankAccount: '2382121472', bankName: 'Zenith', accountHolder: 'Yusuf Lukman Adeshina', price: 15000 },
  { id: 3, name: 'Mukaila Aliyu', firstName: 'Mukaila', otherName: 'Aliyu', location: 'Owode', phone: '08086033036', bankAccount: '8086033036', bankName: 'Opay', accountHolder: 'Aliyu Mukaila', price: 120000 },
  { id: 4, name: 'Tawakalitu Lukman', firstName: 'Tawakalitu', otherName: 'Lukman', location: 'Owode', phone: '09022327374', bankAccount: '9022327374', bankName: 'Opay', accountHolder: 'Lukman Tawakalitu', price: 50000 },
  { id: 5, name: 'Fatimoh Wasiu', firstName: 'Fatimoh', otherName: 'Wasiu', location: 'Owode', phone: '07017810953', bankAccount: '7017810953', bankName: 'Opay', accountHolder: 'Wasiu Fatimoh', price: 120000 },
  { id: 6, name: 'Muslimat Wahab', firstName: 'Muslimat', otherName: 'Wahab', location: 'Owode', phone: '08153522092', bankAccount: '8153522092', bankName: 'Opay', accountHolder: 'Wahab Muslimat', price: 35000 },
  { id: 7, name: 'Mariam Yunus', firstName: 'Mariam', otherName: 'Yunus', location: 'Owode', phone: '09119781026', bankAccount: '9119781026', bankName: 'Opay', accountHolder: 'Mariam Yunus', price: 50000 },
  { id: 8, name: 'Isiaka Sodiq', firstName: 'Isiaka', otherName: 'Sodiq', location: 'Owode', phone: '09044402358', bankAccount: '9044402358', bankName: 'Moniepoint', accountHolder: 'Isiaka Sodiq', price: 140000 },
  { id: 9, name: 'Ayuba Ajape', firstName: 'Ayuba', otherName: 'Ajape', location: 'Owode', phone: '07015950976', bankAccount: '7015950976', bankName: 'Opay', accountHolder: 'Ayuba Ajape', price: 80000 },
  { id: 10, name: 'Wasiu Saheed', firstName: 'Wasiu', otherName: 'Saheed', location: 'Owode', phone: '08067153820', bankAccount: '8067153820', bankName: 'Opay', accountHolder: 'Saheed Wasiu', price: 120000 },
  { id: 11, name: 'Ismaila Jimoh', firstName: 'Ismaila', otherName: 'Jimoh', location: 'Owode', phone: '08083144728', bankAccount: '8083144728', bankName: 'Opay', accountHolder: 'Ismaila Jimoh', price: 120000 },
  { id: 12, name: 'Saheed Sodiq', firstName: 'Saheed', otherName: 'Sodiq', location: 'Owode', phone: '07018547928', bankAccount: '1892114879', bankName: 'Access Bank', accountHolder: 'Saheed Sodiq', price: 90000 },
  { id: 13, name: 'Abdulganiyu Dauda', firstName: 'Abdulganiyu', otherName: 'Dauda', location: 'Owode', phone: '08086486946', bankAccount: '1435844689', bankName: 'Access Bank', accountHolder: 'Abdulganiyu Dauda', price: 80000 },
  { id: 14, name: 'Qadri Mustapha', firstName: 'Qadri', otherName: 'Mustapha', location: 'Owode', phone: '08084116910', bankAccount: '5972259011', bankName: 'FCMB Bank', accountHolder: 'Mustapha Qadri', price: 140000 },
  { id: 15, name: 'Isiaka Salman', firstName: 'Isiaka', otherName: 'Salman', location: 'Owode', phone: '08022795451', bankAccount: '8022795451', bankName: 'Opay', accountHolder: 'Isiaka Salman', price: 140000 },
  { id: 16, name: 'Tunde Ayinde Ajao', firstName: 'Tunde', otherName: 'Ayinde Ajao', location: 'Owode', phone: '07014815043', bankAccount: '2378801601', bankName: 'Zenith', accountHolder: 'Tunde Ayinde Ajao', price: 140000 },
  { id: 17, name: 'Saka Ismaila Adio', firstName: 'Saka', otherName: 'Ismaila Adio', location: 'Owode', phone: '08084950509', bankAccount: '1699642764', bankName: 'Access', accountHolder: 'Saka Ismaila Adio', price: 30000 },
  { id: 18, name: 'Ganiyatu Saheed', firstName: 'Ganiyatu', otherName: 'Saheed', location: 'Owode', phone: '08080263550', bankAccount: '8080263550', bankName: 'Opay', accountHolder: 'Ganiyatu Saheed', price: 120000 },
  { id: 19, name: 'Ajarat AbdulGaniyu', firstName: 'Ajarat', otherName: 'AbdulGaniyu', location: 'Owode', phone: '09046542114', bankAccount: '9046542114', bankName: 'Moniepoint', accountHolder: 'Ajarat AbdulGaniyu', price: 30000 },
  { id: 20, name: 'Dauda Adisa Alamoyo', firstName: 'Dauda', otherName: 'Alamoyo', location: 'Owode', phone: '09045941444', bankAccount: '7015499024', bankName: 'Opay', accountHolder: 'Dauda Adisa Alamoyo', price: 100000 },
  { id: 21, name: 'Alimat Musa', firstName: 'Alimat', otherName: 'Musa', location: 'Owode', phone: '09019717314', bankAccount: '9019717314', bankName: 'Opay', accountHolder: 'Alimat Musa', price: 100000 },
  { id: 22, name: 'Ismail Afeez', firstName: 'Ismail', otherName: 'Afeez', location: 'Owode', phone: '09034299888', bankAccount: '9034299888', bankName: 'Opay', accountHolder: 'Ismail Afeez', price: 80000 },
  { id: 23, name: 'Latifat Sakariyyah', firstName: 'Latifat', otherName: 'Sakariyyah', location: 'Owode', phone: '09074397349', bankAccount: '1850202910', bankName: 'Access Bank', accountHolder: 'Latifat Sakariyyah', price: 105000 },
  { id: 24, name: 'Alade Zakariyahu', firstName: 'Alade', otherName: 'Zakariyahu', location: 'Owode', phone: '07085436224', bankAccount: '213237018', bankName: 'GTBank', accountHolder: 'Alade Zakariyahu', price: 80000 },
  { id: 25, name: 'Issa Sikiru', firstName: 'Issa', otherName: 'Sikiru', location: 'Owode', phone: '09023977879', bankAccount: '1699051429', bankName: 'Access', accountHolder: 'Issa Sikiru', price: 100000 },
  { id: 26, name: 'Yusuf Mukaila Adesina', firstName: 'Yusuf', otherName: 'Mukaila Adesina', location: 'Owode', phone: '08024700150', bankAccount: '8024700150', bankName: 'Opay', accountHolder: 'Yusuf Mukaila Adesina', price: 100000 },
  { id: 27, name: 'Ajarat Rashid', firstName: 'Ajarat', otherName: 'Rashid', location: 'Owode', phone: '08082179481', bankAccount: '802179481', bankName: 'Opay', accountHolder: 'Ajarat Rashid', price: 240000 },
  { id: 28, name: 'Jimoh Abdulrashid', firstName: 'Jimoh', otherName: 'Abdulrashid', location: 'Owode', phone: '09125873961', bankAccount: '9125873961', bankName: 'Opay', accountHolder: 'Jimoh Abdulrashid', price: 100000 },
  { id: 29, name: 'Abdul Ganiyu Ayinde Akanbi', firstName: 'Abdul Ganiyu', otherName: 'Ayinde Akanbi', location: 'Owode', phone: '07082937149', bankAccount: '2327271754', bankName: 'UBA', accountHolder: 'Abdul Ganiyu Ayinde Akanbi', price: 120000 },
  { id: 30, name: 'Saliman Azeezah Adio', firstName: 'Saliman', otherName: 'Azeezah Adio', location: 'Owode', phone: '09049240309', bankAccount: '9049240309', bankName: 'Moniepoint', accountHolder: 'Saliman Azeezah Adio', price: 100000 },
  { id: 31, name: 'Lukman Mansura Abike', firstName: 'Lukman', otherName: 'Mansura Abike', location: 'Owode', phone: '08052930411', bankAccount: '8052930411', bankName: 'Moniepoint', accountHolder: 'Lukman Mansura Abike', price: 120000 },
  { id: 32, name: 'Lukman Memunat Moturayo', firstName: 'Lukman', otherName: 'Memunat Moturayo', location: 'Owode', phone: '09074193691', bankAccount: '9074193691', bankName: 'Moniepoint', accountHolder: 'Lukman Memunat Moturayo', price: 90000 },
  { id: 33, name: 'Abdul Azeez Salaudeen', firstName: 'Abdul Azeez', otherName: 'Salaudeen', location: 'Owode', phone: '09015065719', bankAccount: '9015065719', bankName: 'Opay', accountHolder: 'Abdul Azeez Salaudeen', price: 140000 },
  { id: 34, name: 'Sakariya Abdu Roheem', firstName: 'Sakariya', otherName: 'Abdu Roheem', location: 'Owode', phone: '08027284090', bankAccount: '3238106133', bankName: 'First Bank', accountHolder: 'Sakariya Abdu Roheem', price: 80000 },
  { id: 35, name: 'Saliman Awawu', firstName: 'Saliman', otherName: 'Awawu', location: 'Owode', phone: '07018551905', bankAccount: '7018551905', bankName: 'Opay', accountHolder: 'Saliman Awawu', price: 100000 },
  { id: 36, name: 'AbdulKareem Awawu Ajoke', firstName: 'AbdulKareem', otherName: 'Awawu Ajoke', location: 'Owode', phone: '07018551905', bankAccount: '7018551905', bankName: 'Opay', accountHolder: 'AbdulKareem Awawu Ajoke', price: 120000 },
  { id: 37, name: 'Saliman Awawu', firstName: 'Saliman', otherName: 'Awawu', location: 'Owode', phone: '08129845388', bankAccount: '3164674731', bankName: 'First Bank', accountHolder: 'Saliman Awawu', price: 110000 },
  { id: 38, name: 'Isiaka Alimotu', firstName: 'Isiaka', otherName: 'Alimotu', location: 'Owode', phone: '09040991752', bankAccount: '9022544369', bankName: 'Opay', accountHolder: 'Isiaka Alimotu', price: 100000 },
  { id: 39, name: 'Isiaka Garuba', firstName: 'Isiaka', otherName: 'Garuba', location: 'Owode', phone: '08081672243', bankAccount: '8081672243', bankName: 'Opay', accountHolder: 'Isiaka Garuba', price: 80000 },
  { id: 40, name: 'Roheemat Isiaka', firstName: 'Roheemat', otherName: 'Isiaka', location: 'Owode', phone: '08102602588', bankAccount: '8025746039', bankName: 'Opay', accountHolder: 'Roheemat Isiaka', price: 140000 },
  { id: 41, name: 'Fasasi Adio', firstName: 'Fasasi', otherName: 'Adio', location: 'Owode', phone: '07086843526', bankAccount: '7086843526', bankName: 'Moniepoint', accountHolder: 'Fasasi Adio', price: 90000 },
  { id: 42, name: 'Abdul Qudus Fasasi', firstName: 'Abdul Qudus', otherName: 'Fasasi', location: 'Owode', phone: '08087315328', bankAccount: '8087315328', bankName: 'Opay', accountHolder: 'Abdul Qudus Fasasi', price: 120000 },
  { id: 43, name: 'Marufu Karima', firstName: 'Marufu', otherName: 'Karima', location: 'Owode', phone: '09132372475', bankAccount: '9132372475', bankName: 'Opay', accountHolder: 'Marufu Karima', price: 100000 },
  { id: 44, name: 'Risikatu Ismail Ajoke', firstName: 'Risikatu', otherName: 'Ismail Ajoke', location: 'Owode', phone: '07087617872', bankAccount: '7087617872', bankName: 'Opay', accountHolder: 'Risikatu Ismail Ajoke', price: 105000 },
  { id: 45, name: 'Ismail Ajadi Umaru', firstName: 'Ismail', otherName: 'Ajadi Umaru', location: 'Owode', phone: '07083073611', bankAccount: '2378902209', bankName: 'Zenith', accountHolder: 'Ismail Ajadi Umaru', price: 140000 },
  { id: 46, name: 'Rofiat Anike Ayuba', firstName: 'Rofiat', otherName: 'Anike Ayuba', location: 'Owode', phone: '09112852052', bankAccount: '9112852052', bankName: 'Opay', accountHolder: 'Rofiat Anike Ayuba', price: 80000 },
  { id: 47, name: 'Wasiu Sakariya', firstName: 'Wasiu', otherName: 'Sakariya', location: 'Owode', phone: '07076725486', bankAccount: '7076725486', bankName: 'Moniepoint', accountHolder: 'Wasiu Sakariya', price: 120000 },
];

function sanitizePhone(p) {
  let clean = p.replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '0' + clean;
  return clean;
}

async function registerOrLoginUser(user, role) {
  const cleanPhone = sanitizePhone(user.phone);
  const password = `${user.firstName}@#11`;
  const email = `${user.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${user.otherName.toLowerCase().replace(/[^a-z0-9]/g, '')}${user.id}@yucachain.com`;

  const regBody = {
    Role: role,
    FullName: user.name,
    FirstName: user.firstName,
    LastName: user.otherName,
    PhoneNumber: cleanPhone,
    Email: email,
    Password: password,
    state: 'Oyo State',
    lga: 'Owode',
  };

  if (role.toLowerCase() === 'processor') {
    regBody.companyName = user.company || `${user.name} Agro Processing`;
    regBody.facilityAddress = `${user.location || 'Owode'}, Oyo State`;
  } else {
    regBody.farmAddress = `${user.location || 'Owode'}, Oyo State`;
    regBody.farmName = `${user.name} Farms`;
  }

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
      console.log(`[REGISTERED] ${role}: ${user.name} (${cleanPhone}) -> ${userId}`);
    } else {
      // User might already exist, try to log in
      console.log(`[INFO] ${user.name} registration notice: ${regData.message}. Attempting login...`);
      const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          password: password,
        }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.successful) {
        token = loginData.data?.accessToken || loginData.data?.token || '';
        userId = loginData.data?.user?.id || '';
        console.log(`[LOGGED IN] ${role}: ${user.name} (${cleanPhone}) -> ${userId}`);
      } else {
        console.warn(`[WARN] Could not register or login ${user.name}:`, loginData?.message || regData?.message);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Network failed for ${user.name}:`, err.message);
  }

  // Update profile and bank details if token available
  if (token) {
    try {
      await fetch(`${API_BASE}/api/v1/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          firstName: user.firstName,
          lastName: user.otherName,
          phoneNumber: cleanPhone,
          address: `${user.location}, Oyo State`,
          bankName: user.bankName,
          accountNumber: user.bankAccount,
          accountName: user.accountHolder || user.name,
        }),
      });

      await fetch(`${API_BASE}/api/v1/user/bank-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankName: user.bankName,
          accountNumber: user.bankAccount,
          accountName: user.accountHolder || user.name,
        }),
      });
    } catch { }
  }

  return {
    ...user,
    role,
    phone: cleanPhone,
    password,
    email,
    token,
    userId: userId || `usr_${role}_${user.id}`,
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
    fd.append('HarvestDate', '2026-10-19');
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

      // Set pricing
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
        }).catch(() => { });
      }

      return data.data;
    }
  } catch (err) {
    console.warn(`[WARN] Failed to create live batch for ${farmer.name}:`, err.message);
  }
  return null;
}

async function main() {
  console.log('--- STARTING LIVE REGISTRATION FOR 25 PROCESSORS & 29 FARMERS ---');

  const registeredProcessors = [];
  let procCounter = 1;

  for (const p of processorsRaw) {
    const res = await registerOrLoginUser(p, 'Processor');
    const idNumber = `YC-PRS-${String(procCounter).padStart(4, '0')}`;
    procCounter++;
    registeredProcessors.push({ ...res, idNumber });
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log('\n--- REGISTERING FARMERS ---');
  const registeredFarmers = [];
  let farmerCounter = 1;

  for (const f of farmersRaw) {
    const res = await registerOrLoginUser(f, 'Farmer');
    const idNumber = `YC-FRM-${String(farmerCounter).padStart(4, '0')}`;
    farmerCounter++;
    registeredFarmers.push({ ...res, idNumber });
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log('\n--- CREATING CASSAVA BATCHES FOR 29 FARMERS ---');
  const batches = [];
  for (let i = 0; i < registeredFarmers.length; i++) {
    const f = registeredFarmers[i];
    const batchCode = `YC-2026-${String(i + 1).padStart(5, '0')}`;
    const liveBatch = await createFarmerBatch(f, batchCode);
    batches.push({
      batchCode: liveBatch?.batchCode || batchCode,
      farmer: f,
      weightKg: 5000,
      price: f.price,
    });
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('\n--- GENERATING 29 MATCHED ORDERS & POPULATING REGISTRY ---');
  const orders = [];
  const registry = {};

  registeredProcessors.forEach((p) => {
    registry[p.userId.toLowerCase()] = p.idNumber;
    registry[p.phone] = p.idNumber;
    registry[p.name.toLowerCase()] = p.idNumber;
  });

  registeredFarmers.forEach((f) => {
    registry[f.userId.toLowerCase()] = f.idNumber;
    registry[f.phone] = f.idNumber;
    registry[f.name.toLowerCase()] = f.idNumber;
  });

  for (let i = 0; i < registeredFarmers.length; i++) {
    const farmer = registeredFarmers[i];
    const processor = registeredProcessors[i % registeredProcessors.length];
    const orderNum = `ORD-${String(100100 + i)}`;

    orders.push({
      id: `ord-${Date.now()}-${i}`,
      orderNumber: orderNum,
      productTitle: `Fresh Cassava Roots (TME 419) - Lot YC-${2026}-0${i + 1}`,
      category: 'Produce',
      sellerName: farmer.name,
      sellerRole: 'farmer',
      sellerId: farmer.userId,
      sellerIdNumber: farmer.idNumber,
      buyerName: processor.name,
      buyerRole: 'processor',
      buyerId: processor.userId,
      buyerIdNumber: processor.idNumber,
      quantity: 5,
      unit: 'Tonnes',
      totalAmount: farmer.price,
      date: 'Oct 19, 2026',
      deliveryMethod: 'direct-delivery',
      paymentMethod: 'bank-transfer',
      paymentStatus: 'Paid to YucaChain Escrow',
      payoutStatus: i % 3 === 0 ? 'Paid / Disbursed' : 'Pending Admin Payout',
      payoutDate: i % 3 === 0 ? 'Oct 20, 2026' : undefined,
      sellerBankDetails: {
        bankName: farmer.bankName,
        accountNumber: farmer.bankAccount,
        accountName: farmer.accountHolder || farmer.name,
      },
    });
  }

  const outputPayload = {
    processors: registeredProcessors.map((p) => ({
      idNumber: p.idNumber,
      name: p.name,
      role: 'Buyer / Processor',
      phone: p.phone,
      password: p.password,
      bankName: p.bankName,
      accountNumber: p.bankAccount,
      accountHolder: p.accountHolder,
      price: p.price,
      location: p.location,
    })),
    farmers: registeredFarmers.map((f) => ({
      idNumber: f.idNumber,
      name: f.name,
      role: 'Farmer',
      phone: f.phone,
      password: f.password,
      bankName: f.bankName,
      accountNumber: f.bankAccount,
      accountHolder: f.accountHolder,
      price: f.price,
      location: f.location,
    })),
    orders,
    registry,
  };

  const outputPath = path.resolve('app/data/registered_live_data.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputPayload, null, 2));

  console.log(`\n>>> SUCCESSFULLY COMPLETED: Saved ${registeredProcessors.length} processors, ${registeredFarmers.length} farmers, and ${orders.length} orders to ${outputPath}`);
}

main().catch(console.error);
