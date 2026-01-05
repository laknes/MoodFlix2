
import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { fetchAllUsers, updateMemberStatus, fetchSystemSettings, saveSystemSettings } from '../services/adminService';

const AdminPanel = ({ language, onSync, onSettingsUpdate }) => {
  const t = translations[language].adminDashboard;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [userList, setUserList] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    activeModel: 'gemini-3-flash-preview',
    customSystemPrompt: '',
    allowGuestMode: true,
    temperature: 1.0,
    topP: 0.95,
    topK: 64,
    logs: []
  });

  const loadData = async () => {
    try {
      const [users, settings] = await Promise.all([fetchAllUsers(), fetchSystemSettings()]);
      setUserList(users);
      if (settings && Object.keys(settings).length > 0) setSystemSettings(settings);
    } catch (e) {
      console.error("Admin data load failed", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAdmin = async (userId, current) => {
    await updateMemberStatus(userId, { isAdmin: !current });
    loadData();
  };

  const handleToggleStatus = async (userId, current) => {
    await updateMemberStatus(userId, { status: current === 'active' ? 'suspended' : 'active' });
    loadData();
  };

  const saveSettings = async (updates) => {
    const next = { ...systemSettings, ...updates };
    setSystemSettings(next);
    await saveSystemSettings(next);
    if (onSettingsUpdate) onSettingsUpdate(next);
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRtl = language === 'fa';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[3.5rem] p-8 md:p-12 border border-white/5 bg-white/95 dark:bg-[#080808]/90 shadow-2xl relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 border-b border-black/5 dark:border-white/5 pb-10">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase">{t.title}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] opacity-60">Sovereign Administration Hub</p>
          </div>
          <button onClick={onSync} className="px-8 py-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl font-black text-xs uppercase hover:bg-black/5 transition-all shadow-lg">
            {t.syncData}
          </button>
        </div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: 'dashboard', label: t.dashboard },
            { id: 'users', label: t.userControl },
            { id: 'settings', label: t.systemSettings }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`px-8 py-4 rounded-[1.4rem] font-black text-[11px] uppercase transition-all border ${activeTab === tab.id ? 'bg-red-600 border-red-600 text-white shadow-xl' : 'bg-black/5 dark:bg-white/5 text-slate-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'users' && (
            <div className="space-y-10">
              <input 
                type="text" 
                placeholder="Search citizens..."
                className="w-full bg-black/5 border border-black/10 rounded-[1.8rem] px-10 py-5 outline-none focus:border-red-600 transition-all font-bold dark:text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredUsers.map(u => (
                  <div key={u.id} className="glass-card p-8 rounded-[3rem] border border-white/5 flex flex-col group relative shadow-lg">
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-16 h-16 bg-red-600/10 rounded-[1.5rem] flex items-center justify-center font-black text-red-600 text-2xl">
                         {u.name[0].toUpperCase()}
                       </div>
                       <div>
                         <h4 className="font-black text-black dark:text-white uppercase text-lg">{u.name}</h4>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{u.email}</p>
                       </div>
                    </div>
                    <div className="flex gap-3 mt-auto">
                       <button onClick={() => handleToggleAdmin(u.id, !!u.isAdmin)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${u.isAdmin ? 'bg-slate-800 text-white' : 'bg-red-600 text-white shadow-xl'}`}>
                         {u.isAdmin ? t.revoke : t.promote}
                       </button>
                       <button onClick={() => handleToggleStatus(u.id, u.status)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border ${u.status === 'active' ? 'text-red-600 border-red-600/20' : 'bg-green-600 text-white'}`}>
                         {u.status === 'active' ? 'Lock' : 'Unlock'}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-12">
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">{t.activeModel}</label>
                  {['gemini-3-flash-preview', 'gemini-3-pro-preview'].map(m => (
                    <button 
                      key={m}
                      onClick={() => saveSettings({ activeModel: m })}
                      className={`w-full px-10 py-8 rounded-[3rem] border-2 text-left flex justify-between items-center transition-all ${systemSettings.activeModel === m ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-black/5'}`}
                    >
                      <span className="font-black dark:text-white uppercase text-xl">{m.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black dark:text-white uppercase">Logical Temperature: {systemSettings.temperature}</label>
                   <input type="range" min="0" max="2" step="0.1" className="w-full h-2.5 bg-black/10 rounded-full accent-red-600" value={systemSettings.temperature} onChange={(e) => saveSettings({ temperature: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-6">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">{t.systemPrompt}</label>
                <textarea 
                  className="w-full bg-black/5 border border-black/10 rounded-[3.5rem] px-12 py-10 outline-none focus:border-red-600 font-medium dark:text-white min-h-[400px]"
                  value={systemSettings.customSystemPrompt}
                  onChange={e => saveSettings({ customSystemPrompt: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Citizens</p>
                <p className="text-5xl font-black text-red-600">{userList.length}</p>
              </div>
              <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Stability</p>
                <p className="text-3xl font-black text-green-500">OPTIMAL</p>
              </div>
              <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Neural Entropy</p>
                <p className="text-3xl font-black text-blue-500">LOW</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
