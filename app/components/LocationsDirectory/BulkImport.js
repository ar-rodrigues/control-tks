import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  useToast,
  Textarea,
  Text,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

export default function BulkImport({ onImportComplete }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const toast = useToast();

  const downloadTemplate = () => {
    const headers = [
      "cliente",
      "convenio",
      "agencia",
      "direccion",
      "ciudad",
      "estado",
      "cp",
    ];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_ubicaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateData = (locations) => {
    const errors = [];
    const requiredFields = [
      "cliente",
      "convenio",
      "agencia",
      "direccion",
      "ciudad",
      "estado",
      "cp",
    ];

    locations.forEach((location, index) => {
      const rowErrors = [];
      requiredFields.forEach((field) => {
        if (!location[field]) {
          rowErrors.push(`Falta el campo ${field}`);
        }
      });

      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // +2 because of 0-based index and header row
          errors: rowErrors,
        });
      }
    });

    return errors;
  };

  const processAndPreviewData = (data, fromExcel = false) => {
    let locations = [];
    if (fromExcel) {
      locations = data.map((row) => ({
        cliente: row.cliente || row.Cliente,
        convenio: row.convenio || row.Convenio,
        agencia: row.agencia || row.Agencia,
        direccion: row.direccion || row.Direccion,
        ciudad: row.ciudad || row.Ciudad,
        estado: row.estado || row.Estado,
        cp: row.cp || row.CP,
      }));
    } else {
      // CSV text
      const workbook = XLSX.read(data, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      locations = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      locations = locations.map((row) => ({
        cliente: row.cliente || row.Cliente,
        convenio: row.convenio || row.Convenio,
        agencia: row.agencia || row.Agencia,
        direccion: row.direccion || row.Direccion,
        ciudad: row.ciudad || row.Ciudad,
        estado: row.estado || row.Estado,
        cp: row.cp || row.CP,
      }));
    }
    const errors = validateData(locations);
    setValidationErrors(errors);
    setPreviewData(locations);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        setCsvData(csvText);
        processAndPreviewData(csvText, false);
      };
      reader.readAsText(file, "utf-8");
    } else if (ext === "xls" || ext === "xlsx") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setCsvData(""); // Not used for Excel
        processAndPreviewData(json, true);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({
        title: "Tipo de archivo no soportado",
        description: "Solo se permiten archivos CSV, XLS o XLSX",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });

  const handlePaste = (event) => {
    const newValue = event.target.value;
    setCsvData(newValue);
    processAndPreviewData(newValue, false);
  };

  const handleImport = async () => {
    if (!previewData || previewData.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, ingresa datos válidos antes de importar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Error",
        description: "Por favor, corrige los errores antes de importar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/locations-directory/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locations: previewData }),
      });

      if (!response.ok) {
        throw new Error("Error al importar ubicaciones");
      }

      toast({
        title: "Éxito",
        description: `${previewData.length} ubicaciones importadas correctamente`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onImportComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar los datos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="green" onClick={onOpen}>
        Importar en masa
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>Importar ubicaciones en masa</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  Descarga la plantilla para asegurar el formato correcto
                </Text>
                <Box display="flex" gap={2}>
                  <Button size="sm" onClick={downloadTemplate}>
                    Descargar plantilla
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {
                      setCsvData("");
                      setPreviewData(null);
                      setValidationErrors([]);
                    }}
                  >
                    Limpiar datos
                  </Button>
                </Box>
              </Flex>

              <Tabs>
                <TabList>
                  <Tab>Subir archivo</Tab>
                  <Tab>Copiar y pegar</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Box
                      {...getRootProps()}
                      p={10}
                      border="2px dashed"
                      borderColor={isDragActive ? "blue.400" : "gray.200"}
                      borderRadius="md"
                      textAlign="center"
                      cursor="pointer"
                      _hover={{ borderColor: "blue.400" }}
                    >
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <Text>Suelta el archivo aquí...</Text>
                      ) : (
                        <Text>
                          Arrastra y suelta un archivo CSV, XLS o XLSX aquí, o
                          haz clic para seleccionar
                        </Text>
                      )}
                    </Box>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4}>
                      <Text fontSize="sm" color="gray.600">
                        Pega tus datos CSV aquí. Asegúrate de que la primera
                        fila contenga los encabezados: cliente, convenio,
                        agencia, direccion, ciudad, estado, cp
                      </Text>
                      <Textarea
                        value={csvData}
                        onChange={handlePaste}
                        placeholder="Pega tus datos CSV aquí..."
                        rows={10}
                      />
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {validationErrors.length > 0 && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Errores encontrados</AlertTitle>
                    <AlertDescription>
                      {validationErrors.map((error, index) => (
                        <Text key={index} fontSize="sm">
                          Fila {error.row}: {error.errors.join(", ")}
                        </Text>
                      ))}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {previewData && (
                <Box overflowX="auto">
                  <Text fontWeight="bold" mb={2}>
                    Vista previa ({previewData.length} registros)
                  </Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Cliente</Th>
                        <Th>Convenio</Th>
                        <Th>Agencia</Th>
                        <Th>Dirección</Th>
                        <Th>Ciudad</Th>
                        <Th>Estado</Th>
                        <Th>CP</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {previewData.slice(0, 5).map((row, index) => (
                        <Tr key={index}>
                          <Td>{row.cliente}</Td>
                          <Td>{row.convenio}</Td>
                          <Td>{row.agencia}</Td>
                          <Td>{row.direccion}</Td>
                          <Td>{row.ciudad}</Td>
                          <Td>{row.estado}</Td>
                          <Td>{row.cp}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {previewData.length > 5 && (
                    <Text mt={2} fontSize="sm" color="gray.600">
                      Mostrando 5 de {previewData.length} registros
                    </Text>
                  )}
                </Box>
              )}

              <Button
                colorScheme="blue"
                onClick={handleImport}
                isLoading={isLoading}
                isDisabled={validationErrors.length > 0 || !previewData}
                w="full"
              >
                Importar
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
