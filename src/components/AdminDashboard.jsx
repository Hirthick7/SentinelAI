import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  ShieldAlert, Activity, Users, AlertTriangle, Download, 
  Check, FileText, FilterX, HelpCircle, ShieldAlert as AlertIcon,
  RefreshCw, TrendingUp, Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

const COLORS = ['#00f0ff', '#bd00ff', '#ff0055', '#ffaa00', '#00ff66', '#00a8ff'];

const AdminDashboard = ({ 
  employees, 
  logs, 
  alerts, 
  incidents, 
  onResolveAlert, 
  onUpdateIncidentStatus,
  onResetDb,
  onUnlockEmployee
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, alerts, incidents, employees

  // Filter metrics based on selected employee
  const filteredEmployees = selectedEmployeeId 
    ? employees.filter(e => e.id === selectedEmployeeId) 
    : employees;

  const filteredLogs = selectedEmployeeId 
    ? logs.filter(l => l.employee_id === selectedEmployeeId) 
    : logs;

  const filteredAlerts = selectedEmployeeId 
    ? alerts.filter(a => a.employee_id === selectedEmployeeId) 
    : alerts;

  const filteredIncidents = selectedEmployeeId 
    ? incidents.filter(i => i.employee_id === selectedEmployeeId) 
    : incidents;

  // 1. Metric Calculations
  const totalAlerts = alerts.filter(a => a.status === 'Active').length;
  const criticalThreats = employees.filter(e => e.risk_score > 80).length;
  const avgRiskScore = employees.length > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + curr.risk_score, 0) / employees.length) 
    : 0;

  // Selected employee gauge data
  const mainEmployee = selectedEmployeeId 
    ? employees.find(e => e.id === selectedEmployeeId) 
    : employees.reduce((max, emp) => (emp.risk_score > (max?.risk_score || 0) ? emp : max), null);

  const activeRiskScore = mainEmployee ? mainEmployee.risk_score : avgRiskScore;
  const activeRiskName = mainEmployee ? mainEmployee.name : "System Average";

  const getRiskColor = (score) => {
    if (score <= 30) return '#00ff66'; // Success green
    if (score <= 60) return '#ffaa00'; // Warning orange
    if (score <= 80) return '#ff5500'; // High Orange-Red
    return '#ff0055'; // Critical neon red/pink
  };

  const getRiskClass = (score) => {
    if (score <= 30) return 'text-cyber-success bg-cyber-success/10 border-cyber-success/30';
    if (score <= 60) return 'text-cyber-warning bg-cyber-warning/10 border-cyber-warning/30';
    if (score <= 80) return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    return 'text-cyber-danger bg-cyber-danger/10 border-cyber-danger/30 critical-pulse border';
  };

  const getRiskLabel = (score) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    if (score <= 80) return 'High';
    return 'Critical';
  };

  // 2. Chart Telemetry Data Preps
  // Chart A: Risky Employees
  const riskyEmployeesData = employees
    .map(e => ({ name: e.name, score: e.risk_score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Chart B: Common attacks/activities
  const activityCounts = logs.reduce((acc, curr) => {
    const act = curr.activity;
    acc[act] = (acc[act] || 0) + 1;
    return acc;
  }, {});
  const commonAttacksData = Object.keys(activityCounts).map(key => ({
    name: key,
    value: activityCounts[key]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  // Chart C: Department incidents (incidents count or alert counts by department)
  const deptIncidents = incidents.reduce((acc, curr) => {
    const dept = curr.department || 'Retail Banking';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const deptIncidentsData = Object.keys(deptIncidents).map(key => ({
    subject: key,
    A: deptIncidents[key],
    fullMark: Math.max(...Object.values(deptIncidents), 1) + 2
  }));

  // Chart D: Timeline of threat distribution (recent risk scores logs)
  const timelineData = [...logs]
    .reverse()
    .slice(-10)
    .map(log => ({
      time: log.timestamp ? log.timestamp.split(' ')[1] : '',
      score: log.risk_score_after,
      employee: log.employee_name
    }));

  // SVG circular properties
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeRiskScore / 100) * circumference;

  // PDF Download Handler
  const downloadPDFReport = (incident) => {
    const doc = new jsPDF();
    
    // Modern Dark Headers
    doc.setFillColor(6, 9, 19); // #060913
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(0, 240, 255); // neon cyan
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SENTINEL AI", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PRIVILEGED INCIDENT DETECTION SUMMARY", 15, 30);
    doc.text(`REPORT NO: INC-${incident.id}-${new Date().getFullYear()}`, 145, 20);
    doc.text(`GENERATED: ${new Date().toLocaleString()}`, 145, 26);

    // Section header
    doc.setTextColor(13, 19, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INCIDENT DOSSIER", 15, 55);
    
    // Draw table border line
    doc.setDrawColor(31, 45, 84); // #1f2d54
    doc.line(15, 58, 195, 58);

    // Metadata Grid
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Name:", 15, 68);
    doc.text("Department:", 15, 76);
    doc.text("Assigned Role:", 15, 84);
    doc.text("Trigger Event:", 15, 92);
    doc.text("Activity Timestamp:", 15, 100);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(incident.employee_name || 'N/A', 55, 68);
    doc.text(incident.department || 'N/A', 55, 76);
    doc.text(incident.role || 'N/A', 55, 84);
    doc.text(incident.action_performed || 'N/A', 55, 92);
    doc.text(incident.timestamp || 'N/A', 55, 100);

    // Telemetry Box
    doc.setFillColor(245, 247, 250);
    doc.rect(130, 62, 65, 42, 'F');
    doc.setDrawColor(220, 225, 235);
    doc.rect(130, 62, 65, 42, 'D');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(13, 19, 38);
    doc.text("THREAT TELEMETRY", 135, 68);
    
    doc.setFontSize(9);
    doc.text("RISK SCORE:", 135, 78);
    doc.text("THREAT LEVEL:", 135, 86);
    doc.text("INCIDENT STATUS:", 135, 94);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    
    // Risk score coloring logic
    const scoreColor = incident.risk_score > 80 ? [255, 0, 85] : incident.risk_score > 60 ? [255, 170, 0] : [0, 255, 102];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${incident.risk_score} / 100`, 168, 78);
    doc.text(incident.threat_level || 'N/A', 168, 86);
    
    doc.setTextColor(0, 168, 255);
    doc.text(incident.status || 'N/A', 172, 94);

    // AI Analysis Block
    doc.setTextColor(13, 19, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AI ENGINE EXPLANATION", 15, 118);
    doc.line(15, 121, 195, 121);

    // Dynamic wrapped text for explanation
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitExplanation = doc.splitTextToSize(incident.ai_explanation || 'No explanation generated.', 175);
    doc.setFillColor(252, 240, 243);
    doc.rect(15, 126, 180, (splitExplanation.length * 5) + 6, 'F');
    doc.setDrawColor(255, 0, 85, 0.2);
    doc.rect(15, 126, 180, (splitExplanation.length * 5) + 6, 'D');
    doc.text(splitExplanation, 18, 131);

    // Recommended Mitigation Action
    const yPosNext = 136 + (splitExplanation.length * 5) + 6;
    doc.setTextColor(13, 19, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RECOMMENDED MITIGATION PROTOCOL", 15, yPosNext);
    doc.line(15, yPosNext + 3, 195, yPosNext + 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const splitAction = doc.splitTextToSize(incident.recommended_action || 'N/A', 175);
    doc.text(splitAction, 15, yPosNext + 10);

    // Sign-off
    const yPosSign = yPosNext + 40;
    doc.line(15, yPosSign, 85, yPosSign);
    doc.line(125, yPosSign, 195, yPosSign);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("AUTHORIZED SECURITY OFFICER", 23, yPosSign + 5);
    doc.text("BANK COMPLIANCE DIRECTOR", 135, yPosSign + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This document is generated by SentinelAI Cyber Incident Engine. Confidential - Internal Bank Use Only.", 42, 280);

    doc.save(`Sentinel_Incident_Report_${incident.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Filter Alert Banner */}
      {selectedEmployeeId && (
        <div className="bg-cyber-info/10 border border-cyber-info/30 p-3.5 rounded-lg flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-cyber-primary">
            <Users className="h-4.5 w-4.5" />
            <span>Telemetry view filtered to employee: <strong>{employees.find(e => e.id === selectedEmployeeId)?.name}</strong></span>
          </div>
          <button 
            onClick={() => setSelectedEmployeeId(null)}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyber-info/20 hover:bg-cyber-info/40 border border-cyber-info/40 rounded transition-all text-cyber-primary"
          >
            <FilterX className="h-3.5 w-3.5" /> Clear Filter
          </button>
        </div>
      )}

      {/* 2. Top Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 flex items-center gap-4 hover:border-cyber-primary/40 transition-all">
          <div className="p-3 rounded-lg bg-cyber-primary/10 border border-cyber-primary/20 text-cyber-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-mono">System Avg Risk</p>
            <p className="text-2xl font-bold text-cyber-primary mt-1 font-mono">{avgRiskScore}/100</p>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 flex items-center gap-4 hover:border-cyber-danger/40 transition-all">
          <div className="p-3 rounded-lg bg-cyber-danger/10 border border-cyber-danger/25 text-cyber-danger">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-mono">Active Alerts</p>
            <p className="text-2xl font-bold text-cyber-danger mt-1 font-mono">{totalAlerts}</p>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 flex items-center gap-4 hover:border-cyber-warning/40 transition-all">
          <div className="p-3 rounded-lg bg-cyber-warning/10 border border-cyber-warning/20 text-cyber-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-mono">Critical Threats</p>
            <p className="text-2xl font-bold text-cyber-warning mt-1 font-mono">{criticalThreats}</p>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 flex items-center gap-4 hover:border-cyber-success/40 transition-all">
          <div className="p-3 rounded-lg bg-cyber-success/10 border border-cyber-success/20 text-cyber-success">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-mono">Monitored Personnel</p>
            <p className="text-2xl font-bold text-cyber-success mt-1 font-mono">{employees.length}</p>
          </div>
        </div>
      </div>

      {/* 3. Primary Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Risk Meter Gauge */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-6 text-center self-start w-full flex justify-between">
            <span>Risk Assessment Gauge</span>
            <span className="text-cyber-primary">{activeRiskName}</span>
          </h3>

          <div className="relative flex items-center justify-center">
            {/* SVG Circular Ring */}
            <svg className="w-44 h-44 transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-cyber-border/40"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="transition-all duration-500 ease-out"
                stroke={getRiskColor(activeRiskScore)}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 5px ${getRiskColor(activeRiskScore)}80)`
                }}
              />
            </svg>
            
            {/* Score inside circular gauge */}
            <div className="absolute text-center flex flex-col justify-center items-center font-mono">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: getRiskColor(activeRiskScore) }}>
                {activeRiskScore}
              </span>
              <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-widest mt-1">Score</span>
            </div>
          </div>

          <div className="mt-6 text-center w-full">
            {mainEmployee && (mainEmployee.status === 'Flagged' || mainEmployee.risk_score >= 100) ? (
              <div className="space-y-3">
                <div className="px-4 py-1.5 rounded-full text-xs font-mono font-bold border text-cyber-danger border-cyber-danger bg-cyber-danger/10 animate-pulse flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> OPERATOR LOCKED OUT
                </div>
                <div className="bg-black/30 border border-cyber-danger/20 p-2.5 rounded text-[10px] text-gray-400 text-left space-y-1 font-mono">
                  <p><span className="text-gray-500">Lock Time:</span> {mainEmployee.lock_time || 'N/A'}</p>
                  <p><span className="text-gray-500">IP / Loc:</span> {mainEmployee.ip_address} ({mainEmployee.last_location})</p>
                  <p className="line-clamp-2"><span className="text-gray-500">Reason:</span> {mainEmployee.lock_reason || 'Insider threat baseline exceeded.'}</p>
                </div>
                <button 
                  onClick={() => onUnlockEmployee(mainEmployee.id)}
                  className="w-full py-1.5 bg-cyber-success hover:bg-cyber-success/80 text-cyber-bg font-extrabold rounded text-[10px] tracking-wider transition-all"
                >
                  UNLOCK OPERATOR
                </button>
              </div>
            ) : (
              <>
                <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border ${getRiskClass(activeRiskScore)}`}>
                  Threat Level: {getRiskLabel(activeRiskScore)}
                </span>
                <p className="text-gray-500 text-[10px] mt-4 font-mono">
                  Dynamically derived from anomalies, location shifts, off-hours execution, and volume profiles.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-5 xl:col-span-2 flex flex-col h-[380px]">
          <h3 className="text-gray-100 text-sm font-bold font-mono border-b border-cyber-border pb-3 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="text-cyber-primary h-4.5 w-4.5 animate-pulse" />
              Live activity stream
            </span>
            <span className="text-xs text-gray-500 font-normal">No page refresh</span>
          </h3>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-600 italic font-mono">
                NO ACTIONS REGISTERED FOR THE SELECTED QUERY.
              </div>
            ) : (
              filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className="bg-cyber-bg/60 border border-cyber-border/40 p-2.5 rounded flex items-center justify-between text-xs font-mono hover:border-cyber-border transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-[10px]">{log.timestamp?.split(' ')[1] || log.timestamp}</span>
                    <div>
                      <span className="text-cyber-primary font-semibold hover:underline cursor-pointer" onClick={() => setSelectedEmployeeId(log.employee_id)}>
                        {log.employee_name}
                      </span>
                      <span className="text-gray-400 mx-1.5">→</span>
                      <span className="text-gray-300 font-medium">{log.activity}</span>
                      <p className="text-gray-500 text-[10px] mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[10px] text-gray-500">{log.location}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskClass(log.risk_score_after)}`}>
                      {log.risk_score_after} pts
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Active Alerts & Navigation Tab bar */}
      <div className="bg-cyber-card border border-cyber-border rounded-lg p-5">
        <div className="border-b border-cyber-border flex flex-wrap gap-2 mb-4 font-mono text-xs">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2.5 border-b-2 font-bold tracking-wider transition-all ${activeTab === 'overview' ? 'border-cyber-primary text-cyber-primary' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            ANALYTICS & METRICS
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 px-2.5 border-b-2 font-bold tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'alerts' ? 'border-cyber-danger text-cyber-danger' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            ACTIVE ALERTS ({totalAlerts})
          </button>
          <button 
            onClick={() => setActiveTab('incidents')}
            className={`pb-3 px-2.5 border-b-2 font-bold tracking-wider transition-all ${activeTab === 'incidents' ? 'border-cyber-warning text-cyber-warning' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            INCIDENT REPORT CENTER ({filteredIncidents.length})
          </button>
          <button 
            onClick={() => setActiveTab('employees')}
            className={`pb-3 px-2.5 border-b-2 font-bold tracking-wider transition-all ${activeTab === 'employees' ? 'border-cyber-success text-cyber-success' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            EMPLOYEE DIRECTORY
          </button>
        </div>

        {/* Tab 1: Analytics Dashboard */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Risk Distribution Chart */}
            <div className="bg-cyber-bg/30 border border-cyber-border/40 p-4 rounded-lg">
              <h4 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Riskiest Employees</span>
                <TrendingUp className="h-4 w-4 text-cyber-danger" />
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskyEmployeesData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d54" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1326', borderColor: '#1f2d54', borderRadius: '4px' }}
                      labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#ff0055', fontFamily: 'monospace' }}
                    />
                    <Bar dataKey="score" fill="#ff0055" radius={[4, 4, 0, 0]}>
                      {riskyEmployeesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attack Vectors Pie Chart */}
            <div className="bg-cyber-bg/30 border border-cyber-border/40 p-4 rounded-lg">
              <h4 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">Top Action Anomalies</h4>
              <div className="h-56 flex items-center justify-center">
                {commonAttacksData.length === 0 ? (
                  <p className="text-xs text-gray-500 italic font-mono">Insufficient logs to generate distribution.</p>
                ) : (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={commonAttacksData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {commonAttacksData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0d1326', borderColor: '#1f2d54', borderRadius: '4px' }}
                            itemStyle={{ color: '#00f0ff', fontFamily: 'monospace', fontSize: 11 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5 font-mono text-[10px] text-gray-400 w-1/2">
                      {commonAttacksData.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="truncate max-w-[120px]">{entry.name}</span>
                          <span className="text-cyber-primary ml-auto">({entry.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Threat Timeline */}
            <div className="bg-cyber-bg/30 border border-cyber-border/40 p-4 rounded-lg">
              <h4 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">Real-Time Threat timeline</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d54" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1326', borderColor: '#1f2d54', borderRadius: '4px' }}
                      labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#00f0ff', fontFamily: 'monospace' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#00f0ff" fillOpacity={1} fill="url(#scoreGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Wise Incidents */}
            <div className="bg-cyber-bg/30 border border-cyber-border/40 p-4 rounded-lg">
              <h4 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-4">Department Incident Distribution</h4>
              <div className="h-56 flex items-center justify-center">
                {deptIncidentsData.length === 0 ? (
                  <p className="text-xs text-gray-500 italic font-mono">No incidents generated to map departments.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="70%" data={deptIncidentsData}>
                      <PolarGrid stroke="#1f2d54" />
                      <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={8} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#6b7280" fontSize={8} />
                      <Radar name="Incidents" dataKey="A" stroke="#bd00ff" fill="#bd00ff" fillOpacity={0.4} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d1326', borderColor: '#1f2d54', borderRadius: '4px' }}
                        itemStyle={{ color: '#bd00ff', fontFamily: 'monospace' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Active Alerts list */}
        {activeTab === 'alerts' && (
          <div className="space-y-4 pt-2 font-mono">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 italic border border-dashed border-cyber-border rounded">
                NO ACTIVE SECURITY ALERTS REGISTERED.
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    alert.status === 'Resolved' 
                      ? 'border-cyber-border/40 bg-cyber-bg/20 opacity-60' 
                      : alert.threat_level === 'Critical' 
                      ? 'border-cyber-danger bg-cyber-danger/5 border-l-4'
                      : alert.threat_level === 'High' 
                      ? 'border-orange-500 bg-orange-500/5 border-l-4'
                      : 'border-cyber-warning bg-cyber-warning/5 border-l-4'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRiskClass(alert.threat_level === 'Critical' ? 95 : alert.threat_level === 'High' ? 75 : 45)}`}>
                        {alert.threat_level} ALERT
                      </span>
                      <span className="text-gray-400 font-semibold text-xs hover:underline cursor-pointer" onClick={() => setSelectedEmployeeId(alert.employee_id)}>
                        {alert.employee_name}
                      </span>
                      <span className="text-gray-600 text-[10px]">{alert.timestamp}</span>
                    </div>
                    <p className="text-gray-200 text-xs font-semibold">{alert.reason}</p>
                    <p className="text-cyber-primary/70 text-[10px] leading-relaxed"><strong className="text-cyber-primary">Mitigation Protocol:</strong> {alert.recommended_action}</p>
                  </div>
                  
                  {alert.status === 'Active' ? (
                    <button 
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-4 py-2 bg-cyber-success hover:bg-cyber-success/80 border-transparent hover:shadow-glow-success text-cyber-bg font-bold rounded text-xs flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0"
                    >
                      <Check className="h-4 w-4 stroke-[3]" /> RESOLVE ALERT
                    </button>
                  ) : (
                    <span className="text-cyber-success/60 text-xs font-bold flex items-center gap-1 shrink-0 bg-cyber-success/10 px-2.5 py-1 rounded border border-cyber-success/30">
                      <Check className="h-3.5 w-3.5" /> RESOLVED
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Incidents Table and PDF Exporter */}
        {activeTab === 'incidents' && (
          <div className="space-y-4 pt-2 font-mono">
            {filteredIncidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 italic border border-dashed border-cyber-border rounded">
                NO AUDITABLE CYBER INCIDENTS GENERATED.
              </div>
            ) : (
              <div className="overflow-x-auto border border-cyber-border rounded">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cyber-bg/80 border-b border-cyber-border text-gray-400">
                      <th className="p-3">Incident ID</th>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Trigger Action</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">Threat Level</th>
                      <th className="p-3">Incident Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/40">
                    {filteredIncidents.map(inc => (
                      <React.Fragment key={inc.id}>
                        <tr className="hover:bg-cyber-bg/40">
                          <td className="p-3 font-semibold text-cyber-primary">INC-00{inc.id}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-semibold text-gray-200 hover:underline cursor-pointer" onClick={() => setSelectedEmployeeId(inc.employee_id)}>
                                {inc.employee_name}
                              </p>
                              <p className="text-[10px] text-gray-500">{inc.role} ({inc.department})</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">{inc.action_performed}</td>
                          <td className="p-3 text-gray-500">{inc.timestamp}</td>
                          <td className="p-3 text-cyber-danger font-bold text-sm">{inc.risk_score}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskClass(inc.risk_score)}`}>
                              {inc.threat_level}
                            </span>
                          </td>
                          <td className="p-3">
                            <select 
                              value={inc.status} 
                              onChange={(e) => onUpdateIncidentStatus(inc.id, e.target.value)}
                              className="bg-cyber-bg border border-cyber-border text-xs rounded px-2 py-1 focus:outline-none cursor-pointer text-cyber-info"
                            >
                              <option value="New">New</option>
                              <option value="Investigating">Investigating</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => downloadPDFReport(inc)}
                              className="px-3 py-1.5 bg-cyber-primary/10 hover:bg-cyber-primary/20 border border-cyber-primary/30 text-cyber-primary rounded flex items-center gap-1.5 text-[10px] font-bold ml-auto transition-all"
                            >
                              <Download className="h-3 w-3" /> EXPORT PDF
                            </button>
                          </td>
                        </tr>
                        {/* Expanded details row for AI Explanation */}
                        <tr>
                          <td colSpan="8" className="bg-[#090d18] p-3 text-[11px] leading-relaxed border-b border-cyber-border/40">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                              <div className="md:col-span-8 border-l border-cyber-danger/30 pl-3">
                                <span className="text-cyber-danger/80 font-bold block mb-1">AI INSIDER THREAT ASSESSMENT:</span>
                                <p className="text-gray-400 italic">"{inc.ai_explanation}"</p>
                              </div>
                              <div className="md:col-span-4 border-l border-cyber-border/40 pl-3">
                                <span className="text-cyber-primary font-bold block mb-1">RECOMMENDED ACTION:</span>
                                <p className="text-gray-500 text-[10px]">{inc.recommended_action}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Employee Directory list */}
        {activeTab === 'employees' && (
          <div className="space-y-4 pt-2 font-mono">
            {/* Locked Operators Alert Section */}
            {employees.some(emp => emp.status === 'Flagged' || emp.risk_score >= 100) && (
              <div className="border border-cyber-danger bg-cyber-danger/5 rounded-lg p-4 space-y-4 mb-4">
                <div className="flex items-center gap-2 border-b border-cyber-danger/20 pb-2 text-cyber-danger font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="h-4.5 w-4.5 animate-pulse" />
                  <span>Critical Lockout Alerts: Action Required ({employees.filter(emp => emp.status === 'Flagged' || emp.risk_score >= 100).length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.filter(emp => emp.status === 'Flagged' || emp.risk_score >= 100).map(emp => (
                    <div key={emp.id} className="bg-black/40 border border-cyber-danger/30 rounded p-3 text-xs space-y-2 relative font-mono">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-100 font-extrabold text-sm">{emp.name}</p>
                          <p className="text-gray-500 text-[10px]">ID: {emp.employee_id} | {emp.role} ({emp.department})</p>
                        </div>
                        <span className="bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/40 px-2 py-0.5 rounded font-black text-[10px]">
                          {emp.risk_score}/100 RISK
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] border-t border-cyber-border/20 pt-2 text-gray-400">
                        <p><span className="text-gray-500">Location:</span> {emp.last_location}</p>
                        <p><span className="text-gray-500">IP Address:</span> {emp.ip_address}</p>
                        <p><span className="text-gray-500">Time Locked:</span> {emp.lock_time || 'N/A'}</p>
                        <p><span className="text-gray-500">Device/OS:</span> {emp.device_name} ({emp.operating_system})</p>
                      </div>

                      <div className="bg-cyber-danger/10 border-l border-cyber-danger p-2 text-gray-300 italic text-[10px]">
                        <strong className="text-cyber-danger uppercase font-bold">Lockout Reason:</strong> {emp.lock_reason || "Critical Insider Threat metrics breached."}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => onUnlockEmployee(emp.id)}
                          className="px-3 py-1 bg-cyber-success hover:bg-cyber-success/80 text-cyber-bg font-extrabold rounded text-[10px] tracking-wider transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                        >
                          UNLOCK OPERATOR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-cyber-border rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cyber-bg/80 border-b border-cyber-border text-gray-400">
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">System Status</th>
                    <th className="p-3">Current Risk</th>
                    <th className="p-3">Last Active Action</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/40">
                  {filteredEmployees.map(emp => {
                    const isLocked = emp.status === 'Flagged' || emp.risk_score >= 100;
                    return (
                      <tr key={emp.id} className="hover:bg-cyber-bg/40">
                        <td className="p-3 font-semibold text-gray-200">
                          <div className="flex items-center gap-1.5">
                            {isLocked && <Lock className="h-3.5 w-3.5 text-cyber-danger animate-pulse" />}
                            <span>{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-400">{emp.department}</td>
                        <td className="p-3 text-gray-400">{emp.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLocked 
                              ? 'text-cyber-danger bg-cyber-danger/10 border border-cyber-danger/25' 
                              : 'text-cyber-success bg-cyber-success/10 border border-cyber-success/20'
                          }`}>
                            {isLocked ? 'Locked / Flagged' : emp.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-sm" style={{ color: getRiskColor(emp.risk_score) }}>
                          {emp.risk_score}
                        </td>
                        <td className="p-3 text-gray-500 max-w-[200px] truncate">{emp.last_activity || 'N/A'}</td>
                        <td className="p-3 text-right space-x-2">
                          <button 
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className="px-2.5 py-1 bg-cyber-primary/10 hover:bg-cyber-primary/30 border border-cyber-primary/30 text-cyber-primary rounded text-[10px] transition-all font-semibold"
                          >
                            Analyse Telemetry
                          </button>
                          {isLocked && (
                            <button 
                              onClick={() => onUnlockEmployee(emp.id)}
                              className="px-2.5 py-1 bg-cyber-success hover:bg-cyber-success/80 border-transparent text-cyber-bg rounded text-[10px] font-bold transition-all"
                            >
                              Unlock Operator
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. System Administration Control Footer */}
      <div className="bg-[#0b1021]/30 border border-cyber-border/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-gray-500 gap-3">
        <span>SentinelAI Engine Version: <strong>v2.8.6-beta</strong> | Database: <strong>SQLite v3</strong></span>
        <button 
          onClick={onResetDb}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-danger/10 hover:bg-cyber-danger/30 border border-cyber-danger/30 rounded text-cyber-danger font-bold transition-all"
        >
          <RefreshCw className="h-3 w-3" /> RESET SYSTEM DATABASE
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
