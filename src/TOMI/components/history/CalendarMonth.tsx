import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { historyStyles } from '../../styles/history.styles';

interface CalendarMonthProps {
  currentMonth: Date;
  activeDates: string[];
  selectedDate?: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onDatePress: (date: Date) => void;
  emptyMessage?: string;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentMonth,
  activeDates,
  selectedDate,
  onMonthChange,
  onDatePress,
  emptyMessage = 'No workouts this month',
}) => {
  // Get calendar grid data
  const getCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Format date to YYYY-MM-DD
  const getDateString = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  // Check if a date has workouts
  const isDateActive = (day: number) => {
    const dateString = getDateString(day);
    return activeDates.includes(dateString);
  };

  // Check if a date is today
  const isDateToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  // Handle date press
  const handleDatePress = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDatePress(date);
  };

  return (
    <View>
      {/* Calendar Grid */}
      <View style={historyStyles.calendarGrid}>
        <View style={historyStyles.calendarWeekdays}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <Text key={idx} style={historyStyles.weekdayText}>{day}</Text>
          ))}
        </View>

        <View style={historyStyles.calendarDays}>
          {getCalendarGrid().map((day, idx) => {
            const isActive = day ? isDateActive(day) : false;
            const isSelected = day ? selectedDate === getDateString(day) : false;
            const isToday = day ? isDateToday(day) : false;

            return (
              <TouchableOpacity
                key={idx}
                style={historyStyles.calendarDay}
                disabled={!isActive}
                onPress={() => day && isActive && handleDatePress(day)}
                activeOpacity={isActive ? 0.7 : 1}
              >
                {day && (
                  <View
                    style={[
                      historyStyles.calendarDayInner,
                      isActive && historyStyles.calendarDayActive,
                      isSelected && historyStyles.calendarDaySelected,
                      isToday && !isSelected && historyStyles.calendarDayToday,
                      isToday && isSelected && historyStyles.calendarDayTodaySelected,
                    ]}
                  >
                    <Text
                      style={[
                        historyStyles.calendarDayText,
                        isActive && !isSelected && historyStyles.calendarDayTextActive,
                        isSelected && historyStyles.calendarDayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                    {isToday && (
                      <View style={[
                        historyStyles.todayDot,
                        isSelected && historyStyles.todayDotSelected,
                      ]} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {activeDates.length === 0 && (
        <View style={historyStyles.emptyCalendar}>
          <Text style={historyStyles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};
