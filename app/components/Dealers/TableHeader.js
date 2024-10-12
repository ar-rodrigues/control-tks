import React, { useRef } from 'react';
import { Flex, Box, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { FilterMatchMode } from 'primereact/api';
import { FiSearch, FiUpload, FiDownload } from 'react-icons/fi';
import { Column } from 'primereact/column';

const TableHeader = ({ importCSV, exportCSV, setFilters }) => {
  const fileUploadRef = useRef(null);

  return (
    <Box p={4} bg="white" boxShadow="sm" borderRadius="md">
      <Flex flexDir="column" gap={5} mb={4}>
      <InputGroup size="md" width="300px">
          <InputLeftElement ml={3} mt={3.5} pointerEvents="none">
            <FiSearch color="gray.300" size={25} />
          </InputLeftElement>
          <InputText
            type="search"
            onInput={(e) =>
              setFilters((prev) => ({
                ...prev,
                global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
              }))
            }
            placeholder="Buscar..."
            className="w-full"
            style={{
              paddingLeft: '3rem',
              borderRadius: '0.375rem',
              border: '10px solid #E2E8F0',
              fontSize: '1.5rem',
              marginTop: '0.5rem'
            }}
          />
        </InputGroup>
        <Flex gap={3}>
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            accept=".csv"
            maxFileSize={1000000}
            chooseLabel="Importar CSV"
            className="p-button-outlined"
            onUpload={importCSV}
            icon={<FiUpload />}
          />
          <Button
            label="Exportar CSV"
            icon={<FiDownload />}
            className="p-button-outlined"
            onClick={exportCSV}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default TableHeader;