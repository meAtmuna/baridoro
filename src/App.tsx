import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function App() {
  return (
    <SidebarProvider>
      {/* 1. Sidebar Component */}
      <AppSidebar />

      {/* 2. Main Page Layout */}
      <SidebarInset className="min-h-screen bg-background">
        <header className="flex h-16 items-center gap-2 border-b-2 border-border px-4">
          <SidebarTrigger />
          <h1 className="font-heading text-xl font-bold">Dashboard Overview</h1>
        </header>

        <main className="p-6">
          <div className="mb-6 grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-base border-2 border-border bg-main/20 p-4">
              <h3 className="font-heading font-bold">Card 1</h3>
            </div>
            <div className="aspect-video rounded-base border-2 border-border bg-main/20 p-4">
              <h3 className="font-heading font-bold">Card 2</h3>
            </div>
            <div className="aspect-video rounded-base border-2 border-border bg-main/20 p-4">
              <h3 className="font-heading font-bold">Card 3</h3>
            </div>
          </div>

          <div className="min-h-[400px] rounded-base border-2 border-border bg-background p-6">
            <p className="font-base">Your main content goes here.</p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}