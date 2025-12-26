
import React, { useState, useEffect } from 'react';
import { Language, User, ApiKeyConfig, SystemSettings } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  users: User[];
  onSync: () => void;
  onSettingsUpdate?: (settings: SystemSettings) => void;
}

const AdminPanel: React.FC<Props> = ({ language, users: initialUsers, onSync, onSettingsUpdate }) => {
  const t = translations[language].adminDashboard;
  const commonT = translations[language];
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'keys' | 'settings'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent States
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    activeModel: 'gemini-3-flash-preview',
    customSystemPrompt: '',
    allowGuestMode: true
  });
  
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('moodflix_api_keys');
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    
    const savedSettings = localStorage.getItem('moodflix_system_settings');
    if (savedSettings) setSystemSettings(JSON.parse(savedSettings));

    const savedUsers = localStorage.getItem('moodflix_all_users');
    if (savedUsers) setUserList(JSON.parse(savedUsers));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('moodflix_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('moodflix_system_settings', JSON.stringify(systemSettings));
    if (onSettingsUpdate) onSettingsUpdate(systemSettings);
  }, [systemSettings, onSettingsUpdate]);

  useEffect(() => {
    localStorage.setItem('moodflix_all_users', JSON.stringify(userList));
  }, [userList]);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) return;
    const newKey: ApiKeyConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: newKeyValue,
      isActive: apiKeys.length === 0,
      provider: 'gemini',
      usageCount: 0
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const activateKey = (id: string) => {
    setApiKeys(apiKeys.map(k => ({
      ...k,
      isActive: k.id === id
    })));
  };

  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const toggleAdmin = (email: string) => {
    setUserList(prev => prev.map(u => 
      u.email === email ? { ...u, isAdmin: !u.isAdmin } : u
    ));
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSetting = (key: keyof SystemSettings) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof SystemSettings]
    }));
  };

  // Icons
  const StatsIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  const UsersIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
  const KeysIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
  const SettingsIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border-red-600/20 bg-black/60 shadow-2xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-3xl md:text-6xl font-black netflix-red mb-2">{t.title}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-sm">Operations Center</p>
          </div>
          <button 
            onClick={onSync}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 md:px-8 py-3 md:py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 active:scale-95 text-sm md:text-base"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.syncData}
          </button>
        </div>

        <div className="flex gap-2 mb-8 md:mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: 'stats', label: t.status, icon: StatsIcon },
            { id: 'users', label: t.userControl, icon: UsersIcon },
            { id: 'keys', label: t.apiControl, icon: KeysIcon },
            { id: 'settings', label: commonT.settings, icon: SettingsIcon }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-base whitespace-nowrap transition-all flex items-center gap-2 md:gap-3 border ${
                activeTab === tab.id 
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="flex-shrink-0 scale-75 md:scale-100">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="transition-all duration-500 min-h-[300px]">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4">
              <div className="p-6 md:p-8 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">{t.totalUsers}</p>
                <p className="text-3xl md:text-5xl font-black text-white">{userList.length}</p>
              </div>
              <div className="p-6 md:p-8 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">Active Keys</p>
                <p className="text-3xl md:text-5xl font-black text-green-500">{apiKeys.filter(k => k.isActive).length}</p>
              </div>
              <div className="p-6 md:p-8 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">System Status</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                   <p className="font-bold text-sm md:text-base">{systemSettings.maintenanceMode ? 'Maintenance' : 'Live'}</p>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">Active Model</p>
                <p className="text-lg md:text-xl font-black text-red-500 truncate">{systemSettings.activeModel.split('-')[2]}</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in slide-in-from-bottom-4">
               <div className="mb-6 md:mb-8">
                  <input 
                    type="text" 
                    placeholder={language === 'fa' ? "جستجوی کاربر..." : "Search users..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 outline-none focus:border-red-600 transition-all font-bold text-sm md:text-base"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="overflow-x-auto rounded-xl">
                 <table className="w-full text-left rtl:text-right min-w-[600px]">
                    <thead className="text-slate-500 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/5">
                       <tr>
                          <th className="pb-4 font-black">{language === 'fa' ? 'نام' : 'Name'}</th>
                          <th className="pb-4 font-black">{language === 'fa' ? 'ایمیل' : 'Email'}</th>
                          <th className="pb-4 font-black">{language === 'fa' ? 'سن' : 'Age'}</th>
                          <th className="pb-4 font-black">{language === 'fa' ? 'نقش' : 'Role'}</th>
                          <th className="pb-4 text-center font-black">{language === 'fa' ? 'عملیات' : 'Actions'}</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredUsers.map(u => (
                         <tr key={u.email} className="group hover:bg-white/5 transition-colors">
                            <td className="py-4 font-bold text-sm md:text-base">{u.name}</td>
                            <td className="py-4 text-slate-400 text-sm md:text-base">{u.email}</td>
                            <td className="py-4 text-sm md:text-base">{u.age}</td>
                            <td className="py-4">
                               <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase ${u.isAdmin ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-slate-500'}`}>
                                  {u.isAdmin ? 'Admin' : 'User'}
                               </span>
                            </td>
                            <td className="py-4 text-center">
                               <button 
                                onClick={() => toggleAdmin(u.email)}
                                className={`text-[10px] md:text-xs font-bold py-1.5 md:py-2 px-3 md:px-4 rounded-lg md:rounded-xl transition-all ${u.isAdmin ? 'bg-slate-800 text-slate-400' : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white'}`}
                               >
                                  {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-8 md:space-y-10 animate-in slide-in-from-bottom-4">
              <div className="bg-white/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white/5">
                <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8">{language === 'fa' ? 'افزودن کلید جدید' : 'Register New API Key'}</h3>
                <form onSubmit={handleAddKey} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <input 
                    type="text" 
                    placeholder="Key Label (e.g. Gemini Pro)"
                    className="bg-black/40 border border-white/10 rounded-xl px-5 md:px-6 py-3 md:py-4 outline-none focus:border-red-600 transition-all font-bold text-sm md:text-base"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                  />
                  <input 
                    type="password" 
                    placeholder="API Key (Secret)"
                    className="bg-black/40 border border-white/10 rounded-xl px-5 md:px-6 py-3 md:py-4 outline-none focus:border-red-600 transition-all font-mono text-sm md:text-base"
                    value={newKeyValue}
                    onChange={e => setNewKeyValue(e.target.value)}
                  />
                  <button type="submit" className="bg-white text-black font-black py-3 md:py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all text-sm md:text-base">
                    {commonT.signup}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {apiKeys.map(k => (
                  <div key={k.id} className={`p-6 md:p-8 bg-white/5 border rounded-[1.5rem] md:rounded-[2rem] transition-all ${k.isActive ? 'border-red-600' : 'border-white/5 opacity-60'}`}>
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                      <h4 className="text-lg md:text-xl font-black truncate max-w-[150px]">{k.name}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] md:text-xs font-mono opacity-50">...{k.key.slice(-6)}</span>
                         {k.isActive && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                      </div>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                      {!k.isActive && (
                        <button onClick={() => activateKey(k.id)} className="flex-1 py-2 md:py-3 bg-green-600/10 text-green-500 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-green-600 hover:text-white transition-all">Activate</button>
                      )}
                      <button onClick={() => deleteKey(k.id)} className="px-3 md:px-4 py-2 md:py-3 bg-red-600/10 text-red-500 rounded-lg md:rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-8 md:space-y-10 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                 <div 
                  className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border transition-all cursor-pointer ${systemSettings.maintenanceMode ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/5'}`}
                  onClick={() => toggleSetting('maintenanceMode')}
                 >
                    <h4 className="font-black text-lg md:text-xl mb-1 md:mb-2">Maintenance Mode</h4>
                    <p className="text-xs md:text-sm opacity-50 mb-4 leading-relaxed">Redirect all non-admins to maintenance screen.</p>
                    <div className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-all ${systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-slate-700'}`}>
                       <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${systemSettings.maintenanceMode ? 'ltr:translate-x-5 md:ltr:translate-x-7 rtl:-translate-x-5 md:rtl:-translate-x-7' : 'translate-x-0'}`} />
                    </div>
                 </div>

                 <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-white/5">
                    <h4 className="font-black text-lg md:text-xl mb-3 md:mb-4">Active Model</h4>
                    <div className="flex flex-col gap-2">
                       {['gemini-3-flash-preview', 'gemini-3-pro-preview'].map(m => (
                         <button 
                          key={m}
                          onClick={() => setSystemSettings(prev => ({ ...prev, activeModel: m as any }))}
                          className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-bold border transition-all text-xs md:text-sm ${systemSettings.activeModel === m ? 'border-red-600 text-red-600 bg-red-600/5' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                         >
                           {m.toUpperCase()}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-white/5">
                <h4 className="font-black text-lg md:text-xl mb-3 md:mb-4">Global AI Persona</h4>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[120px] md:min-h-[150px] outline-none focus:border-red-600 transition-all text-xs md:text-sm leading-relaxed"
                  placeholder="You are a poetic cinema expert..."
                  value={systemSettings.customSystemPrompt}
                  onChange={e => setSystemSettings(prev => ({ ...prev, customSystemPrompt: e.target.value }))}
                />
                <p className="text-[10px] md:text-xs opacity-40 mt-3 italic">Override default system instructions for the recommendation engine.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
