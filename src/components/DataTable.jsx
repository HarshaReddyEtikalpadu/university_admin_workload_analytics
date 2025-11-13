import { useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { REQUEST_TYPES, STATUSES, PRIORITIES } from '../utils/constants';

const DataTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const rowsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    // Handle numeric values
    if (sortConfig.key === 'processing_time_minutes' || sortConfig.key === 'request_id') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeColor = (time) => {
    const minutes = Number(time) || 0;
    if (minutes > 60) return 'text-red-600 font-semibold';
    if (minutes < 30) return 'text-green-600 font-semibold';
    return 'text-gray-700';
  };

  // CSV download helpers (inside component for access to data)
  const downloadCSV = (filename, rows) => {
    const escape = (v) => {
      const s = (v ?? '').toString().replace(/"/g, '""');
      const needsQuotes = s.includes('"') || s.includes(',') || s.includes('\n');
      return needsQuotes ? `"${s}"` : s;
    };
    const body = rows.map((r) => r.map(escape).join(',')).join('\n');
    const csv = `\uFEFF${body}`; // BOM for Excel on Windows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleExportCSV = () => {
    const header = [
      'request_id',
      'request_number',
      'request_type',
      'department_name',
      'status',
      'priority',
      'processing_time_minutes',
      'created_at',
      'resolved_at',
      'assigned_admin_id',
      'assigned_admin_name',
    ];
    const rows = [header];
    (Array.isArray(data) ? data : []).forEach((r) => {
      rows.push([
        r.request_id,
        r.request_number,
        r.request_type,
        r.department_name || r.department,
        r.status,
        r.priority,
        r.processing_time_minutes,
        r.created_at,
        r.resolved_at,
        r.assigned_admin_id,
        r.assigned_admin_name,
      ]);
    });
    const ts = new Date();
    const stamp = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}_${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}`;
    downloadCSV(`my_tasks_${stamp}.csv`, rows);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Request Details</h3>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('request_id')}
              >
                Request ID
                {sortConfig.key === 'request_id' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? 'â†‘' : 'â†“'}</span>
                )}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('request_type')}
              >
                Type
                {sortConfig.key === 'request_type' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? 'â†‘' : 'â†“'}</span>
                )}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('department_name')}
              >
                Department
                {sortConfig.key === 'department_name' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? 'â†‘' : 'â†“'}</span>
                )}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('processing_time_minutes')}
              >
                Processing Time
                {sortConfig.key === 'processing_time_minutes' && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? 'â†‘' : 'â†“'}</span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No requests found
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.request_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{row.request_number || row.request_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.request_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.department_name}</td>
                  <td className={`px-4 py-3 text-sm ${getTimeColor(row.processing_time_minutes)}`}>
                    {row.processing_time_minutes} min
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(row.priority)}`}>
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} requests
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
