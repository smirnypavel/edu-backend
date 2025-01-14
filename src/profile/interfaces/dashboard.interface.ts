/* eslint-disable prettier/prettier */
export interface DashboardData {
    totalProgress: number;
    activeCourses: number;
    totalScore: number;
    rank: number;
    recentActivity: {
      courseId: string;
      lessonId: string;
      action: 'started' | 'completed' | 'inProgress';
      timestamp: Date;
    }[];
    nextLessons: {
      courseId: string;
      lessonId: string;
      title: string;
      scheduledFor?: Date;
    }[];
  }