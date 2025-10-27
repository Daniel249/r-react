import { CategoryEntity } from '../../domain/entities/Category';
import { CategoryUseCase } from '../../domain/usecases/CategoryUseCase';

export class CategoryController {
  constructor(private categoryUseCase: CategoryUseCase) {}

  async getCategories(courseId: string): Promise<CategoryEntity[]> {
    try {
      console.log('🏷️ [CATEGORY_CONTROLLER] Getting categories for course:', courseId);
      const categories = await this.categoryUseCase.getCategories(courseId);
      console.log('✅ [CATEGORY_CONTROLLER] Retrieved categories:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ [CATEGORY_CONTROLLER] Error getting categories:', error);
      throw error;
    }
  }

  async createCategory(name: string, isRandomSelection: boolean, groupSize: number, courseId: string): Promise<CategoryEntity> {
    try {
      console.log('🏷️ [CATEGORY_CONTROLLER] Starting category creation with params:', { name, isRandomSelection, groupSize, courseId });
      console.log('🏷️ [CATEGORY_CONTROLLER] About to call categoryUseCase.addCategory...');
      
      const category = await this.categoryUseCase.addCategory(name, courseId, isRandomSelection, groupSize);
      
      console.log('🏷️ [CATEGORY_CONTROLLER] UseCase returned:', category);
      console.log('✅ [CATEGORY_CONTROLLER] Created category successfully');
      return category;
    } catch (error) {
      console.error('❌ [CATEGORY_CONTROLLER] Error creating category:', error);
      console.error('❌ [CATEGORY_CONTROLLER] Error details:', (error as Error).message);
      console.error('❌ [CATEGORY_CONTROLLER] Error stack:', (error as Error).stack);
      throw error;
    }
  }

  async updateCategory(category: CategoryEntity): Promise<void> {
    try {
      console.log('🏷️ [CATEGORY_CONTROLLER] Updating category:', category.id);
      await this.categoryUseCase.updateCategory(category);
      console.log('✅ [CATEGORY_CONTROLLER] Updated category:', category.id);
    } catch (error) {
      console.error('❌ [CATEGORY_CONTROLLER] Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      console.log('🏷️ [CATEGORY_CONTROLLER] Deleting category:', categoryId);
      await this.categoryUseCase.deleteCategory(categoryId);
      console.log('✅ [CATEGORY_CONTROLLER] Deleted category:', categoryId);
    } catch (error) {
      console.error('❌ [CATEGORY_CONTROLLER] Error deleting category:', error);
      throw error;
    }
  }
}