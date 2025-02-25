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
