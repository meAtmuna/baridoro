import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Check, MoreVertical, X, Palette, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTaskStore } from '@/store/task-store'
import { DragDropProvider} from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'

export const Route = createFileRoute('/task-management')({
  component: RouteComponent,
})

const projectSchema = z.object({
  projectName: z.string().trim().min(1, 'Project name is required'),
})

const taskSchema = z.object({
  taskName: z.string().trim().min(1, 'Task name is required'),
  description: z.string().trim(),
})

function TaskForm({
  onCreate,
  onCancel,
} : {
  onCreate: (task: {name: string; description: string}) => void
  onCancel: () => void
}) {
  const taskForm = useForm({
    defaultValues: {
      taskName: '',
      description: '',
    },
    validators: {
      onSubmit: taskSchema,
    },
    onSubmit: ({value}) => {
      onCreate({
        name: value.taskName.trim(),
        description: value.description.trim(),
      })

      taskForm.reset()
    },
  })
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        taskForm.handleSubmit()
        }}
      className='mt-4 space-y-2 w-80'
    >
      <taskForm.Field
        name='taskName'
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
          
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Task Name
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
                placeholder='Task name'
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      />

      <taskForm.Field
        name='description'
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Description
            </FieldLabel>
            <Textarea
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              placeholder='Description'
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      />

      <div className='flex items-center gap-2 justify-end'>
        <Button
          size='icon'
          variant='neutral'
          type='button'
          onClick={onCancel}
        >
          <X />
        </Button>

        <taskForm.Field
          name='taskName'
          children={(field) => 
            field.state.value.trim() && (
              <Button
                size='icon'
                type='submit'
              >
                <Check />
              </Button>
            )
          }
        />
      </div>
    </form>
  )
}

function TaskCard({
  task,
  index,
  projectId,
}: {
  task: {
    id: string
    name: string
    description: string
  }
  index: number
  projectId: string
}) {
  const {ref} = useSortable({
    id: task.id,
    index,
    type: 'task',
    data: {
      projectId,
    }
  }) 

  return (
    <div ref={ref}>
      <Card key={task.id} className='w-80'>
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
    </div>
  )
}

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
      <div className='flex items-center justify-between'>
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
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
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
          <button
          className='mt-4'
          onClick={() => setShowTaskInput(index)}
          >
            + Add New Task
          </button>
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
          <Button onClick={() => setShowInput(true)}>
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
                  >
                      <X />
                  </Button>
  
                  {field.state.value.trim() && (
                    <Button
                      type='submit'
                      size="icon"
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
