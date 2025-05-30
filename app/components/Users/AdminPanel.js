"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Spinner,
  HStack,
  useToast,
  Text,
  Icon,
  Tooltip,
  Input,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  Badge,
} from "@chakra-ui/react";
import {
  fetchUsers,
  deleteUser,
  updateUser,
  createUser,
} from "../../api/users/users";
import { UserTable } from "./UserTable";
import { AddUserModal } from "./AddUserModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { PasswordModal } from "./PasswordModal";
import { fetchRoles } from "../../api/roles/roles";
import { FaFileImport, FaUserPlus, FaDownload } from "react-icons/fa";
import { generateRandomPassword } from "../../utils/passwordGenerator";

export function AdminPanel({ currentUserRole }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [error, setError] = useState(null);
  const [bulkUsers, setBulkUsers] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const toast = useToast();

  //console.log(roles);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
    fetchRoles().then(setRoles);
  }, []);

  const handleBulkAdd = async () => {
    try {
      setIsBulkLoading(true);
      const userLines = bulkUsers.split("\n").filter((line) => line.trim());
      const results = [];
      const errors = [];

      for (const line of userLines) {
        const [name, email, roleName] = line
          .split(",")
          .map((item) => item.trim());
        if (!name || !email || !roleName) {
          errors.push(`Invalid line format: ${line}`);
          continue;
        }

        const role = roles.find(
          (r) => r.role_name.toLowerCase() === roleName.toLowerCase()
        );
        if (!role) {
          errors.push(`Invalid role for user ${email}: ${roleName}`);
          continue;
        }

        const password = generateRandomPassword();
        try {
          await createUser({
            name,
            email,
            password,
            role: role.id.toString(),
          });
          results.push(`Successfully created user: ${email}`);
        } catch (error) {
          errors.push(`Failed to create user ${email}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        toast({
          title: "Algunos usuarios no pudieron ser creados",
          description: errors.join("\n"),
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      if (results.length > 0) {
        toast({
          title: "Éxito",
          description: results.join("\n"),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }

      setBulkUsers("");
      setIsBulkModalOpen(false);
      await fetchUsers().then(setUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la creación masiva de usuarios",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template =
      "name,email,role\nJohn Doe,john@example.com,admin\nJane Smith,jane@example.com,user";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    setDeleteUserId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      setIsLoading(true);
      await deleteUser(deleteUserId);
    } catch (error) {
      console.error("Failed to delete user:", error.message);
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
      console.error("Failed to update user:", error.message);
    } finally {
      setEditUserId(null);
      await fetchUsers().then(setUsers);
    }
  };

  const handleAdd = async () => {
    try {
      setIsLoading(true);
      await createUser(newUser);
      setNewUser({ name: "", email: "", role: "" });
    } catch (error) {
      if (error.message === "Email already exists") {
        setError("Correo ya registrado.");
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else {
        console.error("Failed to add user:", error.message);
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
      setUsers(
        users.map((u) => (u.id === id ? { ...u, password: newPassword } : u))
      );
    } catch (error) {
      console.error("Failed to update password:", error.message);
    } finally {
      setIsLoading(false);
      setPasswordModalOpen(false);
      setEditUserId(null);
    }
  };

  return (
    <Box>
      {isLoading &&
      !isAddModalOpen &&
      !isDeleteModalOpen &&
      !isPasswordModalOpen ? (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      ) : (
        <>
          <VStack spacing={4} align="stretch" mb={6}>
            <HStack spacing={4} justify="space-between">
              <HStack spacing={4}>
                <Button
                  leftIcon={<FaUserPlus />}
                  onClick={() => setAddModalOpen(true)}
                  colorScheme="blue"
                  size="md"
                >
                  Agregar Usuario
                </Button>
                <Button
                  leftIcon={<FaFileImport />}
                  onClick={() => setIsBulkModalOpen(true)}
                  colorScheme="green"
                  size="md"
                >
                  Importar Usuarios
                </Button>
                <Tooltip label="Descargar plantilla">
                  <Button
                    leftIcon={<FaDownload />}
                    onClick={downloadTemplate}
                    variant="outline"
                    size="md"
                  >
                    Plantilla
                  </Button>
                </Tooltip>
              </HStack>
            </HStack>
          </VStack>

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
            currentUserRole={currentUserRole}
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
            currentUserRole={currentUserRole}
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

          <Modal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            size="xl"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Importar Usuarios</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <Text>
                    Ingrese los usuarios en formato CSV (nombre,email,rol). Un
                    usuario por línea.
                  </Text>
                  <Textarea
                    value={bulkUsers}
                    onChange={(e) => setBulkUsers(e.target.value)}
                    placeholder="John Doe,john@example.com,admin&#10;Jane Smith,jane@example.com,user"
                    size="lg"
                    rows={10}
                    fontFamily="monospace"
                  />
                  <Badge colorScheme="blue" p={2} borderRadius="md">
                    Roles disponibles:{" "}
                    {roles.map((r) => r.role_name).join(", ")}
                  </Badge>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={() => setIsBulkModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleBulkAdd}
                  isLoading={isBulkLoading}
                >
                  Importar Usuarios
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
}

export default AdminPanel;
