import { CourseEntity } from '../entities/Course';

export interface ICourseRepository {
  getCourses(): Promise<CourseEntity[]>;
  createCourse(name: string, description: string): Promise<CourseEntity>;
  updateCourse(courseId: string, name: string, description: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  joinCourse(courseId: string, password: string): Promise<void>;
}