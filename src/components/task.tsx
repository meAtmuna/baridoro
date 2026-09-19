import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Card, CardContent } from "./ui/card";


const taskSchema = z.object({
  taskName: z.string().trim().min(1, 'Task name is required'),
  description: z.string().trim(),
})

export function TaskForm({
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
      className=' space-y-2 w-80 border-border border-2 p-4 rounded shadow-shadow'
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
            <Input
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              placeholder='Description (optional)'
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

export function TaskCard({
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
      <Card key={task.id} className='w-80 !shadow-none border-2   border-border !p-0 hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:!shadow-shadow cursor-pointer'>
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
