import { IActivityDataSource } from '../../data/datasources/IActivityDataSource';
import { ActivityEntity } from '../entities/Activity';

export class UpdateActivityUseCase {
  constructor(private activityDataSource: IActivityDataSource) {}

  async execute(activity: ActivityEntity): Promise<void> {
    if (!activity.id) {
      throw new Error('Activity ID is required for update');
    }
    return await this.activityDataSource.updateActivity(
      activity.id,
      activity.name,
      activity.description || ''
    );
  }
}