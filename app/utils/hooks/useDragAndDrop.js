import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, closestCorners } from '@dnd-kit/sortable';

export const useDragAndDrop = (containers, setContainers, findValueOfItems) => {
  const [activeId, setActiveId] = useState(null);

  // Set up sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragMove = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'item');

      if (activeContainer && overContainer) {
        const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id);
        const overContainerIndex = containers.findIndex(c => c.id === overContainer.id);

        const activeItemIndex = activeContainer.items.findIndex(item => item.id === active.id);
        const overItemIndex = overContainer.items.findIndex(item => item.id === over.id);

        let newContainers = [...containers];
        if (activeContainerIndex === overContainerIndex) {
          newContainers[activeContainerIndex].items = arrayMove(
            newContainers[activeContainerIndex].items,
            activeItemIndex,
            overItemIndex
          );
        } else {
          const [removedItem] = newContainers[activeContainerIndex].items.splice(activeItemIndex, 1);
          newContainers[overContainerIndex].items.splice(overItemIndex, 0, removedItem);
        }
        setContainers(newContainers);
      }
    }

    // Handle Item dropping into Container
    if (active?.id.includes('item') && over?.id.includes('container')) {
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'container');

      if (activeContainer && overContainer) {
        const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id);
        const overContainerIndex = containers.findIndex(c => c.id === overContainer.id);

        const activeItemIndex = activeContainer.items.findIndex(item => item.id === active.id);

        let newContainers = [...containers];
        const [removedItem] = newContainers[activeContainerIndex].items.splice(activeItemIndex, 1);
        newContainers[overContainerIndex].items.push(removedItem);

        setContainers(newContainers);
      }
    }
  };

  const handleDragEnd = (event) => {
    // This logic stays the same
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    // Handle container sorting
    if (active.id.includes('container') && over.id.includes('container')) {
      const activeIndex = containers.findIndex(container => container.id === active.id);
      const overIndex = containers.findIndex(container => container.id === over.id);

      setContainers(arrayMove(containers, activeIndex, overIndex));
    }

    setActiveId(null);
  };

  return {
    activeId,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
