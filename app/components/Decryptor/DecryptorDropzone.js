'use client'
import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import decryptFile from './decrypt';
import { CSVLink } from "react-csv";
import { Box, Button, Text, Link } from '@chakra-ui/react';

export function DecryptorDropzone() {
  const [fileContent, setFileContent] = useState([]);
  const [decryptedContent, setDecryptedContent] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const handleFileRead = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split('\n').map(line => line.replace(/\r$/, ''));
      const decryptedLines = lines.map(decryptFile);
      const parsedLines = decryptedLines.map(line => line.split('||').map(value => value.trim()).filter(Boolean));
      setFileContent(lines);
      setDecryptedContent(parsedLines);
      setUploadSuccess(true);
      setUploadError(false);
    };
  
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      setUploadError(true);
      setUploadSuccess(false);
    };
  
    reader.readAsText(file, 'UTF-16LE');
  };
  
  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleFileRead(acceptedFiles[0]);
    } else {
      console.warn('No files accepted.');
    }
  };

  const headers = ["ID", "FACTURA", "VIN", "SALDO", "MONEDA", "FECHA", "MATRIZ", "TIPO"];
  const csvData = [headers, ...decryptedContent];
  return (
    <Box p={4}>
      <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <Box
            {...getRootProps()}
            border="2px dashed"
            borderColor="gray.300"
            p={4}
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: 'blue.500' }}
          >
            <input {...getInputProps()} />
            <Text>Arrastre y suelte un archivo aquí, o haga clic para seleccionarlo</Text>
          </Box>
        )}
      </Dropzone>
      {uploadSuccess && <Text color="green.500">Archivo cargado con exito!</Text>}
      {uploadError && <Text color="red.500">Error al cargar archivo.</Text>}
      {decryptedContent.length > 0 && (
        <Button colorScheme="blue" mt={4}>
          <CSVLink data={csvData} filename={"decrypted-content.csv"}>
            Descargar
          </CSVLink>
        </Button>
      )}
    </Box>
  );
};

export default DecryptorDropzone;
