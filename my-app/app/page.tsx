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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const payload = { ...form, year: yearMap[form.year] };
      await axios.post(`${BACKEND_URL}/api/auth/signup`, payload);
      setIsSuccess(true);
    } catch {
      setMessage({ type: "error", text: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-start md:items-center justify-center py-10 md:py-16 lg:py-24">
      {/* 🌄 Backgrounds */}
      <img src="/desktop_view.png" alt="" className="hidden md:block absolute inset-0 w-full h-full object-cover -z-10" />
      <img src="/mobileview.png" alt="" className="md:hidden absolute inset-0 w-full h-full object-cover -z-10" />

      {isSuccess ? (
        /* ✅ Success Screen */
        <div className="w-[90%] max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <h1 className={`${playfair.className} text-3xl font-bold text-amber-950 mb-4`}>
            Registration Successful 🎉
          </h1>

          <p className="text-gray-800 mb-6 font-medium">
            Please check your email for further instructions.
          </p>

          {/* 🟢 NEW: WhatsApp Group Invite for Success Screen */}
          <div className="mb-6 p-4 rounded-xl bg-green-600/20 border border-green-600/30">
            <p className="text-sm text-green-900 font-bold mb-2">📢 Important Step!</p>
            <a
              href="https://chat.whatsapp.com/GtBFbC7wAF2FK4obNYeIuZ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-950 hover:text-black transition font-semibold"
            >
              <svg className="w-5 h-5 fill-green-700" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Join Official WhatsApp Group
            </a>
          </div>

          <button
            onClick={() => window.location.reload()}
            className={`${playfair.className} w-full py-3 rounded-xl bg-amber-950 text-white text-lg hover:bg-black transition`}
          >
            Back to Home
          </button>
        </div>
      ) : (
        /* 🧊 Form */
        <form onSubmit={handleSubmit} className="w-[90%] max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* 🔰 Logos */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <a href="https://ggscuemk.tech" target="_blank" rel="noopener noreferrer">
              <img src="/icon1.png" alt="GGS CUE MK" className="w-[20.5rem] md:w-80 hover:scale-105 transition" />
            </a>
            <img src="/mainicon2.png" alt="Main Logo" className="w-[22rem] md:w-[24rem]" />
          </div>

          <h1 className={`${playfair.className} text-3xl font-semibold text-center mb-6 text-amber-950`}>
            Registration
          </h1>

          {message.text && (
            <div className="mb-4 p-3 rounded-lg text-center bg-red-500/20 border border-red-500/50 text-red-900">
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <input className="glass-input" name="full_name" placeholder="Full Name" required onChange={handleChange} />
            <input className="glass-input" name="email" type="email" placeholder="Email ID" required onChange={handleChange} />
            <input className="glass-input" name="password" type="password" placeholder="Password" minLength={6} required onChange={handleChange} />
            <input className="glass-input" name="enrollment_number" placeholder="Enrollment Number" minLength={14} maxLength={14} required onChange={handleChange} />
            <input className="glass-input" name="mobile_number" placeholder="Phone Number" minLength={10} maxLength={10} required onChange={handleChange} />
            <input className="glass-input" name="department" placeholder="Department" required onChange={handleChange} />
            <select name="year" className="glass-input" required onChange={handleChange}>
              <option value="">Select College Year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>

          {/* 📞 Contact Us */}
          <details className="mt-5 rounded-xl border border-amber-950 bg-white/20 backdrop-blur-md">
            <summary className={`${playfair.className} cursor-pointer select-none px-4 py-3 text-lg font-semibold text-amber-950`}>
              Contact Us
            </summary>
            <div className="px-4 pb-4 pt-2 text-gray-800 text-sm space-y-2">
              <p><strong>🎮 Theme:</strong> Temple Run</p>
              <p><strong>🧩 Activities:</strong> Treasure hunt, games, quizzes, VR Games.</p>
              <p><strong>🏆 Prizes:</strong> Cash prizes for winners</p>
              <p><strong>📅 Date:</strong> 7th February 2026</p>

              <hr className="border-white/40 my-2" />
              
              {/* 🟢 NEW: WhatsApp Link also added inside Contact Us summary */}
              <p className="font-semibold">Official Links:</p>
              <p>
                🟢 <a href="https://chat.whatsapp.com/GtBFbC7wAF2FK4obNYeIuZ" target="_blank" rel="noopener noreferrer" className="underline font-bold">Join WhatsApp Group</a>
              </p>
              <p className="font-semibold mt-2">Queries:</p>
              <p>👤 Ashna Islam: <a href="tel:9874140007" className="underline">9874140007</a></p>
              <p>👤 Arnab Sarkar: <a href="tel:8016681646" className="underline">8016681646</a> (Whatsapp)</p>
            </div>
          </details>

          <button
            type="submit"
            disabled={loading}
            className={`${playfair.className} mt-6 w-full py-3 rounded-xl bg-amber-950 text-white text-xl hover:bg-black transition disabled:opacity-50`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

      <style>{`
        .glass-input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.35);
          outline: none;
          color: #000;
        }
        .glass-input::placeholder {
            color: #444;
        }
      `}</style>
    </div>
  );
}