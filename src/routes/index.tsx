import AuthForm from '@/components/auth-form';
import { TaskCard, TaskForm } from '@/components/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider'
import { supabase } from '@/lib/supabase';
import { useTaskStore } from '@/store/task-store';
import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router'
import { FolderIcon, Maximize, Minimize, PlusIcon, TimerResetIcon, Upload } from 'lucide-react';
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
  const [selectedMinutes,setSelectedMinutes] = useState<number[]>([0.2]);
  const [secondsLeft,setSecondsLeft] = useState<number>(selectedMinutes[0]*60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState<string>("/b.jpg");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showTaskForm, setShowTaskForm] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<{taskName: string; projectName: string} | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>();
  const [totalTaskSeconds, setTotalTaskSeconds] = useState<number>(0);
  const [grandTotalSeconds, setGrandTotalSeconds] = useState<number | undefined>(0);
  const [isFullScreen,setIsFullScreen] = useState(false);
  const { projects,fetchProjects, addTask,toggleTask,deleteTask } = useTaskStore()

  useEffect(() => {
    fetchProjects();
  },[fetchProjects])

  useEffect(()=>{
    async function fetchGrandTotalTimeLogged() {
      const {data,error} = await supabase.from("timer_sessions").select("duration_seconds");

      if(error){
        console.error("Failed to fetch grand total time:",error);
      }

      const total = data?.reduce((acc,session) => acc + session.duration_seconds, 0);
      setGrandTotalSeconds(total);
    }

    fetchGrandTotalTimeLogged();
  }, [isRunning]);
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange",handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange",handleFullScreenChange);
  },[])

  useEffect(() => {
    if(isRunning){
      document.title = `(${formatTime(secondsLeft)}) Baridoro Timer`
    } else {
      document.title = "Baridoro Timer";
    }
  },[isRunning,secondsLeft]);

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

  async function fetchTotalTimeForTask(taskId:string){
      const {data,error} = await supabase.from("timer_sessions").select("duration_seconds").eq("task_id",taskId);
      if(error){
        console.error("Failed to fetch task time:",error.message);
        return;
      }

      const total = data.reduce((acc,session) => acc + session.duration_seconds,0);
      setTotalTaskSeconds(total);
    }

  useEffect(() =>{
    let timer: ReturnType<typeof setTimeout> | null = null;

    if(isRunning && secondsLeft > 0){
      timer = setTimeout(() => {
        setSecondsLeft((prev) => prev -1);
      }, 1);
    }
    else if(secondsLeft === 0 && isRunning){
      setIsRunning(false);

      async function sendCompletedSecondsToDatabase(taskId: string, secondsLeft: number){
        const {data, error} = await supabase
          .from("timer_sessions")
          .insert([
            {
              task_id: taskId,
              duration_seconds: secondsLeft,
              start_time: new Date().toISOString()
            }
          ])
          .select()
        
        if(error) {
          console.error("Failed to log session:",error.message);
        } else {
          console.log("Session recorded successfully:",data);
          fetchTotalTimeForTask(taskId)
        }
      }

      sendCompletedSecondsToDatabase(`${selectedTaskId}`,selectedMinutes[0]*60)
    }
    return () => {
      if(timer) clearTimeout(timer);
    }
  }, [isRunning,secondsLeft,selectedMinutes])

  useEffect(()=> {
    if(selectedTaskId) {
      fetchTotalTimeForTask(selectedTaskId);
    }else{
      setTotalTaskSeconds(0);
    }
  },[selectedTaskId])

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

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds%3600)/60);

    if(hours>0){
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  }

  const toggleFullScreen = () => {
    if(!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error going into full screen: ${err.message}`);
      });
    } else {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(selectedMinutes[0] * 60);
  }

  const cancelTask = () => {
    setShowTaskForm(null);
  }

  return (
    <div className="font-base min-h-screen w-full bg-cover bg-center bg-no-repeat bg-[url('/b.jpg')] flex flex-col justify-between p-8" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <div className="h-10" />
      <div className="flex flex-col items-center justify-center gap-8 max-w-md w-full mx-auto">
        <Button variant={"neutral"} size={"xs"} className={"hover:cursor-pointer flex items-center gap-1"} onClick={toggleFullScreen} title={isFullScreen? "Exit Fullscreen":"Go Fullscreen"}>
          {isFullScreen ? <Minimize className='h-3 w-3'/> : <Maximize className='h-3 w-3' />}
          {isFullScreen ? "Exit":"Fullscreen"}
        </Button>
        <div>
          <h2 className="text-white text-9xl">{formatTime(secondsLeft)}</h2>
        </div>
        <div className="w-full">
          <Slider defaultValue={selectedMinutes} value={[Math.ceil(secondsLeft / 60)]} onValueChange={handleSliderChange} max={120} step={5}  />
        </div>
        <div className='flex gap-4'>
          <Button className="hover:cursor-pointer"  onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</Button>
          <Button className="hover:cursor-pointer" onClick={resetTimer} variant="neutral"><TimerResetIcon></TimerResetIcon></Button>
        </div>
        <div>
        </div>
        <div className="-mt-10">
          <Drawer modal={false}  swipeDirection="right">
            <DrawerTrigger render={
              <Card className="[--card-spacing:--spacing(4)] hover:cursor-pointer hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
                <CardContent>
                  <div className="flex  gap-64 whitespace-nowrap">
                    <div>
                      <h6>{selectedTask? selectedTask.taskName : "Select a task to track time"}</h6>
                      <p>{selectedTask? `Project: ${selectedTask.projectName}` : "No project selected"}</p>
                    </div>
                    <p className="self-end">{selectedTask?`Time: ${formatDuration(totalTaskSeconds)}`: "0h 0m"}</p>
                  </div>
                </CardContent>
              </Card>
            }>
              Non Modal
            </DrawerTrigger>
            <DrawerContent className="!top-1/2 !-translate-y-1/2 !h-[90vh] border-2 border-solid border-black ring-inset shadow-shadow border-border box-border">
              <DrawerHeader  className="pb-0">
                <DrawerTitle>Task List</DrawerTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Total time spent across all tasks: <span className="font-bold text-foreground">{formatDuration(grandTotalSeconds)}</span>
                </p>
              </DrawerHeader>
              <div className="overflow-y-auto flex-1 p-4">
                <div className="flex items-center flex-col justify-center gap-4 min-h-[inherit] rounded-base " >
                  {
                    projects.length === 0 ? (
                    <Empty className="max-w-md w-full border-border border-dashed rounded-base bg-secondary-background group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FolderIcon />
                        </EmptyMedia>
                        <EmptyTitle>No tasks match these filters</EmptyTitle>
                        <EmptyDescription>
                          Create a task that fits this view, or adjust your filters.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button size="sm" className="hover:cursor-pointer" onClick={() => setShowTaskForm(1)}>
                          <PlusIcon />
                          Create Task
                        </Button>
                      </EmptyContent>
                    </Empty>
                    ) :
                  projects.map((project,index) => (
                  project &&
                  <div className="self-start mt-0 flex flex-col gap-2 mr-4">
                        <div className='flex flex-col  min-w-[336px] w-full gap-2 p-4 border-border border-solid border-2 bg-secondary-background group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full'>
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
                          {project.tasks.map((task, taskIndex) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              index={taskIndex}
                              projectId={project.id} 
                              dragDisabled={false} 
                              onClick={() => {setSelectedTask({ taskName: task.name, projectName: project.name }); setSelectedTaskId(task.id)}}
                              toggleTask={toggleTask}
                              deleteTask={deleteTask}
                              />
                          ))}
                          { showTaskForm === index ? 
                            <TaskForm
                              onCreate={(task) => {
                                addTask(project.id, task)
                                setShowTaskForm(null);
                              }}
                              onCancel={cancelTask}
                            />
                            :
                            <Button size="sm"  className="hover:cursor-pointer w-full" onClick={() => setShowTaskForm(index)} variant="neutral">
                              <PlusIcon />
                              Add Task
                            </Button>
                          }
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div className="flex justify-start items-center w-full">
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
