import React, { useState, useEffect } from 'react';
import { Shield, Key, Terminal, Download, Trash2, ShieldAlert, Cpu, LogOut, CheckCircle, Database, Lock } from 'lucide-react';

const EmployeeDashboard = ({ employees, logs, onActionSuccess }) => {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [location, setLocation] = useState('Chennai Head Office');
  const [isLateNight, setIsLateNight] = useState(false);
  const [downloadCount, setDownloadCount] = useState(600);
  const [deleteCount, setDeleteCount] = useState(50);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showLockPopup, setShowLockPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const activeEmployee = employees.find(e => e.id === parseInt(selectedEmpId));
  const isLocked = activeEmployee && (activeEmployee.risk_score >= 100 || activeEmployee.status === 'Flagged');

  // Trigger popup when activeEmployee reaches 100 risk score or status is Flagged
  useEffect(() => {
    if (activeEmployee && (activeEmployee.risk_score >= 100 || activeEmployee.status === 'Flagged')) {
      setShowLockPopup(true);
      setCountdown(5);
    } else {
      setShowLockPopup(false);
    }
  }, [selectedEmpId, activeEmployee?.risk_score, activeEmployee?.status]);

  useEffect(() => {
    let timer;
    if (showLockPopup) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setSelectedEmpId('');
            setShowLockPopup(false);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showLockPopup]);

  const triggerAction = async (activity, customDetails = {}) => {
    if (!selectedEmpId) {
      alert("Please select an employee first!");
      return;
    }
    if (isLocked) {
      alert("Access Denied: Account is locked.");
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
      details = `Logged in from ${location}`;
    }

    const payload = {
      employee_id: parseInt(selectedEmpId),
      activity,
      location: location,
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
      
      if (response.status === 403) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Access Denied (403)' });
        if (onActionSuccess) onActionSuccess();
        return;
      }

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
    <div className="bg-[#0b1021] border border-green-500/30 p-6 rounded-lg font-mono shadow-[0_0_15px_rgba(34,197,94,0.05)] relative">
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

      {/* Warning Banner */}
      {isLocked && (
        <div className="mb-6 bg-red-950/20 border-2 border-red-500/50 p-5 rounded text-center relative overflow-hidden animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
          <h2 className="text-red-500 font-extrabold text-sm tracking-widest mb-1 flex items-center justify-center gap-2 font-mono">
            <ShieldAlert className="h-5 w-5" /> ⚠ ACCOUNT LOCKED
          </h2>
          <p className="text-gray-300 text-xs font-bold font-mono mb-2">
            This employee has been identified as a Critical Insider Threat.
          </p>
          <div className="text-xl font-black text-red-500 font-mono mb-2">
            Risk Score: {activeEmployee.risk_score}/100
          </div>
          <p className="text-gray-400 text-xs font-mono mb-1">
            All actions have been disabled.
          </p>
          <p className="text-cyber-primary text-[11px] font-semibold font-mono">
            Please contact the Security Operations Center (SOC).
          </p>
        </div>
      )}

      {/* Auto Logout Popup Modal */}
      {showLockPopup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0c16] border-2 border-red-500 rounded-lg p-6 max-w-md w-full text-center space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="flex justify-center">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30 animate-pulse text-red-500">
                <ShieldAlert className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-red-500 font-extrabold text-xl tracking-widest font-mono uppercase">
              Critical Insider Threat Detected
            </h3>
            <p className="text-gray-300 text-sm font-mono leading-relaxed">
              Your account has been locked. All workstation permissions have been revoked.
            </p>
            <p className="text-gray-400 text-xs font-mono">
              Contact Security Administrator.
            </p>
            <div className="border-t border-red-500/20 pt-3 text-[10px] text-gray-500 font-mono">
              Redirecting to operator selection in <span className="text-red-400 font-bold">{countdown}</span> seconds...
            </div>
          </div>
        </div>
      )}

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
                <p><span className="text-green-500/50">Employee ID:</span> <span className="text-green-400 font-semibold">{activeEmployee.employee_id}</span></p>
                <p><span className="text-green-500/50">Department:</span> <span className="text-green-400">{activeEmployee.department}</span></p>
                <p><span className="text-green-500/50">Role:</span> <span className="text-green-400">{activeEmployee.role}</span></p>
                <p><span className="text-green-500/50">Current Location:</span> <span className="text-green-400">{activeEmployee.last_location || 'Chennai Head Office'}</span></p>
                <p><span className="text-green-500/50">Last Login Time:</span> <span className="text-green-400">{activeEmployee.last_login || 'N/A'}</span></p>
                <p><span className="text-green-500/50">Current IP:</span> <span className="text-green-400">{activeEmployee.ip_address || '10.10.20.14'}</span></p>
                <p><span className="text-green-500/50">Device Name:</span> <span className="text-green-400">{activeEmployee.device_name || 'SEC-TERM-2026'}</span></p>
                <p>
                  <span className="text-green-500/50">Current Risk:</span>{' '}
                  <span className={`font-bold ${isLocked ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {activeEmployee.risk_score}/100
                  </span>
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-green-500/50">Status:</span>
                  <span className={`px-1 py-0.5 rounded flex items-center gap-1 ${
                    activeEmployee.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-500 border border-red-500/30'
                  }`}>
                    {activeEmployee.status === 'Flagged' && <Lock className="h-3 w-3" />}
                    {activeEmployee.status}
                  </span>
                </p>
              </div>
            )}

            <div className="border-t border-green-500/10 pt-3">
              <label className="text-green-500/70 text-xs block mb-1">Workstation Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLocked || !selectedEmpId}
                className="w-full bg-[#0d1222] border border-green-500/30 text-green-400 p-2 rounded focus:border-green-400 focus:outline-none text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="Chennai Head Office">Chennai Head Office</option>
                <option value="Bangalore Branch">Bangalore Branch</option>
                <option value="Mumbai Branch">Mumbai Branch</option>
                <option value="Hyderabad Branch">Hyderabad Branch</option>
                <option value="Remote VPN">Remote VPN (+10 Risk)</option>
                <option value="Unknown Location">Unknown Location (+30 Risk)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border-t border-green-500/10 pt-3">
              <input
                type="checkbox"
                id="latenight"
                checked={isLateNight}
                onChange={(e) => setIsLateNight(e.target.checked)}
                disabled={isLocked || !selectedEmpId}
                className="accent-green-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <label htmlFor="latenight" className="text-green-500/70 text-xs cursor-pointer select-none disabled:opacity-40">
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
              disabled={loading || !selectedEmpId || isLocked}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0d1222] disabled:hover:border-green-500/20"
            >
              <span>Authenticate Session (Login)</span>
              <Key className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('View Customer Records')}
              disabled={loading || !selectedEmpId || isLocked}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0d1222] disabled:hover:border-green-500/20"
            >
              <span>View Customer Records</span>
              <Terminal className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('Update Customer Information')}
              disabled={loading || !selectedEmpId || isLocked}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0d1222] disabled:hover:border-green-500/20"
            >
              <span>Update Customer Info</span>
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('Export Excel Report')}
              disabled={loading || !selectedEmpId || isLocked}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0d1222] disabled:hover:border-green-500/20"
            >
              <span>Export Excel Statement</span>
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => triggerAction('Logout')}
              disabled={loading || !selectedEmpId || isLocked}
              className="w-full text-left py-2 px-3 bg-[#0d1222] hover:bg-green-950/20 border border-green-500/20 hover:border-green-500/50 text-green-400 rounded text-xs flex items-center justify-between transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0d1222] disabled:hover:border-green-500/20"
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
                disabled={isLocked || !selectedEmpId}
                value={downloadCount}
                onChange={(e) => setDownloadCount(parseInt(e.target.value))}
                className="w-full h-1 bg-green-950 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2 disabled:opacity-40"
              />
              <button
                onClick={() => triggerAction('Download Customer Data')}
                disabled={loading || !selectedEmpId || isLocked}
                className="w-full py-1.5 bg-green-950/30 border border-green-500/30 hover:bg-green-950/60 hover:border-green-400 text-green-400 rounded text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-950/30 disabled:hover:border-green-500/30"
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
                disabled={isLocked || !selectedEmpId}
                value={deleteCount}
                onChange={(e) => setDeleteCount(parseInt(e.target.value))}
                className="w-full h-1 bg-green-950 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2 disabled:opacity-40"
              />
              <button
                onClick={() => triggerAction('Delete Customer Records')}
                disabled={loading || !selectedEmpId || isLocked}
                className="w-full py-1.5 bg-red-950/30 border border-red-500/30 hover:bg-red-950/60 hover:border-red-400 text-red-400 rounded text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-950/30 disabled:hover:border-red-500/30"
              >
                <Trash2 className="h-3.5 w-3.5" /> Purge Records
              </button>
            </div>

            {/* Miscellaneous */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerAction('Change Permissions')}
                disabled={loading || !selectedEmpId || isLocked}
                className="py-1.5 border border-yellow-500/20 hover:border-yellow-500/60 text-yellow-500/90 hover:bg-yellow-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ShieldAlert className="h-3 w-3" /> Esc. Privilege
              </button>
              <button
                onClick={() => triggerAction('Access Database')}
                disabled={loading || !selectedEmpId || isLocked}
                className="py-1.5 border border-yellow-500/20 hover:border-yellow-500/60 text-yellow-500/90 hover:bg-yellow-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Database className="h-3 w-3" /> Query SQL DB
              </button>
              <button
                onClick={() => triggerAction('Failed Login', { details: "Failed auth challenge due to invalid RSA token" })}
                disabled={loading || !selectedEmpId || isLocked}
                className="py-1.5 border border-red-500/20 hover:border-red-500/60 text-red-500/90 hover:bg-red-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Key className="h-3 w-3" /> Failed Login
              </button>
              <button
                onClick={() => triggerAction('USB Device Connected')}
                disabled={loading || !selectedEmpId || isLocked}
                className="py-1.5 border border-red-500/20 hover:border-red-500/60 text-red-500/90 hover:bg-red-950/20 rounded text-[10px] text-center flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Cpu className="h-3 w-3" /> Connect USB
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Action History */}
      {activeEmployee && (
        <div className="bg-[#070b15] border border-green-500/20 p-4 rounded mt-6">
          <h3 className="text-green-400 text-sm font-semibold border-b border-green-500/10 pb-2 mb-3 flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">04</span>
            ACTION HISTORY (LAST 5)
          </h3>
          <div className="space-y-1.5 font-mono text-xs">
            {logs.filter(l => l.employee_id === activeEmployee.id).slice(0, 5).map((log, index) => {
              const timeStr = log.timestamp ? log.timestamp.split(' ')[1]?.substring(0, 5) || log.timestamp : '';
              return (
                <div key={log.id || index} className="flex justify-between items-center border-b border-green-500/5 pb-1">
                  <span className="text-green-500/50">{timeStr}</span>
                  <span className="text-green-300 font-medium">{log.activity}</span>
                </div>
              );
            })}
            {logs.filter(l => l.employee_id === activeEmployee.id).length === 0 && (
              <p className="text-green-500/30 text-xs italic">No activity recorded.</p>
            )}
          </div>
        </div>
      )}

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
