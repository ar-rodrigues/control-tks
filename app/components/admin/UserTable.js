import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Input, Button } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

export function UserTable({ users, editUserId, newUser, setNewUser, setEditUserId, handleSave, handleEdit, handleDelete }) {
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
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              ) : (
                user.full_name
              )}
            </Td>
            <Td>
              {editUserId === user.id ? (
                <Input
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              ) : (
                user.email
              )}
            </Td>
            <Td>
              {editUserId === user.id ? (
                <Input
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                />
              ) : (
                user.roles?.role_name || 'Role not assigned'
              )}
            </Td>
            <Td>
              {editUserId === user.id ? (
                <Button onClick={() => handleSave(user.id)}>Save</Button>
              ) : (
                <>
                  <IconButton icon={<EditIcon />} onClick={() => handleEdit(user.id, user.full_name, user.email, user.roles.role_name)} />
                  <IconButton icon={<DeleteIcon />} onClick={() => handleDelete(user.id)} ml={2} />
                </>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
