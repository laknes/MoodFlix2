
import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { translations } from '../translations';
import { loginUser, registerUser } from '../services/authService';

interface Props {
  language: Language;
  onAuthComplete: (user: User) => void;
  onCancel: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  birthday?: string;
}

const Auth: React.FC<Props> = ({ language, onAuthComplete, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '', 
    birthday: '' 
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0); 
  
  const t = translations[language];

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    // Length check
    if (pass.length >= 6) strength = 1;
    // Complexity: Numbers and letters
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[a-z]/i.test(pass)) strength = 2;
    // High complexity: Symbols and mixed case
    if (pass.length >= 10 && /[0-9]/.test(pass) && /[A-Z]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) strength = 3;
    return strength;
  };

  const calculateAge = (bday: string) => {
    const today = new Date();
    const birthDate = new Date(bday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (mode === 'signup') {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [formData.password, mode]);

  const validateField = (name: string, value: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case 'email':
        if (!value) return t.validation.emailInvalid;
        if (!emailRegex.test(value)) return t.validation.emailInvalid;
        break;
      case 'password':
        if (!value || value.length < 6) return t.validation.passwordShort;
        break;
      case 'confirmPassword':
        if (mode === 'signup' && value !== formData.password) return t.validation.passwordMismatch;
        break;
      case 'name':
        if (mode === 'signup' && !value) return t.validation.nameRequired;
        break;
      case 'birthday':
        if (mode === 'signup') {
          if (!value) return t.validation.ageRequired;
          const age = calculateAge(value);
          if (age < 1 || age > 120) return t.validation.ageRange;
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Immediate validation for fields already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) (newErrors as any)[key] = error;
    });

    setErrors(newErrors);
    // Mark all as touched to show all errors
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await loginUser({ email: formData.email, password: formData.password });
        onAuthComplete(user);
      } else {
        const user = await registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birthday: formData.birthday
        });
        setTempUser(user);
        setShowAgeConfirmation(true);
      }
    } catch (err: any) {
      // API Level Error handling
      setErrors(prev => ({ ...prev, email: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAge = () => {
    if (tempUser) {
      onAuthComplete(tempUser);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 1) return t.validation.strengthWeak;
    if (passwordStrength === 2) return t.validation.strengthMedium;
    if (passwordStrength === 3) return t.validation.strengthStrong;
    return '';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 1) return 'text-red-500';
    if (passwordStrength === 2) return 'text-yellow-500';
    if (passwordStrength === 3) return 'text-green-500';
    return 'text-slate-500';
  };

  if (showAgeConfirmation) {
    const age = calculateAge(formData.birthday);
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl text-center border border-white/5">
          <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">{t.ageHint}</h2>
          <p className="text-slate-400 mb-8 font-medium">
            {language === 'fa' 
              ? `بر اساس تاریخ تولد شما، سن شما ${age} سال تشخیص داده شد. این برای فیلتر محتوا استفاده می‌شود.`
              : `Based on your birthday, your age is ${age}. This will be used for content filtering.`}
          </p>
          <button 
            onClick={handleConfirmAge}
            className="w-full bg-red-600 text-white font-black py-5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-600/20 uppercase mb-4"
          >
            {t.ageGateConfirmation}
          </button>
          <button 
            onClick={() => setShowAgeConfirmation(false)}
            className="text-slate-500 font-bold text-sm hover:text-white transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl border border-white/5">
        <h2 className="text-4xl font-black text-center mb-8 gradient-text uppercase tracking-tighter">
          {mode === 'login' ? t.login : t.signup}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <input
                  type="text"
                  name="name"
                  placeholder={t.fullName}
                  className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white`}
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {errors.name && <p className="text-red-500 text-[10px] px-2 font-bold animate-in fade-in slide-in-from-top-1">{errors.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t.birthday}</label>
                <input
                  type="date"
                  name="birthday"
                  className={`w-full bg-white/5 border ${errors.birthday ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white`}
                  value={formData.birthday}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {errors.birthday && <p className="text-red-500 text-[10px] px-2 font-bold animate-in fade-in slide-in-from-top-1">{errors.birthday}</p>}
              </div>
            </>
          )}
          
          <div className="space-y-1">
            <input
              type="email"
              name="email"
              placeholder={t.email}
              className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white`}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {errors.email && <p className="text-red-500 text-[10px] px-2 font-bold animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <input
              type="password"
              name="password"
              placeholder={t.password}
              className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white`}
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
            {errors.password && <p className="text-red-500 text-[10px] px-2 font-bold animate-in fade-in slide-in-from-top-1">{errors.password}</p>}
            
            {mode === 'signup' && formData.password && (
              <div className="px-2 pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase text-slate-500">Security Strength</span>
                  <span className={`text-[9px] font-black uppercase ${getStrengthColor()}`}>{getStrengthLabel()}</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full transition-all duration-500 ${passwordStrength >= 1 ? 'bg-red-500 w-1/3' : 'w-0'}`} />
                  <div className={`h-full transition-all duration-500 ${passwordStrength >= 2 ? 'bg-yellow-500 w-1/3' : 'w-0'}`} />
                  <div className={`h-full transition-all duration-500 ${passwordStrength >= 3 ? 'bg-green-500 w-1/3' : 'w-0'}`} />
                </div>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <input
                type="password"
                name="confirmPassword"
                placeholder={t.confirmPassword}
                className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {errors.confirmPassword && <p className="text-red-500 text-[10px] px-2 font-bold animate-in fade-in slide-in-from-top-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white font-black py-5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-600/20 uppercase mt-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (mode === 'login' ? t.login : t.signup)}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button 
            onClick={() => { 
              setMode(mode === 'login' ? 'signup' : 'login'); 
              setErrors({}); 
              setTouched({});
            }} 
            className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white font-bold text-sm transition-all"
          >
            {mode === 'login' ? t.noAccount : t.alreadyRegistered}
          </button>
          <div className="pt-4 border-t border-white/5">
            <button onClick={onCancel} className="text-xs font-black text-slate-500 hover:text-red-600 dark:hover:text-white uppercase tracking-widest">{t.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
