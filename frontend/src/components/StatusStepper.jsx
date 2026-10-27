import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

export default function StatusStepper({ listing }) {
  const { status, listed_at, claimed_at, collected_at, verified_at, donor_name, claimed_by_name } = listing;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (status === 'Expired') {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-bold">Listing Expired</p>
          <p className="text-red-600">Surplus passed its safe consumption deadline without completed pickup.</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      key: 'Listed',
      label: 'Listed',
      sub: donor_name || 'Donor',
      time: formatDate(listed_at),
      icon: Clock,
      active: true,
      done: ['Accepted', 'Collected', 'Verified'].includes(status),
    },
    {
      key: 'Accepted',
      label: 'Accepted',
      sub: claimed_by_name || 'Receiver Claimed',
      time: formatDate(claimed_at),
      icon: Truck,
      active: ['Accepted', 'Collected', 'Verified'].includes(status),
      done: ['Collected', 'Verified'].includes(status),
    },
    {
      key: 'Collected',
      label: 'Collected',
      sub: claimed_by_name ? `${claimed_by_name} picked up` : 'Picked up',
      time: formatDate(collected_at),
      icon: CheckCircle2,
      active: ['Collected', 'Verified'].includes(status),
      done: status === 'Verified',
    },
    {
      key: 'Verified',
      label: 'Double Verified',
      sub: 'Both sides confirmed',
      time: formatDate(verified_at),
      icon: ShieldCheck,
      active: status === 'Verified',
      done: status === 'Verified',
    },
  ];

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full bg-[#3E8E6A] transition-all duration-500"
            style={{
              width:
                status === 'Verified'
                  ? '100%'
                  : status === 'Collected'
                  ? '66%'
                  : status === 'Accepted'
                  ? '33%'
                  : '0%',
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = status === step.key;
          const isPast = step.done;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 text-center px-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#F0922B] text-white ring-4 ring-[#F0922B]/20 scale-110 shadow-sm'
                    : isPast
                    ? 'bg-[#3E8E6A] text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`mt-1.5 text-xs font-bold leading-tight ${
                  isCurrent
                    ? 'text-[#F0922B]'
                    : isPast
                    ? 'text-[#14402F]'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>

              {step.time && (
                <span className="text-[10px] text-gray-500 mt-0.5 max-w-[85px] truncate">
                  {step.time}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {status === 'Verified' && (
        <div className="mt-3 py-1.5 px-3 bg-[#EDF3EF] border border-[#3E8E6A]/30 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold text-[#14402F]">
          <ShieldCheck className="w-4 h-4 text-[#3E8E6A]" />
          <span>Double Handshake Complete: Confirmed & verified by both donor and receiver!</span>
        </div>
      )}
    </div>
  );
}
