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
const BACKEND_URL = "https://your-backend-domain.com";

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    enrollment: "",
    phone: "",
    department: "",
    year: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/register`, form);
      alert("Form submitted successfully");
    } catch (error) {
      alert("Submission failed");
      console.error(error);
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

        {/* 📋 Inputs */}
        <div className="space-y-4">
          <input className="glass-input" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input className="glass-input" name="email" type="email" placeholder="Email ID" onChange={handleChange} required />
          <input className="glass-input" name="enrollment" placeholder="Enrollment Number" onChange={handleChange} required />
          <input className="glass-input" name="phone" placeholder="Phone Number" onChange={handleChange} required />
          <input className="glass-input" name="department" placeholder="Department" onChange={handleChange} required />

          <select name="year" onChange={handleChange} required className="glass-input">
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
          className={`${playfair.className} mt-6 w-full py-3 rounded-xl
                     bg-amber-950 text-white text-xl
                     hover:bg-black transition`}
        >
          Submit
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
