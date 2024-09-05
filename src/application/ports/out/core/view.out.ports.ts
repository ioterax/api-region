export interface ViewOutPort<D, T> {

    findAll(project?: D | {}): Promise<D[]>

    findById(id: T, queryFields?: D | {}, project? : D | {}): Promise<D | null>

}

export const ViewOutPort = Symbol('ViewOutPort');
