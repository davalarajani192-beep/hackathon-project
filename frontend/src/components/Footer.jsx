import React from 'react';
import { Heart, Globe2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#14402F] text-white border-t border-[#3E8E6A]/20 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#3E8E6A]/20">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">EASY</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#3E8E6A] text-white rounded-md">
                Food-Expiry Rescue
              </span>
            </div>
            <p className="text-base font-medium text-[#F0922B] italic">
              "Surplus today. A meal tonight."
            </p>
            <p className="text-sm text-[#9CC5AA] max-w-md leading-relaxed">
              A role-based hyperlocal platform connecting commercial food donors with community kitchens and food banks before shelf-life expires. Built with PostGIS radius queries and verified dual-party confirmation.
            </p>
          </div>

          {/* Sustainable Development Goals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">
              UN SDG Alignment
            </h4>
            <ul className="space-y-2 text-xs text-[#9CC5AA]">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#3E8E6A] text-white flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Zero Hunger (End food insecurity)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F0922B] text-white flex items-center justify-center font-bold text-[10px]">12</span>
                <span>Responsible Consumption & Production</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#2E86AB] text-white flex items-center justify-center font-bold text-[10px]">13</span>
                <span>Climate Action (Methane mitigation)</span>
              </li>
            </ul>
          </div>

          {/* Team Decoders */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-white/90">
              <Sparkles className="w-4 h-4 text-[#F0922B]" />
              <span>Team Decoders</span>
            </div>
            <p className="text-xs text-[#9CC5AA]">Hackathon Builders:</p>
            <div className="flex flex-wrap gap-1.5">
              {['Vindhya', 'Vineela', 'Sreenidhi', 'Gowtham'].map((member) => (
                <span
                  key={member}
                  className="px-2.5 py-1 rounded-lg bg-[#0D2B20] text-xs font-medium text-white border border-[#3E8E6A]/30"
                >
                  {member}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#9CC5AA]/80 pt-1">
              Data citation: UNEP Food Waste Index Report 2024
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9CC5AA] gap-3">
          <p>© {new Date().getFullYear()} EASY – Food-Expiry Rescue. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted for social impact by <strong className="text-white">Team Decoders: Vindhya, Vineela, Sreenidhi, Gowtham</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
