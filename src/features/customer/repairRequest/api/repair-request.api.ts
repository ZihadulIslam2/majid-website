import { api } from "@/lib/api";
import {
  ApiResponse,
  RepairRequest,
  RepairRequestPayload,
  Shopkeeper,
} from "../types/repair-request.types";

export const getShopkeepers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  minRating?: number;
  maxRating?: number;
}): Promise<ApiResponse<Shopkeeper[]>> => {
  const response = await api.get("/user/shopkeeper", { params });
  return response.data;
};

export const createRepairRequest = async (
  payload: RepairRequestPayload,
): Promise<ApiResponse<RepairRequest>> => {
  const formData = new FormData();

  formData.append("shopkeeperId", payload.shopkeeperId);
  formData.append("firstName", payload.firstName);
  formData.append("email", payload.email);
  formData.append("deviceModel", payload.deviceModel);
  formData.append("description", payload.description);

  if (payload.IMEINumber) {
    formData.append("IMEINumber", payload.IMEINumber);
  }

  payload.images?.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/repair-requests/add", formData);
  return response.data;
};

export const getMyRepairRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<RepairRequest[]>> => {
  const response = await api.get("/repair-requests/my-history", { params });
  return response.data;
};

export const getRepairRequestDetails = async (
  id: string,
): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.get(`/repair-requests/${id}`);
  return response.data;
};

export const updateRepairQuoteStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "quote_accepted" | "quote_rejected";
}): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.put(`/repair-requests/quote-status/${id}`, {
    status,
  });
  return response.data;
};
