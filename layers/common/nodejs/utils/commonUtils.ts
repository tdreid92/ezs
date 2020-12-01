const getElapsedTime = (startTime: [number, number]): number => {
  const elapsedHrTime = process.hrtime(startTime);
  return elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
};

const getFormattedDate = (): string => {
  return formatRfc3339(new Date(Date.now()));
};

const pad = (n: number): string => {
  return n < 10 ? '0' + n : n.toString();
};

const formatRfc3339 = (date: Date): string => {
  return (
    date.getUTCFullYear() +
    '-' +
    pad(date.getUTCMonth() + 1) +
    '-' +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    ':' +
    pad(date.getUTCMinutes()) +
    ':' +
    pad(date.getUTCSeconds()) +
    'Z'
  );
};

export const commonUtils = {
  getElapsedTime: getElapsedTime,
  getFormattedDate: getFormattedDate
};
