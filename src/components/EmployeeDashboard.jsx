import React, { useState } from 'react';
import { Shield, Key, Terminal, Download, Trash2, ShieldAlert, Cpu, LogOut, CheckCircle, Database } from 'lucide-react';

const EmployeeDashboard = ({ employees, onActionSuccess }) => {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [location, setLocation] = useState('Office');
  const [customLocation, setCustomLocation] = useState('Chennai');
  const [isLateNight, setIsLateNight] = useState(false);
  const [downloadCount, setDownloadCount] = useState(600);
  const [deleteCount, setDeleteCount] = useState(50);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeEmployee = employees.find(e => e.id === parseInt(selectedEmpId));

  const triggerAction = async (activity, customDetails = {}) => {
    if (!selectedEmpId) {
      alert("Please select an employee first!");
      return;
    }

    setLoading(true);
    setMessage(null);

    let details = customDetails.details || `Simulated ${activity}`;
    let recordsCount = 0;
    
    if (activity === "Download Customer Data") {
      recordsCount = downloadCount;
      details = `Attempted download of ${downloadCount} customer accounts`;
    } else if (activity === "Delete Customer Records") {
      recordsCount = deleteCount;
      details = `Deleted ${deleteCount} database logs/records`;
    } else if (activity === "Login") {
      details = `Logged in from ${location === 'Office' ? 'HQ Office' : location}`;
    }

    const payload = {
      employee_id: parseInt(selectedEmpId),
      activity,
      location: location === 'Office' ? 'Office' : customLocation,
      details,
      records_count: recordsCount,
      is_late_night: isLateNight,
      ...customDetails
    };

    try {
      const response = await fetch('/api/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Action registered: ${activity}. Threat score change: ${data.points_added >= 0 ? '+' : ''}${data.points_added} (Current: ${data.new_score})`
        });
        if (onActionSuccess) onActionSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to register action' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection failure to API server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b1021] border border-green-500/30 p-6 rounded-lg font-mono shadow-[0_0_15px_rgba(34,197,94,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Terminal className="text-green-400 h-6 w-6 animate-pulse" />
          <div>
            <h2 className="text-green-400 font-bold text-lg tracking-wider">AEGIS BANKING WORKSTATION</h2>
            <p className="text-green-500/50 text-xs font-mono">Terminal ID: SEC-TERM-2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
          <span className="text-green-400 text-xs">ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Identity */}
        <div className="bg-[#070b15] border border-green-500/20 p-4 rounded">
          <h3 className="text-green-400 text-sm font-semibold border-b border-green-500/10 pb-2 mb-4 flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">01</span>
            SELECT OPERATOR
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-green-500/70 text-xs block mb-1">Employee Identity</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-[#0d1222] border border-green-500/30 text-green-400 p-2.5 rounded focus:border-green-400 focus:outline-none text-sm cursor-pointer"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role} - {emp.department})
                  </option>
                ))}
              </select>
            </div>

            {activeEmployee && (
              <div className="border border-green-500/10 p-3 bg-green-950/10 rounded text-xs space-y-2">
                <p><span className="text-green-500/50">Dept:</span> {activeEmployee.department}</p>
                <p><span className="text-green-500/50">Role:</span> {activeEmployee.role}</p>
                <p><span className="text-green-500/50">Status:</span> 
                  <span className={`ml-2 px-1 rounded ${activeEmployee.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {activeEmployee.status}
                  </span>
                </p>
                <p><span className="text-green-500/50">Current Risk:</span> <span className="text-green-400 font-bold">{activeEmployee.risk_score}/100</span></p>
              </div>
            )}

            <div className="border-t border-green-500/10 pt-3">
              <label className="text-green-500/70 text-xs block mb-1">Location Profile</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLocation('Office')}
                  className={`flex-1 py-1.5 text-xs border rounded transition-all ${location === 'Office' ? 'bg-green-500/20 border-green-400 text-green-400' : 'border-green-500/20 text-green-500/50 hover:bg-green-500/5'}`}
                >
                  Office
                </button>
                <button
                  type="button"
                  onClick={() => setLocation('Remote')}
                  className={`flex-1 py-1.5 text-xs border rounded transition-all ${location === 'Remote' ? 'bg-green-500/20 border-green-400 text-green-400' : 'border-green-500/20 text-green-500/50 hover:bg-green-500/5'}`}
                >
                  Remote
                </button>
              </div>

              {location === 'Remote' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Chennai, London, Unknown"
                  className="w-full bg-[#0d1222] border border-green-500/30 text-green-400 p-2 rounded focus:border-green-400 focus:outline-none text-xs"
                />
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-green-500/10 pt-3">
              <input
                type="checkbox"
                id="latenight"
                checked={isLateNight}
                onChange={(e) => setIsLateNight(e.target.checked)}
                className="accent-green-500 cursor-pointer"
              />
              <label htmlFor="latenight" className="text-green-500/70 text-xs cursor-pointer select-none">
                Simulate Off-Hours (Late Night)
              </label>
            </div>
          </div>
        </div>

        {/* Step 2: Standard Banking Operations */}
        <div className="bg-[#070b15] border border-green-500/20 p-4 rounded">
          <h3 className="text-green-400 text-sm font-semibold border-b border-green-500/10 pb-2 mb-4 flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">02</span>
            STANDARD PROCEDURES
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => triggerAction('Login')}
              disabled={loading || !selectedEmpId}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Authenticate Session (Login)</span>
              <Key className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('View Customer Records')}
              disabled={loading || !selectedEmpId}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>View Customer Records</span>
              <Terminal className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('Update Customer Information')}
              disabled={loading || !selectedEmpId}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Update Customer Info</span>
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('Export Excel Report')}
              disabled={loading || !selectedEmpId}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Export Excel Statement</span>
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('Logout')}
              disabled={loading || !selectedEmpId}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Terminate Session (Logout)</span>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Step 3: Sensitive / Privilege Activities */}
        <div className="bg-[#070b15] border border-green-500/20 p-4 rounded">
          <h3 className="text-green-400 text-sm font-semibold border-b border-green-500/10 pb-2 mb-4 flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">03</span>
            RESTRICTED ACCESS
          </h3>

          <div className="space-y-4">
            {/* Download Customer Data */}
            <div className="border border-green-500/10 p-2.5 rounded bg-green-950/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-green-400">Download Customer Data</span>
                <span className="text-[10px] text-green-500/60 font-bold">{downloadCount} recs</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={downloadCount}
                onChange={(e) => setDownloadCount(parseInt(e.target.value))}
                className="w-full h-1 bg-green-950 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2"
              />
              <button
                onClick={() => triggerAction('Download Customer Data')}
                disabled={loading || !selectedEmpId}
                className="w-full py-1.5 bg-green-950/30 border border-green-500/30 hover:bg-green-950/60 hover:border-green-400 text-green-400 rounded text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" /> Request Extract
              </button>
            </div>

            {/* Delete Customer Data */}
            <div className="border border-green-500/10 p-2.5 rounded bg-green-950/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-green-400">Delete Customer Records</span>
                <span className="text-[10px] text-green-500/60 font-bold">{deleteCount} rows</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                step="5"
                value={deleteCount}
                onChange={(e) => setDeleteCount(parseInt(e.target.value))}
                className="w-full h-1 bg-green-950 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2"
              />
              <button
                onClick={() => triggerAction('Delete Customer Records')}
                disabled={loading || !selectedEmpId}
                className="w-full py-1.5 bg-red-950/30 border border-red-500/30 hover:bg-red-950/60 hover:border-red-400 text-red-400 rounded text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Purge Records
              </button>
            </div>

            {/* Miscellaneous */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerAction('Change Permissions')}
                disabled={loading || !selectedEmpId}
                className="py-1.5 border border-yellow-500/20 hover:border-yellow-500/60 text-yellow-500/90 hover:bg-yellow-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <ShieldAlert className="h-3 w-3" /> Esc. Privilege
              </button>
              <button
                onClick={() => triggerAction('Access Database')}
                disabled={loading || !selectedEmpId}
                className="py-1.5 border border-yellow-500/20 hover:border-yellow-500/60 text-yellow-500/90 hover:bg-yellow-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <Database className="h-3 w-3" /> Query SQL DB
              </button>
              <button
                onClick={() => triggerAction('Failed Login', { location: location === 'Office' ? 'Office' : customLocation, details: "Failed auth challenge due to invalid RSA token" })}
                disabled={loading || !selectedEmpId}
                className="py-1.5 border border-red-500/20 hover:border-red-500/60 text-red-500/90 hover:bg-red-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <Key className="h-3 w-3" /> Failed Login
              </button>
              <button
                onClick={() => triggerAction('USB Device Connected')}
                disabled={loading || !selectedEmpId}
                className="py-1.5 border border-red-500/20 hover:border-red-500/60 text-red-500/90 hover:bg-red-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <Cpu className="h-3 w-3" /> Connect USB
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Logs Output feedback */}
      {message && (
        <div className={`mt-6 border p-3.5 rounded text-xs ${message.type === 'success' ? 'bg-green-950/20 border-green-500/40 text-green-400' : 'bg-red-950/20 border-red-500/40 text-red-400'} flex items-start gap-3`}>
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 animate-ping bg-green-400"></div>
          <p className="leading-relaxed"><strong className="uppercase">[{message.type}]</strong> {message.text}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
