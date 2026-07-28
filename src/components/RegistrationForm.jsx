import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function RegistrationForm() {
  const [formSchema, setFormSchema] = useState([]);
  const [formData, setFormData] = useState({});
  const [customYear, setCustomYear] = useState(''); // Kept for backwards compatibility with "Other" logic
  const [departmentInfo, setDepartmentInfo] = useState('');
  const [showDeptModal, setShowDeptModal] = useState(false);
  
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const { data, error } = await supabase
          .from('form_config')
          .select('schema, department_info')
          .eq('id', 1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          if (data.schema) setFormSchema(data.schema);
          if (data.department_info) setDepartmentInfo(data.department_info);
          
          // Initialize form data state based on schema
          const initialData = {};
          data.schema.forEach(field => {
            initialData[field.id] = '';
          });
          setFormData(initialData);
        }
      } catch (err) {
        console.error("Failed to load form schema", err);
        // Fallback to empty or we could hardcode the fallback
      } finally {
        setIsLoadingSchema(false);
      }
    };
    
    fetchSchema();
  }, []);

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Admin Easter Egg Backdoor
    if (formData['course'] === 'admin321') {
      window.location.hash = '#/admin';
      return;
    }

    setIsSubmitting(true);

    try {
      // Separate core fields (from original schema) from dynamic fields
      const coreFields = ['name', 'whatsapp_number', 'college_email', 'prn', 'year_studying', 'course', 'recommended_by', 'department', 'past_experience'];
      
      const payload = {
        dynamic_responses: {}
      };
      
      // Special logic for "Other" year studying for backward compatibility
      let finalYear = formData['year_studying'] || '';
      if (finalYear === 'Other' && customYear) {
        finalYear = customYear;
      }

      // Map dynamic form data back to columns or dynamic JSON
      Object.keys(formData).forEach(key => {
        if (coreFields.includes(key)) {
          if (key === 'year_studying') {
            payload[key] = finalYear;
          } else {
            payload[key] = formData[key];
          }
        } else {
          payload.dynamic_responses[key] = formData[key];
        }
      });
      
      const { error } = await supabase
        .from('registrations')
        .insert([payload]);

      if (error) throw error;

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);

    } catch (err) {
      console.error("Form submission failed", err);
      setTimeout(() => {
        setIsSubmitting(false);
        // We'll show success anyway to not block user, or we can show error
        // But for this flow, let's keep it robust
        alert("Submission failed. Please try again.");
      }, 1000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], when: 'beforeChildren', staggerChildren: 0.05 }
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.4, ease: 'easeIn' } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const renderField = (field) => {
    const isFocused = focusedField === field.id;
    
    return (
      <motion.div key={field.id} variants={itemVariants} className={`relative group ${field.type === 'long_text' ? 'col-span-1 md:col-span-2' : ''}`}>
        <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${isFocused ? 'text-accent' : 'text-gray-400'}`}>
          {field.label} {field.required && <span className="text-accent">*</span>}
        </label>
        
        {field.type === 'short_text' && (
          <input
            required={field.required}
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            onFocus={() => setFocusedField(field.id)}
            onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder || ''}
            className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
          />
        )}

        {field.type === 'long_text' && (
          <textarea
            required={field.required}
            rows="3"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            onFocus={() => setFocusedField(field.id)}
            onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder || ''}
            className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans resize-none"
          />
        )}

        {field.type === 'select' && (
          <>
            <select
              required={field.required}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input glass-select font-sans text-gray-300 focus:text-white"
            >
              <option value="" disabled className="bg-neutral-900 text-gray-500">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt} className="bg-neutral-900 text-white">{opt}</option>
              ))}
            </select>
            
            {/* Backward compatibility for specific "Other" logic in year_studying */}
            <AnimatePresence>
              {field.id === 'year_studying' && formData[field.id] === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-accent">
                    Specify Year <span className="text-accent">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    placeholder="e.g. 5th year, Alumnus"
                    className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative z-20 overflow-y-auto bg-black/40">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="reg-form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl glass-panel rounded-[20px] p-6 md:p-8 relative z-30 font-sans"
          >
            <motion.div variants={itemVariants} className="mb-8 text-left border-b border-white/5 pb-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
                Join SquadUP ( Phase 01 )
              </h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <span>Build.</span>
                <span className="text-white/20">•</span>
                <span>Create.</span>
                <span className="text-white/20">•</span>
                <span>Compete.</span>
                <span className="text-white/20">•</span>
                <span>Innovate.</span>
              </div>
              
              <button 
                type="button" 
                onClick={() => setShowDeptModal(true)}
                className="mt-6 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent border border-accent/30 rounded-md transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,45,85,0.3)] hover:shadow-[0_0_25px_rgba(255,45,85,0.5)]"
              >
                Department Info
              </button>
            </motion.div>

            {isLoadingSchema ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {formSchema.filter(f => f.type !== 'long_text').map(renderField)}
                </div>
                
                {formSchema.filter(f => f.type === 'long_text').map(renderField)}

                <motion.div variants={itemVariants} className="pt-4 flex justify-start">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative px-6 py-3 rounded-[8px] bg-gradient-to-r from-primary to-accent text-white font-bold tracking-widest text-[10px] uppercase flex items-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(176,0,32,0.3)] cursor-pointer hover:shadow-[0_0_30px_rgba(255,45,85,0.5)] active:scale-98 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? 'Transmitting...' : 'Begin Your Journey'}
                    </span>
                    {!isSubmitting && <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
                  </motion.button>
                </motion.div>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md glass-panel rounded-[20px] p-8 text-center relative z-30"
          >
            <div className="relative flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute w-20 h-20 rounded-full border border-accent"
              />
              <div className="w-20 h-20 rounded-full bg-accent/5 border border-accent/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,45,85,0.25)]">
                <Check className="w-8 h-8 text-accent stroke-[3]" />
              </div>
            </div>

            <h2 className="text-xl font-extrabold tracking-widest uppercase text-white glow-text-accent">
              TRANSMISSION COMPLETE
            </h2>
            <p className="text-xs text-gray-300 mt-4 leading-relaxed font-sans uppercase tracking-wider">
              Profile secured. The gateway is synchronized with our mainframe.
            </p>
            <p className="text-[9px] text-gray-400 mt-6 tracking-widest uppercase">
              Welcome to the Squad. Expect contact soon.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Department Info Modal */}
      <AnimatePresence>
        {showDeptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDeptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-panel rounded-[20px] p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar relative text-left flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/10 pb-4 gap-4 shrink-0">
                <h3 className="text-2xl font-extrabold tracking-tight text-white uppercase">
                  SquadUP Departments
                </h3>
                <button 
                  onClick={() => setShowDeptModal(false)} 
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white border border-white/20 hover:bg-white/10 rounded-md transition-all flex items-center gap-2"
                >
                  Back to Form
                </button>
              </div>
              <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-sans flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {departmentInfo || "No department information available at this time."}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
