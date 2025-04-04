export const toLocalDate = (dateString, locale = "es-MX", options = {}) => {
  // Default options
  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Create date at 11pm to avoid timezone issues
  const dateObj = new Date(`${dateString}T11:59:59`);

  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
};
