import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../../AllStateContainer/Profile/ProfileSlice';
import { User, Mail, Phone, BookOpen, Calendar, Edit, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ViewProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile:user, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/change-password')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Shield className="h-5 w-5 mr-2" />
              Change Password
            </button>
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Edit className="h-5 w-5 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="relative mb-4">
              {user?.profileImage?.url ? (
                <img
                  src={user.profileImage.url}
                  alt="Profile"
                  className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-xl">
                  <User className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{user?.name}</h2>
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {user?.role}
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-lg font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="text-lg font-medium text-gray-800">{user?.mobileNumber}</p>
                  </div>
                </div>

                {/* Department (for teachers) */}
                {user?.role === 'teacher' && user?.department && (
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="text-lg font-medium text-gray-800">{user.department}</p>
                    </div>
                  </div>
                )}

                {/* Teacher ID (for teachers) */}
                {user?.role === 'teacher' && user?.teacherId && (
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-3 rounded-full mr-4">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teacher ID</p>
                      <p className="text-lg font-medium text-gray-800">{user.teacherId}</p>
                    </div>
                  </div>
                )}

                {/* Account Created */}
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-medium text-gray-800">
                      {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-lg font-medium text-gray-800">
                      {formatDate(user?.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status Section */}
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Account Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="text-lg font-medium text-green-600">Active</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User Role</p>
                    <p className="text-lg font-medium text-gray-800 capitalize">{user?.role}</p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Profile Completion</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: user?.profileImage?.url ? '100%' : '85%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.profileImage?.url ? 'Complete' : 'Add profile picture to complete'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;