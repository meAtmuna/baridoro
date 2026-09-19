import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Check, MoreVertical, X, Palette, Pencil, Trash2, PlusIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTaskStore } from '@/store/task-store'
import { DragDropProvider} from '@dnd-kit/react'
import { TaskCard, TaskForm } from '@/components/task'

export const Route = createFileRoute('/task-management')({
  component: RouteComponent,
})

const projectSchema = z.object({
  projectName: z.string().trim().min(1, 'Project name is required'),
})

function ProjectCard({
  project,
  index,
  showTaskInput,
  setShowTaskInput,
  cancelTask,
  addTask,
}: {
  project: {
    id: string
    name: string
    color: string
    tasks: {
      id: string
      name: string
      description: string
    }[]
  }

  index: number
  showTaskInput: number | null
  setShowTaskInput: (index: number | null) => void
  cancelTask: () => void
  addTask: (
    projectId: string,
    task: {
      name: string
      description: string
    },
  ) => void
}) {
  // const { ref } = useSortable({
  //   id: project.id,
  //   index,
  //   type: 'project',
  // })

  return (
    <div
      // ref={ref}
      className='w-auto shrink-0'
    >
      <div className='flex items-center justify-between gap-44'>
        <div className='flex items-center gap-3'>
          <span 
            className='h-3 w-3 rounded-full'
            style={{backgroundColor: project.color}}
          />
          <h1 className='font-bold text-xl'>
            {project.name}
          </h1>
          <span className='rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400'>
            {project.tasks.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant='neutral'
              size='icon-xs'
              className="hover:cursor-pointer"
            >
              <MoreVertical className='h-4 w-4'/>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' sideOffset={8} className='w-52 p-2'>
            <DropdownMenuItem>
              <Palette />
              Edit project color
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil />
              Edit project name
            </DropdownMenuItem>
            <DropdownMenuItem className='text-red-500 focus:text-red-500'>
              <Trash2 />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='mt-4 space-y-3'>
        {project.tasks.map((task, taskIndex) => (
          <TaskCard
            key={task.id}
            task={task}
            index={taskIndex}
            projectId={project.id}/>
        ))}

        {showTaskInput !== index ? (
          <Button size="sm"  className="hover:cursor-pointer w-full" onClick={() => setShowTaskInput(index)} variant="neutral">
            <PlusIcon />
            Add Task
          </Button>
        ) : (
          <TaskForm
            onCreate={(task) => {
              addTask(project.id, task)
              setShowTaskInput(null)
            }}
            onCancel={cancelTask}
          />
        )}
      </div>
    </div>
  )
}

function RouteComponent() {
  const [showInput, setShowInput] = useState(false)
  const [showTaskInput, setShowTaskInput] = useState<number | null>(null)
  const { projects, addProject, addTask, reorderTasks, } = useTaskStore()

  const cancelCreate = () => {
    setShowInput(false)
  }

  const cancelTask = () => {
    setShowTaskInput(null)
  }
  
  const projectForm = useForm({
    defaultValues: {
      projectName: '',
    },
    validators: {
      onSubmit: projectSchema,
    },
    onSubmit: ({value}) => {
      addProject(value.projectName.trim())
      projectForm.reset()
      setShowInput(false)
    },
  })

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return

        const {source} = event.operation
        // if (source?.type === 'project') {
        //   reorderProjects(event)
        // }
        if (source?.type === 'task') {
            console.log('task darg event:', event)
            console.log('source:', event.operation.source)
            console.log('target:', event.operation.target)
            console.log('SOURCE DATA:', event.operation.source?.data)
            console.log('TARGET DATA:', event.operation.target?.data)
          reorderTasks(event)
        }
      }}
    >
    <div className='min-h-screen overflow-auto p-2'>
      <h1 className='text-4xl font-bold mb-6'>
        Task Management
      </h1>

      <div className='mt-6 flex w-max items-start gap-6'>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            showTaskInput={showTaskInput}
            setShowTaskInput={setShowTaskInput}
            cancelTask={cancelTask}
            addTask={addTask}
          />
        ))}

        <div className='w-auto shrink-0'>
        {!showInput ? (
          <Button onClick={() => setShowInput(true)} className="hover:cursor-pointer">
            Create New Project
          </Button>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              projectForm.handleSubmit()
            }}
            className='flex items-center gap-2'
          >
            <projectForm.Field
              name='projectName'
              children={(field) => (
                <>
                  <Input 
                    placeholder="Enter project name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className='max-w-sm'
                  />
  
                  <Button
                    type='button'
                    size="icon"
                    variant='neutral'
                    onClick={cancelCreate}
                    className="hover:cursor-pointer"
                  >
                      <X />
                  </Button>
  
                  {field.state.value.trim() && (
                    <Button
                      type='submit'
                      size="icon"
                      className="hover:cursor-pointer"
                    >
                        <Check />
                    </Button>
                  )}
                </>  
              )}
            />
          </form>
        )}
        </div>
      </div>
    </div>
    </DragDropProvider>
  )}
