import { IMEIResult } from "@/features/shopkeeper/scanDevice/types/scanDevice.types";

export const getChecksArray = (result: IMEIResult) => {
  if (!result.checks) return [];
  if (typeof result.checks === "object" && !Array.isArray(result.checks)) {
    return Object.values(result.checks);
  }
  return Array.isArray(result.checks) ? result.checks : [];
};

export const getTechnicalBreakdownItems = (result: IMEIResult) => {
  const items = [];
  if (result.technicalBreakdown) {
    const breakdown = result.technicalBreakdown;

    if (breakdown.processor)
      items.push({ label: "Processor", value: breakdown.processor });
    if (breakdown.batteryHealth) {
      items.push({
        label: "Battery Health",
        value: breakdown.batteryHealth.label || breakdown.batteryHealth,
      });
    }
    if (breakdown.storage) {
      items.push({
        label: "Storage",
        value: breakdown.storage.label || breakdown.storage,
      });
    }
    if (breakdown.modem) items.push({ label: "Modem", value: breakdown.modem });
    if (breakdown.display)
      items.push({ label: "Display", value: breakdown.display });
    if (breakdown.warranty) {
      items.push({
        label: "Warranty",
        value:
          breakdown.warranty.label || breakdown.warranty.status || "Unknown",
      });
    }
    if (breakdown.origin) {
      items.push({
        label: "Origin",
        value: breakdown.origin.label || breakdown.origin,
      });
    }
    if (breakdown.activation) {
      items.push({
        label: "Activation",
        value:
          breakdown.activation.label ||
          breakdown.activation.lockStatus ||
          "Unknown",
      });
    }
  }
  return items;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "clean":
      return "bg-[#84CC16] shadow-lime-500/20";
    case "warning":
      return "bg-orange-500 shadow-orange-500/20";
    default:
      return "bg-[#3B82F6] shadow-blue-500/20";
  }
};
