import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Play, AlertCircle, CheckCircle2, RefreshCw, Terminal } from 'lucide-react';

const AttackSimulator = ({ employees, onSimulationUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [targetId, setTargetId] = useState('');
  const logContainerRef = useRef(null);

  // Set default target to John Doe if available, otherwise first employee
  useEffect(() => {
    if (employees && employees.length > 0) {
      const john = employees.find(e => e.name.toLowerCase().includes('john'));
      if (john) {
        setTargetId(john.id.toString());
      } else {
        setTargetId(employees[0].id.toString());
      }
    }
  }, [employees]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { time, text, type }]);
  };

  const runSimulation = async () => {
    if (!targetId) {
      alert("Please select a target employee for simulation.");
      return;
    }
    
    const targetEmp = employees.find(e => e.id === parseInt(targetId));
    if (!targetEmp) return;

    setIsRunning(true);
    setConsoleLogs([]);
    addLog(`[!] INITIALIZING INSIDER THREAT ATTACK VECTOR`, 'warning');
    addLog(`[i] TARGET: ${targetEmp.name} (Department: ${targetEmp.department}, Role: ${targetEmp.role})`, 'info');
    addLog(`[i] BASELINE RISK SCORE: 10/100`, 'info');
    
    // Define steps
    const steps = [
      {
        activity: 'Login',
        location: 'Chennai (VPN via Tor Network Node)',
        details: 'Login from unknown IP address outside operating hours',
        score: 35,
        logText: 'STAGE 1: Hijacking authentication keys. Simulating login from remote proxy...',
        is_late_night: true
      },
      {
        activity: 'View Customer Records',
        location: 'Chennai (VPN via Tor Network Node)',
        details: 'Unusual query scanning credit indices',
        score: 35,
        logText: 'STAGE 2: Establishing database connection. Querying credit tables...'
      },
      {
        activity: 'Download Customer Data',
        location: 'Chennai (VPN via Tor Network Node)',
        details: 'Mass download of 10,000 sensitive consumer profiles',
        score: 55,
        records_count: 10000,
        logText: 'STAGE 3: Extracting high-volume records. Downloading customer credit databases...'
      },
      {
        activity: 'Delete Customer Records',
        location: 'Chennai (VPN via Tor Network Node)',
        details: 'Deleted 100 active audit trails to hide traces',
        score: 80,
        records_count: 100,
        logText: 'STAGE 4: Disabling logs. Purging transaction tables to wipe forensics...'
      },
      {
        activity: 'Privilege Escalation',
        location: 'Chennai (VPN via Tor Network Node)',
        details: 'Unauthorized modification of LDAP Active Directory policies',
        score: 100,
        logText: 'STAGE 5: Injecting privilege escalation exploit. Granting Administrator privileges...'
      }
    ];

    // Reset target employee's risk score to 10 first to simulate exact progression
    try {
      addLog(`[i] Re-aligning risk score baseline...`, 'info');
      // Set to 10
      await fetch('/api/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: targetEmp.id,
          activity: 'Login',
          location: 'Office',
          details: 'Aligned simulation baseline',
          is_simulator: true,
          simulation_score: 10
        })
      });
      if (onSimulationUpdate) onSimulationUpdate();
    } catch (e) {
      addLog(`[-] Failed to reset baseline. Proceeding anyway.`, 'error');
    }

    // Step sequence with delays
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      addLog(step.logText, 'info');

      // Add a slight latency to simulate network load
      await new Promise(r => setTimeout(r, 2000));

      try {
        const res = await fetch('/api/simulate-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: targetEmp.id,
            activity: step.activity,
            location: step.location,
            details: step.details,
            records_count: step.records_count || 0,
            is_simulator: true,
            simulation_score: step.score,
            is_late_night: step.is_late_night || false
          })
        });
        const data = await res.json();
        
        if (data.success) {
          addLog(`[+] Success. Risk Score updated to: ${data.new_score}/100 [Level: ${data.threat_level}]`, 
                 data.new_score >= 80 ? 'critical' : data.new_score >= 60 ? 'error' : 'success');
          
          if (data.new_score >= 70) {
            addLog(`[CRITICAL] Automated Incident Report generated. Alert dispatched to security staff.`, 'critical');
          }
          
          if (onSimulationUpdate) onSimulationUpdate();
        } else {
          addLog(`[-] API rejected simulation step: ${data.error}`, 'error');
        }
      } catch (err) {
        addLog(`[-] Net connection failure. Simulation halted.`, 'error');
        break;
      }
    }

    setIsRunning(false);
    setCurrentStep(-1);
    addLog(`[!] ATTACK SIMULATION COMPLETE. TARGET PROFILE SECURED & FLAG LOCK INITIATED.`, 'warning');
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-cyber-danger h-5 w-5 animate-pulse" />
          <h2 className="text-gray-100 font-bold text-sm tracking-wider uppercase font-mono">Insider Threat Attack Simulator</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-mono">Target Subject:</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={isRunning}
            className="bg-cyber-bg border border-cyber-border text-xs text-cyber-primary rounded px-2 py-1 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 bg-cyber-bg rounded border border-cyber-border/40 font-mono text-xs mb-4">
        <p className="text-gray-400 leading-relaxed mb-3">
          Triggers a pre-programmed sequence mimicking an active insider adversary. Risk levels will escalate dynamically from <span className="text-cyber-success font-bold">10 (Low)</span> to <span className="text-cyber-danger font-bold">100 (Critical)</span>, instantly firing notifications and audit reports in real time.
        </p>

        {/* Visual Step Tracker */}
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] mb-2">
          {['Login (35)', 'Query (35)', 'Extract (55)', 'Purge (80)', 'Escalate (100)'].map((lbl, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <div 
                key={idx} 
                className={`py-1.5 rounded transition-all duration-300 border ${
                  isActive 
                    ? 'bg-cyber-danger/20 border-cyber-danger text-cyber-danger font-bold animate-pulse'
                    : isCompleted
                    ? 'bg-cyber-success/15 border-cyber-success/40 text-cyber-success'
                    : 'bg-cyber-card border-cyber-border text-gray-500'
                }`}
              >
                {lbl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Display */}
      <div 
        ref={logContainerRef}
        className="h-44 overflow-y-auto bg-black p-3.5 rounded border border-cyber-border/50 font-mono text-[11px] text-green-400 space-y-1.5 scroll-smooth mb-4 select-text relative"
      >
        {/* Subtle grid and scanning lines inside console */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
        
        {consoleLogs.length === 0 ? (
          <p className="text-gray-600 italic">SYSTEM READY. CLICK 'SIMULATE INSIDER ATTACK' TO START.</p>
        ) : (
          consoleLogs.map((log, index) => {
            let colorClass = 'text-green-400';
            if (log.type === 'warning') colorClass = 'text-cyber-warning font-bold';
            if (log.type === 'error') colorClass = 'text-cyber-danger';
            if (log.type === 'critical') colorClass = 'text-cyber-danger font-bold bg-cyber-danger/10 px-1 border-l-2 border-cyber-danger animate-pulse';
            if (log.type === 'success') colorClass = 'text-cyber-success';
            
            return (
              <div key={index} className="flex gap-2 items-start leading-tight">
                <span className="text-gray-600 font-bold shrink-0">[{log.time}]</span>
                <span className={colorClass}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Trigger button */}
      <button
        onClick={runSimulation}
        disabled={isRunning}
        className={`w-full py-2.5 rounded font-mono font-bold tracking-widest text-xs flex items-center justify-center gap-2 border transition-all duration-300 ${
          isRunning 
            ? 'bg-cyber-danger/10 border-cyber-danger/30 text-cyber-danger cursor-not-allowed'
            : 'bg-cyber-danger hover:bg-cyber-danger/80 border-transparent hover:shadow-glow-danger text-white'
        }`}
      >
        {isRunning ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin text-cyber-danger" />
            SIMULATING ATTACK VECTOR ACTIVE...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 fill-current" />
            SIMULATE INSIDER ATTACK
          </>
        )}
      </button>
    </div>
  );
};

export default AttackSimulator;
