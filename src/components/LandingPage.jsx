import React from 'react';
import { Shield, Terminal, ShieldAlert } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 relative">
      <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
        
        {/* Brand Banner */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="text-cyber-primary h-16 w-16 animate-pulse-slow" />
              <div className="absolute inset-0 text-cyber-primary filter blur-[8px] h-16 w-16 opacity-75">
                <Shield />
              </div>
            </div>
          </div>
          <div className="inline-block">
            <h1 className="text-gray-100 font-black tracking-widest text-4xl font-mono">
              SENTINEL<span className="text-cyber-primary">AI</span>
            </h1>
            <span className="text-[10px] bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 px-2 py-0.5 rounded font-bold font-mono tracking-widest uppercase block mt-1">
              INSIDER THREAT DETECTOR
            </span>
          </div>
          <p className="text-gray-400 max-w-lg mx-auto text-xs font-mono tracking-wide leading-relaxed">
            Autonomous threat engine utilizing real-time anomaly detection, heuristic behavioral scoring, and machine learning models to safeguard Aegis Bank infrastructure.
          </p>
        </div>

        {/* Option Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          
          {/* Card 1: Employee Workstation */}
          <div 
            onClick={() => onNavigate('/login')}
            className="group bg-cyber-card border border-cyber-border hover:border-cyber-primary/60 p-8 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-glow-cyan hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-primary/5 rounded-full filter blur-xl transition-all group-hover:bg-cyber-primary/10"></div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-cyber-primary/10 rounded-lg border border-cyber-primary/20 text-cyber-primary transition-all group-hover:scale-110">
                <Terminal className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-gray-100 text-lg font-bold font-mono tracking-wider group-hover:text-cyber-primary transition-colors">EMPLOYEE MAIN WORKSPACE</h3>
                <p className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Operator Workstation Portal</p>
              </div>
              <p className="text-gray-400 text-xs font-mono leading-relaxed pt-2">
                Simulate transactional operations, database queries, device connections, and workstation operations.
              </p>
              <div className="pt-4">
                <span className="text-[10px] text-cyber-primary border border-cyber-primary/30 group-hover:bg-cyber-primary group-hover:text-cyber-bg px-4 py-1.5 rounded font-mono font-bold tracking-widest uppercase transition-all">
                  ENTER PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Security Administrator Console */}
          <div 
            onClick={() => onNavigate('/admin')}
            className="group bg-cyber-card border border-cyber-border hover:border-cyber-danger/60 p-8 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-glow-danger hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-danger/5 rounded-full filter blur-xl transition-all group-hover:bg-cyber-danger/10"></div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-cyber-danger/10 rounded-lg border border-cyber-danger/20 text-cyber-danger transition-all group-hover:scale-110">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-gray-100 text-lg font-bold font-mono tracking-wider group-hover:text-cyber-danger transition-colors">SECURITY ADMIN CENTER</h3>
                <p className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">SOC Telemetry Console</p>
              </div>
              <p className="text-gray-400 text-xs font-mono leading-relaxed pt-2">
                Monitor system metrics, review AI generated threat alerts, audit incidents, export compliance reports, and manage operator status.
              </p>
              <div className="pt-4">
                <span className="text-[10px] text-cyber-danger border border-cyber-danger/30 group-hover:bg-cyber-danger group-hover:text-white px-4 py-1.5 rounded font-mono font-bold tracking-widest uppercase transition-all">
                  LAUNCH CONSOLE
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Global Security Warning */}
        <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase pt-6">
          🔐 SECURE NETWORK INTERFACE // AUTHORIZED PERSONNEL ACCESS ONLY // PROTOCOL AEGIS-256
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
