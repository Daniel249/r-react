import { CourseEntity } from '../entities/Course';
import { ICourseRepository } from '../repositories/ICourseRepository';

export class CreateCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(name: string, description: string): Promise<CourseEntity> {
    if (!name.trim()) {
      throw new Error('Course name is required');
    }
    if (!description.trim()) {
      throw new Error('Course description is required');
    }
    return this.courseRepository.createCourse(name, description);
  }
}