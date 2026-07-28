import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, ShieldAlert, RefreshCw, Download, X, Plus, Trash2, Save, LayoutDashboard, Settings } from 'lucide-react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

export default function AdminPortal({ onBackToGateway }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('data'); // 'data' or 'builder'

  // Data state
  const [registrations, setRegistrations] = useState([]);
  const [memberFilter, setMemberFilter] = useState(true);
  const [formSchema, setFormSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);
  
  // Builder state
  const [draftSchema, setDraftSchema] = useState([]);
  const [draftDeptInfo, setDraftDeptInfo] = useState('');
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);

  const fetchMainData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch schema
      const { data: schemaData, error: schemaError } = await supabase
        .from('form_config')
        .select('schema, department_info')
        .eq('id', 1)
        .single();
        
      if (schemaError) throw schemaError;
      setFormSchema(schemaData.schema || []);
      setDraftSchema(schemaData.schema || []);
      setDraftDeptInfo(schemaData.department_info || '');

      // Fetch registrations
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (regError) throw regError;
      setRegistrations(regData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoggedIn(!!session);
      if (session) fetchMainData();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoggedIn(!!session);
      if (session) {
        fetchMainData();
      } else {
        setRegistrations([]); // Clear data on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;
    } catch (err) {
      setLoginError(err.message);
      setTimeout(() => setLoginError(''), 4000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Helper to extract value since it could be a core column or in dynamic_responses
  const getFieldValue = (reg, fieldId) => {
    if (reg[fieldId] !== undefined && reg[fieldId] !== null) {
      return reg[fieldId];
    }
    if (reg.dynamic_responses && reg.dynamic_responses[fieldId] !== undefined) {
      return reg.dynamic_responses[fieldId];
    }
    return '';
  };

  const exportToExcel = () => {
    if (registrations.length === 0) return;
    
    // Format data for Excel based on dynamic schema
    const formattedData = registrations.map(reg => {
      const row = {};
      row['Type'] = reg.is_member ? 'Member' : 'Non-Member';
      formSchema.forEach(field => {
        row[field.label] = getFieldValue(reg, field.id) || '';
      });
      row['Date Submitted'] = new Date(reg.created_at).toLocaleString();
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    // Auto-size columns loosely
    const colWidths = [{ wch: 15 }]; // Type
    formSchema.forEach(f => colWidths.push({ wch: f.type === 'long_text' ? 50 : 25 }));
    colWidths.push({ wch: 25 }); // Date
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `squadup_registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Builder Functions ---
  const saveSchema = async () => {
    setIsSavingSchema(true);
    try {
      const { error } = await supabase
        .from('form_config')
        .update({ schema: draftSchema, department_info: draftDeptInfo, updated_at: new Date().toISOString() })
        .eq('id', 1);
      
      if (error) throw error;
      setFormSchema(draftSchema);
      alert("Form schema saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save schema: " + err.message);
    } finally {
      setIsSavingSchema(false);
    }
  };

  const addField = () => {
    const newId = `field_${Date.now()}`;
    setDraftSchema([...draftSchema, {
      id: newId,
      type: 'short_text',
      label: 'New Field',
      placeholder: '',
      required: false,
      options: []
    }]);
    setEditingFieldId(newId);
  };

  const updateDraftField = (id, updates) => {
    setDraftSchema(draftSchema.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id) => {
    if (confirm("Are you sure you want to remove this field? Existing data won't be deleted from the DB but won't be shown.")) {
      setDraftSchema(draftSchema.filter(f => f.id !== id));
      if (editingFieldId === id) setEditingFieldId(null);
    }
  };

  const moveField = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === draftSchema.length - 1)) return;
    const newSchema = [...draftSchema];
    const temp = newSchema[index];
    newSchema[index] = newSchema[index + direction];
    newSchema[index + direction] = temp;
    setDraftSchema(newSchema);
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
                <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">Admin Email</label>
                <input required type="text" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">Password</label>
                <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans" />
              </div>
              {loginError && <p className="text-xs text-accent font-bold tracking-wide">Auth Error: {loginError}</p>}
              <div className="flex gap-4 pt-2">
                <button type="submit" className="px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-primary to-accent text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(176,0,32,0.2)] hover:shadow-[0_0_25px_rgba(255,45,85,0.4)] transition-all duration-300">
                  <span>Authenticate</span> <LogIn className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={onBackToGateway} className="px-5 py-2.5 rounded-[8px] border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300">
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
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/5 pb-4 shrink-0 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold uppercase tracking-widest text-white">SquadUP Mainframe</h2>
                <div className="flex gap-4 mt-3">
                  <button onClick={() => setActiveTab('data')} className={`text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${activeTab === 'data' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <LayoutDashboard className="w-3.5 h-3.5" /> Data Center
                  </button>
                  <button onClick={() => setActiveTab('builder')} className={`text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${activeTab === 'builder' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    <Settings className="w-3.5 h-3.5" /> Form Builder
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {activeTab === 'data' && (
                  <button onClick={exportToExcel} disabled={registrations.length === 0} className="px-4 py-2 rounded-full bg-accent/20 border border-accent/40 hover:bg-accent/30 text-accent font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50">
                    <span>Export Excel</span> <Download className="w-3 h-3" />
                  </button>
                )}
                {activeTab === 'builder' && (
                  <button onClick={saveSchema} disabled={isSavingSchema} className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 text-green-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50">
                    <span>{isSavingSchema ? 'Saving...' : 'Save Form'}</span> <Save className="w-3 h-3" />
                  </button>
                )}
                <button onClick={fetchMainData} className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all">
                  <span>Refresh</span> <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all">
                  <span>Logout</span> <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm font-sans">
                  Error fetching data: {error}
                </div>
              )}

              {/* DATA CENTER TAB */}
              {activeTab === 'data' && (() => {
                const filteredRegistrations = registrations.filter(r => r.is_member === memberFilter);
                
                return (
                  <>
                    <div className="flex gap-3 mb-4 shrink-0">
                      <button onClick={() => setMemberFilter(true)} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${memberFilter ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,45,85,0.3)]' : 'bg-black/30 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                        SquadUP Members
                      </button>
                      <button onClick={() => setMemberFilter(false)} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${!memberFilter ? 'bg-white/20 border border-white/30 text-white' : 'bg-black/30 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                        Non-Members
                      </button>
                    </div>
                    <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative">
                      <table className="w-full text-left border-collapse text-sm whitespace-nowrap font-sans relative">
                        <thead className="sticky top-0 bg-[#0a0a0a] z-10 shadow-md">
                          <tr>
                            {formSchema.map(field => (
                              <th key={field.id} className="p-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider max-w-[200px] truncate">
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {loading && filteredRegistrations.length === 0 ? (
                          <tr><td colSpan={formSchema.length || 1} className="p-8 text-center text-gray-500">Fetching mainframe...</td></tr>
                        ) : filteredRegistrations.length === 0 ? (
                          <tr><td colSpan={formSchema.length || 1} className="p-8 text-center text-gray-500">No {memberFilter ? 'members' : 'non-members'} found.</td></tr>
                        ) : (
                          filteredRegistrations.map((reg) => (
                            <tr key={reg.id} onClick={() => setSelectedReg(reg)} className="hover:bg-white/10 transition-colors group cursor-pointer">
                              {formSchema.map(field => (
                                <td key={field.id} className="p-4 text-gray-300 truncate max-w-[150px]">
                                  {getFieldValue(reg, field.id)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 shrink-0">
                    <p>Total Entries: {filteredRegistrations.length}</p>
                    <p className="text-[10px] uppercase tracking-wider">Click any row to view full details</p>
                  </div>
                </>
                );
              })()}

              {/* FORM BUILDER TAB */}
              {activeTab === 'builder' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                  {/* Department Info Text Editor */}
                  <div className="w-full bg-black/30 rounded-xl p-6 border border-white/5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Department Info Text</label>
                    <p className="text-[10px] text-gray-500 mb-3">This text will be shown when users click the "Department info" button on the registration form.</p>
                    <textarea 
                      rows="4" 
                      value={draftDeptInfo} 
                      onChange={(e) => setDraftDeptInfo(e.target.value)}
                      placeholder="Welcome to SquadUP! Here is info about departments..."
                      className="w-full px-4 py-3 text-sm rounded-[8px] glass-input font-sans resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                  {/* Field List */}
                  <div className="w-full md:w-1/3 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Form Fields</h3>
                    {draftSchema.map((field, index) => (
                      <div 
                        key={field.id} 
                        onClick={() => setEditingFieldId(field.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${editingFieldId === field.id ? 'bg-accent/10 border-accent/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        <div className="flex-1 truncate">
                          <p className="text-sm font-bold text-white truncate">{field.label || 'Untitled Field'}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{field.type.replace('_', ' ')}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); moveField(index, -1); }} className="p-1 hover:text-white text-gray-500">↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveField(index, 1); }} className="p-1 hover:text-white text-gray-500">↓</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addField} className="p-3 mt-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/50 flex items-center justify-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> Add Field
                    </button>
                  </div>
                  
                  {/* Field Editor */}
                  <div className="w-full md:w-2/3 bg-black/30 rounded-xl p-6 border border-white/5">
                    {editingFieldId ? (() => {
                      const field = draftSchema.find(f => f.id === editingFieldId);
                      if (!field) return null;
                      return (
                        <div className="space-y-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Edit Field</h3>
                            <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg flex items-center gap-2 text-xs uppercase font-bold tracking-wider">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">Field Label</label>
                              <input type="text" value={field.label} onChange={(e) => updateDraftField(field.id, { label: e.target.value })} className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                              <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">Field Type</label>
                              <select value={field.type} onChange={(e) => updateDraftField(field.id, { type: e.target.value })} className="w-full px-4 py-2 text-sm rounded-[8px] glass-input glass-select font-sans text-gray-300">
                                <option value="short_text">Short Text</option>
                                <option value="long_text">Long Text (Paragraph)</option>
                                <option value="select">Dropdown</option>
                              </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                              <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">Required</label>
                              <select value={field.required ? 'true' : 'false'} onChange={(e) => updateDraftField(field.id, { required: e.target.value === 'true' })} className="w-full px-4 py-2 text-sm rounded-[8px] glass-input glass-select font-sans text-gray-300">
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </div>

                            <div className="col-span-2">
                              <label className="block text-[10px] uppercase tracking-widest mb-1.5 font-bold text-gray-400">Placeholder / Example (Optional)</label>
                              <input type="text" value={field.placeholder || ''} onChange={(e) => updateDraftField(field.id, { placeholder: e.target.value })} className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans" />
                            </div>

                            {field.type === 'select' && (
                              <div className="col-span-2 mt-4 p-4 border border-white/10 rounded-lg bg-black/40">
                                <label className="block text-[10px] uppercase tracking-widest mb-3 font-bold text-accent">Dropdown Options (Comma Separated)</label>
                                <textarea 
                                  rows="3" 
                                  value={(field.options || []).join(', ')} 
                                  onChange={(e) => updateDraftField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                  placeholder="Option 1, Option 2, Option 3..."
                                  className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans resize-none"
                                />
                                <p className="text-[10px] text-gray-500 mt-2">Example: 1st year, 2nd year, 3rd year</p>
                              </div>
                            )}

                            <div className="col-span-2 mt-4 p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                              <label className="block text-[10px] uppercase tracking-widest mb-1 font-bold text-red-400">Developer ID (Advanced)</label>
                              <p className="text-xs text-gray-400 mb-2">Used in database. Only change if creating a new field.</p>
                              <input type="text" value={field.id} onChange={(e) => updateDraftField(field.id, { id: e.target.value })} className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans text-gray-500" />
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        Select a field to edit or create a new one.
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Detailed View */}
      <AnimatePresence>
        {selectedReg && activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedReg(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-panel rounded-[20px] p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar relative text-left"
            >
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {getFieldValue(selectedReg, 'name') || 'Registration Details'}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">Submitted: {new Date(selectedReg.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedReg(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {formSchema.map(field => (
                  <div key={field.id} className={field.type === 'long_text' ? 'col-span-1 md:col-span-2' : ''}>
                    <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1.5">{field.label}</p>
                    {field.type === 'long_text' ? (
                       <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-gray-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                         {getFieldValue(selectedReg, field.id) || '-'}
                       </div>
                    ) : (
                      <p className={`text-white font-medium ${field.type === 'select' ? 'text-accent bg-accent/10 inline-block px-3 py-1 rounded-md border border-accent/20' : 'break-all'}`}>
                        {getFieldValue(selectedReg, field.id) || '-'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
