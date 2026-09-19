import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { Check, MoreVertical, X, Palette, Pencil, Trash2, Search, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Check, MoreVertical, X, Palette, Pencil, Trash2, PlusIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTaskStore, type Project, type Task} from '@/store/task-store'
import { DragDropProvider} from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { useTaskStore } from '@/store/task-store'
import { DragDropProvider, useDroppable} from '@dnd-kit/react'
import { TaskCard, TaskForm } from '@/components/task'

export const Route = createFileRoute('/task-management')({
  component: RouteComponent,
})

const projectSchema = z.object({
  projectName: z.string().trim().min(1, 'Project name is required'),
})

const taskSchema = z.object({
  taskName: z.string().trim().min(1, 'Task name is required'),
  description: z.string().trim(),
  date: z.string(),
})

const formatDate = (date: string) => 
  new Date(date + 'T00:00:00').toLocaleDateString('en-GB',{
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function TaskForm({
  onCreate,
  onCancel,
} : {
  onCreate: (task: {name: string; description: string; date: string }) => void
  onCancel: () => void
}) {
  const taskForm = useForm({
    defaultValues: {
      taskName: '',
      description: '',
      date: '',
    },
    validators: {
      onSubmit: taskSchema,
    },
    onSubmit: ({value}) => {
      onCreate({
        name: value.taskName.trim(),
        description: value.description.trim(),
        date: value.date,
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
      className='mt-4 space-y-2 w-64'
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

      <taskForm.Field
        name='date'
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Date
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type='date'
              onBlur={field.handleBlur}
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
  dragDisabled,
  toggleTask,
  deleteTask,
}: {
  task: Task
  index: number
  projectId: string
  dragDisabled: boolean
  toggleTask: (projectId: string, taskId: string) => void
  deleteTask: (projectId: string, taskId: string) => void
}) {
  const {ref} = useSortable({
    id: task.id,
    index,
    type: 'task',
    accept: 'task',
    group: projectId,
    disabled: dragDisabled,
    data: {
      type: 'task',
      projectId,
    }
  }) 

  return (
    <div 
      ref={ref}
      data-task-id={task.id}
      data-project-id={projectId}
    >
      <Card className='w-64'>
        <CardContent className='p-3'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <p className={`font-bold text-sm break-words ${task.completed ? 'line-through opacity-60' : ''}`}>
                {task.name}
              </p>

              {task.description && (
                <p className={`text-xs mt-1 break-words ${task.completed ? 'line-through opacity-60' : ''}`}>
                  {task.description}
                </p>
              )}
            </div>

            <div className='flex shrink-0 items-center gap-1'>
              <Button
                size='icon'
                variant='neutral'
                className={`h-7 w-7 cursor-pointer ${task.completed ? 'bg-green-500' : ''}`}
                onClick={() => toggleTask(projectId, task.id)}
                title='Complete'
              >
                <Check className='h-4 w-4' />
              </Button>

              <Button
                size='icon'
                variant='neutral'
                className='h-7 w-7 cursor-pointer'
                onClick={() => deleteTask(projectId, task.id)}
                title='Delete'
              >
                <Trash2 className='h-4 w-4 text-red-500' />
              </Button>
            </div>
          </div>

          {task.date && (
            <p className='mt-2 flex items-center gap-1 text-xs text-muted-foreground'>
              <CalendarDays className='h-3 w-3' />
              {formatDate(task.date)}
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
  updateProjectColor,
  updateProjectName,
  deleteProject,
  toggleTask,
  deleteTask,
  search,
}: {
  project: Project
  index: number
  search: string
  showTaskInput: number | null
  setShowTaskInput: (index: number | null) => void
  cancelTask: () => void
  addTask: (
    projectId: string,
    task: {
      name: string
      description: string;
      date: string
    },
  ) => void
  updateProjectColor: (
    projectId: string,
    color: string,
  ) => void

  updateProjectName: (
    projectId: string,
    name: string,
  ) => void

  deleteProject: (
    projectId: string,
  ) => void

  toggleTask: (
    projectId: string,
    taskId: string
  ) => void

  deleteTask: (
    projectId: string,
    taskId: string
  ) => void
}) {
  const { ref, handleRef } = useSortable({
    id: project.id,
    index,
    type: 'project',
    accept: ['project', 'task'],
    collisionPriority: 1,
    data: {
      type: 'project',
    }
  })

  const [showColorModal, setShowColorModal] = useState(false)
  const [selectedColor, setSelectedColor] = useState(project.color)
  const [showNameModal, setShowNameModal] = useState(false)
  const [projectName, setProjectName] = useState(project.name)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    setSelectedColor(project.color)
    setProjectName(project.name)
  }, [project.color, project.name])

  const searchText = search.trim().toLowerCase()
  const filteredTasks = searchText
    ? project.tasks.filter(
      (task) =>
          task.name.toLowerCase().includes(searchText) ||
          task.description.toLowerCase().includes(searchText),
      )
    : project.tasks
  
  const hideProject = searchText !== '' && filteredTasks.length === 0
  return (
    <div
      ref={ref}
      className={hideProject ? 'hidden' : 'w-auto shrink-0'}
    >
      <div className='flex items-center justify-between'>
        <div ref={handleRef} className='flex items-center flex-1 cursor-grab gap-3'>
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
      <div className={'flex items-center justify-between min-w-[300px]'}>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
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
            <DropdownMenuItem
              onClick={() => setShowColorModal(true)}
            >
              <Palette />
              Edit project color
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => {
                setProjectName(project.name)
                setShowNameModal(true)
              }}
            >
              <Pencil />
              Edit project name
            </DropdownMenuItem>

            <DropdownMenuItem 
              className='text-red-500 focus:text-red-500'
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='mt-4 space-y-3'>
        <div className='space-y-3 min-h-16' data-project-id={project.id}>
          {filteredTasks.map((task, taskIndex) => (
            <TaskCard
              key={task.id}
              task={task}
              index={taskIndex}
              projectId={project.id}
              dragDisabled={searchText !== ''}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
            />
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

      {showColorModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <div className='w-full max-w-md border-4 border-black bg-background p-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-black'>
                Change Project Color
              </h2>
              <Button
                variant='neutral'
                size='icon'
                onClick={()=> setShowColorModal(false)}
              >
                <X /> 
              </Button>
            </div>

            <div className='mt-6'>
              <p className='font-bold mb-2'>
                Current Color
              </p>
              <div className='flex items-center gap-3'>
                <span
                  className='h-8 w-8 rounded-full border-2 border-black'
                  style={{backgroundColor: selectedColor}}
                />
                <span className='font-bold'>
                  {selectedColor.toUpperCase()}
                </span>
              </div>
            </div>

            <div className='mt-6'>
              <label className='font-bold'>
                Hex Color Code
              </label>
              <Input
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              />
            </div>

            <div className='mt-6'>
              <p className='font-bold mb-3'>
                preset Colors
              </p>
              <div className='flex flex-wrap gap-3'>
                {[
                  '#8E24AA',
                  '#22C55E',
                  '#EF4444',
                  '#F59E0B',
                  '#3B82F6',
                  '#06B6D4',
                  '#6366F1',
                  '#14B8A6',
                  '#F97316',
                  '#6B7280',
                ].map((color) => (
                  <button
                    key={color}
                    type='button'
                    onClick={()=> setSelectedColor(color)}
                    className='h-9 w-9 rounded-full border-2 border-black'
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className='mt-8 flex justify-end gap-3'>
              <Button
                variant='neutral'
                onClick={() => setShowColorModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateProjectColor(project.id, selectedColor)
                  setShowColorModal(false)
                }}
              >
                Save Color
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <div className='w-full max-w-md border-4 border-black bg-background p-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-black'>
                Rename Project
              </h2>
              <Button 
                variant='neutral'
                size='icon'
                onClick={() => setShowNameModal(false)}
              >
                <X />
              </Button>
            </div>

            <p className='mt-2  text-muted-foreground'>
              Choose a new name for this project.
            </p>

            <div className='mt-6'>
              <label className='font-bold'>
                Project Name
              </label>

              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder='Project name'
                className='mt-2'
              />
            </div>

            <div className='mt-8 flex justify-end gap-3'>
              <Button
                variant='neutral'
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!projectName.trim()}
                onClick={() => {
                  updateProjectName(project.id, projectName.trim())
                  setShowNameModal(false)
                }}
              >
                Save Name
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <div className='w-full max-w-md border-4 border-black bg-background p-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-black'>
                Delete Project
              </h2>
              <Button 
                variant='neutral'
                size='icon'
                onClick={() => setShowDeleteModal(false)}
              >
                <X />
              </Button>
            </div>

            <div className='mt-6 border-2 border-orange-500 p-4'>
              <div className='flex items-start gap-3'>
                <Trash2 className='mt-1 text-red-500' />

                <div>
                  <p className='font-bold'>
                    This action canont be undone!
                  </p>
                  <p className='mt-1 text-sm'>
                    All tasks in this project will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <p className='text-sm'>
                This will permanently delete:
              </p>
              <p className='mt-2 font-bold'>
                {project.tasks.length} task
                {project.tasks.length !== 1 ? 's' : ''} in this project
              </p>
            </div>

            <div className='mt-8 flex justify-end gap-3'>
              <Button
                variant='neutral'
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>

              <Button
                className='bg-red-500 hover:bg-red-600'
                onClick={() => {
                  deleteProject(project.id)
                  setShowDeleteModal(false)
                }}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RouteComponent() {
  const [showInput, setShowInput] = useState(false)
  const [showTaskInput, setShowTaskInput] = useState<number | null>(null)
  const { projects, addProject, addTask, reorderTasks, reorderProjects, updateProjectColor, updateProjectName, deleteProject, setProjects, toggleTask, deleteTask} = useTaskStore()
  const projectBeforeDrag = useRef<Project[]>([])
  const [search, setSearch] = useState('')
  const { projects,fetchProjects, addProject, addTask, reorderTasks, } = useTaskStore()

  useEffect(() => {
    fetchProjects();
  },[fetchProjects])
  
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
      onDragStart={() => {
        projectBeforeDrag.current = projects
      }}
      onDragOver={(event) => {
        const { source } = event.operation
        if (source?.type !== 'task') return 
        reorderTasks(event)
      }}
      onDragEnd={(event) => {
        const {source} = event.operation

        if (event.canceled) {
          if (source?.type === 'task') setProjects(projectBeforeDrag.current)
          return
        }

        if (source?.type === 'project') {
          reorderProjects(event)
        }
      }}
    >
    <div className='min-h-screen overflow-auto p-2'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <h1 className='text-4xl font-bold'>
          Task Management
        </h1>

        <div className='relative w-64 ml-auto'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search tasks...'
            className='pl-9'
          />
        </div>
      </div>
      <div className='mt-6 flex w-max items-start gap-12'>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            showTaskInput={showTaskInput}
            setShowTaskInput={setShowTaskInput}
            cancelTask={cancelTask}
            addTask={addTask}
            updateProjectColor={updateProjectColor}
            updateProjectName={updateProjectName}
            deleteProject={deleteProject}
            toggleTask={toggleTask}        
            deleteTask={deleteTask}
            search={search}
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
