'use client'
import React, {useState, useEffect} from 'react';
// DnD
import { DndContext,DragEndEvent,DragMoveEvent,DragOverlay,DragStartEvent,KeyboardSensor,PointerSensor,UniqueIdentifier,closestCorners,useSensor,useSensors,} from '@dnd-kit/core';
import { SortableContext,arrayMove, sortableKeyboardCoordinates,} from '@dnd-kit/sortable';

import {
  Box,
  Heading,
  Input,
  Button,
  Select,
  VStack,
  HStack,
  Grid,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

// Components
import Container from '../components/Planning/Container'; 
import Items from '../components/Planning/Items';
import Calendar from '../components/Planning/Calendar';

// Custom Hooks
import { useDragAndDrop } from '../utils/hooks/useDragAndDrop';
import { useContainerManager } from '../utils/hooks/useContainerManager';

const predefinedContainers = [
  { id: 'container-1', title: 'Dealer 1',},
  { id: 'container-2', title: 'Dealer 2',},
  { id: 'container-3', title: 'Dealer 3',},
];

const predefinedItems = [
  { id: 'item-1', title: 'Auditor A' },
  { id: 'item-2', title: 'Auditor B' },
  { id: 'item-3', title: 'Auditor C' },
  { id: 'item-4', title: 'Auditor D' },
];


const  Home = () =>  {
  
  const {
    containers,
    setContainers,
    currentContainerId,
    setCurrentContainerId,
    selectedContainer,
    setSelectedContainer,
    selectedItem,
    setSelectedItem,
    showAddContainerModal,
    setShowAddContainerModal,
    showAddItemModal,
    setShowAddItemModal,
    onAddContainer,
    onAddItem,
    findValueOfItems, 
    findItemTitle,
    findContainerTitle,
    findContainerItems,
    selectedDates,
    handleDateRangeChange,
  } = useContainerManager(predefinedContainers, predefinedItems);
  
  const {
    activeId,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragAndDrop(containers, setContainers, findValueOfItems);
  

  useEffect (() =>  {
    //console.log('Containers: ', containers)
  } , [containers])


  return (
    <Box py={10} maxWidth="7xl" mx="auto">
      
      {/* Add Container Modal */}
      <ChakraModal isOpen={showAddContainerModal} onClose={() => setShowAddContainerModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Selecciona Dealer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Select
                placeholder="Selecciona Dealer"
                value={selectedContainer}
                onChange={(e) => setSelectedContainer(e.target.value)}
              >
                {predefinedContainers.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.title}
                  </option>
                ))}
              </Select>
              <Button onClick={onAddContainer}>Selecciona Dealer</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </ChakraModal>

      {/* Add Item Modal */}
      <ChakraModal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Selecciona Auditor</ModalHeader>:
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Select
                placeholder="Select item"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                {predefinedItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </Select>
              <Button onClick={onAddItem}>Selecciona Auditor</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </ChakraModal>

      <HStack justify="space-between" mb={10}>
        <Heading as="h1" size="xl">Planeacion</Heading>
        <Button onClick={() => setShowAddContainerModal(true)}>
          Selecciona Dealer
        </Button>
      </HStack>

      <Box mt={10} p={4} rounded="md" shadow="md">
        
        <Grid templateColumns="repeat(2, 1fr)" gap={6} p={4} rounded="md" shadow="md" >
        <Calendar containers={containers} setContainers={setContainers} />

        <Grid templateColumns="repeat(2, 1fr)" gap={6} >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={containers.map((i) => i.id)}>
              {containers.map((container) => (
                <Container
                  id={container.id}
                  title={container.title}
                  key={container.id}
                  selectedDates={container.event}
                  onDateChange={handleDateRangeChange}
                  onAddItem={() => {
                    setShowAddItemModal(true);
                    setCurrentContainerId(container.id);
                  }}
                >
                  <SortableContext items={container.items.map((i) => i.id)}>
                    <VStack align="stretch" spacing={4}>
                      {container.items.map((i) => (
                        <Items title={i.title} id={i.id} key={i.id} />
                      ))}
                    </VStack>
                  </SortableContext>
                </Container>
              ))}
            </SortableContext>
            <DragOverlay adjustScale={false}>
              {/* Drag Overlay For item Item */}
              {activeId && activeId.toString().includes('item') && (
                <Items id={activeId} title={findItemTitle(activeId)} />
              )}
              {/* Drag Overlay For Container */}
              {activeId && activeId.toString().includes('container') && (
                <Container id={activeId} title={findContainerTitle(activeId)}>
                  {findContainerItems(activeId).map((i) => (
                    <Items key={i.id} title={i.title} id={i.id} />
                  ))}
                </Container>
              )}
            </DragOverlay>
          </DndContext>
          
        </Grid>

        </Grid>
        
      </Box>
    </Box>
  );
}


export default Home;