import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  EyeOff, 
  Compass, 
  Sparkles, 
  Truck, 
  HeartHandshake,
  Utensils, 
  Calendar,
  Navigation,
  MessageSquare
} from 'lucide-react';

export default function LandingPage({ setActivePage }) {
  const { switchDemoRole } = useAuth();

  const handleStartRole = (role) => {
    switchDemoRole(role);
    setActivePage(role === 'donor' ? 'donor' : 'receiver');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION: PROMINENT "LAST BITE" BRANDING */}
      <section className="relative bg-[#14402F] text-white overflow-hidden py-16 sm:py-24 border-b border-[#3E8E6A]/30">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#3E8E6A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#F0922B]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF3EF]/10 border border-[#9CC5AA]/30 text-xs font-semibold text-[#9CC5AA]">
              <Sparkles className="w-3.5 h-3.5 text-[#F0922B]" />
              <span>Decoders Innovation • Hyperlocal PostGIS Exchange</span>
            </div>

            {/* Starting coming with the name Last Bite */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Last Bite <br />
              <span className="text-[#9CC5AA] font-normal text-2xl sm:text-4xl">
                Food-Expiry Rescue & Local Surplus Exchange
              </span>
            </h1>

            <p className="text-xl sm:text-2xl font-serif italic text-[#F0922B] tracking-wide">
              "Surplus today. A meal tonight."
            </p>

            <p className="text-base sm:text-lg text-[#9CC5AA] leading-relaxed max-w-2xl font-sans">
              Welcome to <strong>Last Bite</strong>. A role-based platform where commercial food donors (canteens, banquet halls, grocers) list surplus with exact expiry dates & times, and nearby community receivers find, claim, track live, and verify handovers within safe shelf life.
            </p>

            {/* Step 1 Callout: Whether you are donor or receiver */}
            <div className="pt-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F0922B] block">
                Get Started: Are You a Donor or a Receiver?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                {/* Donor Card */}
                <div
                  onClick={() => handleStartRole('donor')}
                  className="bg-[#0D2B20] hover:bg-[#3E8E6A]/20 border border-[#3E8E6A]/40 p-5 rounded-2xl cursor-pointer transition group shadow-soft"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#3E8E6A] text-white flex items-center justify-center font-bold">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#3E8E6A] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Start ➔
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">I am a Donor</h3>
                  <p className="text-xs text-[#9CC5AA] mt-1">
                    Canteens, banquets & grocers. List items with quantities and expiry dates & times.
                  </p>
                </div>

                {/* Receiver Card */}
                <div
                  onClick={() => handleStartRole('receiver')}
                  className="bg-[#0D2B20] hover:bg-[#F0922B]/20 border border-[#F0922B]/40 p-5 rounded-2xl cursor-pointer transition group shadow-soft"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F0922B] text-white flex items-center justify-center font-bold">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#F0922B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Start ➔
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">I am a Receiver</h3>
                  <p className="text-xs text-[#9CC5AA] mt-1">
                    Food banks, kitchens & shelters. Set operating hours, view nearby donors & track deliveries.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs text-[#9CC5AA]">
              <span>Already registered?</span>
              <button
                onClick={() => setActivePage('login')}
                className="font-bold text-white underline hover:text-[#F0922B]"
              >
                Sign in to your account
              </button>
              <span>•</span>
              <button
                onClick={() => setActivePage('register')}
                className="font-bold text-white underline hover:text-[#3E8E6A]"
              >
                Create new profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE-STEP GUIDED WORKFLOW VISUALIZER */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#3E8E6A]">
              End-to-End User Experience
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#14402F] mt-1">
              How Last Bite Connects Surplus to Meals
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#EDF3EF] border border-[#3E8E6A]/20 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#14402F] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="font-extrabold text-sm text-[#14402F]">Welcome to Last Bite</h4>
              <p className="text-xs text-gray-600">Choose whether you are a Commercial Donor or Community Receiver.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDF3EF] border border-[#3E8E6A]/20 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#3E8E6A] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-sm text-[#14402F]">Role Profile Sign-Up</h4>
              <p className="text-xs text-gray-600">Provide Name, Username, Gmail, Phone, and GPS Coordinates (Lat & Long).</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDF3EF] border border-[#3E8E6A]/20 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#3E8E6A] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="font-extrabold text-sm text-[#14402F]">Donor Surplus List</h4>
              <p className="text-xs text-gray-600">Donors enter items to donate, exact quantities, and expiry date & time.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDF3EF] border border-[#3E8E6A]/20 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#2E86AB] text-white text-xs font-bold flex items-center justify-center">4</span>
              <h4 className="font-extrabold text-sm text-[#14402F]">Nearby Donors Feed</h4>
              <p className="text-xs text-gray-600">Receivers state receiving hours and find nearby donors ranked by distance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDF3EF] border border-[#3E8E6A]/20 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#F0922B] text-white text-xs font-bold flex items-center justify-center">5</span>
              <h4 className="font-extrabold text-sm text-[#14402F]">Live Tracking & Receipt</h4>
              <p className="text-xs text-gray-600">Watch live route GPS tracking. Receiver marks received $\rightarrow$ donor gets instant receipt message!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM SECTION */}
      <section className="py-16 sm:py-20 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#14402F] text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg mb-12 relative overflow-hidden">
            <div className="max-w-3xl relative z-10 space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#F0922B]">
                The Global Challenge
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                "1.05 bn tonnes of food wasted worldwide in 2022, about 19% of food available to consumers"
              </h2>
              <p className="text-xs text-[#9CC5AA] font-mono pt-1">
                Source: UNEP Food Waste Index Report 2024
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#EDF3EF] rounded-2xl p-6 shadow-soft border border-[#3E8E6A]/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#3E8E6A] text-white flex items-center justify-center font-bold">
                <EyeOff className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#14402F]">Surplus is Invisible</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Canteens, banquets, and grocers have leftover food but lack direct instant channels to hunger relief charities.
              </p>
            </div>

            <div className="bg-[#EDF3EF] rounded-2xl p-6 shadow-soft border border-[#3E8E6A]/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0922B] text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#14402F]">Shelf-life Runs Out</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Cooked food has a 2 to 6-hour consumption window. Last Bite enforces live countdowns and travel feasibility before expiry.
              </p>
            </div>

            <div className="bg-[#EDF3EF] rounded-2xl p-6 shadow-soft border border-[#3E8E6A]/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E86AB] text-white flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#14402F]">No Local Coordination</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Without PostGIS radius geofences, food gets offered to distant recipients who cannot arrive before expiry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY IT MATTERS */}
      <section className="py-14 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#F8FAF9] space-y-2">
              <h4 className="font-extrabold text-base text-[#14402F]">⚡ Faster Rescue</h4>
              <p className="text-xs text-gray-600">Smart triage reduces claim latency from hours to minutes.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#F8FAF9] space-y-2">
              <h4 className="font-extrabold text-base text-[#14402F]">🤝 Trustworthy Handshake</h4>
              <p className="text-xs text-gray-600">Both donor and receiver double-verify every handover with delivery receipts.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#F8FAF9] space-y-2">
              <h4 className="font-extrabold text-base text-[#14402F]">📍 Hyperlocal PostGIS</h4>
              <p className="text-xs text-gray-600">Radius geofencing coordinates matching without central logistics overload.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
