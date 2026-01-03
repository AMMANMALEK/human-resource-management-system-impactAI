import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword } from '../../services/validationService';
import { LoginCredentials } from '../../types/auth';
import { DEFAULT_REDIRECTS } from '../../constants/roles';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = DEFAULT_REDIRECTS[user.role] || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Debounce validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        const emailError = validateEmail(formData.email);
        setErrors(prev => ({ ...prev, email: emailError || undefined }));
      }
      if (formData.password) {
        const passwordError = validatePassword(formData.password);
        setErrors(prev => ({ ...prev, password: passwordError || undefined }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.email, formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear form-level error on change
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation before submit
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const user = await login(formData);

      // Check if there's a saved location to redirect to
      const from = (location.state as any)?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Role-based routing
      const redirectPath = DEFAULT_REDIRECTS[user.role] || '/';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !errors.email && !errors.password && formData.email && formData.password;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[320px] md:max-w-[480px] bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8 animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src="/logo.png" alt="Oddo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              disabled={isLoading}
              autoComplete="email"
            />

            <div className="space-y-1 relative">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10" // Space for toggle button
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>
          </div>

          {errors.form && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {errors.form}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!isFormValid}
          >
            Sign in
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>

      {/* Footer / Copyright */}
      <p className="mt-8 text-center text-xs text-gray-400">
        &copy; 2026 Oddo. All rights reserved.
      </p>
    </div>
  );
}
