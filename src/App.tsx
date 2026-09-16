import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  )
}