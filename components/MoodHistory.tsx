
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { translations } from '../translations';

const MoodHistory = ({ history, language }) => {
  const t = translations[language];
  const isRtl = language === 'fa';
  
  const chartData = history.slice(-7).map(h => ({
    name: h.date,
    val: h.intensity === 'high' ? 3 : h.intensity === 'medium' ? 2 : 1
  }));

  if (history.length === 0) return (
    <div className="max-w-4xl mx-auto py-24 text-center opacity-50 animate-fade-in">
        <p className="text-xl md:text-3xl font-bold">{language === 'fa' ? 'هنوز تاریخچه‌ای ثبت نشده است.' : 'No history yet.'}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-16 px-4 animate-fade-in">
      <div className="glass-card p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] mb-12">
        <h3 className="text-2xl md:text-4xl font-black mb-10 text-center tracking-tight">{t.historyTitle}</h3>
        <div className="h-48 md:h-80 w-full mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E50914" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 'bold' }}
                 itemStyle={{ color: '#E50914' }}
              />
              <Area type="monotone" dataKey="val" stroke="#E50914" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {history.slice(-6).reverse().map((item, i) => (
            <div key={i} className="bg-white/5 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex justify-between items-center text-sm md:text-lg border border-white/5 hover:border-red-600/30 transition-all group">
              <div className={`${isRtl ? 'text-right' : 'text-left'} space-y-1`}>
                <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{item.date}</span>
                <p className="font-black">
                  {t.moods[item.mood] || item.mood} 
                  <span className="mx-2 opacity-30">/</span>
                  <span className="text-red-600 opacity-80">{t.intensityLevels[item.intensity] || item.intensity}</span>
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-white font-black group-hover:text-red-500 transition-colors text-right max-w-[150px] md:max-w-none">{item.movieTitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodHistory;
