import { ViewUseCase } from "./view.usecase";

export interface CrudUseCase<D, T> extends ViewUseCase<D, T> {

    registerNew(domain: D): Promise<D>;
  
    updateOne(id: T, domain: D): Promise<D | null>;
    
    removeOne(id: T);
  
  }
  
  export const CrudUseCase = Symbol('CrudUseCase');
