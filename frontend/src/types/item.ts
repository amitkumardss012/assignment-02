export interface IVariant {
  type: string;
  value: string;
}

export interface IItem {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  variants: IVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface IItemPayload {
  name: string;
  description: string;
  basePrice: number;
  variants: IVariant[];
}

export interface IUpdateItemPayload extends Partial<IItemPayload> {}

export interface IItemQueryParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface IPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  count: number;
}

export interface IItemsResponse {
  items: IItem[];
  pagination: IPagination;
}
