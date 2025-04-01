"use client";

import { useEffect, useState } from "react";
import { Box, VStack, Button, useBreakpointValue } from "@chakra-ui/react";
import { checkUserRole } from "../../actions/actions";
import { usePathname } from "next/navigation";
import LogoutButton from "../../components/logout/LogoutButton";
import SidebarLink from "./SidebarLink";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { menuLinks } from "../config/menuConfig";

const Sidebar = () => {
  const pathname = usePathname();
  const [roleName, setRoleName] = useState(null);
  const initialTextVisible = useBreakpointValue({ base: false, md: true });
  const [isTextVisible, setIsTextVisible] = useState(initialTextVisible);

  useEffect(() => {
    setIsTextVisible(initialTextVisible);
  }, [initialTextVisible]);

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

  return (
    <Box
      as="nav"
      bgGradient="linear(to-r, blackAlpha.800, gray.800)"
      color="white"
      w={{
        base: "100px",
        md: isTextVisible ? "200px" : "80px",
        sm: isTextVisible ? "200px" : "100px",
      }}
      p="4"
      position="static"
      height="100$"
      minH={"100%"}
      minW={isTextVisible ? "200px" : "80px"}
      overflow={"hidden"}
    >
      <Button
        colorScheme="teal"
        size="sm"
        w={"auto"}
        fontSize={"100%"}
        mt={4}
        mb={4}
        onClick={() => setIsTextVisible(!isTextVisible)}
      >
        {isTextVisible ? <GoSidebarExpand /> : <GoSidebarCollapse />}
      </Button>

      <VStack
        align="start"
        spacing="4"
        pb="10"
        pt="10"
        justify="space-between"
        h="100%"
      >
        <VStack align="stretch" spacing="6" w="100%">
          {menuLinks
            .filter((link) => link.roles.includes(roleName))
            .map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                text={link.text}
                icon={link.icon}
                isActive={pathname === link.href}
                isTextVisible={isTextVisible}
              />
            ))}
          <LogoutButton isTextVisible={isTextVisible} />
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;
