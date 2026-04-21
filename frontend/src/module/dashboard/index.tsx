import { InvoiceFormModal } from "./components/InvoiceFormModal";
import { InvoiceList } from "./components/InvoiceList";

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold tracking-tight">Invoice Dashboard</h2>
                </div>
                <p className="text-muted-foreground pl-[52px]">View and manage all generated invoices.</p>
            </div>

            <div className="flex-1 min-h-0 pt-2">
                <InvoiceList />
            </div>

            {/* This modal handles both 'View' and 'Update' actions triggered from the InvoiceList */}
            <InvoiceFormModal />
        </div>
    )
}