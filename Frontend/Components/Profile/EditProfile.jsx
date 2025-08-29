import  { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfile,
  updateProfile,
} from "../../AllStateContainer/Profile/ProfileSlice";
import { Camera, Save, ArrowLeft, Trash2, User, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    profile: user,
    loading,
    error,
  } = useSelector((state) => state.profile);

  const role =
    useSelector((state) => state.authentication.role) ||
    localStorage.getItem("role");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    teacherId: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        department: user.department || "",
        teacherId: user.teacherId || "",
      });
      if (user.profileImage?.url) setImagePreview(user.profileImage.url);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setUploadError("");
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save the changes to your profile?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("mobileNumber", formData.mobileNumber);
        fd.append("email", formData.email);

        if (role === "teacher") {
          fd.append("department", formData.department);
          fd.append("teacherId", formData.teacherId);
          if (profileImage) {
            fd.append("profileImage", profileImage);
          }
        }

        await dispatch(updateProfile(fd, navigate));
      }
    });
  };

  const handleCancel = () => navigate("/profile");

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 mr-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-gray-600">Update your personal information</p>
          </div>
        </div>

        {/* Errors */}
        {(error || uploadError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {imageLoading ? (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}

              <div className="absolute bottom-0 right-0 flex space-x-2">
                <label htmlFor="profile-image" className="cursor-pointer">
                  <div className="bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                    {imageLoading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </div>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imageLoading}
                  />
                </label>

                {imagePreview && !imageLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setImagePreview(null);
                    }}
                    className="bg-red-600 text-white p-3 rounded-full shadow-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Supported formats: JPG, PNG, GIF • Max size: 5MB
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            {/* Department (teachers only) */}
            {role === "teacher" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biotech">Biotech</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Sociology">Sociology</option>
                  <option value="BBA">BBA</option>
                  <option value="BBA-CA">BBA-CA</option>
                  <option value="Law">Law</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Electronics">Electronics</option>
                  <option value="BCA">BCA</option>
                </select>
              </div>
            )}

            {/* Teacher ID (teachers only) */}
            {role === "teacher" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher ID *
                </label>
                <input
                  type="text"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                  placeholder="Enter Teacher ID"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
