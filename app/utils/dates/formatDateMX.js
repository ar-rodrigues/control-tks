// In a new file, e.g., dateUtils.js
import moment from "moment-timezone";

export const formatDateMX = (date) => {
  return moment(date).tz("America/Mexico_City").format("DD/MM/YYYY");
};

export const formattedDate = () => {
  const date = new Date();
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "America/Mexico_City", // Correct way to specify the timezone
  };
  const formattedDate = date.toLocaleDateString("es-MX", options); // Correct locale
  return formattedDate;
};

export const getCurrentTimeInMX = () => {
  return moment().tz("America/Mexico_City");
};

export const toMXTimeString = (date) => {
  return moment(date).tz("America/Mexico_City").format("HH:mm");
};

export const toMXDateString = (date) => {
  return moment(date).tz("America/Mexico_City").format("YYYY-MM-DD");
};

export const calculateTimeDifference = (start, end) => {
  const startTime = moment(start).tz("America/Mexico_City");
  const endTime = moment(end).tz("America/Mexico_City");
  const duration = moment.duration(endTime.diff(startTime));

  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.minutes());
  const seconds = Math.floor(duration.seconds());

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
