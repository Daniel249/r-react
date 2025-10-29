import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";
import { ActivityRemoteDataSourceImpl } from "@/src/features/products/data/datasources/ActivityRemoteDataSourceImpl";
import { CategoryRemoteDataSourceImpl } from "@/src/features/products/data/datasources/CategoryRemoteDataSourceImpl";
import { CourseRemoteDataSourceImpl } from "@/src/features/products/data/datasources/CourseRemoteDataSourceImpl";
import { GroupRemoteDataSourceImpl } from "@/src/features/products/data/datasources/GroupRemoteDataSourceImpl";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ActivityRepositoryImpl } from "@/src/features/products/data/repositories/ActivityRepositoryImpl";
import { CategoryRepositoryImpl } from "@/src/features/products/data/repositories/CategoryRepositoryImpl";
import { CourseRepositoryImpl } from "@/src/features/products/data/repositories/CourseRepositoryImpl";
import { GroupRepositoryImpl } from "@/src/features/products/data/repositories/GroupRepositoryImpl";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { ActivityUseCase } from "@/src/features/products/domain/usecases/ActivityUseCase";
import { AddProductUseCase } from "@/src/features/products/domain/usecases/AddProductUseCase";
import { CategoryUseCase } from "@/src/features/products/domain/usecases/CategoryUseCase";
import { CourseUseCase } from "@/src/features/products/domain/usecases/CourseUseCase";
import { DeleteProductUseCase } from "@/src/features/products/domain/usecases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "@/src/features/products/domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "@/src/features/products/domain/usecases/GetProductsUseCase";
import { GroupUseCase } from "@/src/features/products/domain/usecases/GroupUseCase";
import { UpdateAssessmentResultsUseCase } from "@/src/features/products/domain/usecases/UpdateAssessmentResultsUseCase";
import { UpdateProductUseCase } from "@/src/features/products/domain/usecases/UpdateProductUseCase";
import { Container } from "./container";

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();

        const authDS = new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);

        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo)
            .register(TOKENS.LoginUC, new LoginUseCase(authRepo))
            .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
            .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
            .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));


        const remoteDS = new ProductRemoteDataSourceImp(authDS);
        const productRepo = new ProductRepositoryImpl(remoteDS);

        c.register(TOKENS.ProductRemoteDS, remoteDS)
            .register(TOKENS.ProductRepo, productRepo).register(TOKENS.AddProductUC, new AddProductUseCase(productRepo))
            .register(TOKENS.UpdateProductUC, new UpdateProductUseCase(productRepo))
            .register(TOKENS.DeleteProductUC, new DeleteProductUseCase(productRepo))
            .register(TOKENS.GetProductsUC, new GetProductsUseCase(productRepo))
            .register(TOKENS.GetProductByIdUC, new GetProductByIdUseCase(productRepo));

        // Course dependencies
        const courseDS = new CourseRemoteDataSourceImpl();
        const courseRepo = new CourseRepositoryImpl(courseDS);

        c.register(TOKENS.CourseRemoteDS, courseDS)
            .register(TOKENS.CourseRepo, courseRepo)
            .register(TOKENS.CourseUC, new CourseUseCase(courseRepo));

        // Category dependencies
        const categoryDS = new CategoryRemoteDataSourceImpl();
        const categoryRepo = new CategoryRepositoryImpl(categoryDS);

        c.register(TOKENS.CategoryRemoteDS, categoryDS)
            .register(TOKENS.CategoryRepo, categoryRepo)
            .register(TOKENS.CategoryUC, new CategoryUseCase(categoryRepo));

        // Activity dependencies
        const activityDS = new ActivityRemoteDataSourceImpl();
        const activityRepo = new ActivityRepositoryImpl(activityDS);

        c.register(TOKENS.ActivityRemoteDS, activityDS)
            .register(TOKENS.ActivityRepo, activityRepo)
            .register(TOKENS.ActivityUC, new ActivityUseCase(activityRepo))
            .register(TOKENS.UpdateAssessmentResultsUC, new UpdateAssessmentResultsUseCase(activityRepo));

        // Group dependencies
        const groupDS = new GroupRemoteDataSourceImpl();
        const groupRepo = new GroupRepositoryImpl(groupDS);

        c.register(TOKENS.GroupRemoteDS, groupDS)
            .register(TOKENS.GroupRepo, groupRepo)
            .register(TOKENS.GroupUC, new GroupUseCase(groupRepo));

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
