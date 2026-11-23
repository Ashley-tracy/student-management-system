import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ChangePasswordModal({ open, onClose, email }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setCurrent(''); setNext(''); setConfirm('')
    setError(null); setSuccess(false); setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    if (next === current) {
      setError('New password must be different from current password.')
      return
    }

    setSaving(true)

    try {
      // 1. Re-authenticate to verify the current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      })
      if (signInErr) {
        setError('Current password is incorrect.')
        setSaving(false)
        return
      }

      // 2. Update the password
      const { error: updateErr } = await supabase.auth.updateUser({ password: next })
      if (updateErr) {
        setError(updateErr.message)
        setSaving(false)
        return
      }

      // 3. Force a session refresh so the client sees the new token
      await supabase.auth.refreshSession()

      setSuccess(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      console.error('[change-password]', err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-medium text-black">Change Password</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-green-50 text-green-700 p-6 rounded-sm mb-6 w-full">
              <p className="font-medium mb-2">Password Changed</p>
              <p className="text-sm">Use your new password the next time you log in.</p>
            </div>
            <button
              onClick={handleClose}
              className="bg-[#3B69B8] text-white px-8 py-2.5 rounded-sm hover:bg-[#2d5497] w-full"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              />
            </div>

            <div className="mt-auto pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#3B69B8] text-white py-3 rounded-sm hover:bg-[#2d5497] disabled:opacity-50 font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}