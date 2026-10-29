"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import {
  getUserProfile,
  updateUserProfile as apiUpdateUserProfile,
  getUserBankDetails,
  updateUserBankDetails as apiUpdateUserBankDetails,
} from "@/app/Services/userService";
import { getOrAllocateUserId } from "@/app/utils/userIdGenerator";
import registeredLiveData from "@/app/data/registered_live_data.json";

export function findRegisteredUserRecord(user?: {
  id?: string;
  idNumber?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
} | null): any {
  if (!user) return null;
  const allRecords = [
    ...(registeredLiveData?.processors || []),
    ...(registeredLiveData?.farmers || []),
  ];

  const cleanPhone = (p?: string | null) => (p || "").replace(/\D/g, "").slice(-10);
  const qPhone = cleanPhone(user.phone || user.phoneNumber);
  const qIdNumber = user.idNumber?.trim().toUpperCase();
  const qName = user.name?.trim().toLowerCase();
  const qEmail = user.email?.trim().toLowerCase();
  const qId = user.id?.trim();

  // 1. Exact ID Number match (e.g. YC-PRS-0001, YC-FRM-0030)
  if (qIdNumber) {
    const found = allRecords.find((r: any) => r.idNumber?.trim().toUpperCase() === qIdNumber);
    if (found) return found;
  }

  // 2. Exact user ID match
  if (qId) {
    const found = allRecords.find((r: any) => r.id === qId);
    if (found) return found;
  }

  // 3. Phone number match (last 10 digits) with name tie-breaking
  if (qPhone) {
    const matches = allRecords.filter((r: any) => cleanPhone(r.phone) === qPhone);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      if (qName) {
        const nameMatch = matches.find((r: any) => r.name?.trim().toLowerCase() === qName);
        if (nameMatch) return nameMatch;
      }
      return matches[0];
    }
  }

  // 4. Exact name match
  if (qName) {
    const found = allRecords.find((r: any) => r.name?.trim().toLowerCase() === qName);
    if (found) return found;
  }

  // 5. Email match
  if (qEmail) {
    const found = allRecords.find((r: any) => r.email?.trim().toLowerCase() === qEmail);
    if (found) return found;
  }

  return null;
}

export const DEFAULT_LIVE_USERS: UserRecordForAdmin[] = [
  ...((registeredLiveData?.processors || []).map((p: any, idx: number) => ({
    id: p.id || `live_prs_${idx + 1}`,
    idNumber: p.idNumber,
    name: p.name,
    email: p.email || `${p.name.toLowerCase().replace(/\s+/g, ".")}@yucachain.com`,
    phone: p.phone,
    role: "processor" as MarketplaceRole,
    address: p.location || "Owode",
    bankName: p.bankName,
    accountNumber: p.accountNumber,
    accountName: p.accountHolder || p.name,
    joinedDate: "Oct 19, 2026",
    status: "Verified" as const,
  }))),
  ...((registeredLiveData?.farmers || []).map((f: any, idx: number) => ({
    id: f.id || `live_frm_${idx + 1}`,
    idNumber: f.idNumber,
    name: f.name,
    email: f.email || `${f.name.toLowerCase().replace(/\s+/g, ".")}@yucachain.com`,
    phone: f.phone,
    role: "farmer" as MarketplaceRole,
    address: f.location || "Owode",
    bankName: f.bankName,
    accountNumber: f.accountNumber,
    accountName: f.accountHolder || f.name,
    joinedDate: f.joinedDate || (idx >= 29 ? "Oct 29, 2026" : "Oct 19, 2026"),
    status: "Verified" as const,
  }))),
];

export type MarketplaceRole = "farmer" | "processor" | "service-provider" | "consumer";

export function normalizeRole(rawRole?: string | null): MarketplaceRole {
  if (!rawRole) return "farmer";
  const lower = rawRole.toLowerCase();
  if (lower.includes("farm") || lower.includes("grower")) return "farmer";
  if (
    lower.includes("process") ||
    lower.includes("buyer") ||
    lower.includes("aggregat") ||
    lower.includes("mill") ||
    lower.includes("off-taker")
  ) {
    return "processor";
  }
  if (
    lower.includes("service") ||
    lower.includes("isp") ||
    lower.includes("vault") ||
    lower.includes("operator") ||
    lower.includes("transport") ||
    lower.includes("machin") ||
    lower.includes("logistic")
  ) {
    return "service-provider";
  }
  if (lower.includes("consum")) return "consumer";
  return "farmer";
}

export interface UserProfile {
  id: string;
  idNumber?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  role: MarketplaceRole;
  avatarUrl?: string;
  companyName?: string;
  businessName?: string;
  farmName?: string;
  address?: string;
  farmAddress?: string;
  facilityAddress?: string;
  businessAddress?: string;
  deliveryAddress?: string;
  state?: string;
  lga?: string;
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
  sellerId?: string;
  sellerIdNumber?: string;
  buyerName: string;
  buyerRole: MarketplaceRole;
  buyerId?: string;
  buyerIdNumber?: string;
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
  idNumber: string;
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
  updateCurrentUser: (
    updates: Partial<UserProfile> & { skipBackendSync?: boolean }
  ) => Promise<void>;
  reloadUserProfile: () => Promise<void>;
  allUsers: UserRecordForAdmin[];
  myOrders: MarketOrderItem[];
  mySales: MarketOrderItem[];
  allTransactions: MarketOrderItem[];
  addListing: (listing: any) => void;
  placeOrder: (order: Partial<MarketOrderItem>) => string;
  disbursePayout: (orderId: string) => void;
}

const EMPTY_USER: UserProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "farmer",
};

const MarketplaceRoleContext = createContext<MarketplaceRoleContextType | undefined>(undefined);

export function MarketplaceRoleProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isAuthenticated } = useAuth();

  const [activeRole, setActiveRoleState] = useState<MarketplaceRole>(() => {
    return normalizeRole(authUser?.role);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (!isAuthenticated || !authUser || !authUser.id) {
      return EMPTY_USER;
    }
    const rawRole = authUser.role;
    const resolvedRole = normalizeRole(rawRole);
    const resolvedName =
      authUser.name ||
      (authUser.firstName && authUser.lastName
        ? `${authUser.firstName} ${authUser.lastName}`
        : "");
    const resolvedPhone = authUser.phoneNumber || "";
    const resolvedEmail = authUser.email || "";

    const matched = findRegisteredUserRecord({
      id: authUser.id,
      idNumber: authUser.idNumber,
      name: resolvedName,
      phone: resolvedPhone,
      email: resolvedEmail,
    });

    let localBank: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw =
          localStorage.getItem("yuca_user_bank_details") ||
          (resolvedPhone ? localStorage.getItem(`yuca_bank_details_${resolvedPhone}`) : null) ||
          (authUser.id ? localStorage.getItem(`yuca_bank_details_${authUser.id}`) : null);
        if (raw) localBank = JSON.parse(raw);
      } catch {}
    }

    const resolvedIdNumber =
      authUser.idNumber ||
      matched?.idNumber ||
      getOrAllocateUserId(resolvedRole, {
        id: authUser.id,
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
      });

    const bankName = localBank?.bankName || matched?.bankName;
    const accountNumber = localBank?.accountNumber || matched?.accountNumber;
    const accountName = localBank?.accountName || matched?.accountHolder || matched?.accountName || resolvedName;

    return {
      ...EMPTY_USER,
      id: authUser.id,
      idNumber: resolvedIdNumber,
      name: resolvedName || matched?.name || "",
      firstName: authUser.firstName || "",
      lastName: authUser.lastName || "",
      email: resolvedEmail,
      phone: resolvedPhone || matched?.phone || "",
      role: resolvedRole,
      address: authUser.deliveryAddress || authUser.address || matched?.location || "Owode, Ogun State",
      farmAddress: authUser.farmAddress,
      facilityAddress: authUser.facilityAddress,
      businessAddress: authUser.businessAddress,
      deliveryAddress: authUser.deliveryAddress || authUser.address,
      state: authUser.state || "Ogun State",
      companyName: authUser.companyName || matched?.name,
      businessName: authUser.businessName || matched?.name,
      farmName: resolvedRole === "farmer" ? `${resolvedName || matched?.name} Cassava Farm` : undefined,
      bankName,
      accountNumber,
      accountName,
    };
  });

  const [allUsers, setAllUsers] = useState<UserRecordForAdmin[]>(() => DEFAULT_LIVE_USERS);
  const [transactions, setTransactions] = useState<MarketOrderItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("yuca_marketplace_orders");
        if (stored) {
          const parsed = JSON.parse(stored);
          const requiredCount = registeredLiveData?.orders?.length || 80;
          if (
            Array.isArray(parsed) &&
            parsed.length >= requiredCount &&
            parsed.some((o: any) => o.date?.includes("Oct 29")) &&
            parsed.some((o: any) => o.productTitle?.includes("Super Yield")) &&
            !parsed.some(
              (o: any) =>
                o.quantity === 5 ||
                !o.date?.includes("M") ||
                (o.sellerIdNumber && o.buyerIdNumber && o.sellerIdNumber.slice(-4) === o.buyerIdNumber.slice(-4))
            )
          ) {
            return parsed;
          }
        }
      } catch {}
    }
    return (registeredLiveData?.orders as MarketOrderItem[]) || [];
  });

  // Hydrate local storage with live orders and bank details for Admin Portal
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("yuca_marketplace_orders");
        const requiredCount = registeredLiveData?.orders?.length || 80;
        let shouldRefresh = !stored;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (
              !Array.isArray(parsed) ||
              parsed.length < requiredCount ||
              !parsed.some((o: any) => o.date?.includes("Oct 29")) ||
              !parsed.some((o: any) => o.productTitle?.includes("Super Yield")) ||
              parsed.some(
                (o: any) =>
                  o.quantity === 5 ||
                  !o.date?.includes("M") ||
                  (o.sellerIdNumber && o.buyerIdNumber && o.sellerIdNumber.slice(-4) === o.buyerIdNumber.slice(-4))
              )
            ) {
              shouldRefresh = true;
            }
          } catch {
            shouldRefresh = true;
          }
        }

        if (shouldRefresh) {
          localStorage.setItem(
            "yuca_marketplace_orders",
            JSON.stringify(registeredLiveData?.orders || [])
          );
          setTransactions(registeredLiveData?.orders as MarketOrderItem[] || []);
        }

        DEFAULT_LIVE_USERS.forEach((u) => {
          if (u.bankName && u.accountNumber && u.bankName !== "—") {
            const bankPayload = JSON.stringify({
              bankName: u.bankName,
              accountNumber: u.accountNumber,
              accountName: u.accountName,
            });
            if (u.id) localStorage.setItem(`yuca_bank_details_${u.id}`, bankPayload);
            if (u.phone) localStorage.setItem(`yuca_bank_details_${u.phone}`, bankPayload);
            if (u.email) localStorage.setItem(`yuca_bank_details_${u.email.toLowerCase()}`, bankPayload);
          }
        });
      } catch (err) {
        console.warn("Storage hydration notice:", err);
      }
    }
  }, []);

  // Load profile and bank details automatically from backend
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !authUser || !authUser.id) {
      setCurrentUser(EMPTY_USER);
      return;
    }

    const rawRole = authUser.role;
    const resolvedRole = normalizeRole(rawRole);
    setActiveRoleState(resolvedRole);

    let profileData: any = null;
    let bankData: any = null;

    try {
      profileData = await getUserProfile();
    } catch {
      // Backend may not be authenticated yet or offline
    }

    if (resolvedRole !== "consumer") {
      try {
        bankData = await getUserBankDetails();
      } catch {
        // Bank details may not be set yet
      }
    }

    const resolvedName =
      profileData?.name ||
      (profileData?.firstName && profileData?.lastName
        ? `${profileData.firstName} ${profileData.lastName}`
        : null) ||
      authUser.name ||
      (authUser.firstName && authUser.lastName
        ? `${authUser.firstName} ${authUser.lastName}`
        : null) ||
      "";

    const resolvedPhone =
      profileData?.phoneNumber ||
      profileData?.phone ||
      authUser.phoneNumber ||
      "";

    const resolvedEmail =
      profileData?.email ||
      authUser.email ||
      "";

    const resolvedIdNumber =
      profileData?.idNumber ||
      authUser.idNumber ||
      getOrAllocateUserId(resolvedRole, {
        id: profileData?.id || authUser.id,
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
      });

    const matchedRecord = findRegisteredUserRecord({
      id: profileData?.id || authUser.id,
      idNumber: resolvedIdNumber,
      name: resolvedName,
      phone: resolvedPhone,
      email: resolvedEmail,
    });

    let localBank: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw =
          localStorage.getItem("yuca_user_bank_details") ||
          (resolvedPhone ? localStorage.getItem(`yuca_bank_details_${resolvedPhone}`) : null) ||
          (authUser.id ? localStorage.getItem(`yuca_bank_details_${authUser.id}`) : null);
        if (raw) localBank = JSON.parse(raw);
      } catch {}
    }

    const resolvedBankName =
      bankData?.bankName ||
      profileData?.bankName ||
      localBank?.bankName ||
      matchedRecord?.bankName ||
      "";

    const resolvedAccountNumber =
      bankData?.accountNumber ||
      profileData?.accountNumber ||
      localBank?.accountNumber ||
      matchedRecord?.accountNumber ||
      "";

    const resolvedAccountName =
      bankData?.accountName ||
      profileData?.accountName ||
      localBank?.accountName ||
      matchedRecord?.accountHolder ||
      matchedRecord?.accountName ||
      resolvedName;

    // Cache bank details in localStorage so other tabs/modals always have it intact
    if (typeof window !== "undefined" && resolvedBankName && resolvedAccountNumber) {
      try {
        const payload = JSON.stringify({
          bankName: resolvedBankName,
          accountNumber: resolvedAccountNumber,
          accountName: resolvedAccountName,
        });
        localStorage.setItem("yuca_user_bank_details", payload);
        if (authUser.id) localStorage.setItem(`yuca_bank_details_${authUser.id}`, payload);
        if (resolvedPhone) localStorage.setItem(`yuca_bank_details_${resolvedPhone}`, payload);
      } catch {}
    }

    const updatedProfile: UserProfile = {
      id: profileData?.id || authUser.id,
      idNumber: resolvedIdNumber || matchedRecord?.idNumber,
      name: resolvedName || matchedRecord?.name || "",
      firstName: profileData?.firstName || authUser.firstName || "",
      lastName: profileData?.lastName || authUser.lastName || "",
      email: resolvedEmail || matchedRecord?.email || "",
      phone: resolvedPhone || matchedRecord?.phone || "",
      role: resolvedRole,
      avatarUrl: profileData?.avatarUrl || authUser.avatarUrl,
      companyName: profileData?.companyName || authUser.companyName || matchedRecord?.name,
      businessName: profileData?.businessName || authUser.businessName || matchedRecord?.name,
      farmName: profileData?.farmName || (resolvedRole === "farmer" ? `${resolvedName || matchedRecord?.name} Cassava Farm` : undefined),
      address: profileData?.address || authUser.deliveryAddress || authUser.address || matchedRecord?.location || "Owode, Ogun State",
      farmAddress: profileData?.farmAddress || authUser.farmAddress,
      facilityAddress: profileData?.facilityAddress || authUser.facilityAddress,
      businessAddress: profileData?.businessAddress || authUser.businessAddress,
      deliveryAddress: profileData?.deliveryAddress || authUser.deliveryAddress || authUser.address,
      state: profileData?.state || authUser.state || "Ogun State",
      lga: profileData?.lga || authUser.lga || "Owode",
      bankName: resolvedBankName,
      accountNumber: resolvedAccountNumber,
      accountName: resolvedAccountName,
    };

    setCurrentUser(updatedProfile);
  }, [authUser, isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setActiveRole = (role: MarketplaceRole) => {
    setActiveRoleState(role);
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const updateCurrentUser = async (
    updates: Partial<UserProfile> & { skipBackendSync?: boolean }
  ) => {
    // 1. Optimistic local update
    const { skipBackendSync, ...userUpdates } = updates;
    setCurrentUser((prev) => ({
      ...prev,
      ...userUpdates,
    }));

    if (typeof window !== "undefined") {
      try {
        const bName = updates.bankName || currentUser.bankName;
        const aNum = updates.accountNumber || currentUser.accountNumber;
        const aName = updates.accountName || currentUser.accountName || currentUser.name;
        if (bName && aNum) {
          const bankPayload = JSON.stringify({
            bankName: bName,
            accountNumber: aNum,
            accountName: aName,
          });
          localStorage.setItem("yuca_user_bank_details", bankPayload);
          if (currentUser.id) localStorage.setItem(`yuca_bank_details_${currentUser.id}`, bankPayload);
          if (currentUser.phone) localStorage.setItem(`yuca_bank_details_${currentUser.phone}`, bankPayload);
        }
      } catch {}
    }

    if (skipBackendSync) {
      return;
    }

    // 2. Persist to PUT /api/v1/user/profile
    try {
      const fullName = updates.name || currentUser.name;
      const nameParts = fullName.trim().split(" ");
      const firstName = updates.firstName ?? (nameParts[0] || "");
      const lastName = updates.lastName ?? (nameParts.slice(1).join(" ") || "");

      await apiUpdateUserProfile({
        name: fullName,
        firstName,
        lastName,
        phoneNumber: updates.phone ?? currentUser.phone,
        address: updates.address ?? currentUser.address,
        farmAddress: updates.farmAddress ?? currentUser.farmAddress,
        facilityAddress: updates.facilityAddress ?? currentUser.facilityAddress,
        businessAddress: updates.businessAddress ?? currentUser.businessAddress,
        deliveryAddress: updates.deliveryAddress ?? currentUser.deliveryAddress,
        avatarUrl: updates.avatarUrl ?? currentUser.avatarUrl,
        state: updates.state ?? currentUser.state,
        lga: updates.lga ?? currentUser.lga,
        farmName: updates.farmName ?? currentUser.farmName,
        businessName: updates.businessName ?? currentUser.businessName,
        companyName: updates.companyName ?? currentUser.companyName,
        bankName: updates.bankName ?? currentUser.bankName,
        accountNumber: updates.accountNumber ?? currentUser.accountNumber,
        accountName: updates.accountName ?? currentUser.accountName,
      });

      // 3. Persist to PUT /api/v1/user/bank-details if non-consumer and bank info provided
      if (
        activeRole !== "consumer" &&
        (updates.bankName || updates.accountNumber || updates.accountName)
      ) {
        await apiUpdateUserBankDetails({
          bankName: updates.bankName || currentUser.bankName || "",
          accountNumber: updates.accountNumber || currentUser.accountNumber || "",
          accountName: updates.accountName || currentUser.accountName || fullName,
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Backend profile sync notice:", err);
    }
  };

  const reloadUserProfile = async () => {
    await loadProfile();
  };

  const addListing = (_listing: any) => {
    // Purge any legacy local storage custom listings - all items must come directly from the real backend API
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("yuca_custom_listings");
      } catch {}
    }
  };

  const placeOrder = (orderData: Partial<MarketOrderItem>): string => {
    const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const sellerRole = orderData.sellerRole || "farmer";
    const sellerIdNum =
      orderData.sellerIdNumber ||
      getOrAllocateUserId(sellerRole, {
        id: orderData.sellerId,
        name: orderData.sellerName,
      });

    const buyerIdNum =
      orderData.buyerIdNumber ||
      currentUser.idNumber ||
      getOrAllocateUserId(activeRole, currentUser);

    const newOrder: MarketOrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      productTitle: orderData.productTitle || "Marketplace Product",
      category: orderData.category || "General",
      sellerName: orderData.sellerName || "Verified Supplier",
      sellerRole: sellerRole,
      sellerId: orderData.sellerId,
      sellerIdNumber: sellerIdNum,
      buyerName: currentUser.name,
      buyerRole: activeRole,
      buyerId: currentUser.id,
      buyerIdNumber: buyerIdNum,
      quantity: orderData.quantity || 1,
      unit: orderData.unit || "Units",
      totalAmount: orderData.totalAmount || 150000,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      deliveryMethod: orderData.deliveryMethod || "direct-delivery",
      paymentMethod: "bank-transfer",
      paymentStatus: "Paid to YucaChain Escrow",
      payoutStatus: "Pending Admin Payout",
      sellerBankDetails: orderData.sellerBankDetails || {
        bankName: currentUser.bankName || "First Bank",
        accountNumber: currentUser.accountNumber || "",
        accountName: currentUser.accountName || currentUser.name,
      },
    };

    setTransactions((prev) => {
      const updated = [newOrder, ...prev];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("yuca_marketplace_orders", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    return orderNum;
  };

  const disbursePayout = (orderId: string) => {
    setTransactions((prev) => {
      const updated = prev.map((t) =>
        t.id === orderId || t.orderNumber === orderId
          ? {
              ...t,
              payoutStatus: "Paid / Disbursed" as const,
              payoutDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : t
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("yuca_marketplace_orders", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const myOrders = useMemo(() => {
    if (!currentUser || (!currentUser.idNumber && !currentUser.name && !currentUser.id && !currentUser.phone)) {
      return [];
    }
    const clean = (s?: string) => (s || "").trim().toLowerCase();
    const curIdNum = (currentUser.idNumber || "").trim().toUpperCase();
    const curName = clean(currentUser.name);
    const curId = currentUser.id;

    const matched = findRegisteredUserRecord(currentUser);
    const matchedIdNum = (matched?.idNumber || "").trim().toUpperCase();
    const matchedName = clean(matched?.name);

    return transactions.filter((t) => {
      const bIdNum = (t.buyerIdNumber || "").trim().toUpperCase();
      const bName = clean(t.buyerName);
      const bId = t.buyerId;

      if (curIdNum && bIdNum && curIdNum === bIdNum) return true;
      if (matchedIdNum && bIdNum && matchedIdNum === bIdNum) return true;
      if (curId && bId && curId === bId) return true;
      if (curName && bName && curName === bName) return true;
      if (matchedName && bName && matchedName === bName) return true;
      return false;
    });
  }, [transactions, currentUser]);

  const mySales = useMemo(() => {
    if (!currentUser || (!currentUser.idNumber && !currentUser.name && !currentUser.id && !currentUser.phone)) {
      return [];
    }
    const clean = (s?: string) => (s || "").trim().toLowerCase();
    const curIdNum = (currentUser.idNumber || "").trim().toUpperCase();
    const curName = clean(currentUser.name);
    const curId = currentUser.id;

    const matched = findRegisteredUserRecord(currentUser);
    const matchedIdNum = (matched?.idNumber || "").trim().toUpperCase();
    const matchedName = clean(matched?.name);

    return transactions.filter((t) => {
      const sIdNum = (t.sellerIdNumber || "").trim().toUpperCase();
      const sName = clean(t.sellerName);
      const sId = t.sellerId;

      if (curIdNum && sIdNum && curIdNum === sIdNum) return true;
      if (matchedIdNum && sIdNum && matchedIdNum === sIdNum) return true;
      if (curId && sId && curId === sId) return true;
      if (curName && sName && curName === sName) return true;
      if (matchedName && sName && matchedName === sName) return true;
      return false;
    });
  }, [transactions, currentUser]);

  return (
    <MarketplaceRoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        updateCurrentUser,
        reloadUserProfile,
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
