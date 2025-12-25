
import React from 'react';
import { Language, User } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  users: User[];
  onSync: () => void;
}

const AdminPanel: React.FC<Props> = ({ language, users, onSync }) => {
  const t = translations[language].adminDashboard;
  const [activeTab, setActiveTab] = React.useState<'stats' | 'users' | 'keys'>('stats');

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card rounded-[3rem] p-8 md:p-12 border-red-600/20 bg-black/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h2 className="text-3xl md:text-5xl font-black gradient-text">{t.title}</h2>
          <button 
            onClick={onSync}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-red-600/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.syncData}
          </button>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all ${activeTab === 'stats' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {t.status}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {t.userControl}
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all ${activeTab === 'keys' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400'}`}
          >
            {t.apiControl}
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{t.totalUsers}</p>
              <p className="text-4xl font-black text-red-600">{users.length}</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Gemini Engine</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xl font-bold">Connected</p>
              </div>
            </div>
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{t.lastSync}</p>
              <p className="text-xl font-bold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-xs font-bold uppercase">
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Joined</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-bold">{u.name}</td>
                    <td className="py-4 px-4 text-slate-400">{u.email}</td>
                    <td className="py-4 px-4 text-slate-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-4">{t.activeApiKey}</label>
              <div className="flex gap-4">
                <input 
                  type="password" 
                  readOnly 
                  value="************************************" 
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-red-600 font-mono"
                />
                <button className="bg-white/10 text-white font-black px-6 py-3 rounded-xl hover:bg-white/20 transition-all">Edit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
