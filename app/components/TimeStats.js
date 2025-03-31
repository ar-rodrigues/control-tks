import { Flex, VStack, Text, Icon, Box } from "@chakra-ui/react";
import { CiClock2 } from "react-icons/ci";

const TimeStats = ({ checkInTime, checkOutTime, hoursWorked }) => {
  const StatItem = ({ label, value }) => (
    <VStack align="center" spacing={1} flex="1" p={2} minW="80px">
      <Icon as={CiClock2} boxSize={6} color="blue.500" />
      <Text fontSize="md" fontWeight="bold" textAlign="center">
        {value || "--:--"}
      </Text>
      <Text
        fontSize="sm"
        color="gray.500"
        textAlign="center"
        whiteSpace={{ base: "normal", sm: "nowrap" }}
      >
        {label}
      </Text>
    </VStack>
  );

  return (
    <Box w="full" mt={8}>
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="center"
        align="center"
        w="full"
        px={4}
        gap={{ base: 4, sm: 2 }}
      >
        <StatItem label="Check in" value={checkInTime} />
        <StatItem label="Check out" value={checkOutTime} />
        <StatItem label="Horas trabajadas" value={hoursWorked} />
      </Flex>
    </Box>
  );
};

export default TimeStats;
