import { useState } from 'react';

export const useContainerManager = (predefinedContainers, predefinedItems) => {
  const [containers, setContainers] = useState([]);
  const [currentContainerId, setCurrentContainerId] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [showAddContainerModal, setShowAddContainerModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'America/Mexico_City' })
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);


  // Handle date range change
  const handleDateRangeChange = (containerId, newDates) => {
    setContainers(prevContainers => 
      prevContainers.map(container => 
        container.id === containerId
          ? { ...container, event: newDates }
          : container
      )
    );
  };


  // Helper function to find containers or items
  const findValueOfItems = (id, type) => {
    if (type === 'container') {
      return containers.find(item => item.id === id);
    }
    if (type === 'item') {
      return containers.find(container =>
        container.items.find(item => item.id === id)
      );
    }
  };

  // Get item title based on its ID
  const findItemTitle = (id) => {
    const container = findValueOfItems(id, 'item');
    if (!container) return '';
    const item = container.items.find((item) => item.id === id);
    return item ? item.title : '';
  };

  // Get container title based on its ID
  const findContainerTitle = (id) => {
    const container = findValueOfItems(id, 'container');
    return container ? container.title : '';
  };

  // Get items in a container based on its ID
  const findContainerItems = (id) => {
    const container = findValueOfItems(id, 'container');
    return container ? container.items : [];
  };

  const onAddContainer = () => {
    if (!selectedContainer) return;
    const newContainer = predefinedContainers.find(c => c.id === selectedContainer);
    if (!newContainer) return;

    
    setContainers([...containers, { ...newContainer, items: [], event: [ new Date(), new Date() ] }]);
    setSelectedContainer('');
    setShowAddContainerModal(false); // Close modal after adding container
  };

  const onAddItem = () => {
    if (!selectedItem || !currentContainerId) return;
    const newItem = predefinedItems.find(i => i.id === selectedItem);
    if (!newItem) return;

    const updatedContainers = containers.map(container => {
      if (container.id === currentContainerId) {
        return { ...container, items: [...container.items, newItem] };
      }
      return container;
    });
    setContainers(updatedContainers);
    setSelectedItem('');
    setShowAddItemModal(false); // Close modal after adding item
  };

  return {
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
    handleDateRangeChange
  };
};
