import { Activity } from './Activity';
import { Category } from './Category';

export interface Course {
  id: string;
  name: string;
  description: string;
  studentsNames: string[];
  teacher: string;
  activities?: Activity[];
  categories?: Category[];
}

export class CourseEntity implements Course {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public studentsNames: string[],
    public teacher: string,
    public activities?: Activity[],
    public categories?: Category[]
  ) {}

  static fromJson(json: any): CourseEntity {
    return new CourseEntity(
      json._id?.toString() ?? json.id?.toString() ?? '',
      json.Name?.toString() ?? json.name?.toString() ?? '',
      json.Description?.toString() ?? json.description?.toString() ?? '',
      CourseEntity.parseStudentNames(json),
      json.Teacher?.toString() ?? json.teacher?.toString() ?? '',
      json.activities,
      json.categories
    );
  }

  private static parseStudentNames(json: any): string[] {
    let students = json.Students ?? json.students ?? [];
    
    // If students is a string, it might be JSON that needs to be parsed
    if (typeof students === 'string') {
      try {
        students = JSON.parse(students);
      } catch (error) {
        console.warn('Failed to parse students JSON:', students);
        return [];
      }
    }
    
    if (Array.isArray(students)) {
      return students.map(student => student.toString());
    }
    return [];
  }

  toJson(): any {
    return {
      _id: this.id,
      Name: this.name,
      Description: this.description,
      Students: JSON.stringify(this.studentsNames),
      Teacher: this.teacher,
    };
  }
}