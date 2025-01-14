/* eslint-disable prettier/prettier */
export interface LearningStats {
    totalTimeSpent: number; // в минутах
    weeklyStats: {
      date: Date;
      timeSpent: number;
      lessonsCompleted: number;
    }[];
    courseStats: {
      courseId: string;
      timeSpent: number;
      progress: number;
      score: number;
      lastAccessed: Date;
    }[];
    achievements: {
      id: string;
      name: string;
      description: string;
      earnedAt: Date;
    }[];
  }