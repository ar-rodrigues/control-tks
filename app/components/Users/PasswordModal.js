import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Button, IconButton, InputGroup, InputRightElement, Text, Spinner } from '@chakra-ui/react';
import { FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { generateRandomPassword } from '../../utils/passwordGenerator';
import { useValidateUser } from '../../utils/validations/useValidateUser';

export function PasswordModal({ isOpen, onClose, userId, onPasswordChange, isLoading }) {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { errors, validate } = useValidateUser({ password: newPassword });

  const handlePasswordUpdate = () => {
    // Validate the password before updating
    const validation = validate();
    console.log('Validation result:', validation)
    if (validation.errors.password) return

    onPasswordChange(userId, newPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Password</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value?.trim());
                validate(); // Re-validate when input changes
              }}
              placeholder="Enter new password"
              isDisabled={isLoading} // Disable input while loading
            />
            <InputRightElement width="4.5rem">
              <IconButton
                h="1.75rem"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                isDisabled={isLoading} // Disable buttons while loading
              />
              <IconButton
                h="1.75rem"
                size="sm"
                ml={2}
                onClick={() => setNewPassword(generateRandomPassword())}
                icon={<FaKey />}
                aria-label="Generate Password"
                isDisabled={isLoading} // Disable buttons while loading
              />
            </InputRightElement>
          </InputGroup>
          {errors.password && <Text color="red.500">{errors.password}</Text>}
        </ModalBody>
        <ModalFooter>
          {isLoading ? (
            <Spinner />
          ) : (
            <Button colorScheme="blue" onClick={handlePasswordUpdate}>
              Update Password
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
