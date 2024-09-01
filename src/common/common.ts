import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment'
import * as entityType from '@atisiothings/laniakea-lib-core/dist/entity.type';

export function setTrace<T extends entityType.IIdentifier<any> & entityType.ITrackable>(o: T, isNew: boolean = false) {
    const now = moment();
    if(isNew) o.createdOn = now.toDate();
    o.changedOn = now.toDate();
    o.signature = uuidv4();
    return o;
}


