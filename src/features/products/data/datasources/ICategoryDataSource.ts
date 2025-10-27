import { CategoryEntity } from '../../domain/entities/Category';

export interface ICategoryDataSource {
  getCategories(courseId: string): Promise<CategoryEntity[]>;
  createCategory(name: string, courseId: string, isRandomSelection: boolean, groupSize: number): Promise<CategoryEntity>;
  updateCategory(categoryId: string, name: string, isRandomSelection: boolean, groupSize: number): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;
}