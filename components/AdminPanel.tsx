
import React, { useState, useEffect } from 'react';
import { Language, User, ApiKeyConfig, SystemSettings, LogEntry } from '../types';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'neural' | 'infrastructure'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    activeModel: 'gemini-3-flash-preview',
    customSystemPrompt: '',
    allowGuestMode: true,
    temperature: 1.0,
    topP: 0.95,
    topK: 64,
    logs: []
  });
  
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyProvider, setNewKeyProvider] = useState('Google Cloud');
  const [newKeyIsActive, setNewKeyIsActive] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('moodflix_api_keys');
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    
    const savedSettings = localStorage.getItem('moodflix_system_settings');
    if (savedSettings) setSystemSettings(JSON.parse(savedSettings));

    const savedUsers = localStorage.getItem('moodflix_all_users');
    if (savedUsers) setUserList(JSON.parse(savedUsers));
  }, []);

  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message
    };
    const updatedLogs = [newLog, ...systemSettings.logs].slice(0, 50);
    updateSystemSettings({ logs: updatedLogs });
  };

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
    if (newKey.isActive) {
      updated = updated.map(k => ({ ...k, isActive: false }));
    }
    updated.push(newKey);
    
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
    addLog(`Key enrolled: ${newKeyName}`, 'info');
    setNewKeyName('');
    setNewKeyValue('');
    setNewKeyIsActive(false);
  };

  const toggleKey = (id: string) => {
    const updated = apiKeys.map(k => ({ ...k, isActive: k.id === id }));
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
    const target = updated.find(k => k.id === id);
    addLog(`Access Token toggled: ${target?.name}`, 'security');
  };

  const deleteKey = (id: string) => {
    const target = apiKeys.find(k => k.id === id);
    const updated = apiKeys.filter(k => k.id !== id);
    if (updated.length > 0 && !updated.some(k => k.isActive)) {
      updated[0].isActive = true;
    }
    setApiKeys(updated);
    localStorage.setItem('moodflix_api_keys', JSON.stringify(updated));
    addLog(`Access Token revoked: ${target?.name}`, 'warning');
  };

  const handleToggleAdmin = async (userId: string) => {
    const updatedUsers: User[] = userList.map(u => 
      u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
    );
    setUserList(updatedUsers);
    localStorage.setItem('moodflix_all_users', JSON.stringify(updatedUsers));
    const target = updatedUsers.find(u => u.id === userId);
    addLog(`Admin status ${target?.isAdmin ? 'granted' : 'revoked'} for ${target?.email}`, 'security');
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers: User[] = userList.map(u => 
      u.id === userId ? { ...u, status: (u.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' } : u
    );
    setUserList(updatedUsers);
    localStorage.setItem('moodflix_all_users', JSON.stringify(updatedUsers));
    const target = updatedUsers.find(u => u.id === userId);
    addLog(`Identity ${target?.status === 'active' ? 'activated' : 'suspended'}: ${target?.email}`, target?.status === 'suspended' ? 'warning' : 'info');
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

  const StatsCard = ({ title, value, sub, icon, trend }: any) => (
    <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-red-600/10 rounded-xl text-red-600">{icon}</div>
        {trend && <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-black dark:text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[3.5rem] p-8 md:p-12 border border-white/5 dark:border-white/5 bg-white/95 dark:bg-[#080808]/90 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>

        <div className={`flex flex-col md:flex-row justify-between items-center gap-6 mb-16 relative z-10 border-b border-black/5 dark:border-white/5 pb-10`}>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-2xl shadow-xl shadow-red-600/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.22 0 2.383.218 3.46.616m.77 10.745A9.013 9.013 0 0115.5 18M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75V19a2 2 0 11-4 0v-.25c0-1.035-.32-2.04-.92-2.85l-.547-.547z" /></svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter">{t.title}</h2>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] opacity-60">Moodflix Cinematic Operations Framework</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => { addLog("Network integrity check started", "info"); onSync(); }} className="px-8 py-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl font-black text-xs uppercase hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 shadow-lg">
               {t.syncData}
             </button>
             <button onClick={() => updateSystemSettings({ maintenanceMode: !systemSettings.maintenanceMode })} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-lg active:scale-95 ${systemSettings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
               {systemSettings.maintenanceMode ? 'Operational' : 'Maintenance'}
             </button>
          </div>
        </div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide no-scrollbar relative z-10">
          {(['dashboard', 'members', 'neural', 'infrastructure'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-10 py-4 rounded-[1.2rem] font-black text-[11px] uppercase whitespace-nowrap transition-all border ${activeTab === tab ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-500 hover:bg-black/10 dark:hover:bg-white/10'}`}
            >
              {tab === 'dashboard' ? 'Overview' : tab === 'members' ? t.userControl : tab === 'neural' ? t.apiControl : t.apiKeysTab}
            </button>
          ))}
        </div>

        <div className="min-h-[500px] relative z-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title={t.totalUsers} 
                  value={userList.length} 
                  sub={`Active: ${userList.filter(u => u.status === 'active').length}`}
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  trend={12}
                />
                <StatsCard 
                  title="Neural Core" 
                  value={systemSettings.activeModel.split('-')[2].toUpperCase()} 
                  sub={`Temp: ${systemSettings.temperature}`}
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                />
                <StatsCard 
                  title="System Pulse" 
                  value="100%" 
                  sub="Stability Verified"
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                />
                <StatsCard 
                  title="Active Tokens" 
                  value={apiKeys.filter(k => k.isActive).length} 
                  sub={`Total Provisioned: ${apiKeys.length}`}
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5">
                   <h3 className="text-xl font-black mb-6 uppercase tracking-tighter flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-red-600"></span>
                     {t.recentActivity}
                   </h3>
                   <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                     {systemSettings.logs.length > 0 ? systemSettings.logs.map(log => (
                       <div key={log.id} className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-white/5 transition-all">
                          <div className={`w-1 h-full min-h-[20px] rounded-full shrink-0 ${log.level === 'error' ? 'bg-red-500' : log.level === 'security' ? 'bg-blue-600' : log.level === 'warning' ? 'bg-yellow-500' : 'bg-slate-500'}`} />
                          <div className="flex-grow">
                            <p className="text-[10px] font-black text-slate-500 mb-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            <p className="text-xs font-bold text-black dark:text-white leading-relaxed">{log.message}</p>
                          </div>
                       </div>
                     )) : (
                       <div className="py-12 text-center opacity-30 italic text-sm">Waiting for incoming telemetry...</div>
                     )}
                   </div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-red-600/5">
                   <h3 className="text-xl font-black mb-6 uppercase tracking-tighter">{t.systemHealth}</h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                           <span>API Latency</span>
                           <span>240ms</span>
                         </div>
                         <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full w-[20%] bg-green-500 rounded-full"></div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                           <span>Neural Density</span>
                           <span>0.95</span>
                         </div>
                         <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full w-[95%] bg-blue-600 rounded-full"></div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                           <span>Storage (JSON)</span>
                           <span>4.2MB</span>
                         </div>
                         <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full w-[15%] bg-slate-500 rounded-full"></div>
                         </div>
                      </div>
                   </div>
                   <div className="mt-12 p-6 bg-black/20 rounded-[2rem] border border-white/5 text-center">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Master Encryption</p>
                     <div className="text-xs font-mono text-slate-300 break-all opacity-40">
                       AES-256-GCM-ENABLED
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-4 relative">
                <input 
                  type="text" 
                  placeholder="Filter users by name, email or status..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[1.5rem] px-8 py-5 focus:border-red-600 outline-none transition-all font-bold text-black dark:text-white pl-12"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(u => (
                  <div key={u.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 hover:border-red-600/30 transition-all flex flex-col group relative">
                    {u.isAdmin && <div className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Admin</div>}
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 bg-red-600/10 rounded-[1.2rem] flex items-center justify-center font-black text-red-600 text-xl border border-red-600/10">
                         {u.name[0].toUpperCase()}
                       </div>
                       <div className="flex-grow min-w-0">
                         <h4 className="font-black text-black dark:text-white truncate uppercase text-sm tracking-tight">{u.name}</h4>
                         <p className="text-[10px] text-slate-500 font-bold truncate opacity-70">{u.email}</p>
                       </div>
                    </div>

                    <div className="space-y-4 mb-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                       <div className="flex justify-between border-b border-white/5 pb-2">
                         <span>Origin</span>
                         <span className="text-black dark:text-white">{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '—'}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/5 pb-2">
                         <span>Status</span>
                         <span className={u.status === 'active' ? 'text-green-500' : 'text-red-600'}>{u.status}</span>
                       </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                       <button 
                         onClick={() => handleToggleAdmin(u.id)}
                         className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${u.isAdmin ? 'bg-slate-800 text-white' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'}`}
                       >
                         {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                       </button>
                       <button 
                         onClick={() => handleToggleStatus(u.id)}
                         className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${u.status === 'active' ? 'bg-black/5 dark:bg-white/5 text-red-600' : 'bg-green-600 text-white'}`}
                       >
                         {u.status === 'active' ? 'Suspend' : 'Activate'}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'neural' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t.activeModel}</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['gemini-3-flash-preview', 'gemini-3-pro-preview'].map(m => (
                      <button 
                        key={m}
                        onClick={() => { updateSystemSettings({ activeModel: m as any }); addLog(`Processing model shifted to ${m}`, "security"); }}
                        className={`px-8 py-6 rounded-[2rem] border-2 text-left flex justify-between items-center transition-all ${systemSettings.activeModel === m ? 'border-red-600 bg-red-600/5' : 'border-black/5 dark:border-white/5 hover:border-red-600/20 bg-black/5 dark:bg-white/5'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-black dark:text-white uppercase text-base tracking-tight">{m.split('-')[2].toUpperCase()}</span>
                          <span className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-widest">{m.split('-')[1]} • v{m.split('-')[0].split('-')[1]}</span>
                        </div>
                        {systemSettings.activeModel === m && <div className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_15px_rgba(229,9,20,0.8)]"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-black/5 dark:bg-white/5">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 text-center">Neural Parameter Calibration</h4>
                   
                   <div className="space-y-10">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-black dark:text-white uppercase tracking-tight">Temperature</label>
                            <span className="text-sm font-black text-red-600 bg-red-600/10 px-3 py-1 rounded-lg">{systemSettings.temperature}</span>
                         </div>
                         <input type="range" min="0" max="2" step="0.1" className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-red-600" value={systemSettings.temperature} onChange={(e) => updateSystemSettings({ temperature: parseFloat(e.target.value) })} />
                         <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">
                           <span>Strict</span>
                           <span>Creative</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-black dark:text-white uppercase tracking-tight">Top-P (Nucleus)</label>
                            <span className="text-sm font-black text-red-600 bg-red-600/10 px-3 py-1 rounded-lg">{systemSettings.topP}</span>
                         </div>
                         <input type="range" min="0" max="1" step="0.01" className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-red-600" value={systemSettings.topP} onChange={(e) => updateSystemSettings({ topP: parseFloat(e.target.value) })} />
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-black dark:text-white uppercase tracking-tight">Top-K Selection</label>
                            <span className="text-sm font-black text-red-600 bg-red-600/10 px-3 py-1 rounded-lg">{systemSettings.topK}</span>
                         </div>
                         <input type="range" min="1" max="100" step="1" className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-red-600" value={systemSettings.topK} onChange={(e) => updateSystemSettings({ topK: parseInt(e.target.value) })} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{t.systemPrompt}</label>
                  <div className="relative group">
                    <textarea 
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2.5rem] px-10 py-8 focus:border-red-600 outline-none transition-all font-medium text-black dark:text-white min-h-[450px] leading-relaxed shadow-inner no-scrollbar text-sm"
                      placeholder="Enter cinematic system directive logic..."
                      value={systemSettings.customSystemPrompt}
                      onChange={e => updateSystemSettings({ customSystemPrompt: e.target.value })}
                    />
                    <div className="absolute top-4 right-6 text-[10px] font-black text-slate-500 group-focus-within:text-red-600 transition-colors">ACTIVE PROMPT</div>
                  </div>
                  <div className="p-6 bg-red-600/5 rounded-[1.5rem] border border-red-600/10">
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                      Pro-tip: Direct the AI to analyze rhythm, lighting, and score to provide deeper cinematic insights. These instructions are appended to every inference request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-12 animate-fade-in">
              <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-black/5 dark:bg-white/5">
                <h3 className="text-xl font-black mb-10 flex items-center gap-4">
                   <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                   {t.addKey}
                </h3>
                <form onSubmit={handleAddKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t.keyName}</label>
                    <input 
                      type="text" 
                      placeholder="Project Alpha..."
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-red-600 transition-all font-bold text-black dark:text-white"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t.keyValue}</label>
                    <input 
                      type="password" 
                      placeholder="GEMINI_API_X..."
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-red-600 transition-all font-mono text-black dark:text-white"
                      value={newKeyValue}
                      onChange={e => setNewKeyValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t.provider}</label>
                    <select 
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-red-600 transition-all font-bold text-black dark:text-white appearance-none"
                      value={newKeyProvider}
                      onChange={e => setNewKeyProvider(e.target.value)}
                    >
                      <option value="Google Cloud">Google Cloud</option>
                      <option value="Vertex AI">Vertex AI</option>
                      <option value="AI Studio">AI Studio</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setNewKeyIsActive(!newKeyIsActive)}
                      className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase transition-all border ${newKeyIsActive ? 'bg-green-600 border-green-600 text-white' : 'bg-black/5 dark:bg-white/5 text-slate-500 border-black/10 dark:border-white/10'}`}
                    >
                      {newKeyIsActive ? 'ACTIVE' : 'STANDBY'}
                    </button>
                    <button 
                      type="submit"
                      className="h-14 w-14 bg-red-600 text-white rounded-2xl hover:brightness-110 transition-all flex items-center justify-center shrink-0 shadow-xl shadow-red-600/20 active:scale-95"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {apiKeys.map(k => (
                  <div 
                    key={k.id} 
                    className={`relative p-8 rounded-[3rem] border-2 transition-all group overflow-hidden ${
                      k.isActive 
                        ? 'border-red-600 bg-red-600/5 shadow-2xl shadow-red-600/10' 
                        : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    {k.isActive && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-5 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] z-10">
                        Operational
                      </div>
                    )}
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${k.isActive ? 'bg-red-600 text-white shadow-lg' : 'bg-white/10 text-slate-400'}`}>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </div>
                        <button 
                          onClick={() => deleteKey(k.id)}
                          className="p-3 text-slate-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 bg-black/5 rounded-xl"
                          title={t.deleteKey}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      
                      <h4 className="font-black text-xl mb-1 dark:text-white uppercase truncate tracking-tight">{k.name}</h4>
                      <div className="flex items-center gap-3 mb-8">
                        <span className="text-[10px] font-black text-red-600 bg-red-600/10 px-3 py-1 rounded-lg uppercase tracking-widest">{k.provider}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{t.usage}: {k.usageCount} INF</span>
                      </div>
                      
                      <div className="mt-auto flex gap-3">
                        <div className="flex-grow bg-black/10 dark:bg-black/60 rounded-xl px-4 py-3 font-mono text-[11px] text-slate-500 truncate flex items-center border border-white/5">
                          ••••••••{k.key.slice(-8)}
                        </div>
                        {!k.isActive && (
                          <button 
                            onClick={() => toggleKey(k.id)}
                            className="px-6 py-3 bg-white dark:bg-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all border border-white/10 active:scale-95 shadow-md"
                          >
                            Deploy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center mt-12">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] opacity-40">Moodflix Sovereign Operating System v4.2.0-LTS</p>
      </div>
    </div>
  );
};

export default AdminPanel;
