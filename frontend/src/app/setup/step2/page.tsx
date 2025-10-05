'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setupService } from '@/services/setupService';
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
import { SetupLayout, SetupHeader, SetupNavigation, SetupButton } from '@/components/setup';

export default function SetupStep2() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const handleNext = async () => {
    if (!selectedDate) {
      toast.error('Please select your birthday');
      return;
    }
    
    try {
      await setupService.saveSetupStep('step2', { birthday: selectedDate.toLocaleDateString('en-CA') });
      
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        user.stepData = user.stepData || {};
        user.stepData.step2 = { birthday: selectedDate.toLocaleDateString('en-CA') };
        user.stepStatus = user.stepStatus || {};
        user.stepStatus.step2 = true;
        localStorage.setItem('user_data', JSON.stringify(user));
      }
      
      toast.success('Birthday saved successfully!');
      setTimeout(() => {
        router.push('/setup/step3');
      }, 1500);
    } catch {
      toast.error('Failed to save birthday. Please try again.');
    }
  };


  const handleBack = () => {
    router.push('/setup/step1');
  };

  useEffect(() => {
    const fetchSetupStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Please login first');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }

            const data = await setupService.getSetupStatus();
        
        if (data.stepStatus && data.stepStatus.step2) {
          if (data.stepData && data.stepData.step2?.birthday) {
            const birthdayDate = new Date(data.stepData.step2.birthday);
            setSelectedDate(birthdayDate);
            setCurrentMonth(birthdayDate);
            toast.success('Birthday loaded from previous setup!');
          } else {
            toast.success('Birthday already set up! Redirecting to next step...');
            setTimeout(() => {
              router.push('/setup/step3');
            }, 1500);
            return;
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching setup status:', error);
        toast.error('Authentication failed. Please login again.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    };

    fetchSetupStatus();
  }, [router]);

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
    <SetupLayout isLoading={isLoading}>
      <SetupHeader 
        title="Set up your profile"
        description="Let us know your birthday to make every vibe more personal."
      />

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
          <SetupButton onClick={handleNext}>
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </SetupButton>
          
          <SetupNavigation onBack={handleBack} />
        </div>
    </SetupLayout>
  );
}
