import { IActivityRepository } from '../repositories/IActivityRepository';

export class UpdateAssessmentResultsUseCase {
  constructor(private activityRepository: IActivityRepository) {}

  async execute(activityId: string, notas: any): Promise<void> {
    console.log('🎯 [UPDATE_ASSESSMENT_UC] Executing updateAssessmentResults use case');
    console.log('🎯 [UPDATE_ASSESSMENT_UC] Activity ID:', activityId);
    console.log('🎯 [UPDATE_ASSESSMENT_UC] Notas:', notas);
    
    return this.activityRepository.updateAssessmentResults(activityId, notas);
  }
}