"use client";

import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import { BiRfid } from "react-icons/bi";
import LocationsTable from "../components/LocationsDirectory/LocationsTable";
import VinListsTable from "../components/VinLists/VinListsTable";
import ApiKeysTable from "../components/ApiKeys/ApiKeysTable";

export default function RfidConfigPage() {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("gray.400", "gray.500");
  const tabActiveColor = useColorModeValue("gray.800", "gray.100");
  const tabInactiveColor = useColorModeValue("gray.500", "gray.400");
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box minH="100vh" bg="white" py={{ base: 2, md: 8 }}>
      <Box
        mx="auto"
        w="100%"
        maxW={{ base: "100%", md: "1200px" }}
        px={{ base: 0, sm: 0, md: 8 }}
      >
        <Flex
          align={isMobile ? "flex-start" : "center"}
          direction={isMobile ? "column" : "row"}
          mb={isMobile ? 0 : 1}
          gap={isMobile ? 1 : 3}
          px={{ base: 2, md: 0 }}
        >
          <Box
            as={BiRfid}
            fontSize={isMobile ? "xl" : "2xl"}
            color={iconColor}
            mb={isMobile ? 1 : 0}
          />
          <Heading
            fontWeight="bold"
            fontSize={isMobile ? "lg" : "2xl"}
            mb={0}
            textAlign={isMobile ? "left" : "inherit"}
          >
            RFID
          </Heading>
        </Flex>
        <Text
          color="gray.400"
          mb={4}
          fontSize={isMobile ? "xs" : "sm"}
          pl={isMobile ? 2 : 7}
          textAlign={isMobile ? "left" : "inherit"}
        >
          Configuración de Directorio de Ubicaciones, Listas VIN y Claves API
          para el escáner RFID
        </Text>
        <Box
          border={{ base: "none", md: "1px solid" }}
          borderColor={borderColor}
          borderRadius={{ base: "none", md: "lg" }}
          p={{ base: 0, sm: 0, md: 6 }}
          bg="white"
          w="100%"
        >
          <Tabs variant="unstyled" isFitted>
            <TabList
              borderBottom="1px solid"
              borderColor={borderColor}
              mb={2}
              px={{ base: 2, md: 0 }}
            >
              <Tab
                _selected={{
                  color: tabActiveColor,
                  borderBottom: "2px solid",
                  borderColor: "black",
                  fontWeight: "bold",
                  bg: "transparent",
                }}
                color={tabInactiveColor}
                fontWeight="medium"
                fontSize={{ base: "sm", md: "md" }}
                px={2}
              >
                Directorio de Ubicaciones
              </Tab>
              <Tab
                _selected={{
                  color: tabActiveColor,
                  borderBottom: "2px solid",
                  borderColor: "black",
                  fontWeight: "bold",
                  bg: "transparent",
                }}
                color={tabInactiveColor}
                fontWeight="medium"
                fontSize={{ base: "sm", md: "md" }}
                px={2}
              >
                Listas VIN
              </Tab>
              <Tab
                _selected={{
                  color: tabActiveColor,
                  borderBottom: "2px solid",
                  borderColor: "black",
                  fontWeight: "bold",
                  bg: "transparent",
                }}
                color={tabInactiveColor}
                fontWeight="medium"
                fontSize={{ base: "sm", md: "md" }}
                px={2}
              >
                Claves API
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={{ base: 2, md: 0 }}>
                <LocationsTable />
              </TabPanel>
              <TabPanel px={{ base: 2, md: 0 }}>
                <VinListsTable />
              </TabPanel>
              <TabPanel px={{ base: 2, md: 0 }}>
                <ApiKeysTable />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}
