import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, Wind, Moon, Sun, Volume2, VolumeX, Play, Pause, 
  CheckCircle2, Circle, MessageSquare, BarChart3, Settings, ShieldAlert,
  Flame, Calendar, Plus, RefreshCw, Feather, User, Send, Compass, Music, Sliders, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

const MOODS = [
  { id: 'peaceful', label: 'Peaceful', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', hex: '#10b981' },
  { id: 'calm', label: 'Calm', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', hex: '#14b8a6' },
  { id: 'anxious', label: 'Anxious', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', hex: '#f59e0b' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', hex: '#f43f5e' },
  { id: 'tired', label: 'Low Energy', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', hex: '#6366f1' },
  { id: 'hopeful', label: 'Hopeful', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30', hex: '#0ea5e9' }
];

const THEMES = {
  dark: { bg: 'bg-slate-900', card: 'bg-slate-800/60 border-slate-700/50', text: 'text-slate-100', textSub: 'text-slate-400', accent: 'bg-indigo-600 hover:bg-indigo-500' },
  sage: { bg: 'bg-emerald-950', card: 'bg-emerald-900/40 border-emerald-800/50', text: 'text-emerald-100', textSub: 'text-emerald-400', accent: 'bg-emerald-600 hover:bg-emerald-500' },
  twilight: { bg: 'bg-slate-950', card: 'bg-indigo-950/40 border-indigo-900/50', text: 'text-purple-100', textSub: 'text-purple-400', accent: 'bg-purple-600 hover:bg-purple-500' },
  peach: { bg: 'bg-amber-950', card: 'bg-amber-900/30 border-amber-800/40', text: 'text-amber-100', textSub: 'text-amber-400', accent: 'bg-amber-600 hover:bg-amber-500' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [journalNote, setJournalNote] = useState('');
  const [moodLogs, setMoodLogs] = useState([
    { date: 'Mon', score: 6, mood: 'Calm' },
    { date: 'Tue', score: 4, mood: 'Anxious' },
    { date: 'Wed', score: 7, mood: 'Hopeful' },
    { date: 'Thu', score: 5, mood: 'Tired' },
    { date: 'Fri', score: 8, mood: 'Peaceful' },
    { date: 'Sat', score: 7, mood: 'Calm' }
  ]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Welcome to Solace. How are you feeling right now in your body and mind?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Breathing state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathPattern, setBreathPattern] = useState('4-7-8');

  // Soundscape state
  const [playingSound, setPlayingSound] = useState(null);
  const audioCtxRef = useRef(null);

  // Grounding modal state
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);

  // Dynamic styles
  const currentTheme = THEMES[theme];

  // Simple Web Audio noise generator for soundscapes
  const toggleSound = (soundId) => {
    if (playingSound === soundId) {
      if (audioCtxRef.current) audioCtxRef.current.close();
      setPlayingSound(null);
      return;
    }

    if (audioCtxRef.current) audioCtxRef.current.close();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (soundId === 'rain') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
    } else if (soundId === 'waves') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
    } else if (soundId === 'bowl') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setPlayingSound(soundId);
  };

  // Log mood submit
  const handleMoodSubmit = () => {
    if (!selectedMood) return;
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    
    const newLog = {
      date: 'Today',
      score: moodIntensity,
      mood: selectedMood.label
    };

    setMoodLogs([...moodLogs, newLog]);
    setAiAnalysis(`Thank you for sharing. Acknowledging feeling ${selectedMood.label.toLowerCase()} is an important first step. Take a moment to ground yourself.`);
    setSelectedMood(null);
    setJournalNote('');
  };

  // Handle chat submission
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessages = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setIsTyping(true);

    // Simulated empathetic response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          text: `I hear you. It takes courage to put that into words. Remember to give yourself grace today.` 
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors duration-500 font-sans p-4 md:p-8`}>
      <div className="max-w-md mx-auto min-h-[85vh] flex flex-col justify-between pb-20">
        
        {/* Header */}
        <header className="flex items-center justify-between py-4 mb-6 border-b border-slate-700/30">
          <div className="flex items-[#10b981] gap-2 items-center">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">Solace AI</h1>
          </div>
          
          {/* Theme Switcher */}
          <div className="flex gap-2">
            {Object.keys(THEMES).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-6 h-6 rounded-full border border-white/20 capitalize ${
                  t === 'dark' ? 'bg-slate-800' :
                  t === 'sage' ? 'bg-emerald-800' :
                  t === 'twilight' ? 'bg-indigo-950' : 'bg-amber-800'
                } ${theme === t ? 'ring-2 ring-indigo-400' : ''}`}
                title={`${t} theme`}
              />
            ))}
          </div>
        </header>

        {/* Dynamic Views */}
        {activeTab === 'home' && (
          <main className="space-y-6">
            {/* Welcome Greeting */}
            <div className={`p-5 rounded-2xl ${currentTheme.card} backdrop-blur-md`}>
              <h2 className="text-lg font-semibold mb-1">Good day, Prachi</h2>
              <p className={`text-sm ${currentTheme.textSub}`}>Pause for a moment. How are you feeling right now?</p>
            </div>

            {/* Mood Tracker */}
            <div className={`p-5 rounded-2xl ${currentTheme.card} backdrop-blur-md space-y-4`}>
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">Select Emotion</h3>
              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${m.color} ${
                      selectedMood?.id === m.id ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="space-y-4 pt-2 border-t border-slate-700/40">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Intensity</span>
                      <span>{moodIntensity} / 10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={moodIntensity} 
                      onChange={(e) => setMoodIntensity(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <textarea
                    placeholder="Write a brief reflection..."
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows="2"
                  />

                  <button 
                    onClick={handleMoodSubmit}
                    className={`w-full py-3 rounded-xl font-medium ${currentTheme.accent} transition-all`}
                  >
                    Log Reflection
                  </button>
                </div>
              )}

              {aiAnalysis && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
                  {aiAnalysis}
                </div>
              )}
            </div>

            {/* Quick Grounding Trigger */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowGrounding(true)}
                className={`p-4 rounded-2xl ${currentTheme.card} flex flex-col items-start gap-2 hover:border-indigo-500/50 transition-all`}
              >
                <Feather className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium">5-4-3-2-1 Grounding</span>
              </button>

              <button 
                onClick={() => setActiveTab('breathe')}
                className={`p-4 rounded-2xl ${currentTheme.card} flex flex-col items-start gap-2 hover:border-teal-500/50 transition-all`}
              >
                <Wind className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-medium">Deep Breathing</span>
              </button>
            </div>
          </main>
        )}

        {activeTab === 'chat' && (
          <main className={`flex-1 flex flex-col justify-between p-4 rounded-2xl ${currentTheme.card}`}>
            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl text-sm max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'ml-auto bg-indigo-600 text-white' 
                      : 'bg-slate-900/60 text-slate-200 border border-slate-700/40'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="p-3 rounded-xl text-xs bg-slate-900/40 text-slate-400 animate-pulse">
                  Solace AI is thinking...
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <input
                type="text"
                placeholder="Talk to Solace..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
                className={`p-3 rounded-xl ${currentTheme.accent}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </main>
        )}

        {activeTab === 'breathe' && (
          <main className="space-y-6 flex flex-col items-center justify-center py-8">
            <div className="relative flex items-center justify-center">
              <div className={`w-48 h-48 rounded-full border-4 border-indigo-500/30 flex items-center justify-center transition-all duration-1000 ${
                isBreathing ? 'scale-110 border-indigo-400 shadow-lg shadow-indigo-500/20' : 'scale-100'
              }`}>
                <span className="text-xl font-medium tracking-wide">{isBreathing ? breathPhase : 'Ready'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`px-8 py-3 rounded-full font-medium ${currentTheme.accent} transition-all`}
              >
                {isBreathing ? 'Pause' : 'Start Session'}
              </button>
            </div>
          </main>
        )}

        {activeTab === 'sound' && (
          <main className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">Ambient Soundscapes</h3>
            
            {[
              { id: 'rain', label: 'Gentle Rain', desc: 'Soft rainfall frequencies' },
              { id: 'waves', label: 'Ocean Tide', desc: 'Deep calm rhythmic waves' },
              { id: 'bowl', label: '432Hz Singing Bowl', desc: 'Harmonic meditative tone' }
            ].map((sound) => (
              <div 
                key={sound.id}
                className={`p-4 rounded-xl ${currentTheme.card} flex items-center justify-between`}
              >
                <div>
                  <h4 className="font-medium text-sm">{sound.label}</h4>
                  <p className={`text-xs ${currentTheme.textSub}`}>{sound.desc}</p>
                </div>
                <button
                  onClick={() => toggleSound(sound.id)}
                  className={`p-3 rounded-full border border-slate-700/50 ${
                    playingSound === sound.id ? 'bg-indigo-600 text-white' : 'bg-slate-900/40 text-slate-300'
                  }`}
                >
                  {playingSound === sound.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </main>
        )}

        {activeTab === 'stats' && (
          <main className="space-y-6">
            <div className={`p-5 rounded-2xl ${currentTheme.card}`}>
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400 mb-4">Mood Trends</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodLogs}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </main>
        )}

        {/* Grounding Modal */}
        {showGrounding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`max-w-sm w-full p-6 rounded-2xl ${currentTheme.card} space-y-4`}>
              <h3 className="text-lg font-bold">5-4-3-2-1 Sensory Grounding</h3>
              <p className="text-sm text-slate-300">
                Notice 5 things you can see around you right now. Take your time.
              </p>
              <button
                onClick={() => setShowGrounding(false)}
                className={`w-full py-2.5 rounded-xl ${currentTheme.accent}`}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-[90%] bg-slate-900/80 backdrop-blur-lg border border-slate-800 rounded-full p-2 flex justify-around shadow-2xl">
          {[
            { id: 'home', icon: Heart, label: 'Home' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'breathe', icon: Wind, label: 'Breathe' },
            { id: 'sound', icon: Music, label: 'Sound' },
            { id: 'stats', icon: BarChart3, label: 'Stats' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2.5 rounded-full transition-all ${
                  isActive ? 'bg-indigo-600 text-white scale-110' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}