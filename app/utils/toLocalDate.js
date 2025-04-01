export const toLocalDate = (dateString, locale = "es-MX", options = {}) => {
  // Default options
  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Create date at noon to avoid timezone issues
  const dateObj = new Date(`${dateString}T12:00:00`);

  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
};
