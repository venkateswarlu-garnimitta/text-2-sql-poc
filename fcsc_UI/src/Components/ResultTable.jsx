import React, { useState } from 'react';

const ResultTable = ({ data }) => {
  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  if (!data || data.length === 0) return <div className="p-4">No data available</div>;

  const columns = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const isPaginationNeeded = data.length > rowsPerPage;

  const displayedData = isPaginationNeeded
    ? data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : data;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full overflow-x-auto mt-4">
      <div className="border border-gray-300  bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border-b border-gray-300 px-4 py-2 bg-gray-200 text-left font-semibold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-100 hover:text-black">
                  {columns.map((col) => (
                    <td key={col} className="border-b border-gray-300 px-4 py-2">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isPaginationNeeded && (
          <div className="p-4 border-t border-gray-300">
            <div className="flex justify-end">
              <div className="overflow-x-auto max-w-full">
                <div className="flex space-x-2 text-sm" style={{ minWidth: 'fit-content' }}>
                  {/* Prev Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-400 transition flex-shrink-0
                      ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#b58932] hover:text-white'}`}
                    aria-label="Previous Page"
                  >
                    &lt;
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 rounded border text-xs flex-shrink-0
                        ${currentPage === i + 1 ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-400 transition flex-shrink-0
                      ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#b58932] hover:text-white'}`}
                    aria-label="Next Page"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultTable;