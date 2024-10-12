import { useState } from 'react';

const parseCSVLine = (line) => {
  const result = [];
  let startValueIndex = 0;
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      insideQuotes = !insideQuotes;
    } else if (line[i] === ',' && !insideQuotes) {
      result.push(line.slice(startValueIndex, i).trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      startValueIndex = i + 1;
    }
  }

  result.push(line.slice(startValueIndex).trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
  return result;
};

export const useCSVImport = (onImportSuccess) => {
  const importCSV = (event) => {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = parseCSVLine(lines[0]);
      const newData = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          const values = parseCSVLine(line);
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });

      onImportSuccess(newData);
    };

    reader.readAsText(file);
  };

  return { importCSV };
};

export const useCSVExport = (columns, data) => {
  const exportCSV = () => {
    const headers = columns.join(',');
    const csvContent = data.map(row => 
      columns.map(col => {
        let value = row[col]; 
        value = value === null || value === undefined ? '' : value.toString();
        return value.includes('"') || value.includes(',') || value.includes('\n') 
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    ).join('\n');

    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, "dealers_data.csv");
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'dealers_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return { exportCSV };
};