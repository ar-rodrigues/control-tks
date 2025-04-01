"use client";

import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#48BB78", "#F56565", "#718096"]; // Green for on time, Red for late, Gray for absent

const PieChart = ({ data, onChartClick }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
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
        <Legend />
      </RechartsChart>
    </ResponsiveContainer>
  );
};

export default PieChart;
