import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Spinner } from '@chakra-ui/react';

export function DeleteConfirmationModal({ isOpen, onClose, handleDeleteConfirmed, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Deletion</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to delete this user? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleDeleteConfirmed}>
          {isLoading ? (
            <Spinner 
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='sm'
            />
          ) : `Delete`
          }
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
