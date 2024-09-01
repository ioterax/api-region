export interface CrudUseCase<D, T > {

    registerNew(domain: D): Promise<D>;
  
    retrieveAll(): Promise<D[]>;
  
    retrieveOne(id: T): Promise<D | null>;
  
    updateOne(id: T, domain: D): Promise<D | null>;
    
    removeOne(id: T);
  
  }
  
  export const CrudUseCase = Symbol('CrudUseCase');
