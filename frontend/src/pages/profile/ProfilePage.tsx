import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Lock, Save, X, Edit2, Loader2, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, UserProfile } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ 
    name: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<{ 
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  useEffect(() => {
    if (authUser?.email) {
      loadProfile();
    }
  }, [authUser]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({ 
        name: data.name,
        phone: data.phone || '',
        address: data.address || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelled
      setFormData({ name: profile?.name || '' });
      setFormErrors({});
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setSuccessMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string } = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Full Name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !authUser?.email) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedProfile = await userService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your account settings</p>
        </div>
        {!isEditing && (
          <Button onClick={handleEditToggle} variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Header / Avatar Section */}
        <div className="bg-gray-50 px-6 py-8 border-b flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-24 w-24 rounded-full border-4 border-white shadow-sm object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-sm">
                <UserCircle className="h-12 w-12 text-primary-600" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left space-y-1 pt-2">
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                profile.role === 'admin' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              )}>
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={formErrors.name}
                  autoFocus
                  disabled={isSaving}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-transparent text-gray-900">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>{profile.name}</span>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Email Address
                <Lock className="h-3 w-3 text-gray-400" />
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed">
                <Mail className="h-5 w-5 text-gray-400" />
                <span>{profile.email}</span>
              </div>
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Role
                <Lock className="h-3 w-3 text-gray-400" />
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="capitalize">{profile.role}</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={formErrors.phone}
                    disabled={isSaving}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700">
                    <span className="font-medium">{profile.phone || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    error={formErrors.address}
                    disabled={isSaving}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700">
                    <span className="font-medium">{profile.address || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Read-only Employment Details */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Employment Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">Department</span>
                  <p className="text-gray-900 font-medium">{profile.department || 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">Role / Position</span>
                  <p className="text-gray-900 font-medium">{profile.position || 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">Date of Joining</span>
                  <p className="text-gray-900 font-medium">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">Employee ID</span>
                  <p className="text-gray-900 font-medium">{profile.id}</p>
                 </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isSaving || formData.name === profile.name}
                  isLoading={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
