import { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Flex, Box } from '@chakra-ui/react'

import TableHeader from './TableHeader';

export default function TableDealers({data,clientes,zonas,estados,isLoading}) {
    const [columns, setColumns] = useState([])
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        remotas: { value: null, matchMode: FilterMatchMode.EQUALS },
        zona: { value: null, matchMode: FilterMatchMode.EQUALS },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS },
        cliente: { value: null, matchMode: FilterMatchMode.EQUALS },
        matriz: { value: null, matchMode: FilterMatchMode.EQUALS },
    })
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    
    // Turn [{"cliente":"BBVA"}] to [{label:"BBVA",value:"BBVA"}]
    const toOptions = (array) => array.map(item => ({ label: item[Object.keys(item)[0]], value: item[Object.keys(item)[0]] }))

    const remotasBodyTemplate = (rowData) => {
        return rowData.remotas ? 'Si' : 'No'
    }

    const dropdownRowFilterTemplate = (options) => {
        // Dropdown filter 
        return (
            <Dropdown 
                value={options.value} 
                onChange={(e) => options.filterApplyCallback(e.value)} 
                options={ options.field === "cliente" ? toOptions(clientes) : 
                            options.field === "zona" ? toOptions(zonas) : 
                            options.field === "estado" ? toOptions(estados) : 
                            [{ label: 'Si', value: true }, { label: 'No', value: false }] 
                        }
                placeholder="Selecciona" 
                className="p-column-filter" 
                showClear 
            />
        )

    }
    
    
    const matrizBodyTemplate = (rowData) => {
        return rowData.matriz ? 'Si' : 'No'
    }

    const zonaBodyTemplate = (rowData) => {
        
        return <Tag 
                    value={rowData.zona} 
                    backGroundColor={
                        rowData.zona === "NORTE" ? "blue" : 
                        rowData.zona === "SUR" ? "green" : 
                        rowData.zona === "CENTRO" ? "yellow" : "red"
                    } 
                />
    }
    
    // Get columns from data
    useEffect(() => {
        if (data && data.length > 0) {
            const newColumns = Object.keys(data[0]).map(key => ({ field: key, header: key }));
            setColumns(newColumns);
            //console.log(estados)
        }}, [data])

    return (
        <Box width="100%" overflowX="auto" overflowY="auto" maxHeight="500px" >
            <Flex flexDir="column" justifyContent="center" alignItems="center" height="100%" width="100%" >
                <Box width="100%" >
                    <TableHeader filters={filters} setFilters={setFilters} />
                </Box>
                <Box width="100%" >
                    <DataTable 
                        value={data} 
                        tableStyle={{ minWidth: '50rem' }}
                        loading={isLoading}
                        filters={filters}
                        filterDisplay="row"
                        
                    >
                        {columns.map(col => (
                            col.field !== ("id") &&  
                            col.field !==("created_at") && 
                            <Column 
                                key={col.field} 
                                field={col.field} 
                                header={col.header.toUpperCase()} 
                                filter
                                filterElement={ col.field === 'remotas' ? dropdownRowFilterTemplate : 
                                                col.field === 'matriz' ? dropdownRowFilterTemplate :
                                                col.field === 'zona' ? dropdownRowFilterTemplate : 
                                                col.field === 'estado' ? dropdownRowFilterTemplate :
                                                col.field === 'cliente' ? dropdownRowFilterTemplate : null
                                            }
                                filterPlaceholder={`filtrar ${col.field}`}
                                style={{minWidth:"12rem"}}
                                body={  col.field === 'remotas' ? remotasBodyTemplate : 
                                        col.field === 'matriz' ? matrizBodyTemplate : 
                                        col.field === 'zona' ? zonaBodyTemplate : null
                                    }
                            />
                            ))}
                    </DataTable>
                </Box>
            </Flex>
        </Box>
        
    )
};
