import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider'
import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router'
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react'
import { z } from 'zod';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

const uploadSchema = z.object({
  image: z
    .custom<File>((val) => val instanceof File, "Please select and image file.")
    .refine((file) => file.size <= 5 * 1024 *1024, "Image size must be under 5mb")
    .refine(
      (file) => ["image/jpeg","image/png","image/webp"].includes(file.type),
      "Only JPG, PNG and Webp formats are supported."
    )
})

function RouteComponent() {
  const [selectedMinutes,setSelectedMinutes] = useState<number[]>([30]);
  const [secondsLeft,setSecondsLeft] = useState<number>(selectedMinutes[0]*60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState<string>("/b.jpg");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      image: undefined as unknown as File,
    },
    onSubmit: async ({ value }) => {
      if(!value.image) return;

      if(backgroundImage.startsWith("blob:")){
        URL.revokeObjectURL(backgroundImage);
      }

      const newImageUrl = URL.createObjectURL(value.image);
      setBackgroundImage(newImageUrl);
      setIsDialogOpen(false);
      form.reset();
    }
  })

  useEffect(() =>{
    let timer: ReturnType<typeof setTimeout> | null = null;

    if(isRunning && secondsLeft > 0){
      timer = setTimeout(() => {
        setSecondsLeft((prev) => prev -1);
      }, 1000);
    }
    else if(secondsLeft === 0){
      setIsRunning(false);
    }
    return () => {
      if(timer) clearTimeout(timer);
    }
  }, [isRunning,secondsLeft])

  const handleSliderChange = (newValues: readonly number[] | number) => {
    if(!isRunning){
      const value = Array.isArray(newValues) ? newValues[0] : (newValues as number);
      setSelectedMinutes([value]);
      setSecondsLeft(value*60);
    }
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  }

  return (
    <div className="font-base min-h-screen w-full bg-cover bg-center bg-no-repeat bg-[url('/b.jpg')] flex flex-col justify-between p-8" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <div className="h-10" />
      <div className="flex flex-col items-center justify-center gap-8 max-w-md w-full mx-auto">
        <div>
          <h2 className="text-white text-9xl">{formatTime(secondsLeft)}</h2>
        </div>
        <div className="w-full">
          <Slider defaultValue={selectedMinutes} value={[Math.ceil(secondsLeft / 60)]} onValueChange={handleSliderChange} max={120} step={1}  />
        </div>
        <Button  onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</Button>
      </div>
      <div className="flex justify-start items-center w-full">
        {/* <Button variant={"white"} size={"xs"} onChange={handleUploadBtnChange}><Upload/></Button> */}
        {/* <Label htmlFor="picture">Picture</Label>
        <Input id="picture" type="file" /> */}
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button  size={"xs"} className="hover:cursor-pointer"><Upload/></Button>}></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Background</DialogTitle>
                <DialogDescription>
                  Upload image to change background. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}>
                <form.Field name="image" validators={{
                  onChange: ({value}) => {
                    const result = uploadSchema.shape.image.safeParse(value);
                    return result.success ? undefined : result.error.issues[0].message;
                  }
                }}>

                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor="picture">Picture</Label>
                      <Input id="picture" type="file" accept="image/png, image/jpeg, image/webp"
                        onChange={(e) =>{
                          const file = e.target.files?.[0];
                          if (file) {
                            field.handleChange(file);
                          }
                        }}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-xs font-bold text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}

                </form.Field>
                <DialogFooter className="mt-4">
                  <DialogClose render={<Button variant="neutral" type="button" className="hover:cursor-pointer">Cancel</Button>} />
                  <form.Subscribe selector={(state) => [state.canSubmit,state.isSubmitting]}>
                    {([canSubmit,isSubmitting]) => (
                      <Button className="hover:cursor-pointer" type="submit" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ?"Saving...":"Save"}
                      </Button>
                    )}
                  </form.Subscribe>
                </DialogFooter>
              </form>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
