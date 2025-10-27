import { ActivityEntity } from '../entities/Activity';
import { IActivityRepository } from '../repositories/IActivityRepository';

export class ActivityUseCase {
  constructor(private repository: IActivityRepository) {}

  async getActivities(courseId: string): Promise<ActivityEntity[]> {
    return await this.repository.getActivities(courseId);
  }

  async addActivity(name: string, description: string, courseId: string, categoryId: string, isAssessment: boolean): Promise<boolean> {
    console.log('🎯 [ACTIVITY_USECASE] Creating activity:', { name, description, courseId, categoryId, isAssessment });
    const result = await this.repository.createActivity(name, description, courseId, categoryId, isAssessment);
    console.log('✅ [ACTIVITY_USECASE] Activity creation result:', result);
    return result;
  }

  async updateActivity(activity: ActivityEntity): Promise<void> {
    if (!activity.id) {
      throw new Error('Activity ID is required for update');
    }
    return await this.repository.updateActivity(activity.id, activity.name, activity.description || '');
  }

  async deleteActivity(activity: ActivityEntity): Promise<void> {
    return await this.repository.deleteActivity(activity);
  }

  async activateAssessment(activityId: string, assessName: string, isPublic: boolean, duration: number, timeUnit: string): Promise<ActivityEntity> {
    console.log('🎯 [ACTIVITY_USECASE] Activating assessment:', { activityId, assessName, isPublic, duration, timeUnit });
    
    // Update through repository first
    await this.repository.activateAssessment(activityId, assessName, isPublic, duration, timeUnit);
    console.log('✅ [ACTIVITY_USECASE] Assessment activated via repository');
    
    // Calculate time with timezone for the response
    const now = new Date();
    const durationInMs = timeUnit === 'hours' ? duration * 60 * 60 * 1000 : duration * 60 * 1000;
    const assessmentTime = new Date(now.getTime() + durationInMs);
    
    // Since we can't reliably fetch the updated activity without a courseId,
    // we'll create a minimal ActivityEntity with the updated assessment info
    // The context will handle updating the full entity from its existing state
    const updatedActivity = new ActivityEntity(
      '', // name - will be filled by context from existing activity
      '', // description - will be filled by context
      '', // course - will be filled by context
      '', // category - will be filled by context
      true, // assessment = true (this is the main change)
      {}, // Initialize empty Notas map
      activityId, // Ensure ID is set
      {}, // studentAverages - will be filled by context
      assessName, // Set assessName
      isPublic,
      assessmentTime, // Set time with timezone
      [] // already - will be filled by context
    );
    
    console.log('✅ [ACTIVITY_USECASE] Returning updated activity entity:', updatedActivity);
    return updatedActivity;
  }
}