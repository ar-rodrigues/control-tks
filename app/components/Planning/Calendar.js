import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { formatDateMX } from '../../utils/dates/formatDateMX';

// Set the default timezone
moment.tz.setDefault('America/Mexico_City');
moment.locale('es');

// Create a custom localizer that uses the timezone
const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(Calendar);


const Schedule = ({containers, setContainers}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [myEvents, setMyEvents] = useState();
  const [view, setView] = useState(Views.MONTH);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const moveEvent = ({ event, start, end }) => {
    const idx = myEvents.indexOf(event);
    const updatedEvent = { ...event, start, end };

    const nextEvents = [...myEvents];
    nextEvents.splice(idx, 1, updatedEvent);

    setMyEvents(nextEvents);
    // Update the containers state
    setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === event.id
            ? {
                ...container,
                event: [
                    start,
                    end
                ]
              }
            : container
        )
      );
  };

  const resizeEvent = ({ event, start, end }) => {
    const nextEvents = myEvents.map(existingEvent => {
      return existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent;
    });

    setMyEvents(nextEvents);
    // Update the containers state
    setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === event.id
            ? {
                ...container,
                event: [
                    start,
                    end
                ]
              }
            : container
        )
      );
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {
      backgroundColor: event.color || '#3182CE',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  const { components, defaultDate, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(),
      max: moment().endOf('day').toDate(),
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  // Map containers to calendar events
  useEffect(() => {
    const containerEvents = containers.map((container) => {
      const start = moment.tz(container.event[0], 'DD/MM/YYYY', 'America/Mexico_City');
      const end = moment.tz(container.event[1], 'DD/MM/YYYY', 'America/Mexico_City');
      
      if (!start.isValid() || !end.isValid()) {
        console.warn(`Invalid date for container ${container.id}`);
        return null;
      }
      
      return {
        id: container.id,
        start: start.toDate(),
        end: end.toDate(),
        title: container.title,
        color: '#3182CE',
      };
    }).filter(Boolean);

    //console.log('Container Events:', containerEvents);
    setMyEvents(containerEvents);
  }, [containers]);

  return (
    <Box p={2} rounded="md" bg={useColorModeValue('white', 'gray.700')}>
      <Flex justifyContent="space-between" mb={4} alignItems="center">
        <Text fontSize="xl" fontWeight="bold">
          Calendario
        </Text>
      </Flex>
      <DnDCalendar
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400, width: '100%' }}
        onSelectEvent={(event) => console.log(event)}
        onNavigate={(date) => setSelectedDate(date)}
        date={selectedDate}
        onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        resizable
        selectable
        eventPropGetter={eventStyleGetter}
        components={components}
        defaultDate={defaultDate}
        max={max}
        views={[Views.MONTH, Views.WORK_WEEK, Views.AGENDA]}
        view={view}
        onView={setView}
        messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            work_week: "Semana de trabajo",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
          }}
          //timezone="America/Mexico_City"
      />
    </Box>
  );
};

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: 'lightblue',
    },
  });

export default Schedule;