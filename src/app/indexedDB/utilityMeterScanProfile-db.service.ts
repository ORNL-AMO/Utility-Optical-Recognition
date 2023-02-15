import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { IdbAccount,  utilityMeterScanProfile} from '../models/idb';
import { AccountdbService } from './account-db.service';

@Injectable({
    providedIn: 'root'
})
export class UtilityMeterScanProfileService {

    utilityMeterScanProfileItems: BehaviorSubject<Array<utilityMeterScanProfile>>; //Getting it from idb.ts
    constructor(private dbService: NgxIndexedDBService, private accountDbService: AccountdbService) { 
        this.utilityMeterScanProfileItems = new BehaviorSubject<Array<utilityMeterScanProfile>>([]);
    }

    getAll(): Observable<Array<utilityMeterScanProfile>> { //CRUD > Read
        return this.dbService.getAll('utilityMeterScanProfile');
    }

    addWithObservable(utilityMeterScanProfileItem: utilityMeterScanProfile): utilityMeterScanProfile { //CRUD > Create
        // return this.dbService.add('utilityMeterScanProfile', utilityMeterScanProfileItem);
        //Add more here.
        return {
            id?: selectAccount.guid,
            guid: Math.random().toString(36).substr(2, 9),
            accountId: "",
            source: new MeterSource,
            attribute: AttributeTypes,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
        }
    }
    
    deleteWithObservable(guid: string, ): Observable<any> { //CRUD > Delete
        return this.dbService.delete('utilityMeterScanProfile', guid);
    }
    
    updateWithObservable(values: utilityMeterScanProfile): Observable<utilityMeterScanProfile> { //CRUD > Update
        return this.dbService.update('utilityMeterScanProfile', values);
    }

    // getNewAccountEmissionsItem(selectedAccount: IdbAccount): IdbCustomEmissionsItem {
    //     // let selectedAccount: IdbAccount = this.accountDbService.selectedAccount.getValue();
    //     return {
    //         accountId: selectedAccount.guid,
    //         id: Math.random().toString(36).substr(2, 9),
    //         date: new Date(),
    //         subregion: 'New Custom Subregion',
    //         locationEmissionRates: [],
    //         residualEmissionRates: []
    //     }
    // }
}