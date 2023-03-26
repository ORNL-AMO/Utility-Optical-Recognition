import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { createWorker } from 'tesseract.js'
import { IdbUtilityMeter, IdbUtilityMeterData, utilityMeterScanProfile } from '../models/idb';
import { SourceOptions } from 'src/app/facility/utility-data/energy-consumption/energy-source/edit-meter-form/editMeterOptions';
import * as _ from 'lodash';
import { UtilityMeterScanProfileService } from '../indexedDB/utilityMeterScanProfile-db.service';
import { exit } from 'process';

@Component({
  selector: 'app-utility-optical-recognition',
  templateUrl: './utility-optical-recognition.component.html',
  styleUrls: ['./utility-optical-recognition.component.css']
})

export class UtilityOpticalRecognitionComponent implements OnInit {
  //#region Variables
  @Input() editMeter: IdbUtilityMeter;
  @Input() editMeterData: IdbUtilityMeterData;
  public undefinedMeterData;
  
  public showScanProfileSelectorDiv: boolean = true;        //aka preset profiles
  public showUtilitySelectorDiv: boolean = false;
  public showFileUploadDiv: boolean = false;
  public showPdfModalDiv: boolean = false;
  public showCropButtons: boolean = false;
  public showPdfDiv: boolean = false;

  public isPdfUploaded: boolean = false;
  public isPdf2Image: boolean = false;
  public isOcrResult: boolean = false;
  public pdfSrc: any = '';
  public totalPages: number = 0;
  public currentpage: number = 1;
  public cropingImage: any = '';
  public ocrResult: any = '';
  public newScanProfile: any;
  public presetName: string = '';
  public coordinatesx1: number = 0;
  public coordinatesy1: number = 0;
  public coordinatesx2: number = 0;
  public coordinatesy2: number = 0;
  public booleanAns: any ;
  public inputValue123: any = (<HTMLInputElement>document.getElementById("inputDiv"))
  public interface = 
  {
    guid: "",
    accountId: "",
    name123: "",
    source123: "",
    attribute123: "",
    coordinatesx1: 0,
    coordinatesy1: 0,
    coordinatesx2: 0,
    coordinatesy2: 0,

  }

    //"Getter method", Angular will call the getter method whenever it needs to update the value of the `src` attribute.
    get strdPdf2Img(): string {
      return this.rtrvPdf2ImgFrmStrg() || '';
    }
  
    get strdCrppdImg(): string {
      return this.rtrvCrppdImgFrmStrg() || '';
    }  
//#endregion

  constructor(
    private scanProfileDbService: UtilityMeterScanProfileService
  ) {}

  ngOnInit(): void {
    // find bill attribute types
    this.undefinedMeterData = Object.entries(this.editMeterData).filter(
      ([key, value]) => value === undefined || value === null || value === '' || value === false || value === 'false' || key.includes('checked')
    );

    // keep only the undefined attributes
    this.undefinedMeterData = this.undefinedMeterData.map(subArray => [
      _.startCase(subArray[0]), subArray[1]
    ]);

    // start scan profile
    this.newScanProfile = this.scanProfileDbService.getnewUtilityMeterProfile();
    this.interface.accountId = this.editMeter.accountId;
    this.interface.source123 = this.editMeter.source;
  }

  skipToUploadPdf() {
    // if source found, skip to upload pdf
    if(this.editMeter.source){
      this.showScanProfileSelectorDiv = false;
      this.showFileUploadDiv = true
    } else {
      this.showScanProfileSelectorDiv = false;
      this.showUtilitySelectorDiv = true;
    }
  }

  //#region PDF Viewer
  public uploadPdf(event:any){
    let $img: any = document.querySelector('#upload-doc');
    if(event.target.files[0].type == 'application/pdf'){
      if (typeof (FileReader) !== 'undefined') {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.pdfSrc = e.target.result;
        };
        this.isPdfUploaded = true;
        this.showPdfDiv = true;
        this.showCropButtons = true;
        reader.readAsArrayBuffer($img.files[0]);
      }
    } else{
      alert('please upload pdf file')
    }
  }

  public afterLoadComplete(pdf: PDFDocumentProxy) {
    this.totalPages = pdf.numPages;
  }

  public previous() {
    if (this.currentpage > 0) {
      if (this.currentpage == 1) {
        this.currentpage = this.totalPages;
      } else {
        this.currentpage--;
      }
    }
  }

  public next() {
    if (this.totalPages > this.currentpage) {
      this.currentpage++;
    } else {
      this.currentpage = 1;
    }
  }
  //#endregion

  //#region Html2Canvas
  public pdfToCanvas(event: any) {
    // set attribute for scan profile
    this.interface.attribute123 = event.target.id;

    html2canvas(document.querySelector(".pdf-container") as HTMLElement).then((canvas: any) => {
      this.getCanvasToStorage(canvas)
    })
    this.isPdfUploaded = false;
    this.isPdf2Image = true;
  }

  private getCanvasToStorage(canvas:any){
    let ctx = canvas.getContext('2d');
    ctx.scale(1, 1);
    let image = canvas.toDataURL("image/png").replace("image/png", "image/png");
    window.sessionStorage.setItem("pdf2Img", image);
  }
  //#endregion

  //#region Image Cropper
  public cropImage(event: ImageCroppedEvent){
    this.cropingImage = event.base64;
    sessionStorage.setItem("CrppdImg", this.cropingImage);

    // set coordinates for scan profile
    this.interface.coordinatesx1 = event.cropperPosition.x1;
    this.interface.coordinatesy1 = event.cropperPosition.y1;
    this.interface.coordinatesx2 = event.cropperPosition.x2;
    this.interface.coordinatesy2 = event.cropperPosition.y2; 
  }
  //#endregion

  //#region Saving to Storage Session
  private rtrvPdf2ImgFrmStrg(){
    return window.sessionStorage.getItem("pdf2Img");
  }

  private rtrvCrppdImgFrmStrg(){
    return window.sessionStorage.getItem("CrppdImg");
  }

  public async updatePreset(){
    let inputValue = (<HTMLInputElement>document.getElementById("preset-name")).value;
    await this.scanProfileDbService.checkPresetName(inputValue)
      .then((isTaken) => {
        this.booleanAns = isTaken;
      });
    if(this.booleanAns == true){ return; }
    this.presetName = inputValue;
    this.interface.name123 = inputValue;
    this.updateDisabled();
  }

  public Test123(){
    // add new scan profile row
    this.scanProfileDbService.updateWithObservable(this.newScanProfile).subscribe((addedProfile: utilityMeterScanProfile) => {
      console.log("Added profile:", addedProfile);
    }, error => {
        console.error("Error adding profile:", error);
    });

    return;
  }

  public updateDisabled(){
    if(this.booleanAns == true){
      (<HTMLInputElement>document.getElementById("inputDiv")).style['pointer-events'] = 'none';
      return;
    }
    if(this.presetName == null || this.presetName == undefined || this.presetName == ""){
      alert("Please do not leave the input field empty for the Preset name.");
      (<HTMLInputElement>document.getElementById("inputDiv")).style['pointer-events'] = 'none';
      return;
      //input validation to verify they do not remove the input field and try to submit
    }
    (<HTMLInputElement>document.getElementById("inputDiv")).removeAttribute("style");
    return;
    //happy case success
  }
  //#endregion

  //#region Tesseract
  async doOCR(){
    this.newScanProfile.accountId = this.interface.accountId;  
    this.newScanProfile.source = this.interface.source123;
    this.newScanProfile.x1 = this.interface.coordinatesx1;
    this.newScanProfile.y1 = this.interface.coordinatesy1;
    this.newScanProfile.x2 = this.interface.coordinatesx2;
    this.newScanProfile.y2 = this.interface.coordinatesy2;
    this.newScanProfile.presetName = this.interface.name123;
    this.newScanProfile.attribute = this.interface.attribute123;

    // show/hide divs
    this.isPdf2Image = false;
    this.isOcrResult = true;

    const worker = createWorker({
      // logger: m => console.log(m),
    });
    await (await worker).loadLanguage('eng');
    await (await worker).initialize('eng');
    const {data: { text } } = await (await worker).recognize(this.cropingImage);
    sessionStorage.setItem("CrppdImg", this.cropingImage);
    this.ocrResult = text;
    await (await worker).terminate();

    this.Test123();
    this.interface.coordinatesx1 = 0;
    this.interface.coordinatesy1 = 0;
    this.interface.coordinatesx2 = 0;
    this.interface.coordinatesy2 = 0;
    this.interface.attribute123 = "";
    return;
  }

  async endProfile(){
    const worker1 = createWorker();
    this.showFileUploadDiv = false;
    this.showScanProfileSelectorDiv = true;
    this.showUtilitySelectorDiv = false;
    this.showPdfModalDiv = false;
    this.showCropButtons = false;
    await (await worker1).terminate();
  }

  
//#endregion

}