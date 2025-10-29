import { CourseEntity } from '../entities/Course';
import { ICourseRepository } from '../repositories/ICourseRepository';

export class CourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  // Create a new course
  async createCourse(name: string, description: string): Promise<CourseEntity> {
    if (!name.trim()) {
      throw new Error('Course name is required');
    }
    if (!description.trim()) {
      throw new Error('Course description is required');
    }
    return this.courseRepository.createCourse(name, description);
  }

  // Get all courses
  async getCourses(): Promise<CourseEntity[]> {
    return this.courseRepository.getCourses();
  }

  // Update an existing course
  async updateCourse(courseId: string, name: string, description: string): Promise<void> {
    if (!courseId.trim()) {
      throw new Error('Course ID is required');
    }
    if (!name.trim()) {
      throw new Error('Course name is required');
    }
    if (!description.trim()) {
      throw new Error('Course description is required');
    }
    return this.courseRepository.updateCourse(courseId, name, description);
  }

  // Delete a course
  async deleteCourse(courseId: string): Promise<void> {
    if (!courseId.trim()) {
      throw new Error('Course ID is required');
    }
    return this.courseRepository.deleteCourse(courseId);
  }

  // Join a course with password
  async joinCourse(courseId: string, password: string): Promise<void> {
    if (!courseId.trim()) {
      throw new Error('Course ID is required');
    }
    if (!password.trim()) {
      throw new Error('Course password is required');
    }
    return this.courseRepository.joinCourse(courseId, password);
  }
}