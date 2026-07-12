import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiSparkles, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 4) errs.password = 'Password must be at least 4 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome to DataClean Pro!');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative min-h-screen animated-gradient flex items-center justify-center px-4 overflow-hidden">
      {/* Floating decorative blobs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] left-[10%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[50%] right-[30%] w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 md:p-10 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-xl mb-4"
          >
            <HiSparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
              DataClean
            </span>{' '}
            <span className="text-white font-light">Pro</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">AI-Powered Data Intelligence</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                errors.email
                  ? 'border-red-400/60 bg-red-500/10'
                  : 'border-white/20 bg-white/5 focus-within:border-white/40 focus-within:bg-white/10'
              }`}
            >
              <HiEnvelope className="w-5 h-5 text-white/50 flex-shrink-0" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-300 text-xs mt-1.5 ml-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                errors.password
                  ? 'border-red-400/60 bg-red-500/10'
                  : 'border-white/20 bg-white/5 focus-within:border-white/40 focus-within:bg-white/10'
              }`}
            >
              <HiLockClosed className="w-5 h-5 text-white/50 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                }}
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-300 text-xs mt-1.5 ml-1">{errors.password}</p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-white/60 text-sm">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => toast('Feature coming soon!', { icon: '🚀' })}
              className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </motion.button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 text-center">
          <p className="text-white/30 text-xs">
            Demo: <span className="text-white/50">admin@dataclean.pro</span> /{' '}
            <span className="text-white/50">admin123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
