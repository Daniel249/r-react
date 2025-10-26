import { CourseEntity } from '../../domain/entities/Course';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { ICourseDataSource } from '../datasources/ICourseDataSource';

export class CourseRepositoryImpl implements ICourseRepository {
  constructor(private courseDataSource: ICourseDataSource) {}

  async getCourses(): Promise<CourseEntity[]> {
    return this.courseDataSource.getCourses();
  }

  async createCourse(name: string, description: string): Promise<CourseEntity> {
    return this.courseDataSource.createCourse(name, description);
  }

  async updateCourse(courseId: string, name: string, description: string): Promise<void> {
    return this.courseDataSource.updateCourse(courseId, name, description);
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.courseDataSource.deleteCourse(courseId);
  }

  async joinCourse(courseId: string, password: string): Promise<void> {
    return this.courseDataSource.joinCourse(courseId, password);
  }
}