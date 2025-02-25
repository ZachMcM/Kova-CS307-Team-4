export function calculateTime(start: number, end: number) {
  const diffInMilliseconds = end - start;
  
  let totalSeconds = Math.floor(diffInMilliseconds / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return { minutes, seconds }
};

export function formatCalculateTime({minutes, seconds}: {minutes: number, seconds: number}) {
  return seconds > 9 ? `${minutes}:${seconds}` : `${minutes}:0${seconds}`
}