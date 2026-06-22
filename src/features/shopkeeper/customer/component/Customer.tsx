"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  useCustomersByShopkeeper,
  useDeleteCustomer,
} from "../../inventory/hooks/useInventory";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  UserCheck,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerFormModal } from "./modals/CustomerFormModal";
import { toast } from "sonner";
import type { Customer } from "../../inventory/types";

export default function Customer() {
  const { data: session } = useSession();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const {
    data: customersResponse,
    isLoading,
    isError,
  } = useCustomersByShopkeeper(shopkeeperId || "");
  const deleteCustomerMutation = useDeleteCustomer();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const customers = useMemo(() => {
    return customersResponse?.data || [];
  }, [customersResponse]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        `${customer.firstName} ${customer.lastName}`
          .toLowerCase()
          .includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.customerId?.toLowerCase().includes(query),
    );
  }, [customers, searchQuery]);

  const handleDelete = async (customer: Customer) => {
    if (!shopkeeperId) return;
    await deleteCustomerMutation.mutateAsync(
      { id: customer._id, shopkeeperId },
      {
        onSuccess: () => {
          toast.success("Customer deleted successfully");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(
            err.response?.data?.message || "Failed to delete customer",
          );
        },
      },
    );
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-6 font-poppins">
        <div className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 rounded-[28px] bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center font-poppins">
        <h2 className="text-xl font-bold text-red-500">
          Failed to load customers
        </h2>
        <p className="text-slate-500">
          Please check your connection or login again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-10 font-poppins dark:bg-background">
      {/* Header Section */}
      <div className="flex flex-col gap-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-card md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
              Customers
            </h1>
            <p className="mt-1 text-sm font-bold text-[#64748B] dark:text-slate-300">
              {customers.length} total customer{customers.length !== 1 && "s"}{" "}
              registered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:w-auto">
          {/* <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div> */}

          <button
            onClick={handleAdd}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-6 text-sm font-black text-white shadow-lg shadow-lime-500/20 transition hover:bg-[#76b813] active:scale-95 cursor-pointer w-full md:w-auto shrink-0"
          >
            <Plus size={18} strokeWidth={3} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer: Customer, index: number) => (
            <motion.div
              key={customer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-xl font-black text-blue-600 dark:from-blue-900/50 dark:to-blue-800/30 dark:text-blue-400">
                    {customer.firstName?.charAt(0).toUpperCase() || (
                      <UserCheck size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0F172A] dark:text-white line-clamp-1">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        ID: {customer.customerId || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-slate-400 hover:text-foreground transition cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-slate-100 p-2 shadow-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => handleEdit(customer)}
                      className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      <Edit2 size={14} />
                      Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(customer)}
                      className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 mt-5">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">
                    {customer.email || "No email"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Phone size={16} className="text-slate-400" />
                  <span className="truncate">
                    {customer.phone || "No phone"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="truncate line-clamp-1">
                    {customer.address || "No address"}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Payment Type
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs font-black text-[#0F172A] dark:text-white capitalize">
                      <CreditCard size={14} className="text-[#84CC16]" />
                      {customer.paymentType || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Already Paid
                    </span>
                    <span className="mt-1 text-lg font-black text-[#84CC16]">
                      ${customer.alreadyPaid?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50 py-24 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            No customers found
          </h3>
          <p className="mt-2 text-sm font-bold text-slate-500">
            {searchQuery
              ? "We couldn't find any customers matching your search."
              : "You haven't added any customers yet."}
          </p>
        </div>
      )}

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />
    </div>
  );
}
