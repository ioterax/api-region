import { ViewOutPort } from "./view.out.ports";

export interface CrudOutPort<D, T> extends ViewOutPort<D, T> {

    save(domain: D): Promise<D>

    updateById(id: T, domain: D): Promise<D | null>

    deleteById(id: T)

}

export const CrudOutPort = Symbol('CrudOutPort');
