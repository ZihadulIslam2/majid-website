"use client";

import Image from "next/image";
import type React from "react";
import { FormEvent, useMemo, useState } from "react";
import {
  Battery,
  Clock3,
  Loader2,
  MapPin,
  Paperclip,
  Search,
  SlidersHorizontal,
  Smartphone,
  Star,
  Wrench,
} from "lucide-react";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  useCreateRepairRequest,
  useShopkeepers,
} from "../hooks/useRepairRequest";
import { Shopkeeper } from "../types/repair-request.types";

const services = [
  { label: "Repair", icon: Wrench },
  { label: "Screen", icon: Smartphone },
  { label: "Battery", icon: Battery },
];

export default function RepairRequest() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [selectedShopkeeperId, setSelectedShopkeeperId] = useState("");
  const [fullName, setFullName] = useState("");
  const [isFullNameEdited, setIsFullNameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailEdited, setIsEmailEdited] = useState(false);
  const [deviceModel, setDeviceModel] = useState("");
  const [imeiNumber, setImeiNumber] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemFile, setProblemFile] = useState<File | null>(null);

  const { data: profileData } = useMyProfile();
  const { data: shopkeeperData, isLoading } = useShopkeepers(
    search,
    ratingFilter,
  );
  const createRepairRequest = useCreateRepairRequest();

  const user = profileData?.data;
  const shopkeepers = useMemo(
    () => shopkeeperData?.data || [],
    [shopkeeperData],
  );
  const profileFullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const resolvedFullName = isFullNameEdited ? fullName : profileFullName;
  const resolvedEmail = isEmailEdited ? email : user?.email || "";

  const selectedShopkeeper =
    shopkeepers.find((shopkeeper) => shopkeeper._id === selectedShopkeeperId) ||
    shopkeepers[0];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedShopkeeper) return;

    createRepairRequest.mutate(
      {
        shopkeeperId: selectedShopkeeper._id,
        firstName: resolvedFullName,
        email: resolvedEmail,
        deviceModel,
        IMEINumber: imeiNumber,
        description: problemDescription,
        images: problemFile ? [problemFile] : undefined,
      },
      {
        onSuccess: () => {
          setDeviceModel("");
          setImeiNumber("");
          setProblemDescription("");
          setProblemFile(null);
        },
      },
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 lg:px-12 font-poppins">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-[1180px] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Create Order
          </h1>
          <p className="mt-1 text-base font-medium text-[#9CA3AF]">
            Give your problem to get service
          </p>
        </div>

        <div className="mb-7 flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
              placeholder="Search by shop name or location"
              type="search"
            />
          </label>

          <button
            type="button"
            onClick={() =>
              setRatingFilter((current) => (current ? undefined : 4))
            }
            className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${
              ratingFilter
                ? "border-[#84CC16] bg-[#F7FEE7] text-[#65A30D]"
                : "border-gray-200 bg-white text-[#9CA3AF] hover:border-[#84CC16]"
            }`}
          >
            <Star size={19} className="text-[#84CC16]" />
            Rating
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <ShopCardSkeleton />
          ) : shopkeepers.length > 0 ? (
            shopkeepers.map((shopkeeper) => (
              <ShopkeeperCard
                key={shopkeeper._id}
                shopkeeper={shopkeeper}
                selected={selectedShopkeeper?._id === shopkeeper._id}
                onSelect={() => setSelectedShopkeeperId(shopkeeper._id)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-sm font-semibold text-[#64748B]">
                No repair shops found. Try a different search.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <FormField label="Full Name" className="md:col-span-2">
            <input
              value={resolvedFullName}
              onChange={(event) => {
                setIsFullNameEdited(true);
                setFullName(event.target.value);
              }}
              required
              className="h-14 w-full rounded-lg border border-gray-200 px-4 text-base font-medium text-[#111827] outline-none transition placeholder:text-[#AEB5BD] focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
              placeholder="Demo"
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Email Address">
              <input
                value={resolvedEmail}
                onChange={(event) => {
                  setIsEmailEdited(true);
                  setEmail(event.target.value);
                }}
                required
                type="email"
                className="h-14 w-full rounded-lg border border-gray-200 px-4 text-base font-medium text-[#111827] outline-none transition placeholder:text-[#AEB5BD] focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
                placeholder="iwmsadvisors@example.com"
              />
            </FormField>

            <FormField label="Device Model Name">
              <input
                value={deviceModel}
                onChange={(event) => setDeviceModel(event.target.value)}
                required
                className="h-14 w-full rounded-lg border border-gray-200 px-4 text-base font-medium text-[#111827] outline-none transition placeholder:text-[#AEB5BD] focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
                placeholder="iPhone 15 Pro Max"
              />
            </FormField>

            <FormField label="IMEI Number">
              <input
                value={imeiNumber}
                onChange={(event) => setImeiNumber(event.target.value)}
                className="h-14 w-full rounded-lg border border-gray-200 px-4 text-base font-medium text-[#111827] outline-none transition placeholder:text-[#AEB5BD] focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
                placeholder="Enter IMEI"
              />
            </FormField>

            <FormField label="Upload Video of Device Problem">
              <label className="flex h-14 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 text-base font-medium text-[#AEB5BD] transition hover:border-[#84CC16]">
                <Paperclip size={22} />
                <span className="truncate">
                  {problemFile?.name || "Upload Video"}
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,image/*"
                  className="sr-only"
                  onChange={(event) =>
                    setProblemFile(event.target.files?.[0] || null)
                  }
                />
              </label>
            </FormField>
          </div>

          <FormField label="Problem Description">
            <textarea
              value={problemDescription}
              onChange={(event) => setProblemDescription(event.target.value)}
              required
              rows={4}
              className="min-h-28 w-full resize-none rounded-lg border border-gray-200 px-4 py-4 text-base font-medium text-[#111827] outline-none transition placeholder:text-[#AEB5BD] focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
              placeholder="Describe about your problem"
            />
          </FormField>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={
              createRepairRequest.isPending ||
              !selectedShopkeeper ||
              shopkeepers.length === 0
            }
            className="flex h-[52px] min-w-28 items-center justify-center rounded-full bg-[#84CC16] px-8 text-base font-bold text-white shadow-[0_12px_24px_rgba(132,204,22,0.28)] transition hover:bg-[#73B713] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createRepairRequest.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Done"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ShopkeeperCard({
  shopkeeper,
  selected,
  onSelect,
}: {
  shopkeeper: Shopkeeper;
  selected: boolean;
  onSelect: () => void;
}) {
  const rating =
    shopkeeper.averageRating > 0 ? shopkeeper.averageRating.toFixed(1) : "4.8";
  const reviews = shopkeeper.totalReviews > 0 ? shopkeeper.totalReviews : 312;

  return (
    <article
      className={`relative rounded-lg border bg-white p-5 transition ${
        selected
          ? "border-[#84CC16] shadow-[0_0_0_1px_rgba(132,204,22,0.35)]"
          : "border-gray-200 hover:border-[#B7E46C]"
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 rounded-full bg-[#84CC16] px-3 py-1 text-xs font-bold text-white">
          Selected
        </span>
      )}

      <div className="relative mb-3 h-[60px] w-[60px] overflow-hidden rounded-lg bg-gray-100">
        <Image
          src="/no-image.jpg"
          alt=""
          fill
          sizes="60px"
          className="object-cover"
        />
      </div>

      <h2 className="text-lg font-medium text-[#111827]">
        {shopkeeper.shopName || "TechCare Mobile"}
      </h2>

      <div className="mt-1 flex items-center gap-1.5 text-sm">
        <Star size={16} fill="#84CC16" className="text-[#84CC16]" />
        <span className="font-bold text-[#111827]">{rating}</span>
        <span className="text-[#6B7280]">· {reviews} reviews</span>
      </div>

      <div className="mt-5 flex items-start gap-2 text-sm font-medium text-[#6B7280]">
        <MapPin size={17} className="mt-0.5 shrink-0 text-[#8A939F]" />
        <span className="line-clamp-1">
          {shopkeeper.shopAddress || "42 Wallaby Way, Sydney, NSW 2000"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <span
              key={service.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-[#111827]"
            >
              <Icon size={13} />
              {service.label}
            </span>
          );
        })}
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F1FBE3] px-3 py-1 text-sm font-semibold text-[#84CC16]">
        <Clock3 size={14} />
        2-4 hrs estimated
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={`mt-5 h-11 w-full rounded-full border-2 text-base font-bold transition ${
          selected
            ? "border-[#84CC16] bg-[#84CC16] text-white shadow-[0_10px_18px_rgba(132,204,22,0.28)]"
            : "border-[#84CC16] bg-white text-[#84CC16] hover:bg-[#F7FEE7]"
        }`}
      >
        {selected ? "Selected" : "Select"}
      </button>
    </article>
  );
}

function ShopCardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[260px] animate-pulse rounded-lg border border-gray-200 bg-gray-50"
        />
      ))}
    </>
  );
}

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="mb-2 block text-base font-semibold text-[#111827]">
        {label}
      </span>
      {children}
    </label>
  );
}
