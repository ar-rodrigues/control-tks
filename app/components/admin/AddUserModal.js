import { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, Select, InputGroup, InputRightElement, IconButton, Text, Spinner } from '@chakra-ui/react';
import { fetchRoles } from '../../api/roles/roles';
import { FaEye, FaEyeSlash,FaKey  } from 'react-icons/fa';
import { generateRandomPassword } from '../../utils/passwordGenerator'
import { useValidateAddUser } from '../../utils/validations/validateAddUser';


export function AddUserModal({ isOpen, onClose, newUser, setNewUser, handleAdd, error, isLoading }) {
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false) 
  const { errorMessage, validate } = useValidateAddUser(newUser); 

  useEffect(() => {
    const getRoles = async () => {
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    };
    getRoles();
  }, []);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            mb={4}
          />
          <Input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value.trim() })}
            mb={4}
          />
          <InputGroup size="md" mb={4}>
            <Input
              pr="4.5rem"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value.trim() })}
            />
            <InputRightElement width="4.5rem">
              <IconButton
                h="1.75rem"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
              />
              <IconButton
                h="1.75rem"
                size="sm"
                ml={2}
                onClick={handleGeneratePassword}
                icon={<FaKey />}
              />
            </InputRightElement>
          </InputGroup>
          <Select
            placeholder="Select role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.role_name.toUpperCase()}
              </option>
            ))}
          </Select>
          {(errorMessage || error) && <Text color="red.500">{errorMessage || error}</Text>}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleAddUser} isDisabled={isLoading}>
          {isLoading ? (
            <Spinner 
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='sm'
            />
          ) : 'Add User'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
