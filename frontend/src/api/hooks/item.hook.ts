import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type { IApiResponse } from "../../types/api";
import type { 
    IItem, 
    IItemPayload, 
    IItemQueryParams, 
    IItemsResponse, 
    IUpdateItemPayload 
} from "../../types/item";

/**
 * @description Hook for fetching all items with infinite scroll support
 */
export const useGetInfiniteItems = (params: Omit<IItemQueryParams, "page">) => {
    return useInfiniteQuery({
        queryKey: ["items", "infinite", params],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const { data } = await api.get<IApiResponse<IItemsResponse>>("/item", {
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
 * @description Hook for fetching a single item by ID
 */
export const useGetItemById = (id: string | undefined) => {
    return useQuery({
        queryKey: ["items", id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get<IApiResponse<IItem>>(`/item/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
};

/**
 * @description Hook for creating a new item
 */
export const useCreateItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: IItemPayload) => {
            const { data } = await api.post<IApiResponse<IItem>>("/item", payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
    });
};

/**
 * @description Hook for updating an existing item
 */
export const useUpdateItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: IUpdateItemPayload }) => {
            const { data } = await api.put<IApiResponse<IItem>>(`/item/${id}`, payload);
            return data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            queryClient.invalidateQueries({ queryKey: ["items", data._id] });
        },
    });
};
