import { AppSidebar } from '@/components/app-sidebar'
import AuthForm from '@/components/auth-form'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { supabase } from '@/lib/supabase'
import { createRootRoute, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState } from 'react'

const RootLayout = () => {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      setSession(session);
      setLoadingSession(false);
    })

    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => subscription.unsubscribe();
  },[])

  if(loadingSession) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>
  }

  if(!session) {
    return <AuthForm />
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen bg-background">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  )
}

export const Route = createRootRoute({ component: RootLayout })