import { create } from 'zustand';
import type { IInvoice } from '@/types/invoice';

export type InvoiceModalMode = 'create' | 'edit' | 'view' | 'none';

interface InvoiceState {
    isModalOpen: boolean;
    modalMode: InvoiceModalMode;
    selectedInvoice: IInvoice | null;
    openModal: (mode: InvoiceModalMode, invoice?: IInvoice | null) => void;
    closeModal: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
    isModalOpen: false,
    modalMode: 'none',
    selectedInvoice: null,
    openModal: (mode, invoice = null) => set({ isModalOpen: true, modalMode: mode, selectedInvoice: invoice }),
    closeModal: () => set({ isModalOpen: false, modalMode: 'none', selectedInvoice: null }),
}));
