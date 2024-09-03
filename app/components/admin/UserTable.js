import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Input, Button, Select, Text } from '@chakra-ui/react';
import { EditIcon, DeleteIcon, LockIcon, CloseIcon } from '@chakra-ui/icons';
import { useValidateUser } from '../../utils/validations/useValidateUser';
import { Tiro_Tamil } from 'next/font/google';

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
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map(user => (
          <Tr key={user.id}>
            <Td>
              {editUserId === user.id ? (
                <>
                  <Input
                    value={newUser.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  {errors.name && <Text color="red.500">{errors.name}</Text>}
                </>
              ) : (
                user.full_name
              )}
            </Td>
            <Td>
              {editUserId === user.id ? (
                <>
                  <Input
                    value={newUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value?.trim())}
                  />
                  {errors.email && <Text color="red.500">{errors.email}</Text>}
                </>
              ) : (
                user.email
              )}
            </Td>
            <Td>
              {editUserId === user.id ? (
                <Select
                  value={newUser.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
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
                <>
                  <IconButton
                    icon={<LockIcon />}
                    onClick={() => handlePasswordChange(user.id)}
                    aria-label="Change Password"
                    mr={2}
                  />
                  <Button onClick={() => handleSave(user.id)}>Save</Button>
                  <IconButton
                    icon={<CloseIcon />}
                    onClick={() => setEditUserId(null)}
                    aria-label="Cancel Edit"
                    colorScheme="red"
                    ml={2}
                    w={2}
                  />
                </>
              ) : (
                <>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => handleEdit(user.id, user.full_name, user.email, user.roles.role_name)}
                    aria-label="Edit"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(user.id)}
                    ml={2}
                    aria-label="Delete"
                  />
                </>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
