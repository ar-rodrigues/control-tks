// In a new file, e.g., dateUtils.js
import moment from 'moment-timezone';

export const formatDateMX = (date) => {
  return moment(date).tz('America/Mexico_City').format('DD/MM/YYYY');
};

export const formattedDate = () => {
  const date = new Date();
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'America/Mexico_City', // Correct way to specify the timezone
  };
  const formattedDate = date.toLocaleDateString('es-MX', options); // Correct locale
  return formattedDate;
};

