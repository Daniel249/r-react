import { IGroupDataSource } from '../../data/datasources/IGroupDataSource';
import { GroupEntity } from '../entities/Group';

export class GetGroupsUseCase {
  constructor(private groupDataSource: IGroupDataSource) {}

  async execute(courseId?: string): Promise<GroupEntity[]> {
    return await this.groupDataSource.getGroups(courseId);
  }

  async executeByCategory(categoryId: string): Promise<GroupEntity[]> {
    return await this.groupDataSource.getGroupsByCategory(categoryId);
  }
}