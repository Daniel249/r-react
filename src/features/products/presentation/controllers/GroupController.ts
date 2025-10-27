import { GroupEntity } from '../../domain/entities/Group';
import { GroupUseCase } from '../../domain/usecases/GroupUseCase';

export class GroupController {
  constructor(private groupUseCase: GroupUseCase) {}

  async getGroups(courseId?: string): Promise<GroupEntity[]> {
    try {
      console.log('👥 [GROUP_CONTROLLER] Getting groups for course:', courseId);
      const groups = await this.groupUseCase.getGroups(courseId);
      console.log('✅ [GROUP_CONTROLLER] Retrieved groups:', groups);
      return groups;
    } catch (error) {
      console.error('❌ [GROUP_CONTROLLER] Error getting groups:', error);
      throw error;
    }
  }

  async getGroupsByCategory(categoryId: string): Promise<GroupEntity[]> {
    try {
      console.log('👥 [GROUP_CONTROLLER] Getting groups for category:', categoryId);
      const groups = await this.groupUseCase.getGroupsByCategory(categoryId);
      console.log('✅ [GROUP_CONTROLLER] Retrieved groups by category:', groups);
      return groups;
    } catch (error) {
      console.error('❌ [GROUP_CONTROLLER] Error getting groups by category:', error);
      throw error;
    }
  }

  async createGroup(name: string, studentsNames: string[], categoryId: string): Promise<GroupEntity> {
    try {
      console.log('👥 [GROUP_CONTROLLER] Creating group:', { name, studentsNames, categoryId });
      const group = await this.groupUseCase.addGroup(name, studentsNames, categoryId);
      console.log('✅ [GROUP_CONTROLLER] Created group:', group);
      return group;
    } catch (error) {
      console.error('❌ [GROUP_CONTROLLER] Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(group: GroupEntity): Promise<void> {
    try {
      console.log('👥 [GROUP_CONTROLLER] Updating group:', group);
      await this.groupUseCase.updateGroup(group);
      console.log('✅ [GROUP_CONTROLLER] Updated group');
    } catch (error) {
      console.error('❌ [GROUP_CONTROLLER] Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      console.log('👥 [GROUP_CONTROLLER] Deleting group:', groupId);
      await this.groupUseCase.deleteGroup(groupId);
      console.log('✅ [GROUP_CONTROLLER] Deleted group');
    } catch (error) {
      console.error('❌ [GROUP_CONTROLLER] Error deleting group:', error);
      throw error;
    }
  }
}