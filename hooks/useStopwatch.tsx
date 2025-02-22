import { useEffect, useRef, useState } from "react";

export const useElapsedTime = (startTime: number) => {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  // Store the initial start time in a ref so it doesn't change on re-renders
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!startTimeRef.current) {
      // Convert input to Date object if it isn't already
      startTimeRef.current = startTime
    }

    const calculateElapsedTime = () => {
      const now = new Date();
      const diffInMilliseconds =
        now.getTime() - startTime;
      let diffInSeconds = Math.floor(diffInMilliseconds / 1000) % 60;

      setMinutes(Math.floor(diffInSeconds / 60).toString());
      setSeconds(
        (diffInSeconds > 9 ? diffInSeconds : `0${diffInSeconds}`).toString()
      );
    };

    // Calculate initial elapsed time
    calculateElapsedTime();

    // Update elapsed time every second
    const intervalId = setInterval(calculateElapsedTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [startTime]); // startTime is still in deps array to handle prop changes

  return { minutes, seconds };
};
