export interface CrudInPort<D, T> {

    handleToRegister(domain: D): Promise<D>;

    handleFindAll(): Promise<D[]>;

    handleFindOne(id: T): Promise<D | null>;

    handleUpdateOne(id: T, domain: D);

    handleRemoveOne(id: T);

}

export const CrudInPort = Symbol('CrudInPort');
