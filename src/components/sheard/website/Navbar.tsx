"use client";
import Image from "next/image";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-6 mx-auto container">
      {/* Logo */}
      <div className="relative w-[100px] md:w-[150px] h-[40px] md:h-[60px]">
        <Image
          src="/images/logo.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>

      {/* Login and Get Started buttons */}
      <div className="flex gap-2 md:gap-4 items-center">
        <div className="hidden sm:block border border-[#84CC16] px-4 py-2 rounded-full cursor-pointer hover:bg-[#84CC16] hover:text-white transition text-sm md:text-base">
          Login
        </div>
        <div className="bg-[#84CC16] text-white px-4 md:px-6 py-2 rounded-full cursor-pointer hover:bg-[#6ABF12] transition text-sm md:text-base">
          Get Started
        </div>
      </div>
    </div>
  );
}
