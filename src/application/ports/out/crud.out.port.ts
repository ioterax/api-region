export interface CrudOutPort<D, T> {

    save(domain: D): Promise<D>

    findAll(): Promise<D[]>

    findById(id: T): Promise<D | null>

    updateById(id: T, domain: D): Promise<D | null>

    deleteById(id: T)

}

export const CrudOutPort = Symbol('CrudOutPort');
