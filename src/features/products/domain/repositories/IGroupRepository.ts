import { GroupEntity } from '../../domain/entities/Group';

export interface IGroupRepository {
  getGroups(courseId?: string): Promise<GroupEntity[]>;
  getGroupsByCategory(categoryId: string): Promise<GroupEntity[]>;
  createGroup(name: string, studentsNames: string[], categoryId: string): Promise<GroupEntity>;
  updateGroup(groupId: string, name: string, studentsNames: string[]): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
}