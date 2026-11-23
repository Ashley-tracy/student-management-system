import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

const DEFAULTS = {
  system_name: 'Student Management System',
  institution_name: 'ABC Learning Institute',
  academic_year: '2026-2027',
  default_intake: 'November 2026',
  email_notif: true,
  sms_alerts: false,
  self_reg: true,
  logo_url: null,
}

function Settings() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('General')
  const [formData, setFormData] = useState(DEFAULTS)
  const [saved, setSaved] = useState(DEFAULTS) // for Reset
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', msg }

  // -------- load --------
  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .maybeSingle()

      if (error) throw error
      if (data) {
        const merged = { ...DEFAULTS, ...data }
        setFormData(merged)
        setSaved(merged)
      }
    } catch (err) {
      console.error('[settings] load failed', err)
      setToast({ type: 'error', msg: 'Could not load settings' })
    } finally {
      setLoading(false)
    }
  }

  // -------- save --------
  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    try {
      const payload = {
        system_name: formData.system_name,
        institution_name: formData.institution_name,
        academic_year: formData.academic_year,
        default_intake: formData.default_intake,
        email_notif: formData.email_notif,
        sms_alerts: formData.sms_alerts,
        self_reg: formData.self_reg,
        updated_at: new Date().toISOString(),
        updated_by: profile?.id,
      }

      const { error } = await supabase
        .from('system_settings')
        .update(payload)
        .eq('id', SETTINGS_ID)

      if (error) throw error

      setSaved(formData)
      setToast({ type: 'success', msg: 'Settings saved' })
    } catch (err) {
      console.error('[settings] save failed', err)
      setToast({ type: 'error', msg: err.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  // -------- reset (restore last saved, NOT defaults) --------
  const handleReset = () => {
    setFormData(saved)
    setToast({ type: 'success', msg: 'Reverted to last saved settings' })
  }

  // -------- upload logo --------
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // basic guard
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', msg: 'Please choose an image file' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', msg: 'Image must be under 2 MB' })
      return
    }

    setUploading(true)
    setToast(null)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const path = `logo-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('branding')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (upErr) throw upErr

      const { data: pub } = supabase.storage.from('branding').getPublicUrl(path)
      const publicUrl = pub.publicUrl

      const { error: dbErr } = await supabase
        .from('system_settings')
        .update({ logo_url: publicUrl })
        .eq('id', SETTINGS_ID)
      if (dbErr) throw dbErr

      setFormData(f => ({ ...f, logo_url: publicUrl }))
      setSaved(s => ({ ...s, logo_url: publicUrl }))
      setToast({ type: 'success', msg: 'Logo updated' })
    } catch (err) {
      console.error('[settings] upload failed', err)
      setToast({ type: 'error', msg: err.message || 'Upload failed' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleToggle = async (key) => {
    const next = { ...formData, [key]: !formData[key] }
    setFormData(next)

    // toggle is saved immediately (feels snappier than requiring Save)
    try {
      await supabase.from('system_settings').update({ [key]: next[key] }).eq('id', SETTINGS_ID)
      setSaved(s => ({ ...s, [key]: next[key] }))
    } catch (err) {
      console.error('[settings] toggle save failed', err)
    }
  }

  // -------- toast auto-dismiss --------
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="min-h-screen bg-[#D8E8ED] flex font-sans">

      {/* Sidebar */}
      <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-6 shadow-md">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium tracking-wide mb-2">SMS</p>
            <Link to="/admin/dashboard" className="text-xs font-medium hover:text-gray-300">Dashboard</Link>
            <Link to="/admin/students" className="text-xs font-medium hover:text-gray-300">Students</Link>
            <Link to="/admin/trainers" className="text-xs font-medium hover:text-gray-300">Trainers</Link>
            <Link to="/admin/courses" className="text-xs font-medium hover:text-gray-300">Courses</Link>
          </div>
          <div className="mt-8">
            <Link to="/admin/settings" className="text-xs font-medium hover:text-gray-300">Settings</Link>
          </div>
        </div>
        <div>
          <button onClick={handleLogout} className="text-xs font-medium hover:underline text-left">
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-10 md:p-14 flex flex-col relative overflow-y-auto">

        <div className="absolute top-10 right-16">
          <p className="text-sm font-medium text-black">{profile?.full_name || 'Admin'}</p>
        </div>

        <div className="mb-8 mt-2">
          <h1 className="text-2xl text-black mb-1">Settings</h1>
          <p className="text-sm text-gray-800">Manage system settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-10">
          {['General', 'Users', 'Notifications', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm shadow-sm transition-colors ${
                activeTab === tab
                  ? 'bg-[#3B69B8] text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 px-4 py-2 text-sm rounded-sm ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {toast.msg}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-700">Loading settings…</div>
        ) : (
          <>
            {/* ---------- GENERAL ---------- */}
            {activeTab === 'General' && (
              <div className="flex flex-col lg:flex-row gap-10 flex-1">
                <div className="flex-1 max-w-2xl">
                  <h2 className="text-base font-medium text-black mb-8">General Settings</h2>

                  <div className="flex flex-col gap-6">
                    <Row label="System Name">
                      <input name="system_name" value={formData.system_name} onChange={handleChange}
                        className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200" />
                    </Row>
                    <Row label="Institution Name">
                      <input name="institution_name" value={formData.institution_name} onChange={handleChange}
                        className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200" />
                    </Row>
                    <Row label="Academic Year">
                      <input name="academic_year" value={formData.academic_year} onChange={handleChange}
                        className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200" />
                    </Row>
                    <Row label="Default Course Intake">
                      <input name="default_intake" value={formData.default_intake} onChange={handleChange}
                        className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200" />
                    </Row>
                  </div>

                  <div className="flex gap-6 mt-16 mb-8 ml-48">
                    <button onClick={handleSave} disabled={saving}
                      className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-10 py-2.5 rounded-sm shadow-sm transition-colors disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                    <button onClick={handleReset}
                      className="bg-white text-black text-sm font-medium px-10 py-2.5 rounded-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                      Reset
                    </button>
                  </div>
                </div>

                {/* Profile / Branding card */}
                <div className="w-full lg:w-80">
                  <div className="bg-white p-8 shadow-sm min-h-[500px] flex flex-col items-center">
                    <h2 className="text-lg text-black mb-8">Profile Settings</h2>

                    <div className="w-32 h-32 rounded-full border border-gray-300 mb-6 overflow-hidden flex items-center justify-center bg-white">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : null}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={handleUploadClick}
                      disabled={uploading}
                      className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-2 rounded-sm shadow-sm transition-colors mb-8 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading…' : 'Upload Logo'}
                    </button>

                    <div className="w-full flex flex-col gap-6 mt-4">
                      <Toggle label="Enable Email Notifications"
                        on={formData.email_notif} onClick={() => handleToggle('email_notif')} />
                      <Toggle label="Enable Sms Alerts"
                        on={formData.sms_alerts} onClick={() => handleToggle('sms_alerts')} />
                      <Toggle label="Allow Self Registration"
                        on={formData.self_reg} onClick={() => handleToggle('self_reg')} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- USERS ---------- */}
            {activeTab === 'Users' && (
              <div className="bg-white p-8 shadow-sm max-w-3xl">
                <h2 className="text-base font-medium text-black mb-6">User Accounts</h2>
                <p className="text-sm text-gray-700 mb-4">
                  User accounts are managed on the Students and Trainers pages. Creating an account there
                  automatically provisions login credentials.
                </p>
                <div className="flex gap-4">
                  <Link to="/admin/students"
                    className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-2.5 rounded-sm">
                    Manage Students
                  </Link>
                  <Link to="/admin/trainers"
                    className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-2.5 rounded-sm">
                    Manage Trainers
                  </Link>
                </div>
              </div>
            )}

            {/* ---------- NOTIFICATIONS ---------- */}
            {activeTab === 'Notifications' && (
              <div className="bg-white p-8 shadow-sm max-w-3xl">
                <h2 className="text-base font-medium text-black mb-6">Notification Preferences</h2>
                <div className="w-full flex flex-col gap-6">
                  <Toggle label="Enable Email Notifications"
                    on={formData.email_notif} onClick={() => handleToggle('email_notif')} />
                  <Toggle label="Enable Sms Alerts"
                    on={formData.sms_alerts} onClick={() => handleToggle('sms_alerts')} />
                  <Toggle label="Allow Self Registration"
                    on={formData.self_reg} onClick={() => handleToggle('self_reg')} />
                </div>
              </div>
            )}

            {/* ---------- SYSTEM ---------- */}
            {activeTab === 'System' && (
              <div className="bg-white p-8 shadow-sm max-w-3xl">
                <h2 className="text-base font-medium text-black mb-6">System Information</h2>
                <div className="flex flex-col gap-3 text-sm text-gray-800">
                  <p><span className="font-medium">Database:</span> Supabase (PostgreSQL)</p>
                  <p><span className="font-medium">Auth:</span> Supabase Auth</p>
                  <p><span className="font-medium">Storage:</span> Supabase Storage (bucket: <code>branding</code>)</p>
                  <p><span className="font-medium">Last updated:</span> {saved.updated_at ? new Date(saved.updated_at).toLocaleString() : '—'}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// --- tiny presentational helpers (keep the exact look) ---
function Row({ label, children }) {
  return (
    <div className="flex items-center">
      <label className="w-48 text-sm text-black">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, on, onClick }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-black">{label}</span>
      <button
        onClick={onClick}
        className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${on ? 'bg-[#29A3D9]' : 'bg-gray-400'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default Settings