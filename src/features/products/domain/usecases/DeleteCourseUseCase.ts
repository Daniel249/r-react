import { ICourseRepository } from '../repositories/ICourseRepository';

export class DeleteCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(courseId: string): Promise<void> {
    if (!courseId.trim()) {
      throw new Error('Course ID is required');
    }
    return this.courseRepository.deleteCourse(courseId);
  }
}