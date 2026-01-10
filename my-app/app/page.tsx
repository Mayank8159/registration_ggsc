"use client";

import { Playfair_Display } from "next/font/google";

// 🎨 Playfair Display Font
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function Page() {
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

      {/* 🚫 Registration Closed Card */}
      <div className="w-[90%] max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
        {/* 🔰 Logos */}
        <div className="flex flex-col items-center gap-2 mb-4">
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

        {/* 🛑 Heading */}
        <h1
          className={`${playfair.className} text-3xl font-bold text-amber-950 mb-4`}
        >
          Registration Closed
        </h1>

        <p className="text-gray-800 mb-6">
          Thank you for your interest!  
          Registrations for this event are now officially closed.
        </p>

        {/* 📅 Event Info */}
        <div className="text-sm text-gray-800 space-y-2 mb-6">
          <p>
            <strong>🧩 Activities:</strong> Treasure hunt, games, quizzes, VR Games
          </p>
          <p>
            <strong>🏆 Prizes:</strong> Cash prizes for winners
          </p>
          <p>
            <strong>📅 Date:</strong> 7th February 2026
          </p>
        </div>

        {/* 📞 Contact Us */}
        <details className="mt-4 rounded-xl border border-amber-950 bg-white/20 backdrop-blur-md text-left">
          <summary
            className={`${playfair.className} cursor-pointer select-none px-4 py-3 text-lg font-semibold text-amber-950`}
          >
            Contact Us
          </summary>

          <div className="px-4 pb-4 pt-2 text-gray-800 text-sm space-y-2">
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
              </a>{" "}
              (WhatsApp)
            </p>
          </div>
        </details>

        {/* 🔙 Button */}
        <a
          href="https://ggscuemk.tech"
          className={`${playfair.className} mt-6 inline-block w-full py-3 rounded-xl bg-amber-950 text-white text-lg hover:bg-black transition`}
        >
          Visit Official Website
        </a>
      </div>
    </div>
  );
}
