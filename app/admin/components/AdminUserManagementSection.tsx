"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  MapPin,
  Sprout,
  Factory,
  Tractor,
  ShoppingBag,
  Eye,
  X,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useMarketplaceRole,
  MarketplaceRole,
  UserRecordForAdmin,
  normalizeRole,
} from "@/app/marketplace/context/MarketplaceRoleContext";
import { AdminApiService } from "@/app/Services/admin";

const ROLE_BADGES: Record<
  MarketplaceRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  farmer: {
    label: "Farmer",
    icon: <Sprout size={11} />,
    color: "bg-emerald-50 text-[#226049] border-emerald-200",
  },
  processor: {
    label: "Buyer / Processor",
    icon: <Factory size={11} />,
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  "service-provider": {
    label: "Service Provider",
    icon: <Tractor size={11} />,
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  consumer: {
    label: "Consumer",
    icon: <ShoppingBag size={11} />,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

import { toast } from "sonner";

export default function AdminUserManagementSection() {
  const { allUsers, currentUser } = useMarketplaceRole();
  const [remoteUsers, setRemoteUsers] = useState<UserRecordForAdmin[]>([]);
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);

  const fetchPlatformUsers = async () => {
    try {
      setLoadingUsers(true);
      const [usersRes, userTypesRes] = await Promise.allSettled([
        AdminApiService.getUsers({ page: 1, pageSize: 100 }),
        AdminApiService.getUserTypes(),
      ]);

      if (userTypesRes.status === "fulfilled" && userTypesRes.value) {
        const ut = Array.isArray(userTypesRes.value)
          ? userTypesRes.value
          : Array.isArray((userTypesRes.value as any)?.data)
            ? (userTypesRes.value as any).data
            : [];
        setUserTypes(ut);
      }

      if (usersRes.status === "fulfilled" && usersRes.value) {
        const val: any = usersRes.value;
        const rawList: any[] = Array.isArray(val)
          ? val
          : Array.isArray(val?.items)
            ? val.items
            : Array.isArray(val?.data)
              ? val.data
              : Array.isArray(val?.users)
                ? val.users
                : [];

        const mapped: UserRecordForAdmin[] = rawList.map((u: any) => {
          const displayName =
            u.name ||
            u.fullName ||
            [u.firstName, u.lastName].filter(Boolean).join(" ") ||
            u.username ||
            u.email?.split("@")[0] ||
            "Platform User";

          const rawRole =
            u.userType?.name ||
            u.userType?.value ||
            u.userType ||
            u.role ||
            u.userRole ||
            u.accountType ||
            u.type;

          const role = normalizeRole(
            typeof rawRole === "string" ? rawRole : String(rawRole || "")
          );

          const phone = u.phone || u.phoneNumber || u.telephone || "—";
          const location =
            u.address ||
            u.location ||
            [u.lga, u.state].filter(Boolean).join(", ") ||
            u.city ||
            "—";

          const rawStatus = String(u.status || "").toLowerCase();
          const isSuspended =
            rawStatus.includes("suspend") || rawStatus.includes("inactive");

          // Extract bank details from possible nested objects on the user record
          const rawBankName =
            u.bankName ||
            u.bankDetails?.bankName ||
            u.bankDetail?.bankName ||
            u.bankAccount?.bankName ||
            u.bank?.name ||
            u.bank?.bankName ||
            u.bank_name ||
            "";

          const rawAccountNumber =
            u.accountNumber ||
            u.bankDetails?.accountNumber ||
            u.bankDetail?.accountNumber ||
            u.bankAccount?.accountNumber ||
            u.bank?.accountNumber ||
            u.account_number ||
            "";

          const rawAccountName =
            u.accountName ||
            u.bankDetails?.accountName ||
            u.bankDetail?.accountName ||
            u.bankAccount?.accountName ||
            u.bank?.accountName ||
            u.account_name ||
            "";

          let finalBankName = rawBankName;
          let finalAccountNumber = rawAccountNumber;
          let finalAccountName = rawAccountName;

          const isSelf =
            Boolean(currentUser?.id && u.id && String(currentUser.id) === String(u.id)) ||
            Boolean(currentUser?.email && u.email && currentUser.email.toLowerCase() === String(u.email).toLowerCase());

          if (isSelf && (currentUser?.bankName || currentUser?.accountNumber)) {
            finalBankName = finalBankName || currentUser.bankName || "";
            finalAccountNumber = finalAccountNumber || currentUser.accountNumber || "";
            finalAccountName = finalAccountName || currentUser.accountName || "";
          }

          const localMatch = allUsers.find(
            (lu) =>
              (lu.id && u.id && String(lu.id) === String(u.id)) ||
              (lu.email && u.email && lu.email.toLowerCase() === String(u.email).toLowerCase())
          );
          if (localMatch && (localMatch.bankName !== "—" || localMatch.accountNumber !== "—")) {
            finalBankName = finalBankName || localMatch.bankName;
            finalAccountNumber = finalAccountNumber || localMatch.accountNumber;
            finalAccountName = finalAccountName || localMatch.accountName;
          }

          if (!finalBankName || !finalAccountNumber) {
            try {
              const keysToCheck = [
                u.id ? `yuca_bank_details_${u.id}` : null,
                u.email ? `yuca_bank_details_${String(u.email).toLowerCase()}` : null,
                isSelf ? "yuca_user_bank_details" : null,
              ].filter(Boolean) as string[];

              for (const key of keysToCheck) {
                const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
                if (cached) {
                  const parsed = JSON.parse(cached);
                  if (parsed.bankName) finalBankName = finalBankName || parsed.bankName;
                  if (parsed.accountNumber) finalAccountNumber = finalAccountNumber || parsed.accountNumber;
                  if (parsed.accountName) finalAccountName = finalAccountName || parsed.accountName;
                  if (finalBankName && finalAccountNumber) break;
                }
              }
            } catch {}
          }

          return {
            id: u.id || String(Math.random()),
            name: displayName,
            email: u.email || "",
            phone,
            role,
            address: location,
            bankName: finalBankName || "—",
            accountNumber: finalAccountNumber || "—",
            accountName: finalAccountName || displayName || "—",
            joinedDate:
              u.createdAt || u.createdDate
                ? new Date(u.createdAt || u.createdDate).toLocaleDateString()
                : "Recent",
            status: isSuspended ? "Active" : "Verified",
          };
        });

        setRemoteUsers(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch users or user types from backend:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPlatformUsers();
  }, []);

  const effectiveUsers = useMemo(() => {
    if (remoteUsers.length > 0) return remoteUsers;
    return allUsers;
  }, [remoteUsers, allUsers]);

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForModal, setSelectedUserForModal] =
    useState<UserRecordForAdmin | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    return effectiveUsers.filter((u) => {
      const matchRole =
        selectedRoleFilter === "all" || u.role === selectedRoleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.address.toLowerCase().includes(q) ||
        u.bankName.toLowerCase().includes(q);

      return matchRole && matchSearch;
    });
  }, [effectiveUsers, selectedRoleFilter, searchQuery]);

  const roleCounts = useMemo(() => {
    return {
      all: effectiveUsers.length,
      farmer: effectiveUsers.filter((u) => u.role === "farmer").length,
      processor: effectiveUsers.filter((u) => u.role === "processor").length,
      "service-provider": effectiveUsers.filter((u) => u.role === "service-provider").length,
      consumer: effectiveUsers.filter((u) => u.role === "consumer").length,
    };
  }, [effectiveUsers]);

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = async (user: UserRecordForAdmin) => {
    setSelectedUserForModal(user);
    if (user.role === "consumer") return;

    // 1. If user already has bank details populated, display immediately
    if (user.bankName && user.bankName !== "—" && user.accountNumber && user.accountNumber !== "—") {
      return;
    }

    // 2. Check localStorage / cached keys
    try {
      const keysToCheck = [
        user.id ? `yuca_bank_details_${user.id}` : null,
        user.email ? `yuca_bank_details_${user.email.toLowerCase()}` : null,
        "yuca_user_bank_details",
      ].filter(Boolean) as string[];

      for (const key of keysToCheck) {
        const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.bankName || parsed.accountNumber) {
            const enriched: UserRecordForAdmin = {
              ...user,
              bankName: parsed.bankName || user.bankName,
              accountNumber: parsed.accountNumber || user.accountNumber,
              accountName: parsed.accountName || user.accountName || user.name,
            };
            setSelectedUserForModal(enriched);
            setRemoteUsers((prev) =>
              prev.map((u) => (u.id === user.id ? enriched : u))
            );
            return;
          }
        }
      }
    } catch {}

    // 3. If this user is the active session user, try fetching from /api/v1/user/bank-details
    const isSelf =
      Boolean(currentUser?.id && user.id && String(currentUser.id) === String(user.id)) ||
      Boolean(currentUser?.email && user.email && currentUser.email.toLowerCase() === user.email.toLowerCase());

    if (isSelf) {
      try {
        setLoadingBankDetails(true);
        const bankData = await AdminApiService.getUserBankDetails();
        if (bankData && (bankData.bankName || bankData.accountNumber)) {
          const enriched: UserRecordForAdmin = {
            ...user,
            bankName: bankData.bankName || user.bankName,
            accountNumber: bankData.accountNumber || user.accountNumber,
            accountName: bankData.accountName || user.accountName || user.name,
          };
          setSelectedUserForModal(enriched);
          setRemoteUsers((prev) =>
            prev.map((u) => (u.id === user.id ? enriched : u))
          );
        }
      } catch {
        // Silently handled
      } finally {
        setLoadingBankDetails(false);
      }
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header (Clean, no redundant badges) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            User Directory &amp; Roles
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage platform participants across all ecosystem roles and inspect verified settlement accounts.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards matching Overview Inspiration Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Registered Users</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <Users size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {roleCounts.all} Active
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Filtered across 4 ecosystem roles</p>
        </div>

        {/* Card 2: Farmers */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Cassava Farmers</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#226049]">
              <Sprout size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {roleCounts.farmer} Farmers
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Root producers &amp; harvest suppliers</p>
        </div>

        {/* Card 3: Processors */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Processors &amp; Buyers</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-700">
              <Factory size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {roleCounts.processor} Buyers
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Flour, garri &amp; industrial buyers</p>
        </div>

        {/* Card 4: Service Providers */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Service Providers</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-amber-700">
              <Tractor size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {roleCounts["service-provider"]} Providers
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Tractor hire &amp; equipment providers</p>
        </div>
      </div>

      {/* Clean Filter Tabs & Search Bar */}
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl self-start overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Users", count: roleCounts.all },
              { id: "farmer", label: "Farmers", count: roleCounts.farmer },
              { id: "processor", label: "Processors", count: roleCounts.processor },
              { id: "service-provider", label: "Service Providers", count: roleCounts["service-provider"] },
              { id: "consumer", label: "Consumers", count: roleCounts.consumer },
            ].map((tab) => {
              const isSelected = selectedRoleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRoleFilter(tab.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected
                    ? "bg-white text-gray-900 shadow-2xs font-bold"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isSelected
                      ? "bg-emerald-100 text-[#226049]"
                      : "bg-gray-200/80 text-gray-500"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-9 pr-8 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#226049] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table (Clean Inspiration Layout) */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-gray-400 font-semibold text-[11px] border-b border-gray-100 pb-3">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedUserIds.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#226049] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">User &amp; Contact</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Location / Address</th>
                <th className="py-3 px-3">Payout Bank Account</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {loadingUsers ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Loader2 size={24} className="mx-auto mb-2 text-[#226049] animate-spin" />
                    <p className="font-semibold text-gray-600">Loading registered platform users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                    <p className="font-semibold text-gray-600">No users match your criteria</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Try adjusting your role filter or search term</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const badge = ROLE_BADGES[user.role] || ROLE_BADGES.farmer;
                  const isChecked = selectedUserIds.includes(user.id);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/60 transition-colors text-xs text-gray-800"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectUser(user.id)}
                          className="rounded border-gray-300 text-[#226049] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* User & Contact */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xs font-bold text-[#226049]">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900 text-xs">{user.name}</p>
                              {user.status === "Verified" && (
                                <CheckCircle2 size={12} className="text-emerald-600" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">{user.email}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{user.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${badge.color}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="flex items-start gap-1 text-gray-600">
                          <MapPin size={12} className="shrink-0 text-gray-400 mt-0.5" />
                          <span className="truncate">
                            {user.address}
                          </span>
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-3">
                        {user.role === "consumer" ? (
                          <span className="text-[11px] text-gray-400 italic">
                            Buyer
                          </span>
                        ) : (
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">{user.bankName}</p>
                            <p className="font-mono text-gray-600 text-[11px] tracking-wide">
                              {user.accountNumber}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {user.status || "Verified"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-xs text-gray-400">
          <span>Showing {filteredUsers.length} of {effectiveUsers.length} registered platform users</span>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 font-sans">
            <button
              type="button"
              onClick={() => setSelectedUserForModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-base font-bold text-[#226049]">
                {selectedUserForModal.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {selectedUserForModal.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold border mt-0.5 ${ROLE_BADGES[selectedUserForModal.role].color
                    }`}
                >
                  {ROLE_BADGES[selectedUserForModal.role].icon}
                  <span>{ROLE_BADGES[selectedUserForModal.role].label}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Phone Number</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedUserForModal.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Email Address</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedUserForModal.email}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Address / Location</p>
                <p className="font-semibold text-gray-900 mt-1 leading-relaxed">
                  {selectedUserForModal.address}
                </p>
              </div>

              {selectedUserForModal.role !== "consumer" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                  <div className="flex items-center justify-between text-[#226049] font-bold mb-2">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={14} />
                      <span>Designated Payout Account</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(selectedUserForModal)}
                      disabled={loadingBankDetails}
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer"
                    >
                      <RefreshCw size={10} className={loadingBankDetails ? "animate-spin" : ""} />
                      <span>{loadingBankDetails ? "Fetching..." : "Refresh Bank"}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500">Bank Name</p>
                      <p className="font-bold text-gray-900">{selectedUserForModal.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Account Number</p>
                      <p className="font-mono font-bold text-gray-900">
                        {selectedUserForModal.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-200/60">
                    <p className="text-[10px] text-gray-500">Account Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUserForModal.accountName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                disabled={updatingStatusUserId === selectedUserForModal.id}
                onClick={async () => {
                  const targetStatus = selectedUserForModal.status === "Verified" ? "Suspended" : "Active";
                  try {
                    setUpdatingStatusUserId(selectedUserForModal.id);
                    await AdminApiService.updateUserStatus(selectedUserForModal.id, {
                      status: targetStatus,
                    });
                    toast.success(`User status successfully updated to ${targetStatus}`);
                    setSelectedUserForModal((prev) =>
                      prev
                        ? {
                          ...prev,
                          status: targetStatus === "Suspended" ? "Active" : "Verified",
                        }
                        : null
                    );
                    fetchPlatformUsers();
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to update user status");
                  } finally {
                    setUpdatingStatusUserId(null);
                  }
                }}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {updatingStatusUserId === selectedUserForModal.id
                  ? "Updating..."
                  : selectedUserForModal.status === "Verified"
                    ? "Suspend User"
                    : "Activate User"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserForModal(null)}
                className="rounded-xl bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
