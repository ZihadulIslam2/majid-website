export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  meta?: ApiMeta;
}

export interface Shopkeeper {
  _id: string;
  shopName: string;
  shopAddress: string;
  totalReviews: number;
  averageRating: number;
}

export interface RepairRequestPayload {
  shopkeeperId: string;
  firstName: string;
  email: string;
  deviceModel: string;
  IMEINumber?: string;
  description: string;
  images?: File[];
}

export type RepairRequestStatus =
  | "request_submitted"
  | "in_review"
  | "quote_sent"
  | "quote_accepted"
  | "quote_rejected"
  | "rejected"
  | "repair_in_progress"
  | "completed";

export interface RepairRequest {
  _id: string;
  shopkeeperId:
    | string
    | {
        _id?: string;
        shopName?: string;
        shopAddress?: string;
      };
  userId: string;
  firstName: string;
  email: string;
  deviceModel: string;
  IMEINumber?: string;
  description: string;
  status: RepairRequestStatus;
  createdAt: string;
  updatedAt: string;
}
