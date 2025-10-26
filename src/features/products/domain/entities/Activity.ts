export interface Activity {
  id?: string;
  name: string;
  description: string;
  course: string;
  category: string;
  assessment: boolean;
  results: { [evaluatorName: string]: { [evaluatedStudentName: string]: number[] } };
  studentAverages?: { [studentName: string]: number };
  assessName?: string;
  isPublic?: boolean;
  time?: Date;
  already?: string[];
}

export class ActivityEntity implements Activity {
  constructor(
    public name: string,
    public description: string,
    public course: string,
    public category: string,
    public assessment: boolean,
    public results: { [evaluatorName: string]: { [evaluatedStudentName: string]: number[] } },
    public id?: string,
    public studentAverages?: { [studentName: string]: number },
    public assessName?: string,
    public isPublic?: boolean,
    public time?: Date,
    public already?: string[]
  ) {}

  static fromJson(json: any): ActivityEntity {
    return new ActivityEntity(
      json.name?.toString() ?? '',
      json.description?.toString() ?? '',
      json.course?.toString() ?? '',
      json.category?.toString() ?? '',
      json.assessment ?? false,
      json.results ?? {},
      json.id?.toString() ?? json._id?.toString(),
      json.studentAverages,
      json.assessName?.toString(),
      json.isPublic,
      json.time ? new Date(json.time) : undefined,
      json.already
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
      course: this.course,
      category: this.category,
      assessment: this.assessment,
      results: this.results,
      studentAverages: this.studentAverages,
      assessName: this.assessName,
      isPublic: this.isPublic,
      time: this.time?.toISOString(),
      already: this.already,
    };
  }
}