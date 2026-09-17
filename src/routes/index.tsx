import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedMinutes,setSelectedMinutes] = useState<number[]>([30]);
  const [secondsLeft,setSecondsLeft] = useState<number>(selectedMinutes[0]*60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

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
    // if(isRunning){
      
    // }
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
    <div className="font-base h-full w-full bg-cover bg-center bg-no-repeat bg-[url('/b.jpg')] flex items-center p-96">
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div>
          <h2 className="text-white text-9xl">{formatTime(secondsLeft)}</h2>
        </div>
        <div className="w-full">
          <Slider defaultValue={selectedMinutes} value={[Math.ceil(secondsLeft / 60)]} onValueChange={handleSliderChange} max={120} step={1}  />
        </div>
        <Button variant={'white'} onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</Button>
      </div>
    </div>
  )
}
