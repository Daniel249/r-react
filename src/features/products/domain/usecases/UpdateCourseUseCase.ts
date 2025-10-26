import { ICourseRepository } from '../repositories/ICourseRepository';

export class UpdateCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(courseId: string, name: string, description: string): Promise<void> {
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
}