"use client";

import { useEffect, useState } from "react";
import { Flex, Box, Text, useColorModeValue, Circle } from "@chakra-ui/react";
import { checkUserRole } from "../../actions/actions";
import { usePathname } from "next/navigation";
import { FiHome, FiUsers, FiLogOut } from "react-icons/fi";
import { CiUnlock } from "react-icons/ci";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { menuLinks, logoutLink } from "../config/menuConfig";

const TabMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [roleName, setRoleName] = useState(null);

  // Colores para el tema minimalista
  const bgColor = useColorModeValue(
    "rgba(255, 255, 255, 0.45)",
    "rgba(26, 32, 44, 0.95)"
  );
  const activeColor = useColorModeValue("teal.500", "teal.300");
  const inactiveColor = useColorModeValue("gray.400", "gray.500");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (pathname !== "/login") {
          const { role } = await checkUserRole();
          setRoleName(role);
        }
      } catch (error) {
        console.error("Failed to fetch role:", error);
      }
    };

    fetchRole();
  }, [pathname]);

  if (pathname === "/login") return null;

  // Función para el logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Filtrar enlaces según el rol del usuario
  const filteredLinks = menuLinks.filter(
    (link) => link.roles.length === 0 || link.roles.includes(roleName)
  );

  // Agregar el enlace de logout
  const tabLinks = [
    ...filteredLinks,
    {
      ...logoutLink,
      onClick: handleLogout,
    },
  ];

  const TabItem = ({ item }) => {
    const isActive = pathname === item.href;

    const handleClick = (e) => {
      if (item.onClick) {
        e.preventDefault();
        item.onClick();
      }
    };

    return (
      <Box
        as={NextLink}
        href={item.href}
        onClick={handleClick}
        position="relative"
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={3}
        transition="transform 0.2s"
        _hover={{ transform: "translateY(-2px)" }}
      >
        {isActive && (
          <Box
            position="absolute"
            top="-1px"
            width="10px"
            height="2px"
            bg={activeColor}
            borderRadius="full"
          />
        )}
        <Box position="relative" mb={1}>
          <Box
            as={item.icon}
            fontSize="lg"
            color={isActive ? activeColor : inactiveColor}
            transition="all 0.3s"
          />
        </Box>
        <Text
          fontSize="xs"
          fontWeight={isActive ? "medium" : "normal"}
          color={isActive ? activeColor : inactiveColor}
          transition="all 0.3s"
        >
          {item.text}
        </Text>
      </Box>
    );
  };

  return (
    <Flex
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      backdropFilter="blur(10px)"
      borderTop="1px solid"
      borderColor={borderColor}
      zIndex={100}
      h="64px"
      justify="space-around"
      align="center"
    >
      {tabLinks.map((item) => (
        <TabItem key={item.href} item={item} />
      ))}
    </Flex>
  );
};

export default TabMenu;
