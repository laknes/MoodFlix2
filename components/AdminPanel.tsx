
import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { translations } from '../translations';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  usageCount: number;
}

interface Props {
  language: Language;
  users: User[];
  onSync: () => void;
}

const AdminPanel: React.FC<Props> = ({ language, users: initialUsers, onSync }) => {
  const t = translations[language].adminDashboard;
  const commonT = translations[language];
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'keys'>('stats');
  
  // States for Management
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Primary Gemini Key', key: 'AIzaSy...7xW90', isActive: true, usageCount: 1250 },
    { id: '2', name: 'Backup Cluster', key: 'AIzaSy...9bC21', isActive: false, usageCount: 45 }
  ]);
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) return;
    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: newKeyValue,
      isActive: false,
      usageCount: 0
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const toggleKeyStatus = (id: string) => {
    setApiKeys(apiKeys.map(k => ({
      ...k,
      isActive: k.id === id ? !k.isActive : false // Only one can be active at a time for safety
    })));
  };

  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const deleteUser = (id: string) => {
    if (confirm(language === 'fa' ? 'آیا از حذف این کاربر اطمینان دارید؟' : 'Are you sure you want to delete this user?')) {
      setUserList(userList.filter(u => u.id !== id));
    }
  };

  const toggleAdmin = (id: string) => {
    setUserList(userList.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[3rem] p-6 md:p-12 border-red-600/20 bg-black/60 shadow-2xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black netflix-red mb-2">{t.title}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">System Operations Control Center</p>
          </div>
          <button 
            onClick={onSync}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.syncData}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: 'stats', label: t.status, icon: '📊' },
            { id: 'users', label: t.userControl, icon: '👥' },
            { id: 'keys', label: t.apiControl, icon: '🔑' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 rounded-2xl font-black text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-3 border ${
                activeTab === tab.id 
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500">
          
          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-[2.5rem]">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{t.totalUsers}</p>
                <p className="text-5xl font-black text-white">{userList.length}</p>
                <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 w-3/4"></div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-[2.5rem]">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Active Keys</p>
                <p className="text-5xl font-black text-green-500">{apiKeys.filter(k => k.isActive).length}</p>
                <p className="text-slate-500 text-xs mt-4">Total requests: {apiKeys.reduce((acc, k) => acc + k.usageCount, 0)}</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-[2.5rem]">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">API Health</p>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                  <p className="text-2xl font-black">99.9% Up</p>
                </div>
                <p className="text-slate-500 text-xs mt-4">Latency: 240ms</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-[2.5rem]">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{t.lastSync}</p>
                <p className="text-2xl font-black text-white">{new Date().toLocaleTimeString()}</p>
                <p className="text-slate-500 text-xs mt-4">Manual override allowed</p>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto animate-in slide-in-from-bottom-4 duration-500">
              <table className="w-full text-right border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-slate-500 text-xs font-black uppercase tracking-widest">
                    <th className="py-4 px-6">{commonT.fullName}</th>
                    <th className="py-4 px-6">{commonT.email}</th>
                    <th className="py-4 px-6">Joined</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(u => (
                    <tr key={u.id} className="bg-white/[0.03] hover:bg-white/[0.07] transition-all group rounded-2xl">
                      <td className="py-6 px-6 font-black rounded-r-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 text-xs font-black">
                            {u.name[0].toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="py-6 px-6 text-slate-400 font-bold">{u.email}</td>
                      <td className="py-6 px-6 text-slate-400 font-bold">{new Date(u.joinedAt).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</td>
                      <td className="py-6 px-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${u.isAdmin ? 'bg-red-600/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                          {u.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-6 px-6 rounded-l-2xl">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleAdmin(u.id)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Toggle Admin Role"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          </button>
                          <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-2 bg-red-600/10 hover:bg-red-600 rounded-lg transition-all text-red-500 hover:text-white"
                            title="Delete User"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* KEYS TAB */}
          {activeTab === 'keys' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Form to add new key */}
              <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 md:p-10">
                <h3 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-3">
                  <span className="text-red-600">⊕</span> {language === 'fa' ? 'افزودن کلید جدید' : 'Add New Secret Key'}
                </h3>
                <form onSubmit={handleAddKey} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">{language === 'fa' ? 'نام نمایشی' : 'Display Name'}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Gemini Production"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-red-600 transition-all font-bold"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">{language === 'fa' ? 'مقدار کلید (Secret)' : 'Key Value'}</label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-red-600 transition-all font-mono"
                      value={newKeyValue}
                      onChange={e => setNewKeyValue(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    >
                      {language === 'fa' ? 'تایید و ثبت' : 'Register Key'}
                    </button>
                  </div>
                </form>
              </div>

              {/* List of keys */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apiKeys.map(k => (
                  <div key={k.id} className={`p-8 bg-white/5 border rounded-[2rem] transition-all relative overflow-hidden group ${k.isActive ? 'border-red-600 shadow-[0_0_30px_rgba(229,9,20,0.15)]' : 'border-white/5'}`}>
                    {k.isActive && <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-6 py-1 rounded-bl-xl uppercase tracking-widest">Active</div>}
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-black mb-1">{k.name}</h4>
                        <p className="text-slate-500 font-mono text-sm">••••••••••••{k.key.slice(-5)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Usage</p>
                        <p className="text-lg font-black">{k.usageCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => toggleKeyStatus(k.id)}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all border ${k.isActive ? 'bg-red-600/10 text-red-500 border-red-600/30' : 'bg-green-600/10 text-green-500 border-green-600/30 hover:bg-green-600 hover:text-white'}`}
                      >
                        {k.isActive ? (language === 'fa' ? 'غیرفعال‌سازی' : 'Deactivate') : (language === 'fa' ? 'فعال‌سازی' : 'Set as Active')}
                      </button>
                      <button 
                        onClick={() => deleteKey(k.id)}
                        className="px-6 py-3 bg-white/5 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer System Info */}
      <div className="mt-8 text-center text-slate-600 font-bold text-xs uppercase tracking-[0.3em]">
        System Version 2.1.0 • Build Protected by Moodflix Security
      </div>
    </div>
  );
};

export default AdminPanel;
