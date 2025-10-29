import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '../../../../core/LocalPreferencesAsyncStorage';
import { GroupEntity } from '../../domain/entities/Group';
import { IGroupDataSource } from './IGroupDataSource';

export class GroupRemoteDataSourceImpl implements IGroupDataSource {
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
    
    console.log(`GroupRemoteDataSourceImpl: Using project ID: ${safeProjectId}`);
    
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

  async getGroups(courseId?: string): Promise<GroupEntity[]> {
    try {
      const headers = await this.getHeaders();
      // Groups don't have CourseID - they're related through categories
      const url = `${this.baseUrl}/read?tableName=Groups`;
      
      console.log('🌐 [GROUPS] Fetching from:', url);
      console.log('🌐 [GROUPS] Headers:', headers);
        
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📡 [GROUPS] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('👥 [GROUPS] Raw API response:', JSON.stringify(data, null, 2));
        
        let groupsData: any[];
        if (Array.isArray(data)) {
          groupsData = data;
          console.log('👥 [GROUPS] Data is array, length:', data.length);
        } else if (data && typeof data === 'object') {
          if (data.Groups) {
            groupsData = data.Groups;
            console.log('👥 [GROUPS] Using data.Groups, length:', data.Groups.length);
          } else if (data.groups) {
            groupsData = data.groups;
            console.log('👥 [GROUPS] Using data.groups, length:', data.groups.length);
          } else if (data.data) {
            groupsData = data.data;
            console.log('👥 [GROUPS] Using data.data, length:', data.data.length);
          } else if (data.records) {
            groupsData = data.records;
            console.log('👥 [GROUPS] Using data.records, length:', data.records.length);
          } else {
            groupsData = [data];
            console.log('👥 [GROUPS] Using single object as array');
          }
        } else {
          groupsData = [];
          console.log('👥 [GROUPS] No valid data, returning empty array');
        }

        console.log('👥 [GROUPS] Final processed data:', groupsData);
        const result = groupsData.map(groupJson => GroupEntity.fromJson(groupJson));
        console.log('👥 [GROUPS] Mapped to entities:', result);
        return result;
      } else {
        const errorBody = await response.text();
        console.error('❌ [GROUPS] API Error:', response.status, errorBody);
        throw new Error(`Failed to fetch groups: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('❌ [GROUPS] Exception:', error);
      throw error;
    }
  }

  async getGroupsByCategory(categoryId: string): Promise<GroupEntity[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/read?tableName=Groups&Category=${categoryId}`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        
        let groupsData: any[];
        if (Array.isArray(data)) {
          groupsData = data;
        } else if (data && typeof data === 'object') {
          if (data.Groups) {
            groupsData = data.Groups;
          } else if (data.groups) {
            groupsData = data.groups;
          } else if (data.data) {
            groupsData = data.data;
          } else if (data.records) {
            groupsData = data.records;
          } else {
            groupsData = [data];
          }
        } else {
          groupsData = [];
        }

        return groupsData.map(groupJson => GroupEntity.fromJson(groupJson));
      } else {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch groups by category: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error fetching groups by category:', error);
      throw error;
    }
  }

  async createGroup(name: string, studentsNames: string[], categoryId: string): Promise<GroupEntity> {
    try {
      console.log('👥 [GROUP_REMOTE] Creating group with data:', { name, studentsNames, categoryId });
      const headers = await this.getHeaders();
      
      const groupData = {
        tableName: 'Groups',
        records: [{
          Name: name,
          Students: JSON.stringify(studentsNames),
          Category: categoryId,
        }]
      };

      console.log('👥 [GROUP_REMOTE] Request body:', JSON.stringify(groupData, null, 2));

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify(groupData),
      });

      console.log('👥 [GROUP_REMOTE] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        
        // The server might return different structures
        let groupData = data;
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          groupData = data.records[0]; // Take first record if it's an array response
        } else if (data.data) {
          groupData = data.data; // Handle nested data structure
        }
        
        const group = GroupEntity.fromJson(groupData);
        return group;
      } else {
        const errorBody = await response.text();
        throw new Error(`Failed to create group: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(groupId: string, name: string, studentsNames: string[]): Promise<void> {
    try {
      const headers = await this.getHeaders();
      
      const updateData = {
        tableName: 'Groups',
        idColumn: '_id',
        idValue: groupId,
        updates: {
          Name: name,
          Students: JSON.stringify(studentsNames),
        }
      };

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update group: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          tableName: 'Groups',
          id: groupId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete group: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
}