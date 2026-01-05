
import React, { useState, useEffect } from 'react';
import { translations } from '../translations.ts';
import { loginUser, registerUser } from '../services/authService.ts';

const Auth = ({ language, onAuthComplete, onCancel }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '', 
    birthday: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); 
  
  const t = translations[language];

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength = 1;
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[a-z]/i.test(pass)) strength = 2;
    if (pass.length >= 10 && /[0-9]/.test(pass) && /[A-Z]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) strength = 3;
    return strength;
  };

  useEffect(() => {
    if (mode === 'signup') {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [formData.password, mode]);

  const validateField = (name, value) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await loginUser({ email: formData.email, password: formData.password });
        onAuthComplete(user);
      } else {
        const age = calculateAge(formData.birthday);
        const user = await registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birthday: formData.birthday,
          age: age
        });
        onAuthComplete(user);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, email: err.message || 'Auth failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5">
        <h2 className="text-4xl font-black text-center mb-8 gradient-text uppercase tracking-tighter">
          {mode === 'login' ? t.login : t.signup}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder={t.email}
            className="w-full bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-6 py-4 outline-none font-bold"
            value={formData.email}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder={t.password}
            className="w-full bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-6 py-4 outline-none font-bold"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-black py-5 rounded-xl uppercase">
            {loading ? '...' : (mode === 'login' ? t.login : t.signup)}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full mt-4 text-sm font-bold opacity-60">
          {mode === 'login' ? t.noAccount : t.alreadyRegistered}
        </button>
      </div>
    </div>
  );
};

export default Auth;
