export const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const progressPercent = (positionMs: number, durationMs: number) => {
  if (durationMs <= 0) return 0;
  return Math.min(100, Math.max(0, (positionMs / durationMs) * 100));
};

export const sumDuration = (durations: number[]) => durations.reduce((total, value) => total + value, 0);
