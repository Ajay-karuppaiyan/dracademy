import React from 'react';
import DataTable from 'react-data-table-component';
import { Search } from 'lucide-react';

const customStyles = {
  headRow: {
    style: {
      backgroundColor: '#f8fafc',
      borderBottomWidth: '1px',
      borderBottomColor: '#f1f5f9',
    },
  },
  headCells: {
    style: {
      color: '#64748b',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      paddingLeft: '16px',
      paddingRight: '16px',
    },
  },
  cells: {
    style: {
      paddingLeft: '16px',
      paddingRight: '16px',
      fontSize: '0.875rem',
      color: '#334155',
    },
  },
  rows: {
    style: {
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
    },
  },
};

const CustomDataTable = ({ 
  columns, 
  data, 
  searchPlaceholder = "Search...", 
  search, 
  setSearch, 
  exportButton,
  ...props 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full h-full">
      {/* Header section with search and export built-in if provided */}
      {(setSearch || exportButton) && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          {setSearch && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          )}
          {exportButton && (
            <div className="w-full sm:w-auto flex justify-end">
              {exportButton}
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 w-full relative">
        <DataTable
          columns={columns}
          data={data}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 50]}
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover={false}
          responsive
          noDataComponent={
            <div className="p-12 text-center text-slate-500">
              <span className="text-4xl block mb-2">📄</span>
              <p className="font-medium text-lg">No records found</p>
            </div>
          }
          {...props}
        />
      </div>
    </div>
  );
};

export default CustomDataTable;
