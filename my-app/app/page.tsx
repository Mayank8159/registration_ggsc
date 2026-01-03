"use client";

import { useState } from "react";
import axios from "axios";
import { Playfair_Display } from "next/font/google";

// 🎨 Playfair Display Font
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// 🔗 BACKEND URL
const BACKEND_URL = "https://registration-ggsc.onrender.com";
// const BACKEND_URL = "http://localhost:3000";  // For local development  

export default function Page() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    enrollment_number: "",
    mobile_number: "",
    department: "",
    year: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Convert year string to number (1-4)
      const yearMap: { [key: string]: number } = {
        "1st Year": 1,
        "2nd Year": 2,
        "3rd Year": 3,
        "4th Year": 4,
      };

      const payload = {
        ...form,
        year: yearMap[form.year],
      };

      const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, payload);

      setMessage({
        type: "success",
        text: "Registration successful! You can now login."
      });

      // Reset form
      setForm({
        full_name: "",
        email: "",
        password: "",
        enrollment_number: "",
        mobile_number: "",
        department: "",
        year: "",
      });

      console.log("Registration response:", response.data);
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";

      // Handle backend errors
      // Handle backend errors
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        const errorString = typeof backendError === 'string' ? backendError : JSON.stringify(backendError);

        if (errorString.includes("users_pkey") || errorString.includes("already registered")) {
          errorMessage = "User already registered! Please login instead.";
        } else if (errorString.includes("email")) {
          errorMessage = "Email already in use!";
        } else if (errorString.includes("enrollment_number")) {
          errorMessage = "Enrollment number already registered!";
        } else {
          errorMessage = errorString;
        }
      }

      setMessage({ type: "error", text: errorMessage });
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden
                 md:py-16 lg:py-24"
    >
      {/* 🌄 Backgrounds */}
      <img
        src="/desktop_view.png"
        alt=""
        className="hidden md:block absolute inset-0 w-full h-full object-cover -z-10"
      />
      <img
        src="/mobileview.png"
        alt=""
        className="md:hidden absolute inset-0 w-full h-full object-cover -z-10"
      />

      {/* 🧊 Form */}
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-md backdrop-blur-lg
                   bg-white/10 border border-white/20
                   rounded-2xl p-8 shadow-2xl"
      >
        {/* 🔰 Logos */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <a
            href="https://ggscuemk.tech"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/icon1.png"
              alt="GGS CUE MK"
              className="w-[20.5rem] md:w-80 h-auto object-contain
                         drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]
                         hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </a>

          <img
            src="/mainicon2.png"
            alt="Main Logo"
            className="w-[22rem] md:w-[24rem] h-auto object-contain
                       drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* 📝 Heading */}
        <h1
          className={`${playfair.className} text-3xl font-semibold text-center mb-6 text-amber-950`}
        >
          Registration
        </h1>

        {/* 💬 Message Display */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-center ${message.type === "success"
              ? "bg-green-500/20 border border-green-500/50 text-green-900"
              : "bg-red-500/20 border border-red-500/50 text-red-900"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* 📋 Inputs */}
        <div className="space-y-4">
          <input
            className="glass-input"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
          <input
            className="glass-input"
            name="email"
            type="email"
            placeholder="Email ID"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="glass-input"
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <input
            className="glass-input"
            name="enrollment_number"
            placeholder="Enrollment Number"
            value={form.enrollment_number}
            onChange={handleChange}
            required
          />
          <input
            className="glass-input"
            name="mobile_number"
            placeholder="Phone Number"
            value={form.mobile_number}
            onChange={handleChange}
            required
          />
          <input
            className="glass-input"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
          />

          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            required
            className="glass-input"
          >
            <option value="">Select College Year</option>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </select>
        </div>

        {/* 🚀 Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`${playfair.className} mt-6 w-full py-3 rounded-xl
                     bg-amber-950 text-white text-xl
                     hover:bg-black transition
                     disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* 🎨 Glass styles */}
      <style>{`
        .glass-input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: rgba(54, 69, 79, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.35);
          outline: none;
          color: #000;
        }

        .glass-input::placeholder {
          color: rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  );
}
