export interface Group {
  id: string;
  name: string;
  studentsNames: string[];
  categoryId?: string;
}

export class GroupEntity implements Group {
  constructor(
    public id: string,
    public name: string,
    public studentsNames: string[],
    public categoryId?: string
  ) {}

  static fromJson(json: any): GroupEntity {
    // Handle StudentsNames which might be a JSON string or already an array
    let studentsNames: string[] = [];
    if (json.studentsNames) {
      studentsNames = Array.isArray(json.studentsNames) ? json.studentsNames : [];
    } else if (json.StudentsNames) {
      try {
        studentsNames = typeof json.StudentsNames === 'string' 
          ? JSON.parse(json.StudentsNames) 
          : (Array.isArray(json.StudentsNames) ? json.StudentsNames : []);
      } catch (e) {
        console.warn('Failed to parse StudentsNames:', json.StudentsNames);
        studentsNames = [];
      }
    } else if (json.Students) {
      studentsNames = Array.isArray(json.Students) ? json.Students : [];
    } else if (json.students) {
      studentsNames = Array.isArray(json.students) ? json.students : [];
    }

    return new GroupEntity(
      json.id?.toString() ?? json._id?.toString() ?? '',
      json.name?.toString() ?? json.Name?.toString() ?? '',
      studentsNames,
      json.categoryId?.toString() ?? json.CategoryID?.toString() ?? json.Category ?? json.category?.toString()
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      studentsNames: this.studentsNames,
      categoryId: this.categoryId,
    };
  }
}