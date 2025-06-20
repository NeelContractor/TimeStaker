"use client"
import { AlertTriangle, Timer } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
    endTime: Date;
    onTimeUp: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime.getTime() - now;

            if (distance < 0) {
                setIsExpired(true)
                onTimeUp()
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime, onTimeUp]);

    if (isExpired) {
        return (
        <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-red-200 font-semibold">Time Expired</h3>
            </div>
            <p className="text-red-300 text-sm">
                The deadline has passed. Your staked SOL may be subject to slashing.
            </p>
        </div>
        )
    }

    const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

    return (
        <div className={`backdrop-blur-lg rounded-2xl p-6 border shadow-xl ${
            isUrgent 
              ? 'bg-red-500/20 border-red-500/30' 
              : 'bg-white/10 border-white/20'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                isUrgent ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                <Timer className={`w-6 h-6 ${
                  isUrgent ? 'text-red-300' : 'text-blue-300'
                }`} />
              </div>
              <h3 className={`font-semibold ${
                isUrgent ? 'text-red-200' : 'text-white'
              }`}>
                Time Remaining
              </h3>
            </div>
      
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    isUrgent ? 'text-red-200' : 'text-white'
                  }`}>
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className={`text-xs ${
                    isUrgent ? 'text-red-300' : 'text-purple-200'
                  }`}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
      
            {isUrgent && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-300 text-sm text-center">
                  ⚠️ Less than 24 hours remaining!
                </p>
              </div>
            )}
          </div>
    )
}