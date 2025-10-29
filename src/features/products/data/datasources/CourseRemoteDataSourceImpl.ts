import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '../../../../core/LocalPreferencesAsyncStorage';
import { CourseEntity } from '../../domain/entities/Course';
import { ICourseDataSource } from './ICourseDataSource';

export class CourseRemoteDataSourceImpl implements ICourseDataSource {
  private readonly baseUrl: string;
  private prefs: ILocalPreferences;

  constructor(projectId?: string) {
    // Safely try to read environment variable with error handling
    let envProjectId: string | undefined;
    try {
      envProjectId = process.env?.EXPO_PUBLIC_ROBLE_PROJECT_ID;
    } catch (error) {
      console.warn("Could not access process.env, using fallback");
      envProjectId = undefined;
    }
    
    // Use provided projectId, then env var, then hardcoded fallback
    const safeProjectId = projectId || envProjectId || "pruebadavid_a9af0fb6f8";
    
    console.log(`CourseRemoteDataSourceImpl: Using project ID: ${safeProjectId}`);
    
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${safeProjectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.prefs.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getCourses(): Promise<CourseEntity[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/read?tableName=Course`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        
        let coursesData: any[];
        if (Array.isArray(data)) {
          coursesData = data;
        } else if (data && typeof data === 'object') {
          if (data.courses) {
            coursesData = data.courses;
          } else if (data.data) {
            coursesData = data.data;
          } else {
            coursesData = [data];
          }
        } else {
          coursesData = [];
        }

        return coursesData.map(courseJson => CourseEntity.fromJson(courseJson));
      } else {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch courses: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async createCourse(name: string, description: string): Promise<CourseEntity> {
    try {
      const headers = await this.getHeaders();
      const currentUser = await this.prefs.getUser();
      
      const courseData = {
        tableName: 'Course',
        records: [{
          Name: name,
          Description: description,
          Teacher: currentUser?.name || '',
          Students: JSON.stringify([]),
        }]
      };

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const data = await response.json();
        return CourseEntity.fromJson(data);
      } else {
        const errorBody = await response.text();
        throw new Error(`Failed to create course: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(courseId: string, name: string, description: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      
      const updateData = {
        tableName: 'Course',
        idColumn: '_id',
        idValue: courseId,
        updates: {
          Name: name,
          Description: description,
        }
      };

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update course: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          tableName: 'Course',
          id: courseId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete course: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  async joinCourse(courseId: string, password: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const currentUser = await this.prefs.getUser();
      
      const response = await fetch(`${this.baseUrl}/joinCourse`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courseId,
          password,
          studentName: currentUser?.name || '',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to join course: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error joining course:', error);
      throw error;
    }
  }
}