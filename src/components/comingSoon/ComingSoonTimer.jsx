import { useEffect, useState } from "react";

export default function ComingSoonTimer() {
  const launchDate = new Date("2025-10-10T00:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-6 px-10 rounded-lg shadow-lg">
        <p className="text-lg font-semibold">
          Coming Soon in Achrol, Nims And Nearby Areas
        </p>
        <div className="flex justify-center space-x-4 mt-3 font-mono text-sm sm:text-base">
          <div>{timeLeft.days}d</div>
          <div>{timeLeft.hours}h</div>
          <div>{timeLeft.minutes}m</div>
          <div>{timeLeft.seconds}s</div>
        </div>
      </div>
    </div>
  );
}
