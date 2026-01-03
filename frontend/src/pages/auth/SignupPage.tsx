import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword, validateName, getPasswordStrength } from '../../services/validationService';
import { SignupCredentials, UserRole } from '../../types/auth';
import { cn } from '../../lib/utils';
import { DEFAULT_REDIRECTS } from '../../constants/roles';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = DEFAULT_REDIRECTS[user.role] || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState<SignupCredentials>({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Debounce validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors: typeof errors = { ...errors };

      if (formData.name) newErrors.name = validateName(formData.name) || undefined;
      if (formData.email) newErrors.email = validateEmail(formData.email) || undefined;

      if (formData.password) {
        newErrors.password = validatePassword(formData.password) || undefined;
        setPasswordStrength(getPasswordStrength(formData.password));
      }

      if (formData.confirmPassword) {
        newErrors.confirmPassword = formData.password !== formData.confirmPassword
          ? "Passwords do not match"
          : undefined;
      }

      setErrors(newErrors);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear global error
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmError = formData.password !== formData.confirmPassword ? "Passwords do not match" : null;

    if (nameError || emailError || passwordError || confirmError) {
      setErrors({
        name: nameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
        confirmPassword: confirmError || undefined,
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await signup(formData);
      // Redirect based on role
      const redirectPath = DEFAULT_REDIRECTS[user.role] || '/';
      navigate(redirectPath);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: error instanceof Error ? error.message : "Failed to create account",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    !errors.name && !errors.email && !errors.password && !errors.confirmPassword &&
    formData.name && formData.email && formData.password && formData.confirmPassword;

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'strong': return 'Strong';
      case 'medium': return 'Medium';
      default: return 'Weak';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[320px] md:max-w-[480px] bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8 animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src="/logo.png" alt="NexusHR" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500">Join NexusHR</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            name="name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            disabled={isLoading}
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="john.doe@company.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            disabled={isLoading}
          />

          <Select
            id="role"
            name="role"
            label="Role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { label: 'Employee', value: 'EMPLOYEE' },
              { label: 'Admin', value: 'ADMIN' },
            ]}
            required
            disabled={isLoading}
          />

          <div className="space-y-1">
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
                className="pr-10"
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

            {/* Password Strength Indicator */}
            {formData.password && !errors.password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-300", getStrengthColor(passwordStrength))}
                    style={{ width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%' }}
                  />
                </div>
                <span className={cn("text-xs font-medium",
                  passwordStrength === 'strong' ? 'text-green-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Min. 8 chars, 1 uppercase, 1 number
            </p>
          </div>

          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.form && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 text-center flex items-center justify-center gap-2">
              <ShieldAlert size={16} />
              {errors.form}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            disabled={!isFormValid}
          >
            Create Account
          </Button>

          <div className="text-center text-sm pt-2">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-2 text-gray-400 text-xs">
        <ShieldCheck size={14} />
        <span>Secure Registration • 256-bit Encryption</span>
      </div>
    </div>
  );
}
