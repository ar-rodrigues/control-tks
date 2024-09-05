'use client';

import { useEffect, useState } from 'react';
import { Box, VStack, Button, useBreakpointValue } from '@chakra-ui/react';
import { checkUserRole } from '../../actions/actions';
import { usePathname } from 'next/navigation';
import LogoutButton from '../../components/logout/LogoutButton';
import SidebarLink from './SidebarLink';
import { FiHome, FiUsers } from 'react-icons/fi'; 
import { CiUnlock, CiMenuKebab, CiMenuBurger  } from "react-icons/ci";


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
        if (pathname !== '/login') {
          const { role } = await checkUserRole();
          setRoleName(role);
          console.log('User:', role);
        }
      } catch (error) {
        console.error('Failed to fetch role:', error);
      }
    };

    fetchRole();
  }, [pathname]);

  if (pathname === '/login') return null;

  // Link data with conditional rendering based on role
  const links = [
    { href: '/', text: 'Inicio', icon: FiHome, roles: ['admin', 'back-office', 'auditor'] },
    { href: '/users', text: 'Usuários', icon: FiUsers, roles: ['admin'] },
    { href: '/back-office', text: 'Desencriptador', icon: CiUnlock, roles: ['admin', 'back-office'] },
  ];

  return (
    <Box
      as="nav"
      bgGradient="linear(to-r, blackAlpha.800, gray.800)"
      color="white"
      w={{ base: '100px', md: isTextVisible ? '200px' : '150px', sm: isTextVisible ? '200px' : '80px' } }
      p="4"
      position="static"
      height="100vh"
      minW={"100px"}
      overflow={"hidden"}
    >
      <Button
        colorScheme="teal"
        mb="4"
        onClick={() => setIsTextVisible(!isTextVisible)} 
      >
        {isTextVisible ? <CiMenuKebab /> : <CiMenuBurger /> }
      </Button>

      <VStack align="stretch" spacing="4" pb="10" pt="10" justify="space-between" h="100%">
        <VStack align="stretch" spacing="4" w="100%">
          {links
            .filter(link => link.roles.includes(roleName)) // Only show links based on role
            .map(link => (
              <SidebarLink
                key={link.href}
                href={link.href}
                text={link.text}
                icon={link.icon}
                isActive={pathname === link.href}
                isTextVisible={isTextVisible}
              />
            ))}
        </VStack>
        
        <LogoutButton />
      </VStack>
    </Box>
  );
};

export default Sidebar;
