import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, ShieldAlert, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminPortal({ onBackToGateway }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(false);

  // Data state
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchRegistrations();
    }
  }, [isLoggedIn]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.email === 'admin@aids' && loginForm.password === 'dev@aids123') {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-20 overflow-y-auto bg-black/50 font-sans">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login-view"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md glass-panel rounded-[20px] p-8 text-left"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <ShieldAlert className="text-accent w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                Admin Authentication
              </h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">
                  Admin Email
                </label>
                <input
                  required
                  type="text"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder=""
                  className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                />
              </div>

              {loginError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-accent font-bold tracking-wide"
                >
                  Access Denied. Invalid Credentials.
                </motion.p>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-primary to-accent text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(176,0,32,0.2)] hover:shadow-[0_0_25px_rgba(255,45,85,0.4)] transition-all duration-300"
                >
                  <span>Authenticate</span>
                  <LogIn className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onBackToGateway}
                  className="px-5 py-2.5 rounded-[8px] border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-7xl glass-panel rounded-[20px] p-6 md:p-8 text-left my-8 flex flex-col h-[85vh]"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold uppercase tracking-widest text-white">
                  SquadUP Mainframe
                </h2>
                <p className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] mt-1">
                  Registration Data Center
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={fetchRegistrations}
                  className="px-4 py-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/5 text-white/70 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <span>Refresh</span>
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="px-4 py-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/5 text-white/70 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <span>Logout</span>
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm font-sans">
                  Error fetching data: {error}
                </div>
              )}

              <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm whitespace-nowrap font-sans">
                  <thead className="sticky top-0 bg-[#0a0a0a] z-10 shadow-md">
                    <tr>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">PRN</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">Year</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">Dept</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">Recommender</th>
                      <th className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider max-w-xs">Experience</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading && registrations.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center text-gray-500">
                          Fetching registrations...
                        </td>
                      </tr>
                    ) : registrations.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center text-gray-500">
                          No registrations found in the mainframe.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4 text-white font-medium">{reg.name}</td>
                          <td className="p-4 text-gray-300">{reg.whatsapp_number}</td>
                          <td className="p-4 text-gray-300">{reg.college_email}</td>
                          <td className="p-4 text-gray-300 font-mono text-xs">{reg.prn}</td>
                          <td className="p-4 text-gray-300">{reg.year_studying}</td>
                          <td className="p-4 text-gray-300">{reg.course}</td>
                          <td className="p-4 text-accent font-semibold text-xs uppercase tracking-wider">{reg.department}</td>
                          <td className="p-4 text-gray-400 italic text-xs">{reg.recommended_by || '-'}</td>
                          <td className="p-4 text-gray-400 text-xs whitespace-normal min-w-[200px]" title={reg.past_experience}>
                            {reg.past_experience || 'None'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 shrink-0">
                <p>Total Entries: {registrations.length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
