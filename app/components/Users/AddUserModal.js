import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { fetchRoles } from "../../api/roles/roles";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { generateRandomPassword } from "../../utils/passwordGenerator";
import { useValidateUser } from "../../utils/validations/useValidateUser";
import { ROLE_ASSIGNMENT_MATRIX } from "../../utils/rolesConfig";

export function AddUserModal({
  isOpen,
  onClose,
  newUser,
  setNewUser,
  handleAdd,
  error,
  isLoading,
  roles,
  currentUserRole,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { errorMessage, validate } = useValidateUser(newUser);

  // Set default role to AUDITOR when opening modal (if not editing)
  useEffect(() => {
    if (
      isOpen &&
      !newUser?.role &&
      (currentUserRole?.toUpperCase() === "ADMIN" ||
        currentUserRole?.toUpperCase() === "RH")
    ) {
      const auditorRole = roles.find(
        (r) => r.role_name.toUpperCase() === "AUDITOR"
      );
      if (auditorRole) {
        setNewUser((prev) => ({ ...prev, role: auditorRole.id }));
      }
    }
  }, [isOpen, roles, setNewUser, newUser?.role, currentUserRole]);

  const handleGeneratePassword = () => {
    const password = generateRandomPassword();
    setNewUser({ ...newUser, password });
  };

  const handleAddUser = () => {
    const { isValid, formattedUser } = validate();

    if (isValid) {
      setNewUser(formattedUser);
      handleAdd();
    }
  };

  // Filter roles using the assignment matrix
  const allowedRoles =
    ROLE_ASSIGNMENT_MATRIX[currentUserRole?.toUpperCase()] || [];
  const filteredRoles = roles.filter((role) =>
    allowedRoles.includes(role.role_name.toUpperCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Agregar Nuevo Usuario</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Nombre"
            value={newUser?.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            mb={4}
          />
          <Input
            placeholder="Correo electrónico"
            value={newUser?.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value.trim() })
            }
            mb={4}
          />
          <InputGroup size="md" mb={4}>
            <Input
              pr="4.5rem"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={newUser?.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value.trim() })
              }
            />
            <InputRightElement width="4.5rem">
              <IconButton
                h="1.75rem"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              />
              <IconButton
                h="1.75rem"
                size="sm"
                ml={2}
                onClick={handleGeneratePassword}
                icon={<FaKey />}
                aria-label="Generar contraseña"
              />
            </InputRightElement>
          </InputGroup>
          <Select
            placeholder="Seleccionar rol"
            value={newUser?.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            {filteredRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name.toUpperCase()}
              </option>
            ))}
          </Select>
          {(errorMessage || error) && (
            <Text color="red.500">{errorMessage || error}</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleAddUser}
            isDisabled={isLoading}
          >
            {isLoading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="sm"
              />
            ) : (
              "Agregar Usuario"
            )}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
