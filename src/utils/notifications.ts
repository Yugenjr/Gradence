import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Exam, TimetableItem } from '../types';

export const scheduleExamNotifications = async (exams: Exam[]) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
    
    // Clear previously scheduled exam notifications
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter(n => n.id.toString().startsWith('20'));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    let notificationsToSchedule = [];
    
    exams.forEach((exam, idx) => {
      const examDate = new Date(exam.date);
      examDate.setHours(9, 0, 0, 0); // Assume exam is at 9 AM
      
      const now = new Date();
      
      // 3 days before
      const threeDaysBefore = new Date(examDate.getTime() - (3 * 24 * 60 * 60 * 1000));
      if (threeDaysBefore > now) {
        notificationsToSchedule.push({
          id: 200000 + (idx * 10) + 3,
          title: 'Exam Approaching! 🎯',
          body: `Your ${exam.subject} exam is in 3 days. Start preparing!`,
          schedule: { at: threeDaysBefore }
        });
      }
      
      // 1 day before
      const oneDayBefore = new Date(examDate.getTime() - (24 * 60 * 60 * 1000));
      if (oneDayBefore > now) {
        notificationsToSchedule.push({
          id: 200000 + (idx * 10) + 1,
          title: 'Exam Tomorrow! ⚠️',
          body: `Your ${exam.subject} exam is tomorrow. Time to revise!`,
          schedule: { at: oneDayBefore }
        });
      }

      // 12 hours before (9 PM previous night)
      const twelveHoursBefore = new Date(examDate.getTime() - (12 * 60 * 60 * 1000));
      if (twelveHoursBefore > now) {
        notificationsToSchedule.push({
          id: 200000 + (idx * 10) + 0,
          title: 'Final Prep! 🌙',
          body: `Your ${exam.subject} exam is tomorrow morning. Get some sleep!`,
          schedule: { at: twelveHoursBefore }
        });
      }
    });

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch (e) {
    console.error('Failed to schedule exam notifications', e);
  }
};

export const scheduleClassNotifications = async (timetable: TimetableItem[]) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return;

    // Clear previously scheduled class notifications (ID starting with 30)
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter(n => n.id.toString().startsWith('30'));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    let notificationsToSchedule = [];

    timetable.forEach((item, idx) => {
      // parse time string like "09:30 AM"
      try {
        const [timeStr, modifier] = item.time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

        // Schedule daily repeating notification 30 mins before
        let t30 = new Date();
        t30.setHours(hours, minutes - 30, 0, 0);
        
        notificationsToSchedule.push({
          id: 300000 + (idx * 10) + 1,
          title: 'Class Nearing 📚',
          body: `${item.subject} in Room ${item.room} starts in 30 minutes.`,
          schedule: { 
            on: { hour: t30.getHours(), minute: t30.getMinutes() },
            repeats: true 
          }
        });

        // 10 mins before
        let t10 = new Date();
        t10.setHours(hours, minutes - 10, 0, 0);
        
        notificationsToSchedule.push({
          id: 300000 + (idx * 10) + 2,
          title: 'Class Starting Soon! 🏃',
          body: `${item.subject} starts in 10 minutes.`,
          schedule: { 
            on: { hour: t10.getHours(), minute: t10.getMinutes() },
            repeats: true 
          }
        });
      } catch (e) {
        console.error('Failed to parse time for class notification', e);
      }
    });

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch (e) {
    console.error('Failed to schedule class notifications', e);
  }
};
