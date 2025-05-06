import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { Box, Input } from "@chakra-ui/react";
import moment from "moment-timezone";

registerLocale("es", es);
const timeZone = "America/Mexico_City";

function MinimalCalendarPicker({ selectedDate, onDateChange, availableDates }) {
  // Convert availableDates to a Set for fast lookup
  const availableSet = React.useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  // Only allow selecting available dates
  const filterDate = (date) => {
    // Convert date to Mexico City time and format as yyyy-MM-dd
    const str = moment.tz(date, timeZone).format("YYYY-MM-DD");
    return availableSet.has(str);
  };

  // Convert selectedDate string to Date object in Mexico City time
  const selected = selectedDate
    ? moment.tz(selectedDate, "YYYY-MM-DD", timeZone).toDate()
    : null;

  return (
    <Box maxW="320px">
      <DatePicker
        selected={selected}
        onChange={(date) => {
          if (!date) return;
          // Convert picked date to Mexico City time and format as yyyy-MM-dd
          const str = moment.tz(date, timeZone).format("YYYY-MM-DD");
          if (availableSet.has(str)) {
            onDateChange(str);
          }
        }}
        filterDate={filterDate}
        locale="es"
        dateFormat="dd/MM/yyyy"
        customInput={<Input />}
        placeholderText="Selecciona una fecha"
        popperPlacement="bottom"
        showPopperArrow={false}
        calendarStartDay={1}
        highlightDates={selected ? [selected] : []}
        isClearable={false}
      />
    </Box>
  );
}

export default MinimalCalendarPicker;
