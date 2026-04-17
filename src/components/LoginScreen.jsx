import React, { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function LoginScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link, then sign in.');
        setMode('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        <div className="text-center space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-bone-500">SSB Screening</div>
          <h1 className="font-display text-5xl font-normal italic text-bone-50">PPDT Practice</h1>
          <p className="text-bone-400 text-sm">A quiet workspace for the picture test. Sign in to save your attempts.</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-bone-50 text-ink-950 font-medium text-sm hover:bg-white disabled:opacity-50 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-bone-500">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-md bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-ink-950 font-medium text-sm transition"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {error && <div className="p-3 rounded-md bg-red-950/40 border border-red-900/50 text-sm text-red-300">{error}</div>}
        {message && <div className="p-3 rounded-md bg-gold-400/10 border border-gold-400/30 text-sm text-gold-300">{message}</div>}

        <div className="text-center text-sm text-bone-500">
          {mode === 'login' ? (
            <>No account? <button onClick={() => setMode('signup')} className="text-gold-300 hover:text-gold-400 underline underline-offset-4">Sign up</button></>
          ) : (
            <>Already have one? <button onClick={() => setMode('login')} className="text-gold-300 hover:text-gold-400 underline underline-offset-4">Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-md bg-ink-900 border border-white/5 focus:border-gold-400/60 focus:outline-none text-sm text-bone-100 placeholder:text-bone-500 transition';
