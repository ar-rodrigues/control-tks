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

// Components
import TimeDisplay from "./components/Home/TimeDisplay";
import TimeStats from "./components/Home/TimeStats";
import CheckButton from "./components/Home/CheckButton";

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import("./components/Home/Map"), { ssr: false });

const useTimeTracking = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
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

  const { currentTime, currentDate } = useTimeTracking();
  const { getCurrentLocation } = useLocationTracking();
  const toast = useToast();
  const router = useRouter();

  // Responsive values
  const mapHeight = useBreakpointValue({ base: "45vh", md: "40vh" });
  const buttonOffset = useBreakpointValue({ base: "-60px", md: "-80px" });
  const contentPadding = useBreakpointValue({ base: 3, md: 4, lg: 6 });
  const contentSpacing = useBreakpointValue({ base: 6, md: 8 });

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { role, email } = await checkUserRole();
        if (!role) {
          router.push("/login");
        } else {
          setRole(role);
          setEmail(email);
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
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleCheckInOut = async () => {
    try {
      const now = new Date();
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      if (!workSession?.check_in) {
        // Check In
        setCheckInTime(formatTime(now));
        setWorkSession({
          check_in: now.toISOString(),
          check_in_location: location,
        });
      } else {
        // Check Out
        setCheckOutTime(formatTime(now));

        const checkIn = new Date(workSession.check_in);
        const diffMs = now - checkIn;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        setHoursWorked(
          `${diffHours.toString().padStart(2, "0")}:${diffMinutes
            .toString()
            .padStart(2, "0")}`
        );

        setWorkSession((prev) => ({
          ...prev,
          check_out: now.toISOString(),
          check_out_location: location,
        }));
      }

      toast({
        title: workSession?.check_in
          ? "Check-out successful"
          : "Check-in successful",
        description: "Your location has been recorded",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "Unable to get your location. Please enable location services.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
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
            isCheckedIn={!!workSession?.check_in}
            onClick={handleCheckInOut}
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
