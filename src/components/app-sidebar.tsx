import * as React from "react"
import { Book, ChartNoAxesColumn, Home, type LucideIcon } from "lucide-react"
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
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Notes", url: "/notes", icon: Book },
  { title: "Task Management", url: "/task-management", icon: Book },
  { title: "Statistics", url: "/statistics", icon: ChartNoAxesColumn },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-2 border-border" {...props} collapsible="icon">
      <SidebarHeader className="border-b-2 border-border p-2 h-16 flex flex-row items-center justify-between">
        <h2 className="font-heading text-lg align-middle group-data-[collapsible=icon]:hidden">My App</h2>
        <SidebarTrigger className="border-2 border-border shadow-sm bg-white hover:bg-main gap-2" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={
                    <Link
                      to={item.url}
                      activeProps={{
                        className: "bg-main text-main-foreground font-bold border-2 border-border",
                      }}
                      activeOptions={{ exact: item.url === "/" }}
                    />
                  }
                >
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