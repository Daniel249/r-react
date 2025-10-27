export interface Activity {
  id?: string;
  name: string;
  description: string;
  course: string;
  category: string;
  assessment: boolean;
  notas: { [evaluatorName: string]: { [evaluatedStudentName: string]: string } }; // JSON stringified number arrays
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
    public notas: { [evaluatorName: string]: { [evaluatedStudentName: string]: string } }, // JSON stringified number arrays
    public id?: string,
    public studentAverages?: { [studentName: string]: number },
    public assessName?: string,
    public isPublic?: boolean,
    public time?: Date,
    public already?: string[]
  ) {}

  static fromJson(json: any): ActivityEntity {
    // Parse notas - handle both string and object formats
    let parsedNotas = {};
    const rawNotas = json.notas ?? json.Notas ?? json.results ?? json.Results;
    if (rawNotas) {
      if (typeof rawNotas === 'string') {
        try {
          parsedNotas = JSON.parse(rawNotas);
        } catch (error) {
          console.warn('Failed to parse notas JSON:', error);
          parsedNotas = {};
        }
      } else {
        parsedNotas = rawNotas;
      }
    }

    return new ActivityEntity(
      json.name?.toString() ?? json.Name?.toString() ?? json.Nombre?.toString() ?? '',
      json.description?.toString() ?? json.Description?.toString() ?? '',
      json.course?.toString() ?? json.CourseID?.toString() ?? '',
      json.category?.toString() ?? json.CategoryID?.toString() ?? json.CatID?.toString() ?? '',
      json.assessment ?? json.Assessment ?? json.Asessment ?? false, // Check Assessment (correct) and Asessment (legacy) as fallback
      parsedNotas,
      json.id?.toString() ?? json._id?.toString(),
      json.studentAverages ?? json.StudentAverages,
      json.assessName?.toString() ?? json.AssessName?.toString(),
      json.isPublic ?? json.IsPublic,
      json.time ? new Date(json.time) : json.Time ? new Date(json.Time) : undefined,
      json.already ?? json.Already
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      Nombre: this.name,
      Description: this.description,
      CourseID: this.course,
      CatID: this.category,
      Assessment: this.assessment, // Use correct database column name
      Notas: this.notas,
      StudentAverages: this.studentAverages,
      AssessName: this.assessName,
      IsPublic: this.isPublic,
      Time: this.time?.toISOString(),
      Already: this.already,
    };
  }
}