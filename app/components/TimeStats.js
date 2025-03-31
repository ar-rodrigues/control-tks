import { Flex, VStack, Text, Icon } from "@chakra-ui/react";
import { CiClock2 } from "react-icons/ci";

const TimeStats = ({ checkInTime, checkOutTime, hoursWorked }) => {
  const StatItem = ({ label, value }) => (
    <VStack align="center" spacing={1}>
      <Icon as={CiClock2} boxSize={6} color="blue.500" />
      <Text fontSize="24px" fontWeight="bold">
        {value || "--:--"}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
    </VStack>
  );

  return (
    <Flex justify="space-between" w="full" px={4} mt={8}>
      <StatItem label="Check in" value={checkInTime} />
      <StatItem label="Check out" value={checkOutTime} />
      <StatItem label="Hours worked" value={hoursWorked} />
    </Flex>
  );
};

export default TimeStats;
