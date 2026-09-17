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
  const [projects, setProjects] = useState<{ name: string; tasks: { name: string; description: string }[] }[]>([])
  const [showTaskInput, setShowTaskInput] = useState<number | null>(null)
  const [taskName, setTaskName] = useState("")
  const [taskDescription, setTaskDescription] = useState("")

  const createProject = () => {
    if (!projectName.trim()) return
    
    setProjects([...projects, { name: projectName.trim(), tasks: [] }])
    setProjectName("")
    setShowInput(false)
  }

  const cancelCreate = () => {
    setProjectName("")
    setShowInput(false)
  }

  const createTask = (projectIndex: number) => {
    if (!taskName.trim()) return 
    
    const updatedProjects = [...projects]

    updatedProjects[projectIndex].tasks.push({
      name: taskName.trim(),
      description: taskDescription.trim(),
    })

    setProjects(updatedProjects)
    setTaskName("")
    setTaskDescription("")
    setShowTaskInput(null)
  }

  const cancelTask = () => {
    setTaskName("")
    setTaskDescription("")
    setShowTaskInput(null)
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
          <div key={index}>
            <h1 className='font-bold text-xl'>
              {project.name}
            </h1>
            <div className='mt-4 space-y-3'>
              {project.tasks.map((task, taskIndex) => (
                  <Card key={taskIndex} className='w-80'>
                    <CardContent className='p-4'>
                      <p className='font-bold text-lg'>
                        {task.name}
                      </p>

                      {task.description && (
                        <p className='text-sm mt-1'>
                          {task.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
              ))}
            </div>

            {showTaskInput !== index ? (
              <button
                className='mt-4'
                onClick={() => setShowTaskInput(index)}
              >
                + Add New Task
              </button>
            ) : (
              <div className='mt-4 space-y-2 w-80'>
                <Input
                  placeholder='Task name'
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
                <Input
                  placeholder='Description'
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />

                <div className='flex items-center gap-2 justify-end'>
                  <Button
                    size='icon'
                    variant='neutral'
                    onClick={cancelTask}
                  >
                    <X />
                  </Button>
                  <Button
                    size='icon'
                    onClick={()=> createTask(index)}
                    disabled={!taskName.trim()}
                  >
                    <Check />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
