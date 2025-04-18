"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserRole } from "./actions/actions";
import {
  Box,
  Flex,
  VStack,
  Spinner,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { toMXTimeString, getCurrentTimeInMX } from "./utils/dates/formatDateMX";

// Components
import TimeDisplay from "./components/Home/TimeDisplay";
import TimeStats from "./components/Home/TimeStats";
import CheckButton from "./components/Home/CheckButton";

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import("./components/Home/Map"), { ssr: false });

const useTimeTracking = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeInMX());
  const [currentDate, setCurrentDate] = useState(getCurrentTimeInMX());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getCurrentTimeInMX();
      setCurrentTime(now);
      setCurrentDate(now);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { currentTime, currentDate };
};

const useLocationTracking = () => {
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        reject,
        { enableHighAccuracy: true }
      );
    });
  };

  return { getCurrentLocation };
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [workSession, setWorkSession] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [hoursWorked, setHoursWorked] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { currentTime, currentDate } = useTimeTracking();
  const { getCurrentLocation } = useLocationTracking();
  const toast = useToast();
  const router = useRouter();

  // Responsive values
  const mapHeight = useBreakpointValue({ base: "45vh", md: "40vh" });
  const buttonOffset = useBreakpointValue({ base: "-60px", md: "-80px" });
  const contentPadding = useBreakpointValue({ base: 3, md: 4, lg: 6 });
  const contentSpacing = useBreakpointValue({ base: 6, md: 8 });

  const fetchCurrentWorkSession = async () => {
    try {
      const response = await fetch("/api/work-sessions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.workSession) {
        setWorkSession(data.workSession);

        // Set check in time if available
        if (data.workSession.check_in) {
          setCheckInTime(formatTime(new Date(data.workSession.check_in)));
        }

        // Set check in location if available
        if (data.workSession.check_in_location) {
          setCurrentLocation(data.workSession.check_in_location);
        }

        // Set check out time and hours worked if available
        if (data.workSession.check_out) {
          setCheckOutTime(formatTime(new Date(data.workSession.check_out)));
          setHoursWorked(data.workSession.total_hours);
        }
      }
    } catch (error) {
      console.error("Failed to fetch work session:", error);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { role, email } = await checkUserRole();
        if (!role) {
          router.push("/login");
        } else {
          setRole(role);
          setEmail(email);

          // Fetch current work session after authentication
          await fetchCurrentWorkSession();
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        router.push("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  const formatTime = (date) => {
    return toMXTimeString(date);
  };

  const handleCheckInOut = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const now = new Date();
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      if (!workSession?.check_in || workSession?.check_out) {
        // Check In
        const response = await fetch("/api/work-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            check_in_location: location,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setCheckInTime(formatTime(now));
          setWorkSession(data.workSession);
          setCheckOutTime(null);
          setHoursWorked(null);

          toast({
            title: "Check-in exitoso",
            description: "Tu ubicación ha sido registrada",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        } else {
          toast({
            title: "Check-in fallido",
            description: data.error || "Ocurrió un error",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      } else {
        // Check Out
        const response = await fetch("/api/work-sessions", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            check_out_location: location,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setCheckOutTime(formatTime(now));
          setWorkSession(data.workSession);
          setHoursWorked(data.workSession.total_hours);
          setCurrentLocation(null);

          toast({
            title: "Check-out exitoso",
            description: "Tu hora de salida ha sido registrada",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        } else {
          toast({
            title: "Check-out fallido",
            description: data.error || "Ocurrió un error",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "No se pudo obtener su ubicación. Por favor, habilite los servicios de ubicación.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" justify="center" align="center" bg="white">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Flex
      minH="100vh"
      direction="column"
      bg="white"
      position="relative"
      maxW="100vw"
      overflow="hidden"
    >
      {/* Map Section */}
      <Box h={mapHeight} position="relative">
        <Map location={currentLocation} isPlaceholder={!currentLocation} />
      </Box>

      {/* Main Content */}
      <VStack
        spacing={contentSpacing}
        p={contentPadding}
        flex={1}
        align="stretch"
        maxW={{ base: "100%", md: "container.md" }}
        mx="auto"
        w="full"
      >
        {/* Check In/Out Button and Time Display */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          position="relative"
          mt={buttonOffset}
          px={2}
        >
          <CheckButton
            isCheckedIn={!!workSession?.check_in && !workSession?.check_out}
            onClick={handleCheckInOut}
            isLoading={isProcessing}
          />
          <TimeDisplay currentTime={currentTime} currentDate={currentDate} />
        </Flex>

        {/* Time Stats */}
        <Box
          w="full"
          maxW={{ base: "100%", md: "container.sm" }}
          mx="auto"
          px={2}
        >
          <TimeStats
            checkInTime={checkInTime}
            checkOutTime={checkOutTime}
            hoursWorked={hoursWorked}
          />
        </Box>
      </VStack>
    </Flex>
  );
};

export default Home;
