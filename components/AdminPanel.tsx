
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
    allowGuestMode: true
  });
  
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  useEffect(() => {
    // In a real implementation, these would be API calls. For now, we interact with localStorage or props.
    const savedKeys = localStorage.getItem('moodflix_api_keys');
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    
    const savedSettings = localStorage.getItem('moodflix_system_settings');
    if (savedSettings) setSystemSettings(JSON.parse(savedSettings));

    // Update user list from localStorage to get the most recent data
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
      isActive: apiKeys.length === 0,
      provider: 'gemini',
      usageCount: 0
    };
    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
    setNewKeyName('');
    setNewKeyValue('');
  };

  const toggleKey = (id: string) => {
    const updated = apiKeys.map(k => ({ ...k, isActive: k.id === id }));
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
  };

  const deleteKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
  };

  const handleToggleAdmin = async (userId: string) => {
    // Update local state
    const updatedUsers = userList.map(u => 
      u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
    );
    setUserList(updatedUsers);
    localStorage.setItem('moodflix_all_users', JSON.stringify(updatedUsers));
    
    // In real app, we'd call the server
    await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, isAdmin: !userList.find(u => u.id === userId)?.isAdmin })
    });
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

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[3rem] p-8 md:p-12 border border-white/5 dark:border-white/5 bg-white/90 dark:bg-black/60 shadow-2xl">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-black/5 dark:border-white/5 pb-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-red-600 mb-1 tracking-tighter">{t.title}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-60">System Operations Hub</p>
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
          <button onClick={() => setActiveTab('stats')} className={`px-8 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all ${activeTab === 'stats' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}>Stats</button>
          <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}>{t.userControl}</button>
          <button onClick={() => setActiveTab('keys')} className={`px-8 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all ${activeTab === 'keys' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}>{t.keys}</button>
          <button onClick={() => setActiveTab('settings')} className={`px-8 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}>AI Settings</button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Platform Population</p>
                <p className="text-5xl font-black text-black dark:text-white">{userList.length}</p>
                <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-xs">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 101.414 1.414L9 7.414V13a1 1 0 102 0V7.414l1.293 1.293a1 1 0 001.414-1.414z"/></svg>
                  <span>Healthy Growth</span>
                </div>
              </div>
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">API Integrity</p>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-2xl font-black text-green-500 uppercase">Operational</p>
                </div>
                <p className="mt-4 text-slate-500 text-xs font-medium">Model: {systemSettings.activeModel.split('-')[2]}</p>
              </div>
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">System Mode</p>
                <p className="text-2xl font-black text-black dark:text-white">
                  {systemSettings.maintenanceMode ? '🔒 Maintenance' : '⚡ Public Live'}
                </p>
                <p className="mt-4 text-slate-500 text-xs font-medium">Auto-recovering active</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="Search users by name or email..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="overflow-x-auto rounded-3xl border border-black/5 dark:border-white/5">
                <table className="w-full text-left rtl:text-right">
                  <thead>
                    <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-5">Identities</th>
                      <th className="px-6 py-5">Role</th>
                      <th className="px-6 py-5">Temporal Origin</th>
                      <th className="px-6 py-5 text-center">Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-black dark:text-white">{u.name}</span>
                            <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isAdmin ? 'bg-red-600/10 text-red-600' : 'bg-black/5 dark:bg-white/5 text-slate-500'}`}>
                            {u.isAdmin ? 'Admin' : 'Civilian'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-xs text-slate-500 font-bold">
                          {new Date(u.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => handleToggleAdmin(u.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${u.isAdmin ? 'text-slate-400 hover:text-red-600' : 'text-red-600 bg-red-600/10 hover:bg-red-600 hover:text-white'}`}
                          >
                            {u.isAdmin ? t.revoke : t.promote}
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
            <div className="space-y-10">
              <form onSubmit={handleAddKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5">
                <input 
                  type="text" 
                  placeholder="Key Label (e.g. Primary Flash)"
                  className="bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-6 py-3 outline-none focus:border-red-600 transition-all font-bold text-black dark:text-white"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="API Key"
                  className="bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-6 py-3 outline-none focus:border-red-600 transition-all font-mono text-black dark:text-white"
                  value={newKeyValue}
                  onChange={e => setNewKeyValue(e.target.value)}
                />
                <button className="bg-red-600 text-white font-black py-3 rounded-xl hover:brightness-110 transition-all uppercase text-sm">Deploy Key</button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiKeys.map(k => (
                  <div key={k.id} className={`p-6 rounded-[1.5rem] border transition-all ${k.isActive ? 'border-red-600 bg-red-600/5' : 'border-black/10 dark:border-white/10'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-black dark:text-white">{k.name}</h4>
                        <p className="text-[10px] font-mono text-slate-500">...{k.key.slice(-8)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleKey(k.id)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${k.isActive ? 'bg-red-600 text-white' : 'bg-black/5 dark:bg-white/5 text-slate-500'}`}>
                          {k.isActive ? 'Active' : 'Standby'}
                        </button>
                        <button onClick={() => deleteKey(k.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.activeModel}</label>
                  <div className="flex flex-col gap-2">
                    {['gemini-3-flash-preview', 'gemini-3-pro-preview'].map(m => (
                      <button 
                        key={m}
                        onClick={() => updateSystemSettings({ activeModel: m as any })}
                        className={`px-6 py-4 rounded-2xl border text-left flex justify-between items-center transition-all ${systemSettings.activeModel === m ? 'border-red-600 bg-red-600/5 ring-1 ring-red-600' : 'border-black/10 dark:border-white/10 hover:border-red-600/50'}`}
                      >
                        <span className="font-black text-black dark:text-white uppercase">{m.split('-')[2]}</span>
                        {systemSettings.activeModel === m && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Maintenance Control</label>
                  <button 
                    onClick={() => updateSystemSettings({ maintenanceMode: !systemSettings.maintenanceMode })}
                    className={`w-full px-6 py-4 rounded-2xl border flex justify-between items-center transition-all ${systemSettings.maintenanceMode ? 'bg-red-600 border-red-600 text-white' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500'}`}
                  >
                    <span className="font-black uppercase">Lockdown Mode</span>
                    <span className="font-bold">{systemSettings.maintenanceMode ? 'ENABLED' : 'DISABLED'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.systemPrompt}</label>
                <textarea 
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-medium text-black dark:text-white min-h-[150px] leading-relaxed"
                  placeholder="Inject global AI behavior parameters..."
                  value={systemSettings.customSystemPrompt}
                  onChange={e => updateSystemSettings({ customSystemPrompt: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
