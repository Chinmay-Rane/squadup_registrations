import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { getActiveFormConfig } from '../config';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year', 'Other'];

const DEPARTMENTS = [
  'Events and Ops',
  'Production',
  'Media',
  'Social media and marketing',
  'Sponsorship',
  'Technical',
  'Design',
  'Content creation'
];

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
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

  const [customYear, setCustomYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { actionUrl, fields } = getActiveFormConfig();
      const submittedYear = formData.yearStudying === 'Other' ? customYear : formData.yearStudying;
      
      const formBody = new URLSearchParams();
      formBody.append(fields.name, formData.name);
      formBody.append(fields.whatsAppNumber, formData.whatsAppNumber);
      formBody.append(fields.collegeEmail, formData.collegeEmail);
      formBody.append(fields.prn, formData.prn);
      formBody.append(fields.yearStudying, submittedYear);
      formBody.append(fields.course, formData.course);
      formBody.append(fields.recommendedBy, formData.recommendedBy);
      formBody.append(fields.department, formData.department);
      formBody.append(fields.pastExperience, formData.pastExperience);

      await fetch(actionUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody.toString()
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);

    } catch (err) {
      console.error("Form submission failed", err);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        when: 'beforeChildren',
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
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
            {/* Minimal Header */}
            <motion.div variants={itemVariants} className="mb-8 text-left border-b border-white/5 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                Join SquadUP ( Phase 0 )
              </h2>
              {/* Pillar Subheadings */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <span>Build.</span>
                <span className="text-white/20">•</span>
                <span>Create.</span>
                <span className="text-white/20">•</span>
                <span>Compete.</span>
                <span className="text-white/20">•</span>
                <span>Innovate.</span>
              </div>
            </motion.div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'name' ? 'text-accent' : 'text-gray-400'}`}>
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Chinmay Rane"
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>

                {/* WhatsApp Number */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'whatsAppNumber' ? 'text-accent' : 'text-gray-400'}`}>
                    WhatsApp Number
                  </label>
                  <input
                    required
                    type="tel"
                    name="whatsAppNumber"
                    value={formData.whatsAppNumber}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('whatsAppNumber')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. +91 1234567890"
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>

                {/* College email id */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'collegeEmail' ? 'text-accent' : 'text-gray-400'}`}>
                    College email id
                  </label>
                  <input
                    required
                    type="email"
                    name="collegeEmail"
                    value={formData.collegeEmail}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('collegeEmail')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. abcd12345@mitwpu.edu.in"
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>

                {/* PRN */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'prn' ? 'text-accent' : 'text-gray-400'}`}>
                    PRN
                  </label>
                  <input
                    required
                    type="text"
                    name="prn"
                    value={formData.prn}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('prn')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 1234567890"
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>

                {/* Year Studying in */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'yearStudying' ? 'text-accent' : 'text-gray-400'}`}>
                    Year Studying in
                  </label>
                  <select
                    required
                    name="yearStudying"
                    value={formData.yearStudying}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('yearStudying')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input glass-select font-sans text-gray-300 focus:text-white"
                  >
                    <option value="" disabled className="bg-neutral-900 text-gray-500">Select Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-neutral-900 text-white">{y}</option>
                    ))}
                  </select>

                  {/* Write-in custom year input if 'Other' is selected */}
                  <AnimatePresence>
                    {formData.yearStudying === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <label className="block text-[9px] uppercase tracking-widest mb-1 font-bold text-accent">
                          Specify Year
                        </label>
                        <input
                          required
                          type="text"
                          name="customYear"
                          value={customYear}
                          onChange={(e) => setCustomYear(e.target.value)}
                          placeholder="e.g. 5th year, Alumnus"
                          className="w-full px-4 py-2 text-sm rounded-[8px] glass-input font-sans"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Course studying in */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'course' ? 'text-accent' : 'text-gray-400'}`}>
                    Course studying in
                  </label>
                  <input
                    required
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('course')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>

                {/* Recommended by */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'recommendedBy' ? 'text-accent' : 'text-gray-400'}`}>
                    Recommended by
                  </label>
                  <input
                    required
                    type="text"
                    name="recommendedBy"
                    value={formData.recommendedBy}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('recommendedBy')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Senior Name, Instagram, etc."
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans"
                  />
                </motion.div>

                {/* Department you are interest in */}
                <motion.div variants={itemVariants} className="relative group">
                  <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'department' ? 'text-accent' : 'text-gray-400'}`}>
                    Department you are interest in
                  </label>
                  <select
                    required
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input glass-select font-sans text-gray-300 focus:text-white"
                  >
                    <option value="" disabled className="bg-neutral-900 text-gray-500">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-neutral-900 text-white">{d}</option>
                    ))}
                  </select>
                </motion.div>
              </div>

              {/* Any past experience for the selected department */}
              <motion.div variants={itemVariants} className="relative">
                <label className={`block text-[10px] uppercase tracking-widest mb-1.5 font-bold transition-colors duration-300 ${focusedField === 'pastExperience' ? 'text-accent' : 'text-gray-400'}`}>
                  Any past experience for the selected department
                </label>
                <textarea
                  required
                  name="pastExperience"
                  rows="3"
                  value={formData.pastExperience}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('pastExperience')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Describe your relevant projects, work experience, or past events..."
                  className="w-full px-4 py-2.5 text-sm rounded-[8px] glass-input font-sans resize-none"
                />
              </motion.div>

              {/* Submit Button */}
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
          </motion.div>
        ) : (
          /* SUCCESS CARD */
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
    </div>
  );
}
