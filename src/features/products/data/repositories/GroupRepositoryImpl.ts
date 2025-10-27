import { GroupEntity } from '../../domain/entities/Group';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { IGroupDataSource } from '../datasources/IGroupDataSource';

export class GroupRepositoryImpl implements IGroupRepository {
  constructor(private remoteDataSource: IGroupDataSource) {}

  async getGroups(courseId?: string): Promise<GroupEntity[]> {
    return await this.remoteDataSource.getGroups(courseId);
  }

  async getGroupsByCategory(categoryId: string): Promise<GroupEntity[]> {
    return await this.remoteDataSource.getGroupsByCategory(categoryId);
  }

  async createGroup(name: string, studentsNames: string[], categoryId: string): Promise<GroupEntity> {
    return await this.remoteDataSource.createGroup(name, studentsNames, categoryId);
  }

  async updateGroup(groupId: string, name: string, studentsNames: string[]): Promise<void> {
    return await this.remoteDataSource.updateGroup(groupId, name, studentsNames);
  }

  async deleteGroup(groupId: string): Promise<void> {
    return await this.remoteDataSource.deleteGroup(groupId);
  }
}