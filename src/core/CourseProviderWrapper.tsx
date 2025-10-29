import React from 'react';
import { useDI } from '../core/di/DIProvider';
import { TOKENS } from '../core/di/tokens';
import { CourseUseCase } from '../features/products/domain/usecases/CourseUseCase';
import { CourseProvider } from '../features/products/presentation/context/courseContext';

export function CourseProviderWrapper({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const courseUseCase = di.resolve<CourseUseCase>(TOKENS.CourseUC);

  return (
    <CourseProvider
      courseUseCase={courseUseCase}
    >
      {children}
    </CourseProvider>
  );
}