import { ActivityEntity } from '../../domain/entities/Activity';
import { IActivityRepository } from '../../domain/repositories/IActivityRepository';
import { IActivityDataSource } from '../datasources/IActivityDataSource';

export class ActivityRepositoryImpl implements IActivityRepository {
  constructor(private activityDataSource: IActivityDataSource) {}

  async getActivities(courseId: string): Promise<ActivityEntity[]> {
    return this.activityDataSource.getActivities(courseId);
  }

  async createActivity(name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean): Promise<boolean> {
    return this.activityDataSource.createActivity(name, description, courseId, categoryId, isAssessment);
  }

  async updateActivity(activityId: string, name: string, description: string): Promise<void> {
    return this.activityDataSource.updateActivity(activityId, name, description);
  }

  async deleteActivity(activity: ActivityEntity): Promise<void> {
    return this.activityDataSource.deleteActivity(activity);
  }

  async activateAssessment(activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string): Promise<void> {
    return this.activityDataSource.activateAssessment(activityId, assessName, isPublic, duration, timeUnit);
  }

  async updateAssessmentResults(activityId: string, notas: any): Promise<void> {
    return this.activityDataSource.updateAssessmentResults(activityId, notas);
  }
}