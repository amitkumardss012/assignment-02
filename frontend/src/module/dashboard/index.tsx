import { LayoutDashboard, Users, Receipt, Package } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function DashboardPage() {
    const stats = [
        { title: "Total Revenue", value: "₹45,231", description: "+20.1% from last month", icon: LayoutDashboard },
        { title: "Invoices Sent", value: "128", description: "+12 since last week", icon: Receipt },
        { title: "Active Inventory", value: "42", description: "5 items low on stock", icon: Package },
        { title: "Customer Base", value: "89", description: "+4 new this month", icon: Users },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight">Overview</h2>
                <p className="text-muted-foreground">Welcome back! Here's what's happening with your business today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-lg bg-card/50 backdrop-blur-sm hover:scale-[1.02] transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-background min-h-[300px] flex items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-4">
                    <div className="inline-block p-3 rounded-full bg-primary/20 animate-pulse">
                        <Receipt className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold italic text-primary">Performance Insights Coming Soon</CardTitle>
                    <CardDescription className="text-base">
                        Integration with advanced analytics and chart visualizations is planned for the next release. 
                        Start by creating your first invoice in the Invoice module!
                    </CardDescription>
                </div>
            </Card>
        </div>
    )
}