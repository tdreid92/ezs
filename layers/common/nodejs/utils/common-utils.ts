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

const getElapsedTime = (startTime: [number, number]): number => {
  const elapsedHrTime = process.hrtime(startTime);
  return elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
};

const getFormattedDate = (): string => {
  return formatRfc3339(new Date(Date.now()));
};

function cast<T>(obj: any, cl: { new (...args): T }): T {
  //todo: can arrow?
  obj.__proto__ = cl.prototype;
  return obj;
}

const tryParse = (input: any) => {
  try {
    JSON.parse(input);
  } catch (e) {
    return undefined;
  }
};

export const commonUtils = {
  cast: cast,
  tryParse: tryParse,
  getElapsedTime: getElapsedTime,
  getFormattedDate: getFormattedDate
};
