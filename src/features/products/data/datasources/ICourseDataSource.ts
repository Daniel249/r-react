import { CourseEntity } from '../../domain/entities/Course';

export interface ICourseDataSource {
  getCourses(): Promise<CourseEntity[]>;
  createCourse(name: string, description: string): Promise<CourseEntity>;
  updateCourse(courseId: string, name: string, description: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  joinCourse(courseId: string, password: string): Promise<void>;
}