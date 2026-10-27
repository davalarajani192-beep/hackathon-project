import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ expiryTime, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(expiryTime).getTime() - Date.now();
    if (diff <= 0) {
      return { expired: true, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { expired: false, hours, minutes, seconds, totalSeconds: Math.floor(diff / 1000) };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryTime]);

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertCircle className="w-3.5 h-3.5" /> Expired
      </span>
    );
  }

  const isUrgent = timeLeft.totalSeconds < 2 * 3600; // Under 2 hours
  const isModerate = timeLeft.totalSeconds < 6 * 3600; // 2 - 6 hours

  const pad = (n) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isUrgent
            ? 'bg-amber-100 text-[#D87D1A] animate-pulse ring-1 ring-[#F0922B]'
            : isModerate
            ? 'bg-[#EDF3EF] text-[#14402F]'
            : 'bg-[#EDF3EF] text-[#3E8E6A]'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-[#F0922B]" />
        <span>
          {timeLeft.hours > 0 && `${timeLeft.hours}h `}
          {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
        </span>
      </span>
    );
  }

  return (
    <div
      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
        isUrgent
          ? 'bg-amber-50/80 border-[#F0922B] text-[#14402F]'
          : 'bg-[#EDF3EF]/70 border-[#3E8E6A]/20 text-[#14402F]'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isUrgent ? 'bg-[#F0922B] text-white animate-pulse' : 'bg-[#3E8E6A] text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            {isUrgent ? 'Urgent Shelf-Life' : 'Time Remaining'}
          </p>
          <p className="text-sm font-extrabold tracking-tight">
            {timeLeft.hours > 0 && <span>{timeLeft.hours}h </span>}
            <span>{pad(timeLeft.minutes)}m </span>
            <span className="text-xs font-medium text-gray-600">{pad(timeLeft.seconds)}s</span>
          </p>
        </div>
      </div>
      {isUrgent && (
        <span className="text-[11px] font-semibold text-[#D87D1A] bg-white px-2 py-0.5 rounded shadow-sm border border-amber-200">
          Act Fast
        </span>
      )}
    </div>
  );
}
