import { Button } from "@chakra-ui/react";

const CheckButton = ({ isCheckedIn, onClick }) => {
  return (
    <Button
      w="200px"
      h="200px"
      zIndex={1000}
      borderRadius="full"
      bg={isCheckedIn ? "orange.500" : "blue.500"}
      color="white"
      fontSize="24px"
      boxShadow="lg"
      _hover={{
        transform: "scale(1.05)",
        boxShadow: "xl",
      }}
      _active={{
        transform: "scale(0.95)",
        boxShadow: "inner",
      }}
      transition="all 0.2s ease-in-out"
      onClick={onClick}
    >
      {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
    </Button>
  );
};

export default CheckButton;
