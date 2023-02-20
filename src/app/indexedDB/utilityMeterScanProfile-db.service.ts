import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { IdbAccount, utilityMeterScanProfile, MeterSource, AttributeTypes} from '../models/idb';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AccountdbService } from './account-db.service';

@Injectable({
    providedIn: 'root'
})
export class UtilityMeterScanProfileService {

    utilityMeterScanProfileItems: BehaviorSubject<Array<utilityMeterScanProfile>>; //Getting it from idb.ts
    constructor(private formBuilder: FormBuilder, private dbService: NgxIndexedDBService, private accountDbService: AccountdbService) { 
        this.utilityMeterScanProfileItems = new BehaviorSubject<Array<utilityMeterScanProfile>>([]);
    }

    getAll(): Observable<Array<utilityMeterScanProfile>> { //CRUD > Read
        return this.dbService.getAll('utilityMeterScanProfile');
    }

    addWithObservable(utilityMeterScanProfileItem: utilityMeterScanProfile): utilityMeterScanProfile { //CRUD > Create
        // return this.dbService.add('utilityMeterScanProfile', utilityMeterScanProfileItem);
        //Add more here.
        let source: MeterSource;
        let attribute: AttributeTypes;
        return {
            id: null,
            guid: Math.random().toString(36).substr(2, 9),
            accountId: utilityMeterScanProfileItem.guid,
            source: source,
            attribute: attribute,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
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

    getElectricityMeterProfile(meterData: utilityMeterScanProfile): FormGroup {
        //need to use date string for calander to work in form
        let dateString: string;
        if (meterData.readDate && isNaN(new Date(meterData.readDate).getTime()) == false) {
          let datePipe: DatePipe = new DatePipe(navigator.language);
          let stringFormat: string = 'y-MM-dd'; // YYYY-MM-DD  
          dateString = datePipe.transform(meterData.readDate, stringFormat);
        }
        return this.formBuilder.group({
          readDate: [dateString, Validators.required],
          totalEnergyUse: [meterData.totalEnergyUse, [Validators.required, Validators.min(0)]],
          totalCost: [meterData.totalCost, [Validators.min(0)]],
          deliveryCharge: [meterData.deliveryCharge, [Validators.min(0)]],
          totalRealDemand: [meterData.totalRealDemand, [Validators.min(0)]],
          totalBilledDemand: [meterData.totalBilledDemand, [Validators.min(0)]],
          nonEnergyCharge: [meterData.nonEnergyCharge, [Validators.min(0)]],
          block1Consumption: [meterData.block1Consumption, [Validators.min(0)]],
          block1ConsumptionCharge: [meterData.block1ConsumptionCharge, [Validators.min(0)]],
          block2Consumption: [meterData.block2Consumption, [Validators.min(0)]],
          block2ConsumptionCharge: [meterData.block2ConsumptionCharge, [Validators.min(0)]],
          block3Consumption: [meterData.block3Consumption, [Validators.min(0)]],
          block3ConsumptionCharge: [meterData.block3ConsumptionCharge, [Validators.min(0)]],
          otherConsumption: [meterData.otherConsumption, [Validators.min(0)]],
          otherConsumptionCharge: [meterData.otherConsumptionCharge, [Validators.min(0)]],
          onPeakAmount: [meterData.onPeakAmount, [Validators.min(0)]],
          onPeakCharge: [meterData.onPeakCharge, [Validators.min(0)]],
          offPeakAmount: [meterData.offPeakAmount, [Validators.min(0)]],
          offPeakCharge: [meterData.offPeakCharge, [Validators.min(0)]],
          transmissionAndDeliveryCharge: [meterData.transmissionAndDeliveryCharge, [Validators.min(0)]],
          powerFactor: [meterData.powerFactor, [Validators.min(0)]],
          powerFactorCharge: [meterData.powerFactorCharge, [Validators.min(0)]],
          localSalesTax: [meterData.localSalesTax, [Validators.min(0)]],
          stateSalesTax: [meterData.stateSalesTax, [Validators.min(0)]],
          latePayment: [meterData.latePayment, [Validators.min(0)]],
          otherCharge: [meterData.otherCharge, [Validators.min(0)]]
        })
      }

    updateElectricityMeterProfileForm(meterData: utilityMeterScanProfile, form: FormGroup): utilityMeterScanProfile {
        meterData.id = null,
        meterData.guid = Math.random().toString(36).substr(2, 9),
        meterData.accountId = utilityMeterScanProfileItem.guid,
        
        return meterData;
      }
}