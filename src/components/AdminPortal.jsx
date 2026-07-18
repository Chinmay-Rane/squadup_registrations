import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Save, RotateCcw, LogOut, ShieldAlert } from 'lucide-react';
import { getActiveFormConfig, GOOGLE_FORM_CONFIG } from '../config';

export default function AdminPortal({ onBackToGateway }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(false);

  // Form configurations state
  const [actionUrl, setActionUrl] = useState('');
  const [fields, setFields] = useState({
    name: '',
    whatsAppNumber: '',
    collegeEmail: '',
    prn: '',
    yearStudying: '',
    course: '',
    recommendedBy: '',
    department: '',
    pastExperience: ''
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Load existing form configuration
  useEffect(() => {
    const activeConfig = getActiveFormConfig();
    setActionUrl(activeConfig.actionUrl);
    setFields({ ...activeConfig.fields });
  }, []);

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

  const handleConfigSave = (e) => {
    e.preventDefault();
    const configToSave = {
      actionUrl,
      fields
    };
    localStorage.setItem('squadup_google_form_config', JSON.stringify(configToSave));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset Google Form configuration to compile-time defaults?')) {
      localStorage.removeItem('squadup_google_form_config');
      setActionUrl(GOOGLE_FORM_CONFIG.actionUrl);
      setFields({ ...GOOGLE_FORM_CONFIG.fields });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
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
            className="w-full max-w-3xl glass-panel rounded-[20px] p-6 md:p-8 text-left my-8"
          >
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold uppercase tracking-widest text-white">
                  SquadUP Mainframe
                </h2>
                <p className="text-[10px] text-accent font-bold uppercase tracking-[0.25em] mt-1">
                  Google Forms Endpoint Configurator
                </p>
              </div>

              <button
                onClick={() => setIsLoggedIn(false)}
                className="px-4 py-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/5 text-white/70 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300"
              >
                <span>Logout</span>
                <LogOut className="w-3 h-3" />
              </button>
            </div>

            <form onSubmit={handleConfigSave} className="space-y-6">
              {/* Form Action URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">
                  Google Form Action URL (ends in /formResponse)
                </label>
                <input
                  required
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/.../formResponse"
                  className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                />
              </div>

              {/* Field mapping inputs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3 pb-1 border-b border-white/5">
                  Field Entry ID Mapping (e.g. entry.123456789)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      Name Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* WhatsApp Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      WhatsApp Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.whatsAppNumber}
                      onChange={(e) => handleFieldChange('whatsAppNumber', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* Email Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      College Email Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.collegeEmail}
                      onChange={(e) => handleFieldChange('collegeEmail', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* PRN Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      PRN Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.prn}
                      onChange={(e) => handleFieldChange('prn', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* Year Studying Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      Year Studying Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.yearStudying}
                      onChange={(e) => handleFieldChange('yearStudying', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* Course Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      Course Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.course}
                      onChange={(e) => handleFieldChange('course', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* Recommended by Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      Recommended by Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.recommendedBy}
                      onChange={(e) => handleFieldChange('recommendedBy', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>

                  {/* Department Mapping */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                      Department Field Entry ID
                    </label>
                    <input
                      required
                      type="text"
                      value={fields.department}
                      onChange={(e) => handleFieldChange('department', e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                    />
                  </div>
                </div>

                {/* Past Experience Mapping */}
                <div className="mt-5">
                  <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-gray-400">
                    Past Experience Field Entry ID
                  </label>
                  <input
                    required
                    type="text"
                    value={fields.pastExperience}
                    onChange={(e) => handleFieldChange('pastExperience', e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                  />
                </div>
              </div>

              {saveSuccess && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-400 font-bold tracking-wide uppercase"
                >
                  mainframe synchronized. configurations saved locally.
                </motion.p>
              )}

              <div className="flex flex-wrap gap-4 pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-primary to-accent text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(176,0,32,0.2)] hover:shadow-[0_0_25px_rgba(255,45,85,0.4)] transition-all duration-300"
                >
                  <span>Save Configs</span>
                  <Save className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-5 py-2.5 rounded-[8px] border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <span>Reset Defaults</span>
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
