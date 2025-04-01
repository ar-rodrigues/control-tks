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
      fontSize={{ base: "sm", md: "md" }}
      _hover={{ bg: "gray.50" }}
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

  return (
    <TableContainer w="full" overflowX="auto">
      <Table variant="simple" size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <SortableHeader sortKey="full_name">Name</SortableHeader>
            <SortableHeader sortKey="email">Email</SortableHeader>
            <SortableHeader sortKey="role">Role</SortableHeader>
            <Th fontSize={{ base: "sm", md: "md" }}>Actions</Th>
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
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                >
                  <Td fontSize={{ base: "sm", md: "md" }}>
                    {editUserId === user.id ? (
                      <VStack align="start" spacing={1}>
                        <Input
                          value={newUser.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          size="sm"
                          placeholder="Enter name"
                        />
                        {errors.name && (
                          <Text color="red.500" fontSize="sm">
                            {errors.name}
                          </Text>
                        )}
                      </VStack>
                    ) : (
                      user.full_name
                    )}
                  </Td>
                  <Td fontSize={{ base: "sm", md: "md" }}>
                    {editUserId === user.id ? (
                      <VStack align="start" spacing={1}>
                        <Input
                          value={newUser.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value?.trim())
                          }
                          size="sm"
                          placeholder="Enter email"
                        />
                        {errors.email && (
                          <Text color="red.500" fontSize="sm">
                            {errors.email}
                          </Text>
                        )}
                      </VStack>
                    ) : (
                      user.email
                    )}
                  </Td>
                  <Td fontSize={{ base: "sm", md: "md" }}>
                    {editUserId === user.id ? (
                      <Select
                        value={newUser.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        size="sm"
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
                      >
                        {user.roles?.role_name || "Role not assigned"}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {editUserId === user.id ? (
                      <HStack spacing={2} wrap="wrap">
                        <Tooltip label="Change Password">
                          <IconButton
                            icon={<LockIcon />}
                            onClick={() => handlePasswordChange(user.id)}
                            aria-label="Change Password"
                            size="sm"
                            colorScheme="blue"
                            isLoading={isActionLoading}
                          />
                        </Tooltip>
                        <Button
                          onClick={() => handleSave(user.id)}
                          size="sm"
                          colorScheme="green"
                          isLoading={isActionLoading}
                        >
                          Save
                        </Button>
                        <Tooltip label="Cancel Edit">
                          <IconButton
                            icon={<CloseIcon />}
                            onClick={() => setEditUserId(null)}
                            aria-label="Cancel Edit"
                            colorScheme="red"
                            size="sm"
                          />
                        </Tooltip>
                      </HStack>
                    ) : (
                      <HStack spacing={2} wrap="wrap">
                        <Tooltip label="Edit User">
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
                            aria-label="Edit"
                            size="sm"
                            colorScheme="blue"
                          />
                        </Tooltip>
                        <Tooltip label="Delete User">
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleDelete(user.id)}
                            aria-label="Delete"
                            size="sm"
                            colorScheme="red"
                          />
                        </Tooltip>
                      </HStack>
                    )}
                  </Td>
                </Tr>
              ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
