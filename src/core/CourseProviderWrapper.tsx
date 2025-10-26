import React from 'react';
import { useDI } from '../core/di/DIProvider';
import { TOKENS } from '../core/di/tokens';
import { CreateCourseUseCase } from '../features/products/domain/usecases/CreateCourseUseCase';
import { DeleteCourseUseCase } from '../features/products/domain/usecases/DeleteCourseUseCase';
import { GetCoursesUseCase } from '../features/products/domain/usecases/GetCoursesUseCase';
import { JoinCourseUseCase } from '../features/products/domain/usecases/JoinCourseUseCase';
import { UpdateCourseUseCase } from '../features/products/domain/usecases/UpdateCourseUseCase';
import { CourseProvider } from '../features/products/presentation/context/courseContext';

export function CourseProviderWrapper({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const getCoursesUseCase = di.resolve<GetCoursesUseCase>(TOKENS.GetCoursesUC);
  const createCourseUseCase = di.resolve<CreateCourseUseCase>(TOKENS.CreateCourseUC);
  const updateCourseUseCase = di.resolve<UpdateCourseUseCase>(TOKENS.UpdateCourseUC);
  const deleteCourseUseCase = di.resolve<DeleteCourseUseCase>(TOKENS.DeleteCourseUC);
  const joinCourseUseCase = di.resolve<JoinCourseUseCase>(TOKENS.JoinCourseUC);

  return (
    <CourseProvider
      getCoursesUseCase={getCoursesUseCase}
      createCourseUseCase={createCourseUseCase}
      updateCourseUseCase={updateCourseUseCase}
      deleteCourseUseCase={deleteCourseUseCase}
      joinCourseUseCase={joinCourseUseCase}
    >
      {children}
    </CourseProvider>
  );
}