"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import {
  getUserProfile,
  updateUserProfile as apiUpdateUserProfile,
  getUserBankDetails,
  updateUserBankDetails as apiUpdateUserBankDetails,
} from "@/app/Services/userService";

export type MarketplaceRole = "farmer" | "processor" | "service-provider" | "consumer";

export function normalizeRole(rawRole?: string | null): MarketplaceRole {
  if (!rawRole) return "farmer";
  const lower = rawRole.toLowerCase();
  if (lower.includes("farm")) return "farmer";
  if (
    lower.includes("process") ||
    lower.includes("buyer") ||
    lower.includes("mill") ||
    lower.includes("off-taker")
  ) {
    return "processor";
  }
  if (
    lower.includes("service") ||
    lower.includes("transport") ||
    lower.includes("machin")
  ) {
    return "service-provider";
  }
  if (lower.includes("consum")) return "consumer";
  return "farmer";
}

export interface UserProfile {
  id: string;
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
  updateCurrentUser: (updates: Partial<UserProfile>) => Promise<void>;
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
  name: "Marketplace User",
  email: "",
  phone: "",
  role: "farmer",
};

const MarketplaceRoleContext = createContext<MarketplaceRoleContextType | undefined>(undefined);

export function MarketplaceRoleProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();

  const [activeRole, setActiveRoleState] = useState<MarketplaceRole>(() => {
    return normalizeRole(authUser?.role);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => ({
    ...EMPTY_USER,
    id: authUser?.id || "",
    name: authUser?.name || "Marketplace User",
    email: authUser?.email || "",
    phone: authUser?.phoneNumber || "",
    role: normalizeRole(authUser?.role),
    farmAddress: authUser?.farmAddress,
    facilityAddress: authUser?.facilityAddress,
    businessAddress: authUser?.businessAddress,
    deliveryAddress: authUser?.deliveryAddress,
    companyName: authUser?.companyName,
    businessName: authUser?.businessName,
  }));

  const [allUsers, setAllUsers] = useState<UserRecordForAdmin[]>([]);
  const [transactions, setTransactions] = useState<MarketOrderItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("yuca_marketplace_orders");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Load profile and bank details automatically from backend
  const loadProfile = useCallback(async () => {
    const rawRole = authUser?.role;
    const resolvedRole = normalizeRole(rawRole);
    setActiveRoleState(resolvedRole);

    const hasToken =
      typeof window !== "undefined" &&
      Boolean(
        localStorage.getItem("accessToken") ||
        localStorage.getItem("yuca_access_token")
      );

    // Only query backend if user is authenticated with a token
    if (!hasToken && !authUser) {
      return;
    }

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
      authUser?.name ||
      "Marketplace User";

    const resolvedPhone =
      profileData?.phoneNumber ||
      authUser?.phoneNumber ||
      "";

    const resolvedEmail =
      profileData?.email ||
      authUser?.email ||
      "";

    const updatedProfile: UserProfile = {
      id: profileData?.id || authUser?.id || "user",
      name: resolvedName,
      firstName: profileData?.firstName || authUser?.firstName || "",
      lastName: profileData?.lastName || authUser?.lastName || "",
      email: resolvedEmail,
      phone: resolvedPhone,
      role: resolvedRole,
      avatarUrl: profileData?.avatarUrl || authUser?.avatarUrl,
      companyName: profileData?.companyName || authUser?.companyName,
      businessName: profileData?.businessName || authUser?.businessName,
      farmName: profileData?.farmName,
      address: profileData?.address,
      farmAddress: profileData?.farmAddress || authUser?.farmAddress,
      facilityAddress: profileData?.facilityAddress || authUser?.facilityAddress,
      businessAddress: profileData?.businessAddress || authUser?.businessAddress,
      deliveryAddress: profileData?.deliveryAddress || authUser?.deliveryAddress,
      state: profileData?.state,
      lga: profileData?.lga,
      bankName: bankData?.bankName || profileData?.bankName,
      accountNumber: bankData?.accountNumber || profileData?.accountNumber,
      accountName: bankData?.accountName || profileData?.accountName || resolvedName,
    };

    setCurrentUser(updatedProfile);
  }, [authUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setActiveRole = (role: MarketplaceRole) => {
    setActiveRoleState(role);
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const updateCurrentUser = async (updates: Partial<UserProfile>) => {
    // 1. Optimistic local update
    setCurrentUser((prev) => ({
      ...prev,
      ...updates,
    }));

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

  const addListing = (listing: any) => {
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

  const myOrders = transactions.filter(
    (t) => t.buyerName === currentUser.name || t.buyerRole === activeRole
  );
  const mySales = transactions.filter(
    (t) => t.sellerName === currentUser.name || t.sellerRole === activeRole
  );

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
