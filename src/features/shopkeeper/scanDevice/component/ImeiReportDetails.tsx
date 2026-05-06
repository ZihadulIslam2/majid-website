"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Database,
  RadioTower,
  Tag,
} from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

type ReportRow = {
  label: string;
  value: string;
};

type ProviderDataShape = {
  result?: string;
  status?: string;
  id?: string | number;
  price?: string;
  balance?: string | number;
  ip?: string;
};

interface ImeiReportDetailsProps {
  result: IMEIResult;
  heading?: string;
  caption?: string;
  meta?: {
    provider?: string;
    serviceId?: number;
    cached?: boolean;
    message?: string;
    rowNumber?: number;
    totalRows?: number;
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
}

function parseProviderRows(rawHtml?: string): ReportRow[] {
  if (!rawHtml) return [];

  return stripHtml(rawHtml)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      if (rest.length === 0) {
        return { label: "Detail", value: line };
      }

      return {
        label: label.trim(),
        value: rest.join(":").trim(),
      };
    });
}

function formatValue(value: unknown) {
  if (value == null || value === "") return "N/A";
  return String(value);
}

export function ImeiReportDetails({
  result,
  heading = "Reports",
  caption = "Structured IMEI scan details",
  meta,
}: ImeiReportDetailsProps) {
  const providerData =
    result.providerData && typeof result.providerData === "object"
      ? (result.providerData as ProviderDataShape)
      : undefined;

  const providerRows = parseProviderRows(providerData?.result);
  const detailRows =
    providerRows.length > 0
      ? providerRows
      : [
          { label: "Device", value: result.deviceName },
          { label: "IMEI", value: result.imei },
          { label: "Status", value: result.deviceStatus },
          { label: "Risk", value: result.riskMeter.label },
        ];

  const scanMeta = [
    {
      label: "Scan Status",
      value: formatValue(providerData?.status || result.deviceStatus),
      icon: CheckCircle2,
    },
    {
      label: "Provider",
      value: formatValue(meta?.provider || "IMEI Service"),
      icon: RadioTower,
    },
    {
      label: "Service ID",
      value: formatValue(meta?.serviceId),
      icon: Tag,
    },
    {
      label: "Reference",
      value: formatValue(providerData?.id),
      icon: Database,
    },
  ].filter((item) => item.value !== "N/A");

  return (
    <section className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-black text-[#84CC16] uppercase tracking-[0.22em]">
            {heading}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#0F172A]">
            IMEI Scan Result
          </h2>
          <p className="mt-2 text-sm font-medium text-[#64748B]">{caption}</p>
        </div>
        {meta?.rowNumber && meta?.totalRows ? (
          <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
              Batch Position
            </p>
            <p className="mt-1 text-sm font-bold text-[#0F172A]">
              Result {meta.rowNumber} of {meta.totalRows}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scanMeta.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-5 py-4"
            >
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Icon size={15} />
                <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                  {item.label}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-[#0F172A] break-words">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {meta?.message ? (
        <div className="flex items-start gap-3 rounded-2xl border border-lime-100 bg-lime-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 text-lime-600" size={18} />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-700">
              Processing Note
            </p>
            <p className="mt-1 text-sm font-semibold text-lime-700">
              {meta.message}
              {meta.cached ? " Cached result used." : ""}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-gray-100 bg-[#FCFCFD] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#0F172A]">
                Provider Report
              </h3>
              <p className="mt-1 text-sm font-medium text-[#64748B]">
                Cleaned and grouped for easier reading.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {detailRows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className="rounded-2xl border border-gray-100 bg-white px-4 py-4"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                  {row.label}
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#0F172A] break-words">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-[#FCFCFD] p-6">
          <h3 className="text-lg font-black text-[#0F172A]">Report Snapshot</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                Device
              </p>
              <p className="mt-2 text-sm font-bold text-[#0F172A]">
                {result.deviceName}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                IMEI
              </p>
              <p className="mt-2 text-sm font-bold text-[#0F172A] break-all">
                {result.imei}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                Provider Price
              </p>
              <p className="mt-2 text-sm font-bold text-[#0F172A]">
                {formatValue(providerData?.price)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                Remaining Balance
              </p>
              <p className="mt-2 text-sm font-bold text-[#0F172A]">
                {formatValue(providerData?.balance)}
              </p>
            </div>
            {providerData?.ip ? (
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                  Provider IP
                </p>
                <p className="mt-2 text-sm font-bold text-[#0F172A] break-all">
                  {providerData.ip}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
