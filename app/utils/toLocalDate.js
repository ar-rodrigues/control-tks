import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export const toLocalDate = (dateString, locale = "es-MX", options = {}) => {
  const timeZone = "America/Mexico_City";
  const dateObj = toZonedTime(new Date(dateString + "T00:00:00Z"), timeZone);
  // Default options
  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return dateObj.toLocaleDateString(locale, {
    ...defaultOptions,
    ...options,
    timeZone,
  });
};
