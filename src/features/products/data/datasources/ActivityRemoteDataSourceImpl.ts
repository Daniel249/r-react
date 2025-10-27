import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '../../../../core/LocalPreferencesAsyncStorage';
import { ActivityEntity } from '../../domain/entities/Activity';
import { IActivityDataSource } from './IActivityDataSource';

export class ActivityRemoteDataSourceImpl implements IActivityDataSource {
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

  async getActivities(courseId: string): Promise<ActivityEntity[]> {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}/read?tableName=Activities&CourseID=${courseId}`;
      console.log('🌐 [ACTIVITIES] Fetching from:', url);
      console.log('🌐 [ACTIVITIES] Headers:', headers);
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📡 [ACTIVITIES] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📝 [ACTIVITIES] Raw API response:', JSON.stringify(data, null, 2));
        
        let activitiesData: any[];
        if (Array.isArray(data)) {
          activitiesData = data;
          console.log('📝 [ACTIVITIES] Data is array, length:', data.length);
        } else if (data && typeof data === 'object') {
          if (data.Activities) {
            activitiesData = data.Activities;
            console.log('📝 [ACTIVITIES] Using data.Activities, length:', data.Activities.length);
          } else if (data.data) {
            activitiesData = data.data;
            console.log('📝 [ACTIVITIES] Using data.data, length:', data.data.length);
          } else {
            activitiesData = [data];
            console.log('📝 [ACTIVITIES] Using single object as array');
          }
        } else {
          activitiesData = [];
          console.log('📝 [ACTIVITIES] No valid data, returning empty array');
        }

        console.log('📝 [ACTIVITIES] Final processed data:', activitiesData);
        
        // Debug each activity transformation
        const result = activitiesData.map((activityJson, index) => {
          console.log(`🔄 [ACTIVITIES] Transforming item ${index}:`, {
            Name: activityJson.Name,
            CatID: activityJson.CatID,
            CategoryID: activityJson.CategoryID,
            Description: activityJson.Description,
            raw: activityJson,
            keys: Object.keys(activityJson)
          });
          const entity = ActivityEntity.fromJson(activityJson);
          console.log(`✅ [ACTIVITIES] Transformed to:`, {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            category: entity.category // This should now be the CatID value
          });
          return entity;
        });
        
        console.log('📝 [ACTIVITIES] All mapped entities:', result.map(r => ({id: r.id, name: r.name, category: r.category})));
        return result;
      } else {
        const errorBody = await response.text();
        console.error('❌ [ACTIVITIES] API Error:', response.status, errorBody);
        throw new Error(`Failed to fetch activities: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('❌ [ACTIVITIES] Exception:', error);
      throw error;
    }
  }

  async createActivity(name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean): Promise<boolean> {
    try {
      console.log('🎯 [ACTIVITY_REMOTE] Creating activity with data:', { name, description, courseId, categoryId, isAssessment });
      const headers = await this.getHeaders();
      
      const activityData = {
        tableName: 'Activities',
        records: [{
          Nombre: name,
          Description: description,
          CourseID: courseId,
          CatID: categoryId,
          Assessment: isAssessment, // Fixed: should be 'Assessment', not 'Asessment'
          Notas: JSON.stringify({}),
        }]
      };

      console.log('🎯 [ACTIVITY_REMOTE] Request body:', JSON.stringify(activityData, null, 2));

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify(activityData),
      });

      console.log('🎯 [ACTIVITY_REMOTE] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [ACTIVITY_REMOTE] Server response body:', JSON.stringify(data, null, 2));
        console.log('✅ [ACTIVITY_REMOTE] Activity created successfully');
        return true;
      } else {
        const errorBody = await response.text();
        console.error('❌ [ACTIVITY_REMOTE] Failed response body:', errorBody);
        throw new Error(`Failed to create activity: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('❌ [ACTIVITY_REMOTE] Error creating activity:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, name: string, description: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      
      const updateData = {
        tableName: 'Activities',
        idColumn: '_id',
        idValue: activityId,
        updates: {
          Nombre: name,
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
        throw new Error(`Failed to update activity: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(activity: ActivityEntity): Promise<void> {
    try {
      console.log('🗑️ [ACTIVITY_REMOTE] Deleting activity:', activity);
      const headers = await this.getHeaders();
      
      // Use the same JSON structure as the Dart version
      const deleteData = {
        tableName: 'Activities',
        idColumn: '_id',
        idValue: activity.id
      };

      console.log('🗑️ [ACTIVITY_REMOTE] Delete request body:', JSON.stringify(deleteData, null, 2));
      console.log('🗑️ [ACTIVITY_REMOTE] Sending DELETE request to:', `${this.baseUrl}/delete`);
      
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(deleteData),
      });

      console.log('🗑️ [ACTIVITY_REMOTE] Delete response status:', response.status);
      
      // Log response body for both success and error cases
      const responseBody = await response.text();
      console.log('🗑️ [ACTIVITY_REMOTE] Delete response body:', responseBody);

      if (!response.ok) {
        console.error('🗑️ [ACTIVITY_REMOTE] Delete failed with body:', responseBody);
        throw new Error(`Failed to delete activity: ${response.status} - ${responseBody}`);
      }
      
      console.log('✅ [ACTIVITY_REMOTE] Activity deleted successfully with response:', responseBody);
    } catch (error) {
      console.error('❌ [ACTIVITY_REMOTE] Error deleting activity:', error);
      throw error;
    }
  }

  async activateAssessment(activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string): Promise<void> {
    try {
      console.log('🎯 [ACTIVITY_REMOTE] Activating assessment:', { activityId, assessName, isPublic, duration, timeUnit });
      const headers = await this.getHeaders();
      
      // Calculate time based on duration and unit
      const now = new Date();
      const durationInMs = timeUnit === 'hours' ? duration * 60 * 60 * 1000 : duration * 60 * 1000;
      const assessmentTime = new Date(now.getTime() + durationInMs);
      
      const updateData = {
        tableName: 'Activities',
        idColumn: '_id',
        idValue: activityId,
        updates: {
          AssessName: assessName,
          IsPublic: isPublic,
          Time: assessmentTime.toISOString(),
          Assessment: true,
        }
      };

      console.log('🎯 [ACTIVITY_REMOTE] Assessment activation request body:', JSON.stringify(updateData, null, 2));

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      console.log('🎯 [ACTIVITY_REMOTE] Assessment activation response status:', response.status);

      if (response.ok) {
        const responseBody = await response.text();
        console.log('✅ [ACTIVITY_REMOTE] Assessment activation response body:', responseBody);
        console.log('✅ [ACTIVITY_REMOTE] Assessment activated successfully');
      } else {
        const errorBody = await response.text();
        console.error('❌ [ACTIVITY_REMOTE] Assessment activation failed response body:', errorBody);
        throw new Error(`Failed to activate assessment: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('❌ [ACTIVITY_REMOTE] Error activating assessment:', error);
      throw error;
    }
  }

  async updateAssessmentResults(activityId: string, notas: any): Promise<void> {
    try {
      console.log('📊 [ACTIVITY_REMOTE] Updating assessment results for activity:', activityId);
      console.log('📊 [ACTIVITY_REMOTE] New notas:', notas);
      
      const headers = await this.getHeaders();
      
      // Use the same JSON structure as other update operations
      const updateData = {
        tableName: 'Activities',
        idColumn: '_id',
        idValue: activityId,
        updates: {
          Notas: JSON.stringify(notas)
        }
      };

      console.log('📊 [ACTIVITY_REMOTE] Update request body:', JSON.stringify(updateData, null, 2));
      console.log('📊 [ACTIVITY_REMOTE] Sending PUT request to:', `${this.baseUrl}/update`);
      
      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      console.log('📊 [ACTIVITY_REMOTE] Update response status:', response.status);
      
      // Log response body for both success and error cases
      const responseBody = await response.text();
      console.log('📊 [ACTIVITY_REMOTE] Update response body:', responseBody);

      if (!response.ok) {
        console.error('📊 [ACTIVITY_REMOTE] Update failed with body:', responseBody);
        throw new Error(`Failed to update assessment results: ${response.status} - ${responseBody}`);
      }
      
      console.log('✅ [ACTIVITY_REMOTE] Assessment results updated successfully with response:', responseBody);
    } catch (error) {
      console.error('❌ [ACTIVITY_REMOTE] Error updating assessment results:', error);
      throw error;
    }
  }
}