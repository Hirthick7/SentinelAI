import React from 'react';
import { User, ShieldAlert, Cpu, Network, Clock, ShieldCheck, Lock } from 'lucide-react';

const ProfilePage = ({ employee, alerts }) => {
  if (!employee) {
    return (
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-8 text-center font-mono text-xs">
        <p className="text-gray-500 italic">No operator session active. Please log in.</p>
      </div>
    );
  }

  const isLocked = employee.risk_score >= 100 || employee.status === 'Flagged';
  const myAlerts = alerts.filter(a => a.employee_id === employee.id);

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-cyber-success';
    if (score <= 60) return 'text-cyber-warning';
    if (score <= 80) return 'text-orange-500';
    return 'text-cyber-danger';
  };

  const getRiskBorder = (score) => {
    if (score <= 30) return 'border-cyber-success/30 bg-cyber-success/5';
    if (score <= 60) return 'border-cyber-warning/30 bg-cyber-warning/5';
    if (score <= 80) return 'border-orange-500/30 bg-orange-500/5';
    return 'border-cyber-danger/30 bg-cyber-danger/5';
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.35)] font-mono text-xs relative overflow-hidden">
      
      {/* Glow header overlay */}
      <div className={`absolute inset-x-0 top-0 h-[2px] ${isLocked ? 'bg-cyber-danger shadow-glow-danger' : 'bg-cyber-primary shadow-glow-cyan'} animate-pulse`}></div>

      {/* Header */}
      <div className="border-b border-cyber-border pb-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-100 text-lg font-bold tracking-wider uppercase">OPERATOR COMPLIANCE PROFILE</h2>
          <p className="text-gray-500 text-[10px] uppercase">Compliance Dossier // Authorized Operator Review Only</p>
        </div>
        <div className={`px-3 py-1 rounded font-bold border flex items-center gap-1.5 ${
          isLocked ? 'border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger' : 'border-cyber-success/30 bg-cyber-success/10 text-cyber-success'
        }`}>
          {isLocked ? (
            <>
              <Lock className="h-3.5 w-3.5" /> LOCKED / SUSPENDED
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" /> SECURE / COMPLIANT
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Basic Information */}
        <div className="md:col-span-4 flex flex-col items-center text-center space-y-5 border-b md:border-b-0 md:border-r border-cyber-border pb-6 md:pb-0 md:pr-6">
          {/* Cyber Avatar Box */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-lg border-2 flex items-center justify-center bg-black/60 relative overflow-hidden ${
              isLocked ? 'border-cyber-danger' : 'border-cyber-primary'
            }`}>
              {/* Scanline inside avatar */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
              
              <User className={`h-20 w-20 ${isLocked ? 'text-cyber-danger' : 'text-cyber-primary'} opacity-75`} />
            </div>
            {/* Status light */}
            <span className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-cyber-card ${
              isLocked ? 'bg-cyber-danger animate-pulse' : 'bg-cyber-success animate-ping'
            }`}></span>
          </div>

          <div className="space-y-1">
            <h3 className="text-gray-100 text-base font-extrabold">{employee.name}</h3>
            <p className="text-cyber-primary text-[10px] font-bold tracking-wider">{employee.employee_id}</p>
            <p className="text-gray-500 text-[10px] uppercase font-bold">{employee.role}</p>
          </div>

          {/* Risk telemetry gauge box */}
          <div className={`w-full p-4 border rounded-lg ${getRiskBorder(employee.risk_score)}`}>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Behavioral Risk Rating</span>
            <span className={`text-3xl font-black block tracking-tight ${getRiskColor(employee.risk_score)}`}>
              {employee.risk_score} / 100
            </span>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-3 border border-cyber-border/40">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  employee.risk_score > 80 ? 'bg-cyber-danger' : employee.risk_score > 40 ? 'bg-cyber-warning' : 'bg-cyber-success'
                }`}
                style={{ width: `${employee.risk_score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Technical details & Alerts */}
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Dept details */}
            <div className="bg-black/30 border border-cyber-border/40 p-3.5 rounded space-y-3">
              <h4 className="text-cyber-primary font-bold uppercase tracking-wider text-[10px] border-b border-cyber-border/20 pb-1 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Departmental Info
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <p><span className="text-gray-500">Department:</span> <span className="text-gray-300 font-semibold">{employee.department}</span></p>
                <p><span className="text-gray-500">Role Designation:</span> <span className="text-gray-300 font-semibold">{employee.role === 'Employee' ? 'Staff Operator' : employee.role}</span></p>
                <p><span className="text-gray-500">Designation Level:</span> <span className="text-gray-300 font-semibold">L2 Operations Personnel</span></p>
                <p><span className="text-gray-500">Current Branch:</span> <span className="text-gray-300 font-semibold">{employee.last_location || 'Chennai Head Office'}</span></p>
              </div>
            </div>

            {/* Workstation details */}
            <div className="bg-black/30 border border-cyber-border/40 p-3.5 rounded space-y-3">
              <h4 className="text-cyber-primary font-bold uppercase tracking-wider text-[10px] border-b border-cyber-border/20 pb-1 flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5" /> Workstation Telemetry
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <p><span className="text-gray-500">Device Terminal:</span> <span className="text-gray-300 font-semibold">{employee.device_name || 'SEC-TERM-2026'}</span></p>
                <p><span className="text-gray-500">Operating System:</span> <span className="text-gray-300 font-semibold">{employee.operating_system || 'Windows 11 Enterprise'}</span></p>
                <p><span className="text-gray-500">Gateway IP:</span> <span className="text-gray-300 font-semibold">{employee.ip_address || '10.10.20.14'}</span></p>
                <p><span className="text-gray-500">Last Authentication:</span> <span className="text-gray-300 font-semibold">{employee.last_login || 'N/A'}</span></p>
              </div>
            </div>

          </div>

          {/* User Alerts feed */}
          <div className="bg-black/30 border border-cyber-border/40 p-4 rounded space-y-3">
            <h4 className="text-cyber-primary font-bold uppercase tracking-wider text-[10px] border-b border-cyber-border/20 pb-1 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> Recent Compliance Alerts ({myAlerts.length})
            </h4>
            <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
              {myAlerts.length === 0 ? (
                <p className="text-gray-500 italic text-[11px] text-center py-4">No compliance alerts registered for this workstation.</p>
              ) : (
                myAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-2.5 border rounded text-[11px] flex justify-between items-start gap-3 ${
                      alert.threat_level === 'Critical' 
                        ? 'border-cyber-danger/30 bg-cyber-danger/5 text-cyber-danger' 
                        : alert.threat_level === 'High' 
                        ? 'border-orange-500/30 bg-orange-500/5 text-orange-400' 
                        : 'border-cyber-warning/30 bg-cyber-warning/5 text-cyber-warning'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[10px] uppercase mb-0.5">{alert.threat_level} ALERT - {alert.timestamp}</p>
                      <p className="text-gray-300">{alert.reason}</p>
                    </div>
                    <span className="text-[10px] bg-black/40 border border-cyber-border/30 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                      {alert.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
