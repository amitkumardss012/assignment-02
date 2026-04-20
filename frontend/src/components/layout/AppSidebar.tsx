import { 
  LayoutDashboard, 
  Package, 
  Receipt,
  Search
} from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarInput,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const location = useLocation()

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Items",
      icon: Package,
      href: "/items",
    },
    {
      title: "Invoices",
      icon: Receipt,
      href: "/invoice",
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2 font-bold text-xl tracking-tight">
          <div className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
            I
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden">InvoiceAI</span>
        </div>
        <div className="px-2 group-data-[collapsible=icon]:hidden">
           <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <SidebarInput placeholder="Search..." className="pl-8" />
           </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="md:h-12 md:p-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
                JD
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">John Doe</span>
                <span className="truncate text-xs text-muted-foreground">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
