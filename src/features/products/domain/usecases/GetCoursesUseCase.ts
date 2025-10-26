import { CourseEntity } from '../entities/Course';
import { ICourseRepository } from '../repositories/ICourseRepository';

export class GetCoursesUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute(): Promise<CourseEntity[]> {
    return this.courseRepository.getCourses();
  }
}