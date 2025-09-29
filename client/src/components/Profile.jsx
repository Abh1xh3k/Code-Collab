import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Sophia Bennett',
    email: 'sophia.bennett@example.com',
    jobTitle: 'Software Engineer',
    company: 'CodeCollab Inc.',
    location: 'San Francisco, CA',
    bio: 'Passionate software engineer with a love for building collaborative tools and elegant user interfaces.'
  });

  const [profileImage, setProfileImage] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuCY8kMgxV9lLJruhpmwvRBZLjrcSAXqd8lTr6XbBdmjI_Y1D0pbKQM3j7R5PCo2YqsMKhgeW4oCdyyqkGV5N_UrW_mAxKJLvgbNDm5ho9lRaBG1BU_VBiaOWzoc5fh8sEuASF1xJ90oW1IfLk7EGMYs58WrW--WhbYoeohxGHyUWDOppxOYsUtbc90ZZhcqF0GQ3fGIGDz9la66daPwbD_4yEl2mBJA_3AwhLQ3KRomc0haFf9M7nFWoLukxwqj8lzD-U6P_sJ63x8");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast.error('Please login to view your profile');
        return;
      }

      const response = await axios.put("/api/user/profile", profileUpdateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const userData = response.data;
      const profileData = {
        name: userData.username || '',
        email: userData.email || '',
        jobTitle: userData.profile?.jobTitle || '',
        company: userData.profile?.company || '',
        location: userData.profile?.location || '',
        bio: userData.profile?.bio || ''
      };

      setFormData(profileData);
      setOriginalData(profileData);
      setProfileImage(userData.avatar || '');

    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }


    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.jobTitle.length > 100) {
      newErrors.jobTitle = 'Job title must be less than 100 characters';
    }
    if (formData.company.length > 100) {
      newErrors.company = 'Company must be less than 100 characters';
    }
    if (formData.location.length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    document.getElementById('imageInput').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast.error('Please login to update your profile');
        return;
      }

      // abhi we can only update profile fields, not name/email isliye
      const profileUpdateData = {
        profile: {
          jobTitle: formData.jobTitle,
          company: formData.company,
          location: formData.location,
          bio: formData.bio
        }
      };

      // Check if name or email changed (for future implementation)
      if (formData.name !== originalData.name || formData.email !== originalData.email) {
        toast.info('Name and email updates will be available in a future update');
      }

      const response = await axios.put("/api/user/profile", profileUpdateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          navigate('/room');
        }, 1000);
        setOriginalData(formData);


        if (response.data.avatar) {
          setProfileImage(response.data.avatar);
        }
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid profile data');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setFormData(originalData);
        setErrors({});
        toast.info('Changes discarded');
      }
    } else {
      toast.info('No changes to discard');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 text-gray-800 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="flex flex-col min-h-screen">
        <header className="border-b border-purple-700/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <a className="flex items-center gap-2 text-gray-900" href="#">
                  <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
                  </svg>
                  <span className="text-lg font-bold">CodeCollab</span>
                </a>
              </div>
              <nav className="hidden md:flex items-center gap-8">
              </nav>
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9qFzFB_z3PgGGhrzsF8FBUVlPiIEuZF87h-rdoGzxLcr1KDEfttcluYlsg2CLqyq7nj8vdoWkpEn9aaaIPOz0n1RLgDGKta__h9VelVNuaPBztn7SWHuxfED371KmAr6wSu2HJ35GMOfEeu_teGLMhgLmHA9lRNyY3sBk_NVoiG-nUl_iJdUcDhpS6gxAhbyLHbyfwpEmLxZab2UgwnjJkWh8b4OCQC9nGpc_v6CUb-f74ooK_kwYIZrHfeP19uYcsIV2L1IFA2s")'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>


              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div
                    className="w-32 h-32 rounded-full bg-cover bg-center ring-4 ring-purple-700/20"
                    style={{
                      backgroundImage: `url("${profileImage}")`
                    }}
                  ></div>
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    className="absolute bottom-0 right-0 bg-purple-700 text-white rounded-full p-2 hover:bg-purple-700/80 transition-colors"
                    onClick={triggerImageUpload}
                    type="button"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                    </svg>
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.name || 'Your Profile'}</h2>
                <p className="text-base text-purple-700">{formData.jobTitle || 'Add your job title'}</p>
              </div>


              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                      Name
                    </label>
                    <input
                      className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-purple-700/20'} bg-gray-50 focus:ring-purple-700 focus:border-purple-700 text-gray-900 px-3 py-2 focus:outline-none focus:ring-2`}
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-purple-700/20'} bg-gray-50 focus:ring-purple-700 focus:border-purple-700 text-gray-900 px-3 py-2 focus:outline-none focus:ring-2`}
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="jobTitle">
                    Job Title
                  </label>
                  <input
                    className={`w-full rounded-lg border ${errors.jobTitle ? 'border-red-500' : 'border-purple-700/20'} bg-gray-50 focus:ring-purple-700 focus:border-purple-700 text-gray-900 px-3 py-2 focus:outline-none focus:ring-2`}
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Product Manager"
                  />
                  {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formData.jobTitle.length}/100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="company">
                    Company
                  </label>
                  <input
                    className={`w-full rounded-lg border ${errors.company ? 'border-red-500' : 'border-purple-700/20'} bg-gray-50 focus:ring-purple-700 focus:border-purple-700 text-gray-900 px-3 py-2 focus:outline-none focus:ring-2`}
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft, CodeCollab Inc."
                  />
                  {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formData.company.length}/100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                    Location
                  </label>
                  <input
                    className={`w-full rounded-lg border ${errors.location ? 'border-red-500' : 'border-purple-700/20'} bg-gray-50 focus:ring-purple-700 focus:border-purple-700 text-gray-900 px-3 py-2 focus:outline-none focus:ring-2`}
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA"
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formData.location.length}/100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    className={`w-full rounded-lg border ${errors.bio ? 'border-red-500' : 'border-purple-700/20'} bg-gray-50 focus:ring-purple-700 focus:border-purple-700 text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 resize-none`}
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your interests, and what you do..."
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-gray-50 text-gray-800 hover:bg-purple-700/10 transition-colors border border-gray-200"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-purple-700 to-purple-500 text-white hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}

                  >
                    {saving ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default ProfileEdit;