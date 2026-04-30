import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createRepairRequest,
  getMyRepairRequests,
  getShopkeepers,
} from "../api/repair-request.api";

export function useShopkeepers(search: string, minRating?: number) {
  return useQuery({
    queryKey: ["shopkeepers", search, minRating],
    queryFn: () =>
      getShopkeepers({
        search: search || undefined,
        minRating,
        page: 1,
        limit: 12,
      }),
  });
}

export function useCreateRepairRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepairRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-requests"] });
      toast.success("Repair request created successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to create repair request",
      );
    },
  });
}

export function useMyRepairRequests(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["repair-requests", page, limit],
    queryFn: () => getMyRepairRequests({ page, limit }),
  });
}
