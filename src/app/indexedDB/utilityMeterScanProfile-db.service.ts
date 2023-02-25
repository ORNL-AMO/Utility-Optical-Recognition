import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { utilityMeterScanProfile, MeterSource, ElectricityAttributeTypes, GeneralAttributeTypes} from '../models/idb';
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

    /*These are our basic observable CRUD functions for both Utility Profiles.
    We may update for more usage at a later time.*/
    getAll(): Observable<Array<utilityMeterScanProfile>> {
        return this.dbService.getAll('utilityMeterScanProfile');
    }

    addWithObservable(utilityProfile: utilityMeterScanProfile): Observable<utilityMeterScanProfile> {
        return this.dbService.add('utilityMeterScanProfile', utilityProfile);
    }
    
    deleteWithObservable(guid: string, ): Observable<any> {
        return this.dbService.delete('utilityMeterScanProfile', guid);
    }
    
    updateWithObservable(values: utilityMeterScanProfile): Observable<utilityMeterScanProfile> {
        return this.dbService.update('utilityMeterScanProfile', values);
    }

    /*This is the CREATE of the CRUD functions both profiles. If the source is Electricity then return
    electricity attributes else it will return general attributes.*/
    getnewUtilityMeterProfile(utilityMeterScanProfileItem: utilityMeterScanProfile): utilityMeterScanProfile{
        let eSource: 'Electricity';
        let gSource: MeterSource;
        let eAttributes: ElectricityAttributeTypes;
        let gAttributes: GeneralAttributeTypes;
        if(eSource){
            return {
                //id: undefined,
                guid: Math.random().toString(36).substr(2, 9),
                accountId: utilityMeterScanProfileItem.accountId,
                source: eSource,
                attribute: eAttributes,
                x1: undefined,
                y1: undefined,
                x2: undefined,
                y2: undefined
            }
        }
        return{
                //id: undefined,
                guid: Math.random().toString(36).substr(2, 9),
                accountId: utilityMeterScanProfileItem.accountId,
                source: gSource,
                attribute: gAttributes,
                x1: undefined,
                y1: undefined,
                x2: undefined,
                y2: undefined
        }
    }

    /*This is the DELETE of the CRUD function for both utility profiles. We will delete the
    whole form by the foreign key (guid)*/
    async deleteUtilityMeterProfileForm(meterData: Array<utilityMeterScanProfile>){
        for(let i = 0; i < meterData.length; i++){
            await this.deleteWithObservable(meterData[i].guid).toPromise();
        }
    }

    //This is the READ of the CRUD Fucntion for Electricity.
    getElectricityMeterProfile(meterData: utilityMeterScanProfile): FormGroup {
        return this.formBuilder.group({
            id: [meterData.id, [Validators.min(0)]],
            guid: [meterData.guid, [Validators.min(0)]],
            accountId: [meterData.accountId, [Validators.min(0)]],
            source: [meterData.source],
            attribute: [meterData.attribute],
            x1: [meterData.x1, [Validators.min(0)]],
            x2: [meterData.x2, [Validators.min(0)]],
            y1: [meterData.y1, [Validators.min(0)]],
            y2: [meterData.y2, [Validators.min(0)]]
        })
    }

    //This is the UPDATE of the CRUD Function for Electricity.
    updateElectricityMeterProfileForm(meterData: utilityMeterScanProfile, form: FormGroup): utilityMeterScanProfile {
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

    // getGeneralMeterDataForm(meterData: utilityMeterScanProfile, displayVolumeInput: boolean, displayEnergyInput: boolean): FormGroup {
    //     //need to use date string for calander to work in form
        
    //     let dateString: string;
    //     if (meterData.readDate && isNaN(new Date(meterData.readDate).getTime()) == false) {
    //       let datePipe: DatePipe = new DatePipe(navigator.language);
    //       let stringFormat: string = 'y-MM-dd'; // YYYY-MM-DD  
    //       dateString = datePipe.transform(meterData.readDate, stringFormat);
    //     }
    //     let totalVolumeValidators: Array<ValidatorFn> = [];
    //     if (displayVolumeInput) {
    //       totalVolumeValidators = [Validators.required, Validators.min(0)]
    //     }
    //     let totalEnergyUseValidators: Array<ValidatorFn> = [];
    //     if (displayEnergyInput) {
    //       totalEnergyUseValidators = [Validators.required, Validators.min(0)];
    //     }
    //     return this.formBuilder.group({
    //       readDate: [dateString, Validators.required],
    //       totalVolume: [meterData.totalVolume, totalVolumeValidators],
    //       totalEnergyUse: [meterData.totalEnergyUse, totalEnergyUseValidators],
    //       totalCost: [meterData.totalCost],
    //       commodityCharge: [meterData.commodityCharge],
    //       deliveryCharge: [meterData.deliveryCharge],
    //       otherCharge: [meterData.otherCharge],
    //     });
        
    // }

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