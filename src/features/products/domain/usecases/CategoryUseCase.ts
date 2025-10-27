import { CategoryEntity } from '../entities/Category';
import { ICategoryRepository } from '../repositories/ICategoryRepository';

export class CategoryUseCase {
  constructor(private repository: ICategoryRepository) {}

  async getCategories(courseId: string): Promise<CategoryEntity[]> {
    return await this.repository.getCategories(courseId);
  }

  async addCategory(name: string, courseId: string, isRandomSelection: boolean, groupSize: number): Promise<CategoryEntity> {
    console.log('🎯 [CATEGORY_USECASE] Starting addCategory with params:', { name, courseId, isRandomSelection, groupSize });
    console.log('🎯 [CATEGORY_USECASE] About to call repository.createCategory...');
    
    const result = await this.repository.createCategory(name, courseId, isRandomSelection, groupSize);
    
    console.log('🎯 [CATEGORY_USECASE] Repository returned:', result);
    console.log('✅ [CATEGORY_USECASE] addCategory completed successfully');
    return result;
  }

  async updateCategory(category: CategoryEntity): Promise<void> {
    if (!category.id) {
      throw new Error('Category ID is required for update');
    }
    return await this.repository.updateCategory(category.id, category.name, category.isRandomSelection, category.groupSize);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return await this.repository.deleteCategory(categoryId);
  }
}