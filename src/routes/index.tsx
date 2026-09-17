import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="font-base h-full w-full bg-cover bg-center bg-no-repeat bg-[url('/public/b.jpg')]">
    <h1 className='text-white text-7xl'>Blah</h1>
  </div>
}
