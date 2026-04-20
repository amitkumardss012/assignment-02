import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemsTable } from "./components/ItemsTable";
import { ItemFormModal } from "./components/ItemFormModal";
import { useItemStore } from "@/store/item.store";

export default function ItemsPage() {
  const { openModal } = useItemStore();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Items</h2>
          <p className="text-muted-foreground">
            Manage your inventory and product catalogue.
          </p>
        </div>
        <Button onClick={() => openModal("create")} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Item
        </Button>
      </div>
      
      <div className="flex-1 min-h-0">
        <ItemsTable />
      </div>
      <ItemFormModal />
    </div>
  );
}