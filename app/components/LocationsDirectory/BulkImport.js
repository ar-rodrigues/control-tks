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

  const zonaOptions = ["Norte", "Sur", "Centro", "Occidente"];

  const downloadTemplate = () => {
    const headers = [
      "cliente",
      "convenio",
      "agencia",
      "direccion",
      "ciudad",
      "estado",
      "cp",
      "zona",
      "es_matriz",
      "is_active",
      "location_coordinates",
    ];

    // Add example row
    const exampleRow = [
      "Banorte",
      "18641716",
      "AUTOMOVILES TECNOLÓGICO, S.A. DE C.V.",
      "AV. LAZARO CARDENAS 1815-C",
      "Monterrey",
      "Nuevo León",
      "64754",
      "Norte",
      "false",
      "true",
      '{"lat": 25.6714, "lon": -100.309}',
    ];

    const csvContent = headers.join(",") + "\n" + exampleRow.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_ubicaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to normalize object keys to lowercase
  const normalizeKeys = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      newObj[key.toLowerCase()] = obj[key];
    });
    return newObj;
  };

  // Helper to parse boolean values (es_matriz and is_active)
  const parseBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return false;
    const val = value.trim().toLowerCase();
    return ["true", "si", "yes", "1"].includes(val);
  };

  // Helper to parse coordinates
  const parseCoordinates = (value) => {
    if (!value || value.trim() === "") return null;

    try {
      // If it's already an object
      if (typeof value === "object" && value.lat && value.lon) {
        return { lat: parseFloat(value.lat), lon: parseFloat(value.lon) };
      }

      // If it's a JSON string
      if (typeof value === "string") {
        const coords = JSON.parse(value);
        if (coords.lat && coords.lon) {
          return { lat: parseFloat(coords.lat), lon: parseFloat(coords.lon) };
        }
      }
    } catch (error) {
      // Invalid JSON or format, return null
    }

    return null;
  };

  // Helper to validate CP (numbers only)
  const validateCP = (cp) => {
    const cpRegex = /^\d+$/;
    return cpRegex.test(cp);
  };

  // Helper to validate zona
  const validateZona = (zona) => {
    return zonaOptions.includes(zona);
  };

  const requiredFields = [
    "cliente",
    "convenio",
    "agencia",
    "direccion",
    "ciudad",
    "estado",
    "cp",
    "zona",
    "is_active",
  ];

  const validateData = (locations) => {
    const errors = [];
    locations.forEach((location, index) => {
      const rowErrors = [];
      const normalized = normalizeKeys(location);

      // Check required fields
      requiredFields.forEach((field) => {
        if (!normalized[field] && normalized[field] !== false) {
          rowErrors.push(`Falta el campo ${field}`);
        }
      });

      // Validate CP format
      if (normalized["cp"] && !validateCP(normalized["cp"])) {
        rowErrors.push("El CP debe contener solo números");
      }

      // Validate zona
      if (normalized["zona"] && !validateZona(normalized["zona"])) {
        rowErrors.push(`La zona debe ser una de: ${zonaOptions.join(", ")}`);
      }

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
      locations = data.map((row) => {
        const normalized = normalizeKeys(row);
        return {
          cliente: normalized["cliente"] || "",
          convenio: normalized["convenio"] || "",
          agencia: normalized["agencia"] || "",
          direccion: normalized["direccion"] || "",
          ciudad: normalized["ciudad"] || "",
          estado: normalized["estado"] || "",
          cp: normalized["cp"] || "",
          zona: normalized["zona"] || "",
          es_matriz: parseBoolean(normalized["es_matriz"]),
          is_active: parseBoolean(normalized["is_active"]),
          location_coordinates: parseCoordinates(
            normalized["location_coordinates"]
          ),
        };
      });
    } else {
      const workbook = XLSX.read(data, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      locations = raw.map((row) => {
        const normalized = normalizeKeys(row);
        return {
          cliente: normalized["cliente"] || "",
          convenio: normalized["convenio"] || "",
          agencia: normalized["agencia"] || "",
          direccion: normalized["direccion"] || "",
          ciudad: normalized["ciudad"] || "",
          estado: normalized["estado"] || "",
          cp: normalized["cp"] || "",
          zona: normalized["zona"] || "",
          es_matriz: parseBoolean(normalized["es_matriz"]),
          is_active: parseBoolean(normalized["is_active"]),
          location_coordinates: parseCoordinates(
            normalized["location_coordinates"]
          ),
        };
      });
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
      // Clear data after successful import
      setCsvData("");
      setPreviewData(null);
      setValidationErrors([]);
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
        <ModalContent maxW="95vw">
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

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Campos requeridos:</AlertTitle>
                  <AlertDescription fontSize="sm">
                    cliente, convenio, agencia, direccion, ciudad, estado, cp,
                    zona, is_active
                    <br />
                    <strong>Zona:</strong> debe ser Norte, Sur, Centro o
                    Occidente
                    <br />
                    <strong>CP:</strong> solo números
                    <br />
                    <strong>Booleanos:</strong> true/false, si/no, yes/no
                    <br />
                    <strong>Coordenadas:</strong> formato JSON{" "}
                    {`{"lat": 25.6714, "lon": -100.309}`} (opcional)
                  </AlertDescription>
                </Box>
              </Alert>

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
                        fila contenga los encabezados requeridos.
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
                        <Th>Zona</Th>
                        <Th>Es Matriz</Th>
                        <Th>Activo</Th>
                        <Th>Coordenadas</Th>
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
                          <Td>
                            <Text
                              color={validateCP(row.cp) ? "inherit" : "red.500"}
                            >
                              {row.cp}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                validateZona(row.zona) ? "green" : "red"
                              }
                            >
                              {row.zona}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={row.es_matriz ? "yellow" : "gray"}
                            >
                              {row.es_matriz ? "Sí" : "No"}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={row.is_active ? "green" : "red"}
                            >
                              {row.is_active ? "Sí" : "No"}
                            </Badge>
                          </Td>
                          <Td>
                            {row.location_coordinates ? (
                              <Text fontSize="xs" color="green.600">
                                {row.location_coordinates.lat.toFixed(4)},{" "}
                                {row.location_coordinates.lon.toFixed(4)}
                              </Text>
                            ) : (
                              <Text fontSize="xs" color="gray.400">
                                Sin coordenadas
                              </Text>
                            )}
                          </Td>
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
