'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  format,
  addMonths,
  subMonths
} from 'date-fns';
import toast from 'react-hot-toast';
import TermsModal from '@/components/TermsModal';

export default function SetupStep2() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleNext = () => {
    router.push('/setup/step3');
  };

  const handleSkip = () => {
    if (!acceptTerms) {
      setShowTermsModal(true);
      toast.error('Please accept terms and conditions before skipping setup');
      return;
    }
    router.push('/');
  };

  const handleAcceptTerms = () => {
    setAcceptTerms(true);
  };

  const handleBack = () => {
    router.push('/setup/step1');
  };

  const generateCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => ({
      date: day,
      isCurrentMonth: isSameMonth(day, currentMonth),
      isToday: isToday(day),
      isSelected: selectedDate ? isSameDay(day, selectedDate) : false
    }));
  };

  const calendarDays = generateCalendar();

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/login-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
        boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '480px',
        height: '700px'
      }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Set up your profile
          </h1>
          <p className="text-sm text-gray-600">
            Let us know your birthday to make every vibe more personal.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <select 
                value={format(currentMonth, 'MMM')}
                onChange={(e) => {
                  const monthIndex = new Date(Date.parse(e.target.value + " 1, 2000")).getMonth();
                  setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
                }}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm text-black"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = new Date(2000, i, 1);
                  return (
                    <option key={i} value={format(month, 'MMM')}>
                      {format(month, 'MMM')}
                    </option>
                  );
                })}
              </select>
              <select 
                value={format(currentMonth, 'yyyy')}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
                }}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm text-black"
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - 50 + i;
                  if (year <= new Date().getFullYear()) {
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  }
                  return null;
                }).filter(Boolean)}
              </select>
            </div>
            
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-sm text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                  day.isSelected
                    ? 'bg-purple-100 text-purple-700'
                    : day.isCurrentMonth
                    ? 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400'
                }`}
              >
                {format(day.date, 'd')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNext}
            className="w-full bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Skip Set up
            </button>
            
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
