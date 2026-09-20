import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CalendarDays, Check, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import type { Task } from "@/store/task-store";


const taskSchema = z.object({
  taskName: z.string().trim().min(1, 'Task name is required'),
  description: z.string().trim(),
  date: z.string(),
})

// export function TaskForm({
//   onCreate,
//   onCancel,
// } : {
//   onCreate: (task: {name: string; description: string}) => void
//   onCancel: () => void
// }) {
//   const taskForm = useForm({
//     defaultValues: {
//       taskName: '',
//       description: '',
//     },
//     validators: {
//       onSubmit: taskSchema,
//     },
//     onSubmit: ({value}) => {
//       onCreate({
//         name: value.taskName.trim(),
//         description: value.description.trim(),
//       })

//       taskForm.reset()
//     },
//   })
  
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault()
//         e.stopPropagation()
//         taskForm.handleSubmit()
//         }}
//       className=' space-y-2 w-80 border-border border-2 p-4 rounded shadow-shadow'
//     >
//       <taskForm.Field
//         name='taskName'
//         children={(field) => {
//           const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
          
//           return (
//             <Field data-invalid={isInvalid}>
//               <Input
//                 id={field.name}
//                 name={field.name}
//                 onBlur={field.handleBlur}
//                 aria-invalid={isInvalid}
//                 placeholder='Task name'
//                 value={field.state.value}
//                 onChange={(e) => field.handleChange(e.target.value)}
//               />
//               {isInvalid && (
//                 <FieldError errors={field.state.meta.errors} />
//               )}
//             </Field>
//           )
//         }}
//       />

//       <taskForm.Field
//         name='description'
//         children={(field) => (
//           <Field>
//             <Input
//               id={field.name}
//               name={field.name}
//               onBlur={field.handleBlur}
//               placeholder='Description (optional)'
//               value={field.state.value}
//               onChange={(e) => field.handleChange(e.target.value)}
//             />
//           </Field>
//         )}
//       />

//       <div className='flex items-center gap-2 justify-end'>
//         <Button
//           size='icon'
//           variant='neutral'
//           type='button'
//           onClick={onCancel}
//           className="hover:cursor-pointer"
//         >
//           <X />
//         </Button>

//         <taskForm.Field
//           name='taskName'
//           children={(field) => 
//             field.state.value.trim() && (
//               <Button
//                 size='icon'
//                 type='submit'
//                 className="hover:cursor-pointer"
//               >
//                 <Check />
//               </Button>
//             )
//           }
//         />
//       </div>
//     </form>
//   )
// }

export function TaskForm({
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
        className=' space-y-2 w-80 border-border border-2 p-4 rounded shadow-shadow' ////////////changed
    >
      <taskForm.Field
        name='taskName'
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
          
          return (
            <Field data-invalid={isInvalid}>
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
          className="hover:cursor-pointer"

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
                className="hover:cursor-pointer"
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

// export function TaskCard({
//   task,
//   index,
//   projectId,
// }: {
//   task: {
//     id: string
//     name: string
//     description: string
//   }
//   index: number
//   projectId: string
// }) {
//   const {ref} = useSortable({
//     id: task.id,
//     index,
//     type: 'task',
//     data: {
//       projectId,
//     }
//   })

//   return (
//     <div ref={ref}>
//       <Card key={task.id} className='w-80 !shadow-none border-2  w-full border-border !p-0 hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:!shadow-shadow cursor-pointer'>
//         <CardContent className='p-4'>
//           <p className='font-bold text-lg'>
//             {task.name}
//           </p>

//           {task.description && (
//             <p className='text-sm mt-1'>
//               {task.description}
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

const formatDate = (date: string) => 
  new Date(date + 'T00:00:00').toLocaleDateString('en-GB',{
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export function TaskCard({
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
      <Card className='w-80 !shadow-none border-2  w-full border-border !p-0 hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:!shadow-shadow cursor-pointer'>
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
