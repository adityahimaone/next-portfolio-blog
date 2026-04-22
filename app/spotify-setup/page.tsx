'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Music, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SpotifySetupPage() {
  const [step, setStep] = useState(1)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load from session storage on mount
  useEffect(() => {
    const savedId = sessionStorage.getItem('spotify_client_id')
    const savedSecret = sessionStorage.getItem('spotify_client_secret')
    if (savedId) setClientId(savedId)
    if (savedSecret) setClientSecret(savedSecret)

    // Check for query params (callback)
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      setStep(2)
    }
  }, [])

  const handleStartAuth = () => {
    if (!clientId || !clientSecret) {
      setError('Please provide both Client ID and Client Secret')
      return
    }

    setError(null)
    setIsConnecting(true)

    // Store in session storage so we can retrieve them after redirect
    sessionStorage.setItem('spotify_client_id', clientId)
    sessionStorage.setItem('spotify_client_secret', clientSecret)

    // Redirect to our auth endpoint
    // We pass the credentials in the query to the auth route which will use them for the redirect_uri callback logic
    const authUrl = new URL('/api/spotify-auth', window.location.origin)
    // Note: The /api/spotify-auth route we saw earlier doesn't take client_secret, 
    // but we'll update it or use the one that does.
    window.location.href = `/api/spotify-auth?client_id=${clientId}&client_secret=${clientSecret}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />

      <main className="relative z-10 container mx-auto px-6 py-24 flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl mb-6">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">System Configuration</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic mb-4">
            SPOTIFY <span className="text-amber-500">ENGINE</span>
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            Initialize the real-time audio bridge between your Spotify playback and this portfolio.
          </p>
        </motion.div>

        {/* Main Console */}
        <div className="w-full max-w-2xl relative">
          {/* Rack Ears */}
          <div className="absolute top-0 bottom-0 -left-6 w-6 flex flex-col items-center justify-around py-12 border-r border-white/5 bg-zinc-900/50 rounded-l-xl hidden md:flex">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="w-3 h-3 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] border border-zinc-800" />
             ))}
          </div>
          <div className="absolute top-0 bottom-0 -right-6 w-6 flex flex-col items-center justify-around py-12 border-l border-white/5 bg-zinc-900/50 rounded-r-xl hidden md:flex">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="w-3 h-3 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] border border-zinc-800" />
             ))}
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden relative">
            {/* Top Status Bar */}
            <div className="bg-[#0a0a0a] border-b border-[#222] px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                   {[1, 2, 3].map(i => (
                     <div key={i} className={cn("h-1.5 w-1.5 rounded-full", step >= i ? "bg-amber-500 shadow-[0_0_5px_#f59e0b]" : "bg-zinc-800")} />
                   ))}
                </div>
                <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">Phase {step}: {step === 1 ? 'Credentials' : step === 2 ? 'Authorization' : 'Complete'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className={cn(isConnecting ? "text-amber-500 animate-pulse" : "text-zinc-800")} />
                <span className="text-[9px] font-mono text-zinc-700">LINK_STATUS: {isConnecting ? 'ESTABLISHING' : 'READY'}</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex gap-4 items-start">
                      <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                      <div className="text-xs space-y-2 text-zinc-400">
                        <p>Go to the <a href="https://developer.spotify.com/dashboard" target="_blank" className="text-amber-500 hover:underline inline-flex items-center gap-1">Spotify Developer Dashboard <ExternalLink size={10} /></a> and create an app.</p>
                        <p>Add <code className="bg-black px-1.5 py-0.5 rounded text-amber-500">http://127.0.0.1:3000/api/callback</code> to your Redirect URIs.</p>
                        <p className="text-amber-500/80 italic font-medium">Note: Spotify no longer accepts 'localhost'. Use '127.0.0.1' exactly.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-1">Client ID</label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="Enter your Spotify Client ID"
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-amber-500 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-800 shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-1">Client Secret</label>
                        <div className="relative group">
                          <input 
                            type="password" 
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            placeholder="Enter your Spotify Client Secret"
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-amber-500 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-800 shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-3 items-center"
                      >
                        <AlertCircle className="text-red-500" size={16} />
                        <span className="text-xs text-red-400 font-medium">{error}</span>
                      </motion.div>
                    )}

                    <button 
                      onClick={handleStartAuth}
                      disabled={isConnecting}
                      className="w-full group relative overflow-hidden rounded-lg bg-white p-4 transition-all hover:bg-zinc-100 disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                      <div className="relative flex items-center justify-center gap-3">
                        <span className="text-black font-black tracking-widest text-xs uppercase">Initialize Connection</span>
                        <ChevronRight size={16} className="text-black" />
                      </div>
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center space-y-8"
                  >
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                      <Music className="w-10 h-10 text-amber-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">Awaiting Signal</h3>
                      <p className="text-zinc-500 text-sm">Follow the authorization flow in the popup window.</p>
                    </div>

                    <div className="p-4 bg-black rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-600 text-left">
                       <p className="animate-pulse">{'>'} Awaiting callback from accounts.spotify.com...</p>
                       <p className="mt-1">{'>'} Redirect URI: http://localhost:3000/api/callback</p>
                    </div>

                    <button 
                      onClick={() => setStep(1)}
                      className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase hover:text-white transition-colors"
                    >
                      ← Back to Credentials
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Panel (Visual Only) */}
            <div className="bg-[#0a0a0a] border-t border-[#222] px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Gain', val: '80%' },
                { label: 'Link', val: 'Active' },
                { label: 'Sync', val: 'Locked' },
                { label: 'Engine', val: 'AH-v2' }
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <span className="text-[7px] font-bold tracking-widest text-zinc-700 uppercase">{item.label}</span>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/20 w-3/4" />
                  </div>
                  <span className="block text-[8px] font-mono text-zinc-600">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-between items-center px-2">
             <div className="flex gap-4">
                <div className="w-10 h-1.5 rounded-full bg-zinc-900 shadow-inner" />
                <div className="w-10 h-1.5 rounded-full bg-zinc-900 shadow-inner" />
             </div>
             <div className="text-[8px] font-mono text-zinc-800">DESIGNED BY ADITYA HIMAONE // TOKYO-ID-2025</div>
          </div>
        </div>
      </main>
    </div>
  )
}
