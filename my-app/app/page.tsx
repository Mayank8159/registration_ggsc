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
// const BACKEND_URL = "http://localhost:3000";

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
  const [isSuccess, setIsSuccess] = useState(false);

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

      await axios.post(`${BACKEND_URL}/api/auth/signup`, payload);
      setIsSuccess(true);
    } catch {
      setMessage({
        type: "error",
        text: "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen relative overflow-hidden
        flex items-start md:items-center justify-center
        py-10 md:py-16 lg:py-24
      "
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

      {isSuccess ? (
        /* ✅ Success Screen */
        <div className="w-[90%] max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <h1
            className={`${playfair.className} text-3xl font-bold text-amber-950 mb-4`}
          >
            Registration Successful 🎉
          </h1>

          <p className="text-gray-800 mb-6">
            Please check your email for further instructions.
          </p>

          <button
            onClick={() => window.location.reload()}
            className={`${playfair.className} w-full py-3 rounded-xl bg-amber-950 text-white text-lg hover:bg-black transition`}
          >
            Back to Home
          </button>
        </div>
      ) : (
        /* 🧊 Form */
        <form
          onSubmit={handleSubmit}
          className="w-[90%] max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
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
                className="w-[20.5rem] md:w-80 hover:scale-105 transition"
              />
            </a>

            <img
              src="/mainicon2.png"
              alt="Main Logo"
              className="w-[22rem] md:w-[24rem]"
            />
          </div>

          {/* 📝 Heading */}
          <h1
            className={`${playfair.className} text-3xl font-semibold text-center mb-6 text-amber-950`}
          >
            Registration
          </h1>

          {/* 💬 Message */}
          {message.text && (
            <div className="mb-4 p-3 rounded-lg text-center bg-red-500/20 border border-red-500/50 text-red-900">
              {message.text}
            </div>
          )}

          {/* 📋 Inputs */}
          <div className="space-y-4">
            <input
              className="glass-input"
              name="full_name"
              placeholder="Full Name"
              required
              onChange={handleChange}
            />
            <input
              className="glass-input"
              name="email"
              type="email"
              placeholder="Email ID"
              required
              onChange={handleChange}
            />
            <input
              className="glass-input"
              name="password"
              type="password"
              placeholder="Password"
              minLength={6}
              required
              onChange={handleChange}
            />
            <input
              className="glass-input"
              name="enrollment_number"
              placeholder="Enrollment Number"
              minLength={14}
              maxLength={14}
              required
              onChange={handleChange}
            />
            <input
              className="glass-input"
              name="mobile_number"
              placeholder="Phone Number"
              minLength={10}
              maxLength={10}
              required
              onChange={handleChange}
            />
            <input
              className="glass-input"
              name="department"
              placeholder="Department"
              required
              onChange={handleChange}
            />

            <select
              name="year"
              className="glass-input"
              required
              onChange={handleChange}
            >
              <option value="">Select College Year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>

          {/* 📞 Contact Us */}
          <details className="mt-5 rounded-xl border border-amber-950 bg-white/20 backdrop-blur-md">
            <summary
              className={`${playfair.className} cursor-pointer select-none px-4 py-3 text-lg font-semibold text-amber-950`}
            >
              Contact Us
            </summary>

            <div className="px-4 pb-4 pt-2 text-gray-800 text-sm space-y-2">
              <p>
                <strong>🎮 Theme:</strong> Temple Run
              </p>
              <p>
                <strong>🧩 Activities:</strong> Treasure hunt, games, quizzes, VR Games.
              </p>
              <p>
                <strong>🏆 Prizes:</strong> Cash prizes for winners
              </p>
              <p>
                <strong>📅 Date:</strong> 7th February 2026
              </p>

              <hr className="border-white/40 my-2" />

              <p className="font-semibold">For any queries, contact:</p>
              <p>
                👤 Ashna Islam:{" "}
                <a href="tel:9874140007" className="underline">
                  9874140007
                </a>
              </p>
              <p>
                👤 Arnab Sarkar:{" "}
                <a href="tel:8016681646" className="underline">
                  8016681646
                </a>
                {" "}(Whatsapp)
              </p>
            </div>
          </details>

          {/* 🚀 Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`${playfair.className} mt-6 w-full py-3 rounded-xl bg-amber-950 text-white text-xl hover:bg-black transition disabled:opacity-50`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

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
      `}</style>
    </div>
  );
}  