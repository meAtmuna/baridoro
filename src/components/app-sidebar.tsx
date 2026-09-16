import * as React from "react"
import { Book, ChartNoAxesColumn, Home, Settings, User, type LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

// TypeScript interface for navigation items
interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Notes", url: "/notes", icon: Book },
  { title: "Statistics", url: "statistics", icon: ChartNoAxesColumn },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-2 border-border" {...props}>
      <SidebarHeader className="border-b-2 border-border p-4 h-16">
        <h2 className="font-heading text-lg font-bold">My App</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton render={<a href={item.url} />}>
                  <item.icon className="mr-2 size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-border p-4">
        <p className="font-base text-xs">© 2026 Neobrutalism</p>
      </SidebarFooter>
    </Sidebar>
  )
}