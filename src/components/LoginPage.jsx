import React, { useState } from 'react';
import { Shield, Key, MapPin, Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ employees, onLogin, onNavigate }) => {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState('Chennai Head Office');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setError('Please select an Operator ID.');
      return;
    }
    if (!password) {
      setError('Please enter your workstation password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: parseInt(selectedEmpId),
          activity: 'Login',
          location: location,
          details: `Authenticate workstation session from ${location}`,
          records_count: 0,
          is_late_night: false
        })
      });

      if (response.status === 403) {
        const errorData = await response.json();
        setError(errorData.message || 'Operator account is locked.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Callback to parent to update state and store session
        onLogin(selectedEmpId, location);
      } else {
        setError(data.error || 'Failed to authenticate.');
      }
    } catch (err) {
      setError('Connection failure to Aegis core auth server.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e => e.role !== 'Security Admin');

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 relative">
      <div className="max-w-md w-full bg-cyber-card border border-cyber-border rounded-xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden font-mono text-xs">
        
        {/* Neon scanline accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-cyber-primary shadow-glow-cyan animate-pulse"></div>

        {/* Logo and title */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <Shield className="text-cyber-primary h-12 w-12 animate-pulse-slow" />
          </div>
          <div>
            <h2 className="text-gray-100 font-extrabold text-xl tracking-widest uppercase">OPERATOR AUTHENTICATION</h2>
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-1">Aegis Banking Secure Workstation Portal</p>
          </div>
        </div>

        {/* Error panel */}
        {error && (
          <div className="mb-6 bg-cyber-danger/10 border border-cyber-danger/30 p-3.5 rounded text-cyber-danger flex items-start gap-2.5">
            <span className="shrink-0 font-bold">⚠</span>
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Operator ID Dropdown */}
          <div className="space-y-1.5">
            <label className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">Operator ID</label>
            <div className="relative">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border text-cyber-primary px-3 py-2.5 rounded focus:border-cyber-primary focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Operator ID --</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-cyber-bg border border-cyber-border text-gray-200 px-3 py-2.5 pr-10 rounded focus:border-cyber-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Workstation Location */}
          <div className="space-y-1.5">
            <label className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">Workstation Location</label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border text-cyber-primary px-3 py-2.5 rounded focus:border-cyber-primary focus:outline-none cursor-pointer"
              >
                <option value="Chennai Head Office">Chennai Head Office</option>
                <option value="Bangalore Branch">Bangalore Branch</option>
                <option value="Mumbai Branch">Mumbai Branch</option>
                <option value="Hyderabad Branch">Hyderabad Branch</option>
                <option value="Remote VPN">Remote VPN (+10 Heuristic Risk)</option>
                <option value="Unknown Location">Unknown Location (+30 Heuristic Risk)</option>
              </select>
            </div>
          </div>

          {/* Remember checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="accent-cyber-primary cursor-pointer h-4 w-4"
            />
            <label htmlFor="remember" className="text-gray-500 text-[10px] uppercase font-bold tracking-wider cursor-pointer select-none">
              Remember this device key
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cyber-primary hover:bg-cyber-primary/95 text-cyber-bg font-extrabold tracking-widest rounded shadow-glow-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'SYNCHRONIZING PORTAL...' : 'AUTHENTICATE & LOG IN'}
          </button>
        </form>

        {/* Warning Banner block */}
        <div className="mt-8 pt-4 border-t border-cyber-border/40 text-center text-[10px] text-gray-500 leading-relaxed font-mono">
          <p className="text-cyber-primary/80 font-semibold mb-1 uppercase tracking-widest">SentinelAI Compliance Radar</p>
          "Every employee activity is continuously monitored and analyzed using SentinelAI."
        </div>
      </div>

      <div className="mt-6">
        <button 
          onClick={() => onNavigate('/')}
          className="text-gray-500 hover:text-cyber-primary font-mono text-[11px] uppercase tracking-wider transition-all"
        >
          ← Return to Role Selection
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
