import api from "../customizeAPI";
import type { ApiResponse, PaginatedResponse } from "@iService";

export interface LoyaltyPointTransaction {
  _id: string;
  userId: string;
  points: number;
  balance: number;
  type:
    | "daily_login"
    | "order_completed"
    | "order_cancelled"
    | "referral"
    | "game_reward"
    | "admin_adjustment"
    | "expired"
    | "points_to_discount";
  description: string;
  orderId?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
}

// Helper: parse response đúng kiểu
const parseResponse = async <T,>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type");
  const raw = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  const result: any = {
    code: response.status,
    message: raw?.message || "Request completed",
  };

  if ("data" in raw) {
    result.data = raw.data;
  }
  if ("items" in raw && "meta" in raw) {
    result.items = raw.items;
    result.meta = raw.meta;
  }

  return result as T;
};

/**
 * Lấy thống kê RT Points của user
 */
export const getLoyaltyStats = async (): Promise<ApiResponse<LoyaltyStats>> => {
  const response = await api.get("/loyalty/stats");
  return await parseResponse<ApiResponse<LoyaltyStats>>(response);
};

/**
 * Lấy lịch sử RT Points của user (có phân trang)
 */
export const getLoyaltyHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<LoyaltyPointTransaction>> => {
  const response = await api.get(
    `/loyalty/history?page=${page}&limit=${limit}`
  );
  return await parseResponse<PaginatedResponse<LoyaltyPointTransaction>>(
    response
  );
};

/**
 * Nhận điểm đăng nhập hàng ngày
 */
export const claimDailyLoginPoints = async (): Promise<
  ApiResponse<{ points: number; balance: number; alreadyClaimed?: boolean }>
> => {
  const response = await api.post("/loyalty/claim-daily-login");
  return await parseResponse(response);
};

export interface ConvertToDiscountResponse {
  discount: {
    _id: string;
    code: string;
    value: number;
    type: string;
    endAt: string;
  };
  pointsUsed: number;
  discountPercent: number;
  newBalance: number;
}

/**
 * Quy đổi RT Points sang discount
 */
export const convertPointsToDiscount = async (
  points: number
): Promise<ApiResponse<ConvertToDiscountResponse>> => {
  const response = await api.post("/loyalty/convert-to-discount", { points });
  return await parseResponse<ApiResponse<ConvertToDiscountResponse>>(response);
};
