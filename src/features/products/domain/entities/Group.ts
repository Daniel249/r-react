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
    return new GroupEntity(
      json.id?.toString() ?? json._id?.toString() ?? '',
      json.name?.toString() ?? '',
      json.studentsNames ?? [],
      json.categoryId?.toString()
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