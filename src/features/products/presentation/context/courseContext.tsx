import React, { createContext, useContext, useState } from 'react';
import { CourseEntity } from '../../domain/entities/Course';
import { CourseUseCase } from '../../domain/usecases/CourseUseCase';

interface CourseContextType {
  courses: CourseEntity[];
  loading: boolean;
  error: string | null;
  getCourses: () => Promise<void>;
  createCourse: (name: string, description: string) => Promise<void>;
  updateCourse: (courseId: string, name: string, description: string) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  joinCourse: (courseId: string, password: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
  children: React.ReactNode;
  courseUseCase: CourseUseCase;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({
  children,
  courseUseCase,
}) => {
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await courseUseCase.getCourses();
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (name: string, description: string) => {
    try {
      setLoading(true);
      setError(null);
      const newCourse = await courseUseCase.createCourse(name, description);
      setCourses(prevCourses => [...prevCourses, newCourse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (courseId: string, name: string, description: string) => {
    try {
      setLoading(true);
      setError(null);
      await courseUseCase.updateCourse(courseId, name, description);
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? new CourseEntity(courseId, name, description, course.studentsNames, course.teacher, course.activities, course.categories)
            : course
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      await courseUseCase.deleteCourse(courseId);
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinCourse = async (courseId: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await courseUseCase.joinCourse(courseId, password);
      // Refresh courses after joining
      await getCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: CourseContextType = {
    courses,
    loading,
    error,
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    joinCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};