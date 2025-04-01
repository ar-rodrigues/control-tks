import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Input,
  Button,
  Select,
  Text,
  Box,
  VStack,
  HStack,
  Spinner,
  useToast,
  TableContainer,
  Badge,
  Tooltip,
  Skeleton,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  LockIcon,
  CloseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { useValidateUser } from "../../utils/validations/useValidateUser";
import { useState } from "react";

export function UserTable({
  users,
  editUserId,
  newUser,
  setNewUser,
  setEditUserId,
  handleSave,
  handleEdit,
  handleDelete,
  handlePasswordChange,
  roles,
  isLoading,
  isActionLoading,
}) {
  const { errors, validate } = useValidateUser(newUser);
  const toast = useToast();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const bgHover = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });
  const buttonSize = useBreakpointValue({ base: "xs", md: "sm" });

  const handleInputChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
    validate();
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue =
      sortConfig.key === "role" ? a.roles?.role_name : a[sortConfig.key];
    const bValue =
      sortConfig.key === "role" ? b.roles?.role_name : b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ children, sortKey }) => (
    <Th
      cursor="pointer"
      onClick={() => handleSort(sortKey)}
      fontSize={{ base: "xs", md: "sm" }}
      bg={headerBg}
      _hover={{ bg: "gray.100" }}
      transition="background-color 0.2s"
      py={3}
      whiteSpace="nowrap"
    >
      <HStack spacing={1}>
        {children}
        {sortConfig.key === sortKey &&
          (sortConfig.direction === "asc" ? (
            <ChevronUpIcon />
          ) : (
            <ChevronDownIcon />
          ))}
      </HStack>
    </Th>
  );

  const ActionButtons = ({ user, isEditing }) => {
    if (isEditing) {
      return (
        <HStack spacing={1} wrap="wrap">
          <Tooltip label="Cambiar contraseña">
            <IconButton
              icon={<LockIcon />}
              onClick={() => handlePasswordChange(user.id)}
              aria-label="Cambiar contraseña"
              size={buttonSize}
              colorScheme="blue"
              isLoading={isActionLoading}
              borderRadius="md"
            />
          </Tooltip>
          <Button
            onClick={() => handleSave(user.id)}
            size={buttonSize}
            colorScheme="green"
            isLoading={isActionLoading}
            borderRadius="md"
          >
            {isMobile ? "✓" : "Guardar"}
          </Button>
          <Tooltip label="Cancelar edición">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => setEditUserId(null)}
              aria-label="Cancelar edición"
              colorScheme="red"
              size={buttonSize}
              borderRadius="md"
            />
          </Tooltip>
        </HStack>
      );
    }

    return (
      <HStack spacing={1} wrap="wrap">
        <Tooltip label="Editar usuario">
          <IconButton
            icon={<EditIcon />}
            onClick={() =>
              handleEdit(
                user.id,
                user.full_name,
                user.email,
                user.roles?.role_name
              )
            }
            aria-label="Editar"
            size={buttonSize}
            colorScheme="blue"
            borderRadius="md"
          />
        </Tooltip>
        <Tooltip label="Eliminar usuario">
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleDelete(user.id)}
            aria-label="Eliminar"
            size={buttonSize}
            colorScheme="red"
            borderRadius="md"
          />
        </Tooltip>
      </HStack>
    );
  };

  return (
    <Box overflowX="auto" w="full">
      <TableContainer
        w="full"
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Table variant="simple" size={tableSize}>
          <Thead>
            <Tr>
              <SortableHeader sortKey="full_name">Nombre</SortableHeader>
              <SortableHeader sortKey="email">Email</SortableHeader>
              <SortableHeader sortKey="role">Rol</SortableHeader>
              <Th
                fontSize={{ base: "xs", md: "sm" }}
                bg={headerBg}
                py={3}
                whiteSpace="nowrap"
              >
                Acciones
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Tr key={index}>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" width="100px" />
                      </Td>
                    </Tr>
                  ))
              : sortedUsers.map((user) => (
                  <Tr
                    key={user.id}
                    _hover={{ bg: bgHover }}
                    transition="background-color 0.2s"
                  >
                    <Td fontSize={{ base: "xs", md: "sm" }} py={3}>
                      {editUserId === user.id ? (
                        <VStack align="start" spacing={1}>
                          <Input
                            value={newUser.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            size={buttonSize}
                            placeholder="Ingrese nombre"
                            borderRadius="md"
                          />
                          {errors.name && (
                            <Text color="red.500" fontSize="xs">
                              {errors.name}
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        user.full_name
                      )}
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }} py={3}>
                      {editUserId === user.id ? (
                        <VStack align="start" spacing={1}>
                          <Input
                            value={newUser.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value?.trim())
                            }
                            size={buttonSize}
                            placeholder="Ingrese email"
                            borderRadius="md"
                          />
                          {errors.email && (
                            <Text color="red.500" fontSize="xs">
                              {errors.email}
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        user.email
                      )}
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }} py={3}>
                      {editUserId === user.id ? (
                        <Select
                          value={newUser.role}
                          onChange={(e) =>
                            handleInputChange("role", e.target.value)
                          }
                          size={buttonSize}
                          borderRadius="md"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.role_name.toUpperCase()}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Badge
                          colorScheme={user.roles?.role_name ? "blue" : "gray"}
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          {user.roles?.role_name || "Rol no asignado"}
                        </Badge>
                      )}
                    </Td>
                    <Td py={3}>
                      <ActionButtons
                        user={user}
                        isEditing={editUserId === user.id}
                      />
                    </Td>
                  </Tr>
                ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
