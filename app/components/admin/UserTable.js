import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Input, Button, Select, Text, Box, VStack, HStack } from '@chakra-ui/react';
import { EditIcon, DeleteIcon, LockIcon, CloseIcon } from '@chakra-ui/icons';
import { useValidateUser } from '../../utils/validations/useValidateUser';

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
  roles
}) {
  const { errors, validate } = useValidateUser(newUser); 

  const handleInputChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
    validate();
  };

  return (
    <Box overflowX="auto" w={"full"}>
      <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
        <Thead>
          <Tr>
            <Th fontSize={{ base: 'sm', md: 'md' }}>Name</Th>
            <Th fontSize={{ base: 'sm', md: 'md' }}>Email</Th>
            <Th fontSize={{ base: 'sm', md: 'md' }}>Role</Th>
            <Th fontSize={{ base: 'sm', md: 'md' }}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map(user => (
            <Tr key={user.id}>
              <Td fontSize={{ base: 'sm', md: 'md' }}>
                {editUserId === user.id ? (
                  <VStack align="start" spacing={1}>
                    <Input
                      value={newUser.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      size="sm"
                    />
                    {errors.name && <Text color="red.500" fontSize="sm">{errors.name}</Text>}
                  </VStack>
                ) : (
                  user.full_name
                )}
              </Td>
              <Td fontSize={{ base: 'sm', md: 'md' }}>
                {editUserId === user.id ? (
                  <VStack align="start" spacing={1}>
                    <Input
                      value={newUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value?.trim())}
                      size="sm"
                    />
                    {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
                  </VStack>
                ) : (
                  user.email
                )}
              </Td>
              <Td fontSize={{ base: 'sm', md: 'md' }}>
                {editUserId === user.id ? (
                  <Select
                    value={newUser.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    size="sm"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.role_name.toUpperCase()}
                      </option>
                    ))}
                  </Select>
                ) : (
                  user.roles?.role_name || 'Role not assigned'
                )}
              </Td>
              <Td>
                {editUserId === user.id ? (
                  <HStack spacing={2} wrap="wrap">
                    <IconButton
                      icon={<LockIcon />}
                      onClick={() => handlePasswordChange(user.id)}
                      aria-label="Change Password"
                      size="sm"
                    />
                    <Button onClick={() => handleSave(user.id)} size="sm">Save</Button>
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() => setEditUserId(null)}
                      aria-label="Cancel Edit"
                      colorScheme="red"
                      size="sm"
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2} wrap="wrap">
                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => handleEdit(user.id, user.full_name, user.email, user.roles.role_name)}
                      aria-label="Edit"
                      size="sm"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(user.id)}
                      aria-label="Delete"
                      size="sm"
                    />
                  </HStack>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
