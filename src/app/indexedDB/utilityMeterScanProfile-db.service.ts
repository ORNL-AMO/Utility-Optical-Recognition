import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { IdbAccount, utilityMeterScanProfile, MeterSource, Type, ElectricityAttributeTypes} from '../models/idb';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AccountdbService } from './account-db.service';
import { UtilityMeterDataService } from '../facility/utility-data/energy-consumption/utility-meter-data/utility-meter-data.service';

@Injectable({
    providedIn: 'root'
})
export class UtilityMeterScanProfileService {

    utilityMeterScanProfileItems: BehaviorSubject<Array<utilityMeterScanProfile>>; //Getting it from idb.ts
    constructor(private formBuilder: FormBuilder, private dbService: NgxIndexedDBService, private accountDbService: AccountdbService, private type: UtilityMeterDataService) { 
        this.utilityMeterScanProfileItems = new BehaviorSubject<Array<utilityMeterScanProfile>>([]);
    }

    getAll(): Observable<Array<utilityMeterScanProfile>> { //CRUD > Read
        return this.dbService.getAll('utilityMeterScanProfile');
    }

    addWithObservable(utilityMeterScanProfileItem: utilityMeterScanProfile): utilityMeterScanProfile { //CRUD > Create
        // return this.dbService.add('utilityMeterScanProfile', utilityMeterScanProfileItem);
        //Add more here.
        let source: MeterSource;
        let attribute: Type;
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

    updateElectricityMeterProfileForm(meterData: utilityMeterScanProfile, form: FormGroup, attribute: ElectricityAttributeTypes, source: MeterSource): utilityMeterScanProfile {
        meterData.id = form.controls.meterId.value;
        meterData.guid = form.controls.guid.value;
        meterData.accountId = form.controls.accountId.value;
        meterData.source = form.controls.source.value;
        meterData.attribute = form.controls.ElectricityAttributeTypes.value; 
        meterData.x1 = form.controls.x1.value;
        meterData.x2 = form.controls.x2.value;
        meterData.y1 = form.controls.y1.value;
        meterData.y2 = form.controls.y2.value;
        return meterData;
    }

    getGeneralMeterDataForm(meterData: utilityMeterScanProfile, displayVolumeInput: boolean, displayEnergyInput: boolean): FormGroup {
        //need to use date string for calander to work in form
        
        let dateString: string;
        if (meterData.readDate && isNaN(new Date(meterData.readDate).getTime()) == false) {
          let datePipe: DatePipe = new DatePipe(navigator.language);
          let stringFormat: string = 'y-MM-dd'; // YYYY-MM-DD  
          dateString = datePipe.transform(meterData.readDate, stringFormat);
        }
        let totalVolumeValidators: Array<ValidatorFn> = [];
        if (displayVolumeInput) {
          totalVolumeValidators = [Validators.required, Validators.min(0)]
        }
        let totalEnergyUseValidators: Array<ValidatorFn> = [];
        if (displayEnergyInput) {
          totalEnergyUseValidators = [Validators.required, Validators.min(0)];
        }
        return this.formBuilder.group({
          readDate: [dateString, Validators.required],
          totalVolume: [meterData.totalVolume, totalVolumeValidators],
          totalEnergyUse: [meterData.totalEnergyUse, totalEnergyUseValidators],
          totalCost: [meterData.totalCost],
          commodityCharge: [meterData.commodityCharge],
          deliveryCharge: [meterData.deliveryCharge],
          otherCharge: [meterData.otherCharge],
        });
        
    }

    updateGeneralMeterDataFromForm(meterData: utilityMeterScanProfile, form: FormGroup): utilityMeterScanProfile {
        //UTC date is one day behind from form
        meterData.id = null;
        meterData.guid = Math.random().toString(36).substr(2, 9);
        meterData.accountId = meterData.guid;
        
        return meterData;
        /*
        let formDate: Date = new Date(form.controls.readDate.value)
        meterData.readDate = new Date(formDate.getUTCFullYear(), formDate.getUTCMonth(), formDate.getUTCDate());
        meterData.totalVolume = form.controls.totalVolume.value;
        meterData.totalEnergyUse = form.controls.totalEnergyUse.value;
        meterData.totalCost = form.controls.totalCost.value;
        meterData.commodityCharge = form.controls.commodityCharge.value;
        meterData.deliveryCharge = form.controls.deliveryCharge.value;
        meterData.otherCharge = form.controls.otherCharge.value;
        return meterData;
        */
    }
}