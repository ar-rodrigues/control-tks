import { Text, VStack } from "@chakra-ui/react";
import moment from "moment-timezone";

const TimeDisplay = ({ currentTime, currentDate }) => {
  const formatTime = (date) => {
    return moment(date).tz("America/Mexico_City").format("HH:mm");
  };

  const formatDate = (date) => {
    return moment(date)
      .tz("America/Mexico_City")
      .format("DD [de] MMMM [de] YYYY");
  };

  return (
    <VStack spacing={2}>
      <Text fontSize="48px" fontWeight="bold">
        {formatTime(currentTime)}
      </Text>
      <Text fontSize="20px" color="gray.500">
        {formatDate(currentDate)}
      </Text>
    </VStack>
  );
};

export default TimeDisplay;
