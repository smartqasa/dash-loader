export const formattedDate = (date: Date = new Date()): string => {
  if (isNaN(date.getTime())) return "Unknown";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };

  try {
    return date.toLocaleDateString(undefined, options);
  } catch (e) {
    return date.toDateString();
  }
};

export const formattedTime = (date: Date = new Date()): string => {
  if (isNaN(date.getTime())) return "Unknown";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours % 12 || 12}:${minutes < 10 ? "0" + minutes : minutes}`;
};
