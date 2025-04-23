import { calculateTime } from "@/lib/calculateTime";
import { useEffect, useRef, useState } from "react";

export const useElapsedTime = (startTime: number, stopped: boolean) => {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [isStopped, setIsStopped] = useState(stopped);

  // Store the initial start time in a ref so it doesn't change on re-renders
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!isStopped) {
      if (!startTimeRef.current) {
        startTimeRef.current = startTime;
      }

      const calculateElapsedTime = () => {
        const { minutes, seconds } = calculateTime(
          startTimeRef.current || Date.now(),
          Date.now()
        );

        setMinutes(minutes.toString());
        setSeconds(seconds > 9 ? seconds.toString() : `0${seconds}`);
      };

      // Calculate initial elapsed time
      calculateElapsedTime();

      // Update elapsed time every second
      const intervalId = setInterval(calculateElapsedTime, 1000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [startTime, isStopped]);

  return { minutes, seconds, setIsStopped };
};

export function takeRest(initDuration: number, stopRest: (duration: number) => void): {
    extendRest: (duration: number) => void, 
    endRest: () => number,
    startRest: (initDuration: number) => void,
    remainingRestTime: number,
    endWorkout: () => void} {
  const [startTime, setStartTime] = useState(Date.now())
  const [endTime, setEndTime] = useState(initDuration + startTime)
  const [isResting, setIsResting] = useState(false)
  const [inWorkout, setInWorkout] = useState(true)
  const [remainingRestTime, setRemainingRestTime] = useState(0)
  const extendRest = function(duration: number) {
    setEndTime(endTime + duration)
  } 

  const startRest = function (initDuration: number) {
    const initTime = Date.now()
    setStartTime(initTime)
    setRemainingRestTime(initDuration)
    setEndTime(initTime + (initDuration))
    setIsResting(true)
  }

  const endRest = function () {
    setIsResting(false)
    return Math.floor((Date.now() - startTime) / 1000)
  }

  const endWorkout = function () {
    setInWorkout(false)
  }

  useEffect(() => {
    if (inWorkout) {
      const updateRemainingTime = () => {
        if (isResting) {
          const currentTime = Date.now()
          if (currentTime >= endTime) {
            setIsResting(false)
            stopRest(Math.floor((endTime - startTime) / 1000))
          }
          setRemainingRestTime(Math.floor((endTime - currentTime) / 1000))
        }
      }
      updateRemainingTime()
      const intervalId = setInterval(updateRemainingTime, 1000);
      return () => clearInterval(intervalId)
    }
  }, [startTime, endTime, inWorkout, isResting])
  return {extendRest, endRest, startRest, remainingRestTime, endWorkout}
}