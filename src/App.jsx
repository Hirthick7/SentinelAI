import React, { useState, useEffect } from 'react';
import { Shield, Users, Terminal, RefreshCw, Radio, HardDrive, ShieldAlert, Cpu } from 'lucide-react';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import AttackSimulator from './components/AttackSimulator';

function App() {
  const [role, setRole] = useState('admin'); // admin or employee
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [systemOnline, setSystemOnline] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [empRes, logRes, alertRes, incRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/logs'),
        fetch('/api/alerts'),
        fetch('/api/incidents')
      ]);

      const [empData, logData, alertData, incData] = await Promise.all([
        empRes.json(),
        logRes.json(),
        alertRes.json(),
        incRes.json()
      ]);

      setEmployees(empData);
      setLogs(logData);
      setAlerts(alertData);
      setIncidents(incData);
      setSystemOnline(true);
    } catch (err) {
      console.error("Error connecting to threat API server:", err);
      setSystemOnline(false);
    }
  };

  // High frequency polling for live updates (1500ms)
  useEffect(() => {
    fetchDashboardData();
    let interval;
    if (pollingActive) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [pollingActive]);

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/resolve/${alertId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const res = await fetch(`/api/incidents/update-status/${incidentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlockEmployee = async (employeeId) => {
    try {
      const res = await fetch(`/api/employees/unlock/${employeeId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert("Employee account successfully unlocked.");
        fetchDashboardData();
      } else {
        alert(data.error || "Failed to unlock employee.");
      }
    } catch (e) {
      alert("Failed to connect to API server.");
    }
  };

  const handleResetDb = async () => {
    if (!window.confirm("Are you sure you want to restore the threat database back to baseline stats?")) {
      return;
    }
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert("Database successfully reset.");
        fetchDashboardData();
      }
    } catch (e) {
      alert("Failed to reset database.");
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 tech-grid relative">
      {/* CRT Visual Scanline Overlay for Cyber Vibe */}
      <div className="absolute inset-0 radial-glow pointer-events-none z-0"></div>

      {/* Main Grid Header */}
      <header className="border-b border-cyber-border/70 bg-[#060913]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="text-cyber-primary h-7 w-7 animate-pulse-slow" />
              <div className="absolute inset-0 text-cyber-primary filter blur-[4px] h-7 w-7 opacity-75">
                <Shield />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-gray-100 font-extrabold tracking-widest text-base font-mono">SENTINEL<span className="text-cyber-primary">AI</span></h1>
                <span className="text-[9px] bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/30 px-1 rounded font-bold font-mono uppercase tracking-wider">DEFENSE ACTIVE</span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">INSIDER THREAT RADAR & AUDITING SYSTEMS</p>
            </div>
          </div>

          {/* Toggle Swapper */}
          <div className="flex items-center gap-2 border border-cyber-border rounded-lg p-1 bg-[#0d1326]/60">
            <button
              onClick={() => setRole('employee')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-mono text-xs font-bold transition-all ${
                role === 'employee'
                  ? 'bg-cyber-primary text-cyber-bg shadow-glow-cyan'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Terminal className="h-4 w-4" /> Employee Panel
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-mono text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-cyber-primary text-cyber-bg shadow-glow-cyan'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldAlert className="h-4 w-4" /> Security Admin
            </button>
          </div>

          {/* Connection health */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Radio className={`h-4.5 w-4.5 ${systemOnline ? 'text-cyber-success animate-pulse' : 'text-cyber-danger'}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {systemOnline ? 'SERVER SYNCED' : 'OFFLINE ERROR'}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10 space-y-6">
        
        {role === 'employee' ? (
          <div className="grid grid-cols-1 gap-6">
            <section className="space-y-2">
              <h2 className="text-xl font-bold font-mono tracking-wide text-gray-100 flex items-center gap-2">
                <Terminal className="text-cyber-primary h-5 w-5" /> Employee Mainframe Terminal
              </h2>
              <p className="text-gray-400 text-xs font-mono">
                Simulates day-to-day transaction records, permission states, and storage accesses in Aegis Bank.
              </p>
            </section>
            
            <EmployeeDashboard 
              employees={employees.filter(e => e.role !== 'Security Admin')} 
              logs={logs}
              onActionSuccess={fetchDashboardData} 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Admin Left Panel - Stats & Directory */}
            <div className="lg:col-span-8 space-y-6">
              <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-3">
                <div>
                  <h2 className="text-xl font-bold font-mono tracking-wide text-gray-100 flex items-center gap-2">
                    <ShieldAlert className="text-cyber-danger h-5 w-5 animate-pulse" /> Security Center Command Console
                  </h2>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">
                    Live system monitors privileged data extracts, structural purges, and off-hour alerts.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-500 text-[10px]">Real-Time Streaming:</span>
                  <button 
                    onClick={() => setPollingActive(!pollingActive)}
                    className={`px-2 py-1 border rounded text-[10px] uppercase font-bold transition-all ${
                      pollingActive 
                        ? 'border-cyber-success/40 bg-cyber-success/15 text-cyber-success'
                        : 'border-cyber-border bg-cyber-card text-gray-500'
                    }`}
                  >
                    {pollingActive ? 'Enabled' : 'Paused'}
                  </button>
                </div>
              </section>

              <AdminDashboard 
                employees={employees}
                logs={logs}
                alerts={alerts}
                incidents={incidents}
                onResolveAlert={handleResolveAlert}
                onUpdateIncidentStatus={handleUpdateIncidentStatus}
                onResetDb={handleResetDb}
                onUnlockEmployee={handleUnlockEmployee}
              />
            </div>

            {/* Admin Right Panel - Active Threat Attack Simulator */}
            <div className="lg:col-span-4 space-y-6">
              <section className="border-b border-cyber-border pb-3">
                <h2 className="text-lg font-bold font-mono tracking-wide text-gray-100 flex items-center gap-2">
                  <Cpu className="text-cyber-warning h-5 w-5" /> Threat Simulation
                </h2>
                <p className="text-gray-400 text-[10px] font-mono mt-0.5">
                  Launch sandboxed cyber anomalies to stress-test detection rules.
                </p>
              </section>

              <AttackSimulator 
                employees={employees.filter(e => e.role !== 'Security Admin')} 
                onSimulationUpdate={fetchDashboardData}
              />
            </div>

          </div>
        )}
      </main>

      {/* Floating System Bar */}
      <footer className="border-t border-cyber-border bg-[#060913]/90 py-4 font-mono text-[10px] text-gray-500 text-center relative z-10">
        <p>&copy; {new Date().getFullYear()} Aegis SentinelAI Banking Security Systems. ALL PRIVILEGED ACTIONS ARE MONITORED.</p>
      </footer>
    </div>
  );
}

export default App;
