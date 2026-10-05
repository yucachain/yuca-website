"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type MarketplaceRole = "farmer" | "processor" | "service-provider" | "consumer";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MarketplaceRole;
  avatarUrl?: string;
  companyName?: string;
  businessName?: string;
  // Role-specific addresses
  farmAddress?: string;
  facilityAddress?: string;
  businessAddress?: string;
  deliveryAddress?: string;
  // Bank details for receiving disbursements / payouts
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface MarketOrderItem {
  id: string;
  orderNumber: string;
  productTitle: string;
  category: string;
  sellerName: string;
  sellerRole: MarketplaceRole;
  buyerName: string;
  buyerRole: MarketplaceRole;
  quantity: number;
  unit: string;
  totalAmount: number;
  date: string;
  deliveryMethod: "yucavault-pickup" | "direct-delivery" | "hub-pickup";
  paymentMethod: "bank-transfer";
  paymentStatus: "Paid to YucaChain Escrow" | "Pending Payment";
  payoutStatus: "Pending Admin Payout" | "Paid / Disbursed";
  payoutDate?: string;
  sellerBankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface UserRecordForAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MarketplaceRole;
  address: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  joinedDate: string;
  status: "Active" | "Verified";
  totalSalesCount?: number;
  totalOrdersCount?: number;
}

interface MarketplaceRoleContextType {
  activeRole: MarketplaceRole;
  setActiveRole: (role: MarketplaceRole) => void;
  currentUser: UserProfile;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  allUsers: UserRecordForAdmin[];
  myOrders: MarketOrderItem[]; // orders bought
  mySales: MarketOrderItem[]; // orders sold
  allTransactions: MarketOrderItem[]; // for Admin
  addListing: (listing: any) => void;
  placeOrder: (order: Partial<MarketOrderItem>) => string;
  disbursePayout: (orderId: string) => void;
}

const INITIAL_USERS: UserRecordForAdmin[] = [
  {
    id: "usr-f01",
    name: "Musa Ibrahim",
    email: "musa.ibrahim@farms.ng",
    phone: "+234 803 456 7890",
    role: "farmer",
    address: "Iseyin Agro Cluster, Farm Block 4B, Oyo State",
    bankName: "First Bank of Nigeria",
    accountNumber: "3084920194",
    accountName: "Musa Ibrahim Farm Ent.",
    joinedDate: "12 Jan 2026",
    status: "Verified",
    totalSalesCount: 14,
    totalOrdersCount: 2,
  },
  {
    id: "usr-f02",
    name: "Grace Adeyemi",
    email: "grace.adeyemi@yuca.farm",
    phone: "+234 812 345 6789",
    role: "farmer",
    address: "Abeokuta North Cassava Outgrowers, Ogun State",
    bankName: "Zenith Bank",
    accountNumber: "2019485736",
    accountName: "Grace Adeyemi",
    joinedDate: "18 Jan 2026",
    status: "Verified",
    totalSalesCount: 8,
    totalOrdersCount: 3,
  },
  {
    id: "usr-p01",
    name: "PrimeStarch & Flour Mills Ltd",
    email: "procurement@primestarch.com",
    phone: "+234 802 888 1234",
    role: "processor",
    address: "Plot 14 Industrial Layout, Agbara Industrial Zone, Ogun State",
    bankName: "Access Bank",
    accountNumber: "0094857382",
    accountName: "PrimeStarch & Flour Mills Ltd",
    joinedDate: "05 Jan 2026",
    status: "Verified",
    totalSalesCount: 22,
    totalOrdersCount: 19,
  },
  {
    id: "usr-p02",
    name: "Supreme Garri Processors",
    email: "sales@supremegarri.ng",
    phone: "+234 809 111 4455",
    role: "processor",
    address: "Kilometer 8, Benin-Ore Expressway, Ondo State",
    bankName: "United Bank for Africa (UBA)",
    accountNumber: "1029384756",
    accountName: "Supreme Agro Processors Nig",
    joinedDate: "20 Feb 2026",
    status: "Verified",
    totalSalesCount: 19,
    totalOrdersCount: 11,
  },
  {
    id: "usr-s01",
    name: "AgroMech Machinery & Tractor Lease",
    email: "rentals@agromech.ng",
    phone: "+234 805 777 9900",
    role: "service-provider",
    address: "Central Mechanization Hub, Iwo Road, Ibadan, Oyo State",
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0149586738",
    accountName: "AgroMech Solutions Ltd",
    joinedDate: "10 Feb 2026",
    status: "Verified",
    totalSalesCount: 31,
    totalOrdersCount: 4,
  },
  {
    id: "usr-s02",
    name: "IITA Certified Seedling & Stems Hub",
    email: "stems@iitahub.org",
    phone: "+234 818 222 3344",
    role: "service-provider",
    address: "Research Outpost 2, Moor Plantation, Ibadan, Oyo State",
    bankName: "Sterling Bank",
    accountNumber: "0059382716",
    accountName: "Cassava Stem Multiplication Co.",
    joinedDate: "25 Jan 2026",
    status: "Verified",
    totalSalesCount: 16,
    totalOrdersCount: 1,
  },
  {
    id: "usr-c01",
    name: "Chukwudi Okafor",
    email: "chukwudi.okafor@gmail.com",
    phone: "+234 803 999 1122",
    role: "consumer",
    address: "24 Admiralty Way, Lekki Phase 1, Lagos State",
    bankName: "Standard Chartered",
    accountNumber: "5002938471",
    accountName: "Chukwudi Okafor",
    joinedDate: "02 Mar 2026",
    status: "Active",
    totalSalesCount: 0,
    totalOrdersCount: 6,
  },
  {
    id: "usr-c02",
    name: "Amina Yusuf",
    email: "amina.yusuf@outlook.com",
    phone: "+234 814 555 8899",
    role: "consumer",
    address: "15 Gana Street, Maitama, Abuja FCT",
    bankName: "Stanbic IBTC Bank",
    accountNumber: "9048372615",
    accountName: "Amina Yusuf",
    joinedDate: "14 Feb 2026",
    status: "Active",
    totalSalesCount: 0,
    totalOrdersCount: 4,
  },
];

const INITIAL_TRANSACTIONS: MarketOrderItem[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-948201",
    productTitle: "Fresh TME 419 High-Starch Cassava (Grade A)",
    category: "Raw Cassava Batches",
    sellerName: "Musa Ibrahim Farm Ent.",
    sellerRole: "farmer",
    buyerName: "PrimeStarch & Flour Mills Ltd",
    buyerRole: "processor",
    quantity: 25,
    unit: "Tonnes",
    totalAmount: 3750000,
    date: "28 Sep 2026",
    deliveryMethod: "yucavault-pickup",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: "Pending Admin Payout",
    sellerBankDetails: {
      bankName: "First Bank of Nigeria",
      accountNumber: "3084920194",
      accountName: "Musa Ibrahim Farm Ent.",
    },
  },
  {
    id: "ord-102",
    orderNumber: "ORD-839120",
    productTitle: "High Quality Cassava Flour (HQCF) 50kg Bags",
    category: "Process Products",
    sellerName: "PrimeStarch & Flour Mills Ltd",
    sellerRole: "processor",
    buyerName: "Chukwudi Okafor",
    buyerRole: "consumer",
    quantity: 10,
    unit: "Bags",
    totalAmount: 480000,
    date: "29 Sep 2026",
    deliveryMethod: "direct-delivery",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: "Paid / Disbursed",
    payoutDate: "30 Sep 2026",
    sellerBankDetails: {
      bankName: "Access Bank",
      accountNumber: "0094857382",
      accountName: "PrimeStarch & Flour Mills Ltd",
    },
  },
  {
    id: "ord-103",
    orderNumber: "ORD-729481",
    productTitle: "Heavy-Duty Cassava Ridge Tractor Lease (5 Days)",
    category: "Machinery Lease",
    sellerName: "AgroMech Solutions Ltd",
    sellerRole: "service-provider",
    buyerName: "Grace Adeyemi",
    buyerRole: "farmer",
    quantity: 5,
    unit: "Days",
    totalAmount: 625000,
    date: "30 Sep 2026",
    deliveryMethod: "direct-delivery",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: "Pending Admin Payout",
    sellerBankDetails: {
      bankName: "Guaranty Trust Bank (GTBank)",
      accountNumber: "0149586738",
      accountName: "AgroMech Solutions Ltd",
    },
  },
  {
    id: "ord-104",
    orderNumber: "ORD-618492",
    productTitle: "Premium Yellow Cassava Garri (Ijebu White & Yellow)",
    category: "Process Products",
    sellerName: "Supreme Agro Processors Nig",
    sellerRole: "processor",
    buyerName: "Amina Yusuf",
    buyerRole: "consumer",
    quantity: 5,
    unit: "Bags",
    totalAmount: 175000,
    date: "01 Oct 2026",
    deliveryMethod: "direct-delivery",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: "Pending Admin Payout",
    sellerBankDetails: {
      bankName: "United Bank for Africa (UBA)",
      accountNumber: "1029384756",
      accountName: "Supreme Agro Processors Nig",
    },
  },
  {
    id: "ord-105",
    orderNumber: "ORD-509381",
    productTitle: "Certified Pro-Vitamin A Cassava Stems (50 Bundles)",
    category: "Inputs & Seeds",
    sellerName: "Cassava Stem Multiplication Co.",
    sellerRole: "service-provider",
    buyerName: "Musa Ibrahim Farm Ent.",
    buyerRole: "farmer",
    quantity: 50,
    unit: "Bundles",
    totalAmount: 225000,
    date: "25 Sep 2026",
    deliveryMethod: "direct-delivery",
    paymentMethod: "bank-transfer",
    paymentStatus: "Paid to YucaChain Escrow",
    payoutStatus: "Paid / Disbursed",
    payoutDate: "27 Sep 2026",
    sellerBankDetails: {
      bankName: "Sterling Bank",
      accountNumber: "0059382716",
      accountName: "Cassava Stem Multiplication Co.",
    },
  },
];

const ROLE_PROFILES: Record<MarketplaceRole, UserProfile> = {
  farmer: {
    id: "usr-f01",
    name: "Musa Ibrahim",
    email: "musa.ibrahim@farms.ng",
    phone: "+234 803 456 7890",
    role: "farmer",
    farmAddress: "Iseyin Agro Cluster, Farm Block 4B, Oyo State",
    bankName: "First Bank of Nigeria",
    accountNumber: "3084920194",
    accountName: "Musa Ibrahim Farm Ent.",
  },
  processor: {
    id: "usr-p01",
    name: "PrimeStarch & Flour Mills Ltd",
    email: "procurement@primestarch.com",
    phone: "+234 802 888 1234",
    role: "processor",
    facilityAddress: "Plot 14 Industrial Layout, Agbara Industrial Zone, Ogun State",
    bankName: "Access Bank",
    accountNumber: "0094857382",
    accountName: "PrimeStarch & Flour Mills Ltd",
  },
  "service-provider": {
    id: "usr-s01",
    name: "AgroMech Machinery & Tractor Lease",
    email: "rentals@agromech.ng",
    phone: "+234 805 777 9900",
    role: "service-provider",
    businessAddress: "Central Mechanization Hub, Iwo Road, Ibadan, Oyo State",
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0149586738",
    accountName: "AgroMech Solutions Ltd",
  },
  consumer: {
    id: "usr-c01",
    name: "Chukwudi Okafor",
    email: "chukwudi.okafor@gmail.com",
    phone: "+234 803 999 1122",
    role: "consumer",
    deliveryAddress: "24 Admiralty Way, Lekki Phase 1, Lagos State",
    bankName: "Standard Chartered",
    accountNumber: "5002938471",
    accountName: "Chukwudi Okafor",
  },
};

const MarketplaceRoleContext = createContext<MarketplaceRoleContextType | undefined>(undefined);

export function MarketplaceRoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<MarketplaceRole>("farmer");
  const [currentUser, setCurrentUser] = useState<UserProfile>(ROLE_PROFILES.farmer);
  const [allUsers, setAllUsers] = useState<UserRecordForAdmin[]>(INITIAL_USERS);
  const [transactions, setTransactions] = useState<MarketOrderItem[]>(INITIAL_TRANSACTIONS);

  // Sync profile when role switches
  const setActiveRole = (role: MarketplaceRole) => {
    setActiveRoleState(role);
    setCurrentUser(ROLE_PROFILES[role]);
    try {
      localStorage.setItem("yuca_active_marketplace_role", role);
    } catch {}
  };

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("yuca_active_marketplace_role") as MarketplaceRole;
      if (savedRole && ROLE_PROFILES[savedRole]) {
        setActiveRoleState(savedRole);
        setCurrentUser(ROLE_PROFILES[savedRole]);
      }
    } catch {}
  }, []);

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      // Also update in allUsers for Admin view
      setAllUsers((users) =>
        users.map((u) =>
          u.id === prev.id
            ? {
                ...u,
                name: updated.name || u.name,
                phone: updated.phone || u.phone,
                bankName: updated.bankName || u.bankName,
                accountNumber: updated.accountNumber || u.accountNumber,
                accountName: updated.accountName || u.accountName,
                address:
                  updated.farmAddress ||
                  updated.facilityAddress ||
                  updated.businessAddress ||
                  updated.deliveryAddress ||
                  u.address,
              }
            : u
        )
      );
      return updated;
    });
  };

  const addListing = (listing: any) => {
    // Add locally to window/storage or trigger visual confirmation
    try {
      const existing = JSON.parse(localStorage.getItem("yuca_custom_listings") || "[]");
      existing.unshift(listing);
      localStorage.setItem("yuca_custom_listings", JSON.stringify(existing));
    } catch {}
  };

  const placeOrder = (orderData: Partial<MarketOrderItem>): string => {
    const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: MarketOrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      productTitle: orderData.productTitle || "Marketplace Product",
      category: orderData.category || "General",
      sellerName: orderData.sellerName || "Verified Supplier",
      sellerRole: orderData.sellerRole || "farmer",
      buyerName: currentUser.name,
      buyerRole: activeRole,
      quantity: orderData.quantity || 1,
      unit: orderData.unit || "Units",
      totalAmount: orderData.totalAmount || 150000,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      deliveryMethod: orderData.deliveryMethod || "direct-delivery",
      paymentMethod: "bank-transfer",
      paymentStatus: "Paid to YucaChain Escrow",
      payoutStatus: "Pending Admin Payout",
      sellerBankDetails: orderData.sellerBankDetails || {
        bankName: "First Bank",
        accountNumber: "3084920194",
        accountName: "Musa Ibrahim Farm Ent.",
      },
    };

    setTransactions((prev) => [newOrder, ...prev]);
    return orderNum;
  };

  const disbursePayout = (orderId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === orderId || t.orderNumber === orderId
          ? {
              ...t,
              payoutStatus: "Paid / Disbursed",
              payoutDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : t
      )
    );
  };

  // Filter for active role
  const myOrders = transactions.filter((t) => t.buyerName === currentUser.name || t.buyerRole === activeRole);
  const mySales = transactions.filter((t) => t.sellerName === currentUser.name || t.sellerRole === activeRole);

  return (
    <MarketplaceRoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        updateCurrentUser,
        allUsers,
        myOrders,
        mySales,
        allTransactions: transactions,
        addListing,
        placeOrder,
        disbursePayout,
      }}
    >
      {children}
    </MarketplaceRoleContext.Provider>
  );
}

export function useMarketplaceRole() {
  const context = useContext(MarketplaceRoleContext);
  if (!context) {
    throw new Error("useMarketplaceRole must be used within a MarketplaceRoleProvider");
  }
  return context;
}
