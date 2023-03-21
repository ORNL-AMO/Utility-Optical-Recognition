import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { createWorker } from 'tesseract.js'
import { IdbUtilityMeter, IdbUtilityMeterData, utilityMeterScanProfile } from '../models/idb';
import { SourceOptions } from 'src/app/facility/utility-data/energy-consumption/energy-source/edit-meter-form/editMeterOptions';
import * as _ from 'lodash';
import { UtilityMeterScanProfileService } from '../indexedDB/utilityMeterScanProfile-db.service';

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
  // public sourceOptions: Array<string> = SourceOptions;      // provides the types of utilities

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
    this.undefinedMeterData = Object.entries(this.editMeterData).filter(
      ([key, value]) => value === undefined || value === null || value === '' || value === false || value === 'false' || key.includes('checked')
    );

    this.undefinedMeterData = this.undefinedMeterData.map(subArray => [
      _.startCase(subArray[0]), subArray[1]
    ]);

    this.testAPIs();
  }

  async testAPIs() {
    // this.newScanProfile = this.scanProfileDbService.getnewUtilityMeterProfile();
    // this.scanProfileDbService.addWithObservable(this.newScanProfile).subscribe((addedProfile: utilityMeterScanProfile) => {
    //   console.log('Added profile:', addedProfile);
    // }, error => {
    //     console.error('Error adding profile:', error);
    // });
  }

  skipToUploadPdf() {
    this.newScanProfile = this.scanProfileDbService.getnewUtilityMeterProfile();
    this.newScanProfile.accountId = this.editMeter.accountId;
    if(this.editMeter.source){
      this.newScanProfile.source = this.editMeter.source;
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
    this.newScanProfile.attribute = event.target.id;
    this.scanProfileDbService.addWithObservable(this.newScanProfile).subscribe((addedProfile: utilityMeterScanProfile) => {
      console.log("Added profile:", addedProfile);
    }, error => {
        console.error("Error adding profile:", error);
    });
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
    // when we have x1, y1, we can update their rows here
    // this.newScanProfile.x1 = event.imagePosition.x1;
    // this.newScanProfile.updateWithObservable(this.newScanProfile).subscribe((updatedProfile: utilityMeterScanProfile) => {
    //   console.log('Edited profile:', updatedProfile);
    // }, error => {
    //     console.error('Error adding profile:', error);
    // });
    this.cropingImage = event.base64;
    sessionStorage.setItem("CrppdImg", this.cropingImage);
  }
  //#endregion

  //#region Saving to Storage Session
  private rtrvPdf2ImgFrmStrg(){
    return window.sessionStorage.getItem("pdf2Img");
  }

  private rtrvCrppdImgFrmStrg(){
    return window.sessionStorage.getItem("CrppdImg");
  }
  public updatePreset(){
    let inputValue = (<HTMLInputElement>document.getElementById("preset-name")).value;
    //this.presetName = inputValue;
    this.newScanProfile.presetName = inputValue;
    return this.newScanProfile.presetName;
    
  }
  //#endregion

  //#region Tesseract
  async doOCR(){
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
    
  }
//#endregion

}