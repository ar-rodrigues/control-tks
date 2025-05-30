# Auto-Planning Tester Documentation

## Descripción General

El **Auto-Planning Tester** es un sistema de planificación automática de visitas de auditoría que asigna auditores a ubicaciones utilizando algoritmos inteligentes y un sistema de restricciones configurable. Está diseñado como una herramienta de prueba y análisis que no afecta los datos existentes en la base de datos.

## Arquitectura del Sistema

### Estructura de Archivos

```
app/utils/autoPlanningTester/
├── index.js                 # Punto de entrada principal
├── distanceCalculator.js    # Cálculo de distancias usando Haversine
├── constraintEngine.js      # Sistema de restricciones configurable
├── assignmentAlgorithm.js   # Algoritmo de asignación principal
├── dateDistributor.js       # Distribución de fechas
├── resultExporter.js        # Exportación de resultados
└── README.md               # Esta documentación
```

### Flujo de Proceso

1. **Validación de Entrada**: Verificación de datos de ubicaciones y auditores
2. **Preparación de Datos**: Filtrado de ubicaciones activas y construcción de matriz de distancias
3. **Asignación de Auditores**: Algoritmo de asignación ponderada con evaluación de restricciones
4. **Distribución de Fechas**: Asignación inteligente de fechas dentro del mes objetivo
5. **Validación de Resultados**: Verificación de restricciones y calidad de asignaciones
6. **Exportación**: Generación de archivos CSV con resultados detallados

## Componentes Principales

### 1. Distance Calculator (`distanceCalculator.js`)

**Propósito**: Calcula distancias geográficas entre auditores y ubicaciones usando la fórmula de Haversine.

**Funciones Principales**:

- `calculateHaversineDistance(point1, point2)`: Calcula distancia entre dos coordenadas
- `buildDistanceMatrix(auditors, locations)`: Construye matriz de distancias
- `findClosestAuditor(location, auditors, distanceMatrix)`: Encuentra auditor más cercano

**Configuración**:

- Precisión de redondeo: 2 decimales
- Unidades: Kilómetros
- Radio terrestre: 6371 km

### 2. Constraint Engine (`constraintEngine.js`)

**Propósito**: Define y evalúa restricciones de planificación.

**Restricciones Disponibles**:

#### Restricciones Duras (Hard Constraints)

- **Evitar re-auditoría de matriz**: Previene que un auditor visite la misma matriz en meses consecutivos
- **Límite de distancia máxima**: Establece distancia máxima permitida entre auditor y ubicación

#### Restricciones Suaves (Soft Constraints)

- **Preferencia por zona asignada**: Prioriza auditores en su zona designada
- **Balance de carga de trabajo**: Distribuye asignaciones equitativamente
- **Distribución temporal**: Evita agrupación excesiva de fechas
- **Agrupación de subsidiarias**: Asigna matriz y subsidiarias al mismo auditor

**Parámetros Configurables**:

```javascript
// Ejemplo de configuración de restricciones
{
  matrizRevisitPrevention: {
    lookbackMonths: 1  // Meses hacia atrás para verificar
  },
  maxDistanceLimit: {
    maxDistanceKm: 200  // Distancia máxima en km
  },
  zonePreference: {
    preferenceWeight: 0.7  // Peso de preferencia (0.1-1.0)
  }
}
```

### 3. Assignment Algorithm (`assignmentAlgorithm.js`)

**Propósito**: Ejecuta el algoritmo principal de asignación usando enfoque greedy ponderado.

**Estrategia de Asignación**:

1. **Priorización**: Matrices primero, luego por distancia mínima
2. **Evaluación por Auditor**: Calcula puntuación ponderada para cada auditor
3. **Selección**: Elige auditor con mayor puntuación válida

**Factores de Puntuación**:

- **Distancia** (peso predeterminado: 40%): Cercanía geográfica
- **Coincidencia de Zona** (peso predeterminado: 30%): Auditor en zona asignada
- **Balance de Carga** (peso predeterminado: 20%): Distribución equitativa
- **Restricciones** (peso predeterminado: 10%): Cumplimiento de restricciones

### 4. Date Distributor (`dateDistributor.js`)

**Propósito**: Asigna fechas inteligentemente dentro del mes objetivo.

**Estrategias de Distribución**:

- **Distribución Uniforme**: Espaciado equitativo a lo largo del mes
- **Agrupación de Subsidiarias**: Fechas consecutivas para matriz y subsidiarias
- **Evitar Fines de Semana**: Excluye sábados y domingos
- **Espaciado Mínimo**: Días mínimos entre visitas del mismo auditor

**Configuración de Fechas**:

```javascript
{
  minDaysBetweenVisits: 2,    // Días mínimos entre visitas
  avoidWeekends: true,        // Evitar fines de semana
  distributeEvenly: true,     // Distribución uniforme
  groupSubsidiaries: true,    // Agrupar subsidiarias
  maxVisitsPerDay: 3          // Máximo visitas por día
}
```

### 5. Result Exporter (`resultExporter.js`)

**Propósito**: Exporta resultados en formato CSV con múltiples secciones.

**Secciones del Reporte**:

1. **Resumen Ejecutivo**: Métricas principales y timestamp
2. **Asignaciones Detalladas**: Lista completa con razones y métricas
3. **Métricas de Rendimiento**: Estadísticas del algoritmo
4. **Distribución de Carga**: Workload por auditor
5. **Ubicaciones No Asignadas**: Lugares sin asignar y razones

## Configuración y Uso

### Configuración Predeterminada

```javascript
const defaultConfig = {
  enabledConstraints: [
    "maxDistanceLimit",
    "zonePreference",
    "workloadBalance",
    "subsidiaryGrouping",
  ],
  constraintParameters: {
    maxDistanceLimit: { maxDistanceKm: 200 },
    zonePreference: { preferenceWeight: 0.7 },
    workloadBalance: { strictBalance: true, maxVariance: 2 },
    subsidiaryGrouping: { groupingWeight: 0.8 },
  },
  algorithmWeights: {
    distance: 0.4, // 40% peso a distancia
    zoneMatch: 0.3, // 30% peso a coincidencia de zona
    workload: 0.2, // 20% peso a balance de carga
    constraints: 0.1, // 10% peso a restricciones
  },
  dateDistributionOptions: {
    minDaysBetweenVisits: 2,
    avoidWeekends: true,
    distributeEvenly: true,
    groupSubsidiaries: true,
    maxVisitsPerDay: 3,
  },
};
```

### Uso Básico

```javascript
import { generateAutomaticPlanning } from "./index.js";

const results = await generateAutomaticPlanning({
  locations: activeLocations,
  auditors: availableAuditors,
  targetMonth: 5, // Junio (0-indexed)
  targetYear: 2024,
  existingPlannings: previousPlannings,
  configuration: customConfig, // Opcional
});
```

## Métricas y Análisis

### Métricas de Eficiencia

- **Tasa de Asignación**: Porcentaje de ubicaciones asignadas exitosamente
- **Tasa de Asignación de Fechas**: Porcentaje de asignaciones con fechas válidas
- **Confianza Promedio**: Nivel de confianza promedio en las asignaciones

### Métricas de Calidad

- **Distancia Promedio**: Distancia media de viaje por visita
- **Violaciones de Restricciones**: Número de restricciones no cumplidas
- **Balance de Carga**: Distribución equitativa entre auditores

### Métricas de Cobertura

- **Ubicaciones Totales**: Cantidad total de ubicaciones consideradas
- **Ubicaciones Asignadas**: Cantidad exitosamente asignada
- **Ubicaciones No Asignadas**: Cantidad sin asignar y razones

## Personalización y Ajustes

### Ajustar Pesos del Algoritmo

Para enfatizar diferentes factores:

```javascript
// Configuración orientada a distancia
algorithmWeights: {
  distance: 0.6,      // Mayor peso a distancia
  zoneMatch: 0.2,
  workload: 0.1,
  constraints: 0.1
}

// Configuración orientada a zonas
algorithmWeights: {
  distance: 0.2,
  zoneMatch: 0.5,     // Mayor peso a coincidencia de zona
  workload: 0.2,
  constraints: 0.1
}
```

### Crear Restricciones Personalizadas

1. **Definir en `constraintEngine.js`**:

```javascript
export const CUSTOM_CONSTRAINT = {
  name: "Mi Restricción",
  description: "Descripción de la restricción",
  type: "soft", // o "hard"
  configurable: true,
  parameters: {
    customParam: {
      type: "number",
      default: 5,
      min: 1,
      max: 10,
      label: "Parámetro Personalizado",
    },
  },
};
```

2. **Implementar función de evaluación**:

```javascript
export function evaluateCustomConstraint(auditor, location, context) {
  // Lógica de evaluación personalizada
  return true; // o false para restricciones duras
}
```

3. **Agregar al switch en `evaluateConstraints()`**:

```javascript
case 'customConstraint':
  const customScore = evaluateCustomConstraint(auditor, location, constraintContext);
  score *= customScore;
  break;
```

### Modificar Distribución de Fechas

Para cambiar la estrategia de asignación de fechas, modifica `dateDistributor.js`:

```javascript
// Ejemplo: Priorizar días específicos de la semana
function getPreferredWorkingDays(year, month) {
  const workingDays = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Priorizar martes a jueves (2-4)
    if (dayOfWeek >= 2 && dayOfWeek <= 4) {
      workingDays.push(date);
    }
  }

  return workingDays;
}
```

### Agregar Nuevas Métricas

Para agregar métricas personalizadas en `assignmentAlgorithm.js`:

```javascript
function calculateCustomMetrics(assignments, locations, auditors) {
  // Ejemplo: Métrica de diversidad geográfica
  const zonesCovered = new Set(assignments.map((a) => a.zona));
  const zoneDiversity = zonesCovered.size / ZONES.length;

  // Ejemplo: Métrica de satisfacción de cliente
  const premiumClients = assignments.filter((a) =>
    ["Banorte", "BBVA"].includes(a.cliente)
  );
  const premiumSatisfaction = premiumClients.length / assignments.length;

  return {
    zoneDiversity: zoneDiversity * 100,
    premiumSatisfaction: premiumSatisfaction * 100,
  };
}
```

## Solución de Problemas

### Problemas Comunes

1. **Sin Asignaciones Generadas**

   - Verificar que existan ubicaciones activas
   - Revisar que auditores tengan coordenadas válidas
   - Ajustar restricción de distancia máxima

2. **Distancias Muy Altas**

   - Reducir el peso de distancia en algoritmo
   - Aumentar límite de distancia máxima
   - Verificar coordenadas de auditores y ubicaciones

3. **Carga Desbalanceada**

   - Aumentar peso de balance de carga
   - Habilitar balance estricto
   - Reducir variación máxima permitida

4. **Pocas Fechas Asignadas**
   - Revisar configuración de días laborables
   - Ajustar espaciado mínimo entre visitas
   - Verificar rango de fechas del mes

### Debugging

Activar logs detallados:

```javascript
// En index.js, agregar:
console.log("🔍 Debugging info:", {
  activeLocations: activeLocations.length,
  auditorsWithCoords: auditors.filter((a) => a.home_address_coordinates).length,
  enabledConstraints: config.enabledConstraints,
  algorithmWeights: config.algorithmWeights,
});
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas

- **Memoización**: Matriz de distancias calculada una sola vez
- **Filtrado Temprano**: Eliminación de opciones inválidas antes del cálculo
- **Evaluación Lazy**: Solo evalúa restricciones necesarias

### Escalabilidad

- **Ubicaciones**: Optimizado para hasta 1000 ubicaciones
- **Auditores**: Eficiente con hasta 100 auditores
- **Restricciones**: Performance lineal con número de restricciones

## Futuras Mejoras

### Algoritmos Avanzados

- **Hungarian Algorithm**: Para asignación óptima global
- **Genetic Algorithm**: Para optimización multi-objetivo
- **Simulated Annealing**: Para balance calidad/velocidad

### Restricciones Adicionales

- **Disponibilidad de Auditores**: Calendarios personales
- **Especialización**: Auditores especializados por tipo de cliente
- **Histórico de Relaciones**: Evitar o preferir combinaciones previas

### Características de UI

- **Vista Previa en Tiempo Real**: Mostrar asignaciones antes de confirmar
- **Comparación de Configuraciones**: Side-by-side de diferentes parámetros
- **Análisis de Sensibilidad**: Impacto de cambios en parámetros

## Soporte y Mantenimiento

Para reportar problemas o sugerir mejoras:

1. Revisar logs de consola para errores específicos
2. Verificar formato de datos de entrada
3. Probar con configuración predeterminada
4. Documentar pasos para reproducir el problema

El sistema está diseñado para ser robusto y manejar casos edge, pero siempre revisa los resultados antes de usar en producción.
