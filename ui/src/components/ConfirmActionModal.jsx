import { useState, useEffect } from 'react'
import { Mail, MessageCircle, X, CheckCircle } from 'lucide-react'

/**
 * Reusable confirmation modal with email / text (SMS) / Google verification.
 * Modal stays open until auth is done; then shows "Signed in" and completes the action.
 * Production would integrate with real verification/OAuth.
 */
export default function ConfirmActionModal({ open, onClose, onConfirm, title = 'Confirm action', children, demoSkipLabel }) {
  const [method, setMethod] = useState(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [code, setCode] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [authDone, setAuthDone] = useState(false)

  if (!open) return null

  const handleSendVerification = () => {
    if (!method) return
    setVerificationSent(true)
  }

  const completeAuth = () => {
    setAuthDone(true)
    onConfirm()
  }

  // After showing "Signed in", close modal shortly after
  useEffect(() => {
    if (!authDone) return
    const t = setTimeout(() => {
      resetAndClose()
    }, 1200)
    return () => clearTimeout(t)
  }, [authDone])

  const handleConfirm = async () => {
    if (method === 'google') {
      setConfirming(true)
      await new Promise((r) => setTimeout(r, 600))
      setConfirming(false)
      completeAuth()
      return
    }
    if (method === 'email' || method === 'text') {
      if (!verificationSent) {
        handleSendVerification()
        return
      }
      if (code.length >= 4) {
        setConfirming(true)
        await new Promise((r) => setTimeout(r, 400))
        setConfirming(false)
        completeAuth()
      }
    }
  }

  const resetAndClose = () => {
    setMethod(null)
    setVerificationSent(false)
    setCode('')
    setAuthDone(false)
    onClose()
  }

  const isGoogle = method === 'google'
  const canConfirm =
    isGoogle || (method && (method === 'email' || method === 'text') && (!verificationSent || code.length >= 4))
  const confirmLabel = !method
    ? 'Choose verification method'
    : isGoogle
      ? 'Continue with Google'
      : verificationSent
        ? 'Sign in'
        : 'Send code'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={authDone ? undefined : resetAndClose}>
      <div
        className="bg-slate-800 border border-gray-700 rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {authDone ? (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <CheckCircle className="w-16 h-16 text-energy-green" />
            <h3 className="text-xl font-semibold text-white">Signed in</h3>
            <p className="text-gray-400 text-sm">Verification successful. Completing…</p>
          </div>
        ) : (
          <>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children && (
          <div className="mb-6 p-4 bg-gray-800/80 rounded-lg">
            {children}
          </div>
        )}

        {demoSkipLabel && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => { onConfirm(); onClose(); }}
              className="w-full btn-primary py-2.5"
            >
              {demoSkipLabel}
            </button>
            <p className="text-gray-500 text-xs mt-2 text-center">No verification needed in demo</p>
          </div>
        )}
        <p className="text-gray-400 text-sm mb-3">{demoSkipLabel ? 'Or verify your identity (for real wallet):' : 'Verify your identity (this page stays until auth is done):'}</p>
        <div className="flex flex-col gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
              method === 'email'
                ? 'border-energy-blue bg-energy-blue/10 text-white'
                : 'border-gray-600 hover:border-gray-500 text-gray-300'
            }`}
          >
            <Mail className="w-5 h-5 shrink-0" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('text')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
              method === 'text'
                ? 'border-energy-blue bg-energy-blue/10 text-white'
                : 'border-gray-600 hover:border-gray-500 text-gray-300'
            }`}
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>Text (SMS)</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('google')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
              method === 'google'
                ? 'border-energy-blue bg-energy-blue/10 text-white'
                : 'border-gray-600 hover:border-gray-500 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {verificationSent && (method === 'email' || method === 'text') && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field w-full"
            />
            <p className="text-gray-500 text-xs mt-2">
              Code sent to your {method === 'email' ? 'email' : 'phone'}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={resetAndClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || confirming}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {confirming ? 'Verifying…' : confirmLabel}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
