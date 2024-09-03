'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Spinner } from '@chakra-ui/react';
import { fetchUsers, deleteUser, updateUser, createUser } from '../../api/users/users';
import { UserTable } from './UserTable';
import { AddUserModal } from './AddUserModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { PasswordModal } from './PasswordModal';
import { fetchRoles } from '../../api/roles/roles';

export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setIsLoading(false));
    fetchRoles().then(setRoles); // Fetch roles once
  }, []);

  const handleDelete = async (id) => {
    setDeleteUserId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      setIsLoading(true);
      await deleteUser(deleteUserId);
    } catch (error) {
      console.error('Failed to delete user:', error.message);
    } finally {
      setDeleteUserId(null);
      setIsLoading(false);
      setDeleteModalOpen(false);
      await fetchUsers().then(setUsers); // Fetch the latest users
    }
  };

  const handleEdit = (id, name, email, roleName) => {
    const role = roles.find((role) => role.role_name === roleName)?.id;
    setEditUserId(id);
    setNewUser({ name, email, role });
  };

  const handleSave = async (id, user = newUser) => {
    try {
      await updateUser(id, user);
      setUsers(users.map((u) => (u.id === id ? { ...u, ...user } : u)));
    } catch (error) {
      console.error('Failed to update user:', error.message);
    } finally {
      setEditUserId(null);
      await fetchUsers().then(setUsers);
    }
  };

  const handleAdd = async () => {
    try {
      setIsLoading(true);
      await createUser(newUser);
      setNewUser({ name: '', email: '', role: '' });
    } catch (error) {
      if (error.message === 'Email already exists') {
        setError('Correo ya registrado.');
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else {
        console.error('Failed to add user:', error.message);
      }
    } finally {
      setIsLoading(false);
      setAddModalOpen(false);
      await fetchUsers().then(setUsers); // Fetch the latest users
    }
  };

  const handlePasswordUpdate = async (id, newPassword) => {
    try {
      setIsLoading(true);
      await updateUser(id, { password: newPassword });
      setUsers(users.map((u) => (u.id === id ? { ...u, password: newPassword } : u)));
    } catch (error) {
      console.error('Failed to update password:', error.message);
    } finally {
      setIsLoading(false);
      setPasswordModalOpen(false);
      setEditUserId(null);
    }
  };

  return (
    <Box>
      {isLoading && !isAddModalOpen && !isDeleteModalOpen && !isPasswordModalOpen ? (
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      ) : (
        <>
          <Button onClick={() => setAddModalOpen(true)} colorScheme="blue" mb={4}>
            Add User
          </Button>
          <UserTable
            users={users}
            editUserId={editUserId}
            newUser={newUser}
            setNewUser={setNewUser}
            setEditUserId={setEditUserId}
            handleSave={handleSave}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePasswordChange={(id) => {
              setEditUserId(id);
              setPasswordModalOpen(!isDeleteModalOpen);
            }}
            roles={roles}
          />
          <AddUserModal
            isOpen={isAddModalOpen}
            onClose={() => setAddModalOpen(false)}
            newUser={newUser}
            setNewUser={setNewUser}
            handleAdd={handleAdd}
            error={error}
            isLoading={isLoading}
            roles={roles}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            handleDeleteConfirmed={handleDeleteConfirmed}
            isLoading={isLoading}
          />
          {editUserId && (
            <PasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setPasswordModalOpen(false)} 
            userId={editUserId}
            onPasswordChange={handlePasswordUpdate}
            isLoading={isLoading}
          />
          )}
        </>
      )}
    </Box>
  );
}

export default AdminPanel;
