import { ActivityEntity } from '../../domain/entities/Activity';
import { ActivityUseCase } from '../../domain/usecases/ActivityUseCase';

export class ActivityController {
  constructor(private activityUseCase: ActivityUseCase) {}

  async getActivities(categoryId: string): Promise<ActivityEntity[]> {
    try {
      console.log('🎯 [ACTIVITY_CONTROLLER] Getting activities for category:', categoryId);
      const activities = await this.activityUseCase.getActivities(categoryId);
      console.log('✅ [ACTIVITY_CONTROLLER] Retrieved activities:', activities);
      return activities;
    } catch (error) {
      console.error('❌ [ACTIVITY_CONTROLLER] Error getting activities:', error);
      throw error;
    }
  }

  async createActivity(name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean = false): Promise<boolean> {
    try {
      console.log('🎯 [ACTIVITY_CONTROLLER] Creating activity:', { name, description, courseId, categoryId, isAssessment });
      const success = await this.activityUseCase.addActivity(name, description, courseId, categoryId, isAssessment);
      console.log('✅ [ACTIVITY_CONTROLLER] Activity creation success:', success);
      return success;
    } catch (error) {
      console.error('❌ [ACTIVITY_CONTROLLER] Error creating activity:', error);
      throw error;
    }
  }

  async updateActivity(activity: ActivityEntity): Promise<void> {
    try {
      console.log('🎯 [ACTIVITY_CONTROLLER] Updating activity:', activity);
      await this.activityUseCase.updateActivity(activity);
      console.log('✅ [ACTIVITY_CONTROLLER] Updated activity');
    } catch (error) {
      console.error('❌ [ACTIVITY_CONTROLLER] Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(activity: ActivityEntity): Promise<void> {
    try {
      console.log('🎯 [ACTIVITY_CONTROLLER] Deleting activity:', activity);
      await this.activityUseCase.deleteActivity(activity);
      console.log('✅ [ACTIVITY_CONTROLLER] Deleted activity');
    } catch (error) {
      console.error('❌ [ACTIVITY_CONTROLLER] Error deleting activity:', error);
      throw error;
    }
  }

  async activateAssessment(activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string): Promise<ActivityEntity> {
    try {
      console.log('🎯 [ACTIVITY_CONTROLLER] Activating assessment for activity:', { activityId, assessName, isPublic, duration, timeUnit });
      const updatedActivity = await this.activityUseCase.activateAssessment(activityId, assessName, isPublic, duration, timeUnit);
      console.log('✅ [ACTIVITY_CONTROLLER] Activated assessment:', updatedActivity);
      return updatedActivity;
    } catch (error) {
      console.error('❌ [ACTIVITY_CONTROLLER] Error activating assessment:', error);
      throw error;
    }
  }
}