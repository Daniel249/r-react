import { ActivityEntity } from '../entities/Activity';
import { IActivityRepository } from '../repositories/IActivityRepository';

export class GetActivitiesUseCase {
  constructor(private activityRepository: IActivityRepository) {}

  async execute(courseId: string): Promise<ActivityEntity[]> {
    return this.activityRepository.getActivities(courseId);
  }
}