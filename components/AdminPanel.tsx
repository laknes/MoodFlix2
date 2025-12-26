
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
  
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    activeModel: 'gemini-3-flash-preview',
    customSystemPrompt: '',
    allowGuestMode: true,
    temperature: 1.0,
    topP: 0.95,
    topK: 64
  });
  
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyProvider, setNewKeyProvider] = useState('Google Gemini');
  const [newKeyIsActive, setNewKeyIsActive] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('moodflix_api_keys');
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    
    const savedSettings = localStorage.getItem('moodflix_system_settings');
    if (savedSettings) setSystemSettings(JSON.parse(savedSettings));

    const savedUsers = localStorage.getItem('moodflix_all_users');
    if (savedUsers) setUserList(JSON.parse(savedUsers));
  }, []);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) return;
    
    const newKey: ApiKeyConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: newKeyValue,
      isActive: newKeyIsActive || apiKeys.length === 0,
      provider: newKeyProvider,
      usageCount: 0
    };

    let updated = [...apiKeys];
    // If setting this one to active, deactivate others
    if (newKey.isActive) {
      updated = updated.map(k => ({ ...k, isActive: false }));
    }
    updated.push(newKey);
    
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
    setNewKeyName('');
    setNewKeyValue('');
    setNewKeyIsActive(false);
  };

  const toggleKey = (id: string) => {
    const updated = apiKeys.map(k => ({ ...k, isActive: k.id === id }));
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
  };

  const deleteKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    // Ensure at least one is active if possible
    if (updated.length > 0 && !updated.some(k => k.isActive)) {
      updated[0].isActive = true;
    }
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
  };

  const handleToggleAdmin = async (userId: string) => {
    const updatedUsers: User[] = userList.map(u => 
      u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
    );
    setUserList(updatedUsers);
    localStorage.setItem('moodflix_all_users', JSON.stringify(updatedUsers));
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers: User[] = userList.map(u => 
      u.id === userId ? { ...u, status: (u.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' } : u
    );
    setUserList(updatedUsers);
    localStorage.setItem('moodflix_all_users', JSON.stringify(updatedUsers));
  };

  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    const next = { ...systemSettings, ...updates };
    setSystemSettings(next);
    localStorage.setItem('moodflix_system_settings', JSON.stringify(next));
    if (onSettingsUpdate) onSettingsUpdate(next);
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRtl = language === 'fa';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[3rem] p-8 md:p-12 border border-white/5 dark:border-white/5 bg-white/90 dark:bg-black/60 shadow-2xl">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-black/5 dark:border-white/5 pb-8">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h2 className="text-4xl md:text-6xl font-black text-red-600 mb-1 tracking-tighter">{t.title}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-60">Control Center & AI Governance</p>
          </div>
          <button 
            onClick={onSync}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.syncData}
          </button>
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all ${activeTab === 'stats' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}
          >
            Stats
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}
          >
            {t.userControl}
          </button>
          <button 
            onClick={() => setActiveTab('keys')} 
            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all ${activeTab === 'keys' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}
          >
            {t.apiKeysTab}
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}
          >
            AI Settings
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Population</p>
                <p className="text-5xl font-black text-black dark:text-white">{userList.length}</p>
                <p className="text-xs text-green-500 font-bold mt-2">Active: {userList.filter(u => u.status === 'active').length}</p>
              </div>
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">AI Parameter Flux</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-2xl font-black text-blue-500 uppercase">Configured</p>
                </div>
                <p className="mt-4 text-slate-500 text-xs font-medium">Temp: {systemSettings.temperature} | Model: {systemSettings.activeModel.split('-')[2]}</p>
              </div>
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Admin Authority</p>
                <p className="text-2xl font-black text-black dark:text-white">{userList.filter(u => u.isAdmin).length} Superusers</p>
                <p className="mt-4 text-slate-500 text-xs font-medium">Full governance active</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="Find identity by name or email..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="overflow-x-auto rounded-3xl border border-black/5 dark:border-white/5">
                <table className="w-full text-left rtl:text-right">
                  <thead>
                    <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-5">Profile</th>
                      <th className="px-6 py-5">Origin</th>
                      <th className="px-6 py-5">Privileges</th>
                      <th className="px-6 py-5 text-center">Governance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div className="flex flex-col">
                              <span className="font-black text-black dark:text-white">{u.name}</span>
                              <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-xs text-slate-500 font-bold">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-5">
                          <button 
                            onClick={() => handleToggleAdmin(u.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${u.isAdmin ? 'bg-red-600 text-white' : 'bg-black/5 dark:bg-white/5 text-slate-500'}`}
                          >
                            {u.isAdmin ? 'Admin' : 'Standard'}
                          </button>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2">
                             <button 
                                onClick={() => handleToggleStatus(u.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${u.status === 'active' ? 'text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white' : 'text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white'}`}
                             >
                               {u.status === 'active' ? 'Suspend' : 'Activate'}
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-10 animate-fade-in">
              <div className="glass-card p-8 rounded-[2rem] border border-black/5 dark:border-white/5">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                   <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   {t.addKey}
                </h3>
                <form onSubmit={handleAddKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.keyName}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Primary Production"
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-all font-bold text-black dark:text-white"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.keyValue}</label>
                    <input 
                      type="password" 
                      placeholder="AI_KEY_..."
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-all font-mono text-black dark:text-white"
                      value={newKeyValue}
                      onChange={e => setNewKeyValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.provider}</label>
                    <select 
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-all font-bold text-black dark:text-white appearance-none"
                      value={newKeyProvider}
                      onChange={e => setNewKeyProvider(e.target.value)}
                    >
                      <option value="Google Gemini">Google Gemini</option>
                      <option value="OpenAI">OpenAI (Experimental)</option>
                      <option value="Anthropic">Anthropic (Experimental)</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewKeyIsActive(!newKeyIsActive)}
                      className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase transition-all border ${newKeyIsActive ? 'bg-red-600 border-red-600 text-white' : 'bg-black/5 dark:bg-white/5 text-slate-500 border-black/10 dark:border-white/10'}`}
                    >
                      {t.activeStatus}: {newKeyIsActive ? 'ON' : 'OFF'}
                    </button>
                    <button 
                      type="submit"
                      className="h-12 w-12 bg-red-600 text-white rounded-xl hover:brightness-110 transition-all flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiKeys.map(k => (
                  <div 
                    key={k.id} 
                    className={`relative p-6 rounded-[2rem] border-2 transition-all group overflow-hidden ${
                      k.isActive 
                        ? 'border-red-600 bg-red-600/5 shadow-2xl shadow-red-600/10' 
                        : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    {k.isActive && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
                        Active Key
                      </div>
                    )}
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </div>
                        <button 
                          onClick={() => deleteKey(k.id)}
                          className="p-2 text-slate-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title={t.deleteKey}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      
                      <h4 className="font-black text-lg mb-1 dark:text-white uppercase truncate">{k.name}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-black text-red-600 bg-red-600/10 px-2 py-0.5 rounded-md uppercase">{k.provider}</span>
                        <span className="text-[10px] font-bold text-slate-500">{t.usage}: {k.usageCount}</span>
                      </div>
                      
                      <div className="mt-auto flex gap-2">
                        <div className="flex-grow bg-black/10 dark:bg-black/40 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-500 truncate flex items-center">
                          ●●●●●●●●{k.key.slice(-6)}
                        </div>
                        {!k.isActive && (
                          <button 
                            onClick={() => toggleKey(k.id)}
                            className="px-4 py-2 bg-white/5 dark:bg-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all border border-white/5"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.activeModel}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['gemini-3-flash-preview', 'gemini-3-pro-preview'].map(m => (
                      <button 
                        key={m}
                        onClick={() => updateSystemSettings({ activeModel: m as any })}
                        className={`px-6 py-5 rounded-[1.5rem] border text-left flex justify-between items-center transition-all ${systemSettings.activeModel === m ? 'border-red-600 bg-red-600/10 ring-2 ring-red-600' : 'border-black/10 dark:border-white/10 hover:border-red-600/30'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-black dark:text-white uppercase text-sm">{m.split('-')[2]}</span>
                          <span className="text-[10px] text-slate-500 font-bold mt-0.5">{m.split('-')[1]} v{m.split('-')[0].split('-')[1]}</span>
                        </div>
                        {systemSettings.activeModel === m && <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(229,9,20,0.5)]"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fine-Tune AI Behavior</h4>
                   
                   <div className="space-y-6 bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] border border-black/5 dark:border-white/5">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-black dark:text-white uppercase">Temperature</label>
                            <span className="text-xs font-black text-red-600">{systemSettings.temperature}</span>
                         </div>
                         <input type="range" min="0" max="2" step="0.1" className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600" value={systemSettings.temperature} onChange={(e) => updateSystemSettings({ temperature: parseFloat(e.target.value) })} />
                         <p className="text-[10px] text-slate-500 italic">High: Creative/Varied. Low: Deterministic/Focused.</p>
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-black dark:text-white uppercase">Top-P (Nucleus Sampling)</label>
                            <span className="text-xs font-black text-red-600">{systemSettings.topP}</span>
                         </div>
                         <input type="range" min="0" max="1" step="0.01" className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600" value={systemSettings.topP} onChange={(e) => updateSystemSettings({ topP: parseFloat(e.target.value) })} />
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-black dark:text-white uppercase">Top-K</label>
                            <span className="text-xs font-black text-red-600">{systemSettings.topK}</span>
                         </div>
                         <input type="range" min="1" max="100" step="1" className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600" value={systemSettings.topK} onChange={(e) => updateSystemSettings({ topK: parseInt(e.target.value) })} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.systemPrompt}</label>
                  <textarea 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl px-8 py-6 focus:border-red-600 outline-none transition-all font-medium text-black dark:text-white min-h-[300px] leading-relaxed shadow-inner"
                    placeholder="Overwrite primary AI persona..."
                    value={systemSettings.customSystemPrompt}
                    onChange={e => updateSystemSettings({ customSystemPrompt: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-500 px-4">This instruction is injected into every recommendation request to define the AI's cinematic perspective.</p>
                </div>

                <div className="pt-6 border-t border-black/5 dark:border-white/5">
                   <button 
                      onClick={() => updateSystemSettings({ maintenanceMode: !systemSettings.maintenanceMode })}
                      className={`w-full py-5 rounded-2xl font-black uppercase text-sm transition-all shadow-xl ${systemSettings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}
                   >
                     {systemSettings.maintenanceMode ? 'Disable Lockdown' : 'Enable Maintenance Mode'}
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
