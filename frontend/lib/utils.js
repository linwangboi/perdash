import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function getErrorMessage(data) {
  const obj = Array.isArray(data) ? data[0] : data;
  return Object.values(obj)?.['error'] || 'Something went wrong, please refresh...'
}

export const formatCreatedAt = (isoString) => {
  if (!isoString) return "—";

  const date = new Date(isoString);

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12;

  const time =
    `${hours}:${minutes.toString().padStart(2, "0")}${period}`;

  const day = date.getDate();

  const month = date.toLocaleString("en-US", { month: "short" });

  return `${time}, ${day} ${month}`;
};