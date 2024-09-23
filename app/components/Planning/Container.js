'use client'

import { DragHandleIcon } from '@chakra-ui/icons';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Flex, Text, Icon } from '@chakra-ui/react';
import { RangeDatepicker } from 'chakra-dayzed-datepicker';

export default function Container({ id, children, title, description, onAddItem, selectedDates, onDateChange  }) {
    //console.log("container component",selectedDates)

  const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
      } = useSortable({
        id: id,
        data: {
          type: 'container',
        },
      });

  return (
    <Box
    {...attributes}
    ref={setNodeRef}
    style={{
      transition,
      transform: CSS.Translate.toString(transform),
    }}
      className={`flex flex-col w-full h-full p-4 bg-gray-50 rounded-xl gap-y-4 ${
        isDragging && 'opacity-50'
      }`}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Flex direction="column" gap={2}>
          <Text fontSize="xl" color="gray.800">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.400">
            {description}
          </Text>
        </Flex>
        <RangeDatepicker
            selectedDates={selectedDates}
            onDateChange={(newDates) => onDateChange(id, newDates)}
            configs={{dateFormat: 'dd/MM/yy'}}
        />
        <Button
          variant="ghost"
          size="sm"
          {...listeners}
          className="p-2 text-xs border shadow-lg rounded-xl hover:shadow-xl"
        >
          <Icon as={DragHandleIcon} boxSize={4} /> 
        </Button>
      </Flex>

      {children}
      <Button onClick={onAddItem}>Selecciona Auditor</Button>
    </Box>
  );
};

