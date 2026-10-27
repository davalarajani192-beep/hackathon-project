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
  CheckCircle,
  Truck,
  Heart,
  BarChart3
} from 'lucide-react';

export default function LandingPage({ setActivePage }) {
  const { switchDemoRole } = useAuth();

  const handleRoleSelect = (role) => {
    switchDemoRole(role);
    setActivePage(role);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Dark Green #14402F) */}
      <section className="relative bg-[#14402F] text-white overflow-hidden py-16 sm:py-24 border-b border-[#3E8E6A]/30">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#3E8E6A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#F0922B]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF3EF]/10 border border-[#9CC5AA]/30 text-xs font-semibold text-[#9CC5AA]">
              <Sparkles className="w-3.5 h-3.5 text-[#F0922B]" />
              <span>Decoders Innovation • PostGIS Hyperlocal Rescue</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
              EASY – Food-Expiry Rescue <br className="hidden sm:inline" />
              <span className="text-[#9CC5AA] font-normal text-3xl sm:text-5xl">& Local Surplus Exchange</span>
            </h1>

            <p className="text-xl sm:text-2xl font-serif italic text-[#F0922B] tracking-wide">
              "Surplus today. A meal tonight."
            </p>

            <p className="text-base sm:text-lg text-[#9CC5AA] leading-relaxed max-w-2xl font-sans">
              A role-based platform where canteens, banquet halls, and grocers list surplus food with live expiry timestamps—and nearby community kitchens collect and double-verify it within radius and remaining shelf life.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleRoleSelect('donor')}
                className="px-6 py-3.5 rounded-2xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-base shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2 group"
              >
                <span>I'm a Donor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleRoleSelect('receiver')}
                className="px-6 py-3.5 rounded-2xl bg-[#F0922B] hover:bg-[#D87D1A] text-white font-bold text-base shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2 group"
              >
                <span>I'm a Receiver</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleRoleSelect('admin')}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#9CC5AA] hover:text-white font-medium text-sm transition"
              >
                View Platform Admin
              </button>
            </div>

            {/* Quick Live Stats Ticker */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#3E8E6A]/20">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">480+ meals</p>
                <p className="text-xs text-[#9CC5AA]">Rescued & Verified this week</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#F0922B]">&lt; 18 mins</p>
                <p className="text-xs text-[#9CC5AA]">Average claim-to-dispatch</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100% PostGIS</p>
                <p className="text-xs text-[#9CC5AA]">Radius geofence matching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="py-16 sm:py-24 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Big Stat Callout */}
          <div className="bg-[#14402F] text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg mb-16 relative overflow-hidden">
            <div className="max-w-3xl relative z-10 space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#F0922B]">
                The Global Challenge
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                "1.05 bn tonnes of food wasted worldwide in 2022, about 19% of food available to consumers"
              </h2>
              <p className="text-xs sm:text-sm text-[#9CC5AA] font-mono pt-2">
                Source: UNEP Food Waste Index Report 2024
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
              <AlertTriangle className="w-80 h-80 text-white" />
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#14402F]">
              Why Good Food Gets Lost
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Commercial hospitality and kitchens produce prime nutritious food, but fall victim to three systemic bottlenecks:
            </p>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#EDF3EF] rounded-2xl p-8 shadow-soft border border-[#3E8E6A]/20 flex flex-col justify-between hover:-translate-y-1 transition duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#3E8E6A] text-white flex items-center justify-center shadow-sm">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#14402F]">Surplus is Invisible</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Canteens, banquets, and grocers have leftover food but lack direct, immediate visibility with nearby charities. Without an instant channel, surplus ends up in municipal dumpsters.
                </p>
              </div>
              <div className="pt-6 border-t border-[#3E8E6A]/10 text-xs font-semibold text-[#3E8E6A]">
                EASY Solution: Instant verified listing feed
              </div>
            </div>

            <div className="bg-[#EDF3EF] rounded-2xl p-8 shadow-soft border border-[#3E8E6A]/20 flex flex-col justify-between hover:-translate-y-1 transition duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F0922B] text-white flex items-center justify-center shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#14402F]">Shelf-life Runs Out</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Fresh cooked meals and perishables have tight 2 to 6-hour consumption windows. Traditional food charities take hours or days to organize pickups, arriving after the food is unsafe.
                </p>
              </div>
              <div className="pt-6 border-t border-[#3E8E6A]/10 text-xs font-semibold text-[#F0922B]">
                EASY Solution: Live reactive countdown & feasibility checks
              </div>
            </div>

            <div className="bg-[#EDF3EF] rounded-2xl p-8 shadow-soft border border-[#3E8E6A]/20 flex flex-col justify-between hover:-translate-y-1 transition duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E86AB] text-white flex items-center justify-center shadow-sm">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#14402F]">No Local Coordination</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Without radius-bounded routing, listings get broadcast to distant receivers who cannot travel through traffic in time, causing failed handovers and wasted volunteer fuel.
                </p>
              </div>
              <div className="pt-6 border-t border-[#3E8E6A]/10 text-xs font-semibold text-[#2E86AB]">
                EASY Solution: PostGIS radius & travel time matching
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-16 sm:py-24 bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#3E8E6A]">
              Architecture & Workflow
            </span>
            <h3 className="text-3xl font-extrabold text-[#14402F] mt-1">
              How EASY Works in 3 Core Steps
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              From commercial surplus kitchen to community distribution plate before the countdown hits zero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-gray-100 relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#14402F] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-lg font-bold text-[#14402F]">Role-Based Access</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Commercial food providers register as <strong>Donors</strong> (canteens, banquet halls, grocers) with defined geofences. Food banks and community kitchens register as <strong>Receivers</strong> with verified vehicle capacity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-gray-100 relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#3E8E6A] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-lg font-bold text-[#14402F]">Live Surplus Listings</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Donors list food items in seconds—specifying exact meal counts or kg, storage requirement (ambient, chilled, or frozen), exact expiry timestamp, and a customizable pickup radius geofence circle.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-gray-100 relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#F0922B] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-lg font-bold text-[#14402F]">Smart 4-Stage Matching</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our backend executes PostGIS ST_DWithin filtering, calculates travel time vs remaining shelf life, verifies cold chain capacity, and ranks top matches with double-handshake confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY IT MATTERS SECTION */}
      <section className="py-16 sm:py-24 bg-[#EDF3EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F0922B]">
              Real-World Impact
            </span>
            <h3 className="text-3xl font-extrabold text-[#14402F] mt-1">
              Why EASY Matters
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Transforming food waste into dignified meals with speed, trust, and hyperlocal scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3E8E6A]/10 text-[#3E8E6A] flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-[#14402F]">Faster</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Smart triage reduces claim latency from hours to minutes. Receivers only see surplus they are guaranteed to reach before the food's shelf life runs out.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2E86AB]/10 text-[#2E86AB] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-[#14402F]">Trustworthy</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every meal count is <strong>verified twice</strong>: first marked collected by the receiver, then confirmed by the donor upon handover. Full immutable audit trail for CSR reporting.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0922B]/10 text-[#F0922B] flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-[#14402F]">Scalable</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                PostGIS spatial indexing ensures zero central bottleneck. Donors control their own geofence radius (5km to 20km) so logistics scale seamlessly from city block to metro region.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA CALLOUT */}
      <section className="bg-[#14402F] text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold">
            Ready to Turn Tonight's Surplus into Meals?
          </h3>
          <p className="text-base text-[#9CC5AA] max-w-xl mx-auto">
            Experience the working live demo built by Team Decoders. Select your role to get started immediately.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => handleRoleSelect('donor')}
              className="px-6 py-3 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-sm shadow-soft transition"
            >
              Open Donor Workspace
            </button>
            <button
              onClick={() => handleRoleSelect('receiver')}
              className="px-6 py-3 rounded-xl bg-[#F0922B] hover:bg-[#D87D1A] text-white font-bold text-sm shadow-soft transition"
            >
              Open Receiver Feed
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
