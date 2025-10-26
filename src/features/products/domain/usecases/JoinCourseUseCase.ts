import { ICourseRepository } from '../repositories/ICourseRepository';

export class JoinCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(courseId: string, password: string): Promise<void> {
    if (!courseId.trim()) {
      throw new Error('Course ID is required');
    }
    if (!password.trim()) {
      throw new Error('Course password is required');
    }
    return this.courseRepository.joinCourse(courseId, password);
  }
}