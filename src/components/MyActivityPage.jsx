import React, { useState } from 'react';
import { Search, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const MyActivityPage = ({ employee, logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!employee) {
    return (
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-8 text-center font-mono text-xs">
        <p className="text-gray-500 italic">No operator session active. Please log in.</p>
      </div>
    );
  }

  // Filter logs for this employee only
  const myLogs = logs.filter(l => l.employee_id === employee.id);

  // Extract unique actions for action filter dropdown
  const uniqueActions = [...new Set(myLogs.map(l => l.activity))];

  // Apply filters
  const filteredLogs = myLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesAction = actionFilter === '' || log.activity === actionFilter;
    
    const matchesDate = dateFilter === '' || 
      (log.timestamp && log.timestamp.split(' ')[0].includes(dateFilter));

    return matchesSearch && matchesAction && matchesDate;
  });

  // Calculate pagination
  const totalEntries = filteredLogs.length;
  const totalPages = Math.max(Math.ceil(totalEntries / pageSize), 1);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (riskAdded, riskAfter) => {
    if (riskAdded >= 40 || riskAfter >= 80) {
      return (
        <span className="px-2 py-0.5 bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/35 rounded font-bold uppercase text-[9px]">
          Critical
        </span>
      );
    }
    if (riskAdded > 0) {
      return (
        <span className="px-2 py-0.5 bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/35 rounded font-bold uppercase text-[9px]">
          Warning
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-cyber-success/10 text-cyber-success border border-cyber-success/35 rounded font-bold uppercase text-[9px]">
        Success
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.35)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-cyber-border pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-100 text-lg font-bold tracking-wider uppercase">MY ACTIVITY PROTOCOL RECORD</h2>
          <p className="text-gray-500 text-[10px] uppercase">Compliance Audits // Action Logs of {employee.name}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-500 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search activity details..."
            className="w-full bg-cyber-bg border border-cyber-border text-gray-200 pl-9 pr-3 py-2 rounded focus:border-cyber-primary focus:outline-none"
          />
        </div>

        {/* Action filter */}
        <div className="relative flex items-center">
          <Filter className="absolute left-3 text-gray-500 h-4 w-4" />
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-cyber-bg border border-cyber-border text-cyber-primary pl-9 pr-3 py-2 rounded focus:border-cyber-primary focus:outline-none cursor-pointer"
          >
            <option value="">-- All Actions --</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        {/* Date filter */}
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 text-gray-500 h-4 w-4" />
          <input
            type="text"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            placeholder="YYYY-MM-DD Filter..."
            className="w-full bg-cyber-bg border border-cyber-border text-gray-200 pl-9 pr-3 py-2 rounded focus:border-cyber-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-cyber-border rounded">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cyber-bg/85 border-b border-cyber-border text-gray-400 font-bold uppercase text-[10px]">
              <th className="p-3">Time</th>
              <th className="p-3">Action</th>
              <th className="p-3">Risk Added</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40 font-mono text-xs">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-600 italic">
                  NO COMPLIANCE AUDIT ENTRIES FOUND FOR THE ACTIVE FILTERS.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, idx) => {
                const riskAdded = log.risk_score_added || 0;
                const riskAfter = log.risk_score_after || 0;
                return (
                  <tr key={log.id || idx} className="hover:bg-black/30 transition-colors">
                    <td className="p-3 text-gray-500 font-semibold">{log.timestamp}</td>
                    <td className="p-3 text-gray-200">
                      <span className="font-bold">{log.activity}</span>
                      <p className="text-gray-500 text-[10px] mt-0.5">{log.details}</p>
                    </td>
                    <td className={`p-3 font-bold ${riskAdded > 0 ? 'text-cyber-danger' : 'text-cyber-success'}`}>
                      {riskAdded >= 0 ? '+' : ''}{riskAdded}
                    </td>
                    <td className="p-3 text-gray-400 font-semibold">{log.location}</td>
                    <td className="p-3">{getStatusBadge(riskAdded, riskAfter)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between font-mono text-xs pt-2">
          <span className="text-gray-500">
            Showing <span className="text-gray-300 font-semibold">{startIndex + 1}</span> to{' '}
            <span className="text-gray-300 font-semibold">
              {Math.min(startIndex + pageSize, totalEntries)}
            </span>{' '}
            of <span className="text-gray-300 font-semibold">{totalEntries}</span> logs
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 border border-cyber-border rounded hover:border-cyber-primary disabled:opacity-40 disabled:hover:border-cyber-border text-gray-400 hover:text-cyber-primary transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center px-3 border border-cyber-border bg-[#0d1326] rounded text-cyber-primary font-bold">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 border border-cyber-border rounded hover:border-cyber-primary disabled:opacity-40 disabled:hover:border-cyber-border text-gray-400 hover:text-cyber-primary transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyActivityPage;
