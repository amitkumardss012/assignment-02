import { create } from 'zustand';
import type { IItem } from '@/types/item';

export type ItemModalMode = 'create' | 'edit' | 'view' | 'none';

interface ItemState {
    isModalOpen: boolean;
    modalMode: ItemModalMode;
    selectedItem: IItem | null;
    openModal: (mode: ItemModalMode, item?: IItem | null) => void;
    closeModal: () => void;
}

export const useItemStore = create<ItemState>((set) => ({
    isModalOpen: false,
    modalMode: 'none',
    selectedItem: null,
    openModal: (mode, item = null) => set({ isModalOpen: true, modalMode: mode, selectedItem: item }),
    closeModal: () => set({ isModalOpen: false, modalMode: 'none', selectedItem: null }),
}));
