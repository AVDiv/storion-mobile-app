function calculateTimeAgo(date: string | number | Date): string {
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];

  let interval = seconds;
  let i = 0;

  while (i < units.length && interval >= units[i][0]) {
    interval /= units[i][0];
    i++;
  }

  return rtf.format(-Math.floor(interval), units[i][1]);
}

export default calculateTimeAgo;
