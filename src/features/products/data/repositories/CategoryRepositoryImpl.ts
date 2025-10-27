import { CategoryEntity } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { ICategoryDataSource } from '../datasources/ICategoryDataSource';

export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private categoryDataSource: ICategoryDataSource) {}

  async getCategories(courseId: string): Promise<CategoryEntity[]> {
    return this.categoryDataSource.getCategories(courseId);
  }

  async createCategory(name: string, courseId: string, isRandomSelection: boolean, groupSize: number): Promise<CategoryEntity> {
    return this.categoryDataSource.createCategory(name, courseId, isRandomSelection, groupSize);
  }

  async updateCategory(categoryId: string, name: string, isRandomSelection: boolean, groupSize: number): Promise<void> {
    return this.categoryDataSource.updateCategory(categoryId, name, isRandomSelection, groupSize);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return this.categoryDataSource.deleteCategory(categoryId);
  }
}