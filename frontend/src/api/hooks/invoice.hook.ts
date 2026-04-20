import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type { IApiResponse } from "../../types/api";
import type { 
    IInvoice, 
    IInvoicePayload, 
    IInvoiceQueryParams, 
    IInvoicesResponse, 
    IUpdateInvoicePayload 
} from "../../types/invoice";

/**
 * @description Hook for fetching all invoices with infinite scroll support
 */
export const useGetInfiniteInvoices = (params: Omit<IInvoiceQueryParams, "page">) => {
    return useInfiniteQuery({
        queryKey: ["invoices", "infinite", params],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const { data } = await api.get<IApiResponse<IInvoicesResponse>>("/invoice", {
                params: { ...params, page: pageParam },
            });
            return data.data;
        },
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
    });
};

/**
 * @description Hook for fetching a single invoice by ID
 */
export const useGetInvoiceById = (id: string | undefined) => {
    return useQuery({
        queryKey: ["invoices", id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get<IApiResponse<IInvoice>>(`/invoice/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
};

/**
 * @description Hook for creating a new invoice
 */
export const useCreateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: IInvoicePayload) => {
            const { data } = await api.post<IApiResponse<IInvoice>>("/invoice", payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
};

/**
 * @description Hook for updating an existing invoice
 */
export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: IUpdateInvoicePayload }) => {
            const { data } = await api.put<IApiResponse<IInvoice>>(`/invoice/${id}`, payload);
            return data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoices", data?._id] });
        },
    });
};
