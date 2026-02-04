import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { IoMail, IoLockClosed, IoEye, IoEyeOff } from "react-icons/io5";
import { BiLoaderAlt } from "react-icons/bi";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { data } = res;
      const { _id, name, email, phone, role } = data.data;
      dispatch(setUser({ _id, name, email, phone, role }));
      enqueueSnackbar(`Welcome back, ${name}!`, { variant: "success" });
      navigate("/");
    },
    onError: (error) => {
      const { response } = error;
      enqueueSnackbar(response?.data?.message || "Login failed", {
        variant: "error",
      });
    },
  });

  const isFormValid = formData.email && formData.password;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <IoMail
              className="text-slate-400 group-focus-within:text-amber-600 transition-colors duration-200"
              size={18}
            />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-100/80 border border-stone-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <IoLockClosed
              className="text-slate-400 group-focus-within:text-amber-600 transition-colors duration-200"
              size={18}
            />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            className="w-full pl-11 pr-12 py-3 rounded-xl bg-stone-100/80 border border-stone-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-600 transition-colors duration-200"
          >
            {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || loginMutation.isPending}
        className={`relative w-full py-3 text-sm font-semibold rounded-xl transition-all duration-200 overflow-hidden ${
          isFormValid && !loginMutation.isPending
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
            : "bg-stone-200 text-stone-400 cursor-not-allowed"
        }`}
      >
        {loginMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <BiLoaderAlt className="animate-spin" size={18} />
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};

export default Login;
