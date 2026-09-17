import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/task-management')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showInput, setShowInput] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projects, setProjects] = useState<string[]>([])

  const createProject = () => {
    if (!projectName.trim()) return
    
    setProjects([...projects, projectName.trim()])
    setProjectName("")
    setShowInput(false)
  }

  const cancelCreate = () => {
    setProjectName("")
    setShowInput(false)
  }

  return (
    <div className='p-2'>
      <h1 className='text-4xl font-bold mb-6'>
        Task Management
      </h1>
      {!showInput ? (
        <Button onClick={() => setShowInput(true)}>
          Create New Project
        </Button>
      ) : (
        <div className='flex items-center gap-2'>
          <Input 
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className='max-w-sm'
          />

          <Button
            size="icon"
            variant='neutral'
            onClick={cancelCreate}
          >
              <X />
          </Button>

          <Button
            size="icon"
            onClick={createProject}
            disabled={!projectName.trim()}
          >
              <Check />
          </Button>
        </div>
      )}

      <div className='mt-6 space-y-4'>
        {projects.map((project, index) => (
          <Card key={index} className='w-64'>
            <CardContent className='p-4'>
              <p className='font-bold'>{project}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )}
