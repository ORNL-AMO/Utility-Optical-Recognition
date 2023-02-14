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

    
}