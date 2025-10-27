import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '../../../../core/LocalPreferencesAsyncStorage';
import { CategoryEntity } from '../../domain/entities/Category';
import { ICategoryDataSource } from './ICategoryDataSource';

export class CategoryRemoteDataSourceImpl implements ICategoryDataSource {
  private readonly baseUrl: string;
  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.prefs.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getCategories(courseId: string): Promise<CategoryEntity[]> {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}/read?tableName=Category&CourseID=${courseId}`;
      console.log('🌐 [CATEGORIES] Fetching from:', url);
      console.log('🌐 [CATEGORIES] Headers:', headers);
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📡 [CATEGORIES] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 [CATEGORIES] Raw API response:', JSON.stringify(data, null, 2));
        
        let categoriesData: any[];
        if (Array.isArray(data)) {
          categoriesData = data;
          console.log('📋 [CATEGORIES] Data is array, length:', data.length);
        } else if (data && typeof data === 'object') {
          if (data.Category) {
            categoriesData = data.Category;
            console.log('📋 [CATEGORIES] Using data.Category, length:', data.Category.length);
          } else if (data.data) {
            categoriesData = data.data;
            console.log('📋 [CATEGORIES] Using data.data, length:', data.data.length);
          } else {
            categoriesData = [data];
            console.log('📋 [CATEGORIES] Using single object as array');
          }
        } else {
          categoriesData = [];
          console.log('📋 [CATEGORIES] No valid data, returning empty array');
        }

        console.log('📋 [CATEGORIES] Final processed data:', categoriesData);
        
        // Debug each category transformation
        const result = categoriesData.map((categoryJson, index) => {
          console.log(`🔄 [CATEGORIES] Transforming item ${index}:`, {
            Name: categoryJson.Name,
            Id: categoryJson.Id,
            id: categoryJson.id,
            _id: categoryJson._id,
            CourseSize: categoryJson.CourseSize,
            GroupSize: categoryJson.GroupSize,
            raw: categoryJson,
            keys: Object.keys(categoryJson)
          });
          const entity = CategoryEntity.fromJson(categoryJson);
          console.log(`✅ [CATEGORIES] Transformed to:`, {
            id: entity.id, // This should now be the Id value
            name: entity.name,
            groupSize: entity.groupSize
          });
          return entity;
        });
        
        console.log('📋 [CATEGORIES] All mapped entities:', result.map(r => ({id: r.id, name: r.name, groupSize: r.groupSize})));
        return result;
      } else {
        const errorBody = await response.text();
        console.error('❌ [CATEGORIES] API Error:', response.status, errorBody);
        throw new Error(`Failed to fetch categories: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('❌ [CATEGORIES] Exception:', error);
      throw error;
    }
  }

  async createCategory(name: string, courseId: string, isRandomSelection: boolean, groupSize: number): Promise<CategoryEntity> {
    try {
      console.log('🏷️ [CATEGORY_REMOTE] Creating category with data:', { name, courseId, isRandomSelection, groupSize });
      const headers = await this.getHeaders();
      
      const categoryData = {
        tableName: 'Category',
        records: [{
          Name: name,
          CourseID: courseId,
          IsRandom: isRandomSelection,
          CourseSize: groupSize,
          GroupsId: [],
        }]
      };

      console.log('🏷️ [CATEGORY_REMOTE] Request body:', JSON.stringify(categoryData, null, 2));

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify(categoryData),
      });

      console.log('🏷️ [CATEGORY_REMOTE] Response status:', response.status);
      console.log('🏷️ [CATEGORY_REMOTE] Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [CATEGORY_REMOTE] Server response data:', JSON.stringify(data, null, 2));
        const category = CategoryEntity.fromJson(data);
        console.log('✅ [CATEGORY_REMOTE] Created category entity:', category);
        return category;
      } else {
        const errorBody = await response.text();
        console.error('❌ [CATEGORY_REMOTE] Failed response body:', errorBody);
        throw new Error(`Failed to create category: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('❌ [CATEGORY_REMOTE] Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, name: string, isRandomSelection: boolean, groupSize: number): Promise<void> {
    try {
      console.log('🏷️ [CATEGORY_REMOTE] Updating category with data:', { categoryId, name, isRandomSelection, groupSize });
      const headers = await this.getHeaders();
      
      const updateData = {
        tableName: 'Category',
        idColumn: '_id',
        idValue: categoryId,
        updates: {
          Name: name,
          IsRandom: isRandomSelection,
          CourseSize: groupSize,
        }
      };

      console.log('🏷️ [CATEGORY_REMOTE] Update request body:', JSON.stringify(updateData, null, 2));

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      console.log('🏷️ [CATEGORY_REMOTE] Update response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ [CATEGORY_REMOTE] Update failed response body:', errorBody);
        throw new Error(`Failed to update category: ${response.status} - ${errorBody}`);
      } else {
        console.log('✅ [CATEGORY_REMOTE] Category updated successfully');
      }
    } catch (error) {
      console.error('❌ [CATEGORY_REMOTE] Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      console.log('🗑️ [CATEGORY_REMOTE] Deleting category with ID:', categoryId);
      const headers = await this.getHeaders();
      
      // Use the same JSON structure as the activity deletion to match Dart backend
      const deleteData = {
        tableName: 'Category',
        idColumn: '_id',
        idValue: categoryId
      };

      console.log('🗑️ [CATEGORY_REMOTE] Delete request body:', JSON.stringify(deleteData, null, 2));
      console.log('🗑️ [CATEGORY_REMOTE] Sending DELETE request to:', `${this.baseUrl}/delete`);
      
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(deleteData),
      });

      console.log('🗑️ [CATEGORY_REMOTE] Delete response status:', response.status);
      
      // Log response body for both success and error cases
      const responseBody = await response.text();
      console.log('🗑️ [CATEGORY_REMOTE] Delete response body:', responseBody);

      if (!response.ok) {
        console.error('🗑️ [CATEGORY_REMOTE] Delete failed with body:', responseBody);
        throw new Error(`Failed to delete category: ${response.status} - ${responseBody}`);
      }
      
      console.log('✅ [CATEGORY_REMOTE] Category deleted successfully with response:', responseBody);
    } catch (error) {
      console.error('❌ [CATEGORY_REMOTE] Error deleting category:', error);
      throw error;
    }
  }
}