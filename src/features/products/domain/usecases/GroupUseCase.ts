import { GroupEntity } from '../entities/Group';
import { IGroupRepository } from '../repositories/IGroupRepository';

export class GroupUseCase {
  constructor(private repository: IGroupRepository) {}

  async getGroups(courseId?: string): Promise<GroupEntity[]> {
    return await this.repository.getGroups(courseId);
  }

  async getGroupsByCategory(categoryId: string): Promise<GroupEntity[]> {
    return await this.repository.getGroupsByCategory(categoryId);
  }

  async addGroup(name: string, studentsNames: string[], categoryId: string): Promise<GroupEntity> {
    return await this.repository.createGroup(name, studentsNames, categoryId);
  }

  async updateGroup(group: GroupEntity): Promise<void> {
    if (!group.id) {
      throw new Error('Group ID is required for update');
    }
    return await this.repository.updateGroup(group.id, group.name, group.studentsNames);
  }

  async deleteGroup(groupId: string): Promise<void> {
    return await this.repository.deleteGroup(groupId);
  }
}