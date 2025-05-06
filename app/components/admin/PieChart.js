"use client";

import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useBreakpointValue } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

const COLORS = ["#48BB78", "#F56565", "#718096"]; // Green for on time, Red for late, Gray for absent

const PieChart = ({ data, onChartClick }) => {
  const outerRadius = useBreakpointValue({ base: 50, sm: 60, md: 80 });
  const labelFontSize = useBreakpointValue({ base: 10, sm: 12, md: 14 });
  return (
    <Box w="100%" h="100%" p={{ base: 1, md: 4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => (
              <tspan style={{ fontSize: labelFontSize }}>{`${name} ${(
                percent * 100
              ).toFixed(0)}%`}</tspan>
            )}
            onClick={(data) => onChartClick && onChartClick(data.name)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: "pointer" }}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value.toFixed(1)}%`, "Porcentaje"]}
            labelFormatter={(label) => label}
          />
          <Legend wrapperStyle={{ fontSize: labelFontSize }} />
        </RechartsChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChart;
