import { CategoryEntity } from '../entities/Category';
import { ICategoryRepository } from '../repositories/ICategoryRepository';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(courseId: string): Promise<CategoryEntity[]> {
    return this.categoryRepository.getCategories(courseId);
  }
}