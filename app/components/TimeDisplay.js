import { Text, VStack } from "@chakra-ui/react";

const TimeDisplay = ({ currentTime, currentDate }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
