import { ActivityEntity } from '../../domain/entities/Activity';

export interface IActivityDataSource {
  getActivities(courseId: string): Promise<ActivityEntity[]>;
  createActivity(name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean): Promise<boolean>;
  updateActivity(activityId: string, name: string, description: string): Promise<void>;
  deleteActivity(activity: ActivityEntity): Promise<void>;
  activateAssessment(activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string): Promise<void>;
  updateAssessmentResults(activityId: string, notas: any): Promise<void>;
}