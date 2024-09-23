'use client'
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Box, Flex, Text, Button, Icon } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';

export default function Items({ id, title }) {
  const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({
        id: id,
        data: {
          type: 'item',
        },
      });

  return (
    <Flex
    ref={setNodeRef}
    {...attributes}
    style={{
      transition,
      transform: CSS.Translate.toString(transform),
    }}
      className={`px-2 py-4 bg-white shadow-md rounded-xl w-full border border-transparent hover:border-gray-200 cursor-pointer${isDragging ? 'opacity-50' : ''}`}
    >
      <Text>{title}</Text>
      <Flex alignItems="center" justifyContent="flex-end" ml="auto">
        <Button
            variant="ghost"
            size="sm"
            {...listeners}
            className="p-2 text-xs border shadow-lg rounded-xl hover:shadow-xl"
          >
            <Icon as={DragHandleIcon} boxSize={4} /> 
          </Button>
      </Flex>
    </Flex>
  );
};

