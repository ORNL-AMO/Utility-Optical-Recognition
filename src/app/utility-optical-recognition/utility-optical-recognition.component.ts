import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import { Dimensions, ImageCroppedEvent, ImageTransform, ImageCropperComponent, CropperPosition } from 'ngx-image-cropper'
import { createWorker } from 'tesseract.js'
import { IdbUtilityMeter, IdbUtilityMeterData, utilityMeterScanProfile } from '../models/idb';
import { SourceOptions } from 'src/app/facility/utility-data/energy-consumption/energy-source/edit-meter-form/editMeterOptions';
import * as _ from 'lodash';
import { UtilityMeterScanProfileService } from '../indexedDB/utilityMeterScanProfile-db.service';
import { exit } from 'process';
import { Interface } from 'readline';
import { element } from 'protractor';
import { color } from 'html2canvas/dist/types/css/types/color';
import { AnyCnameRecord } from 'dns';

@Component({
  selector: 'app-utility-optical-recognition',
  templateUrl: './utility-optical-recognition.component.html',
  styleUrls: ['./utility-optical-recognition.component.css']
})

export class UtilityOpticalRecognitionComponent implements OnInit {
  //#region Variables
  //@ViewChild(PdfViewerComponent) pdfViewer: PdfViewerComponent;
  @ViewChild(PdfViewerComponent, {static: false}) private pdfViewer: PdfViewerComponent;
  @Input() editMeter: IdbUtilityMeter;
  @Input() editMeterData: IdbUtilityMeterData;
  public page: number = 1;
  public undefinedMeterData;
  public counterVar: number = 0;
  public imageChangedEvent: any = '';
  public showFileUploadDiv1:boolean = false;
  public showScanProfileSelectorDiv: boolean = true;        //aka preset profiles
  public showUtilitySelectorDiv: boolean = false;
  public showFileUploadDiv: boolean = false;
  public showPdfModalDiv: boolean = false;
  public showCropButtons: boolean = false;
  public showPdfDiv: boolean = false;
  public showPdfModalDiv1: boolean = false;
  public isPdfUploaded: boolean = false;
  public isPdf2Image: boolean = false;
  public isPdf2Image1: boolean = false;
  public isOcrResult: boolean = false;
  public pdfSrc: any = '';
  public totalPages: number = 0;
  public currentpage: number = 1;
  public cropingImage: any = '';
  public grabbingImage: any = '';
  public isButtonReady: boolean = false;
  public ocrResult: any = '';
  public newScanProfile: any;
  public presetName: string = '';
  public coordinatesx1: number = 0;
  public coordinatesy1: number = 0;
  public coordinatesx2: number = 0;
  public coordinatesy2: number = 0;
  public booleanAns: any;
  public last_attritbute = '';
  public JSON_object = {};
  public uniqueProfiles: utilityMeterScanProfile[];
  public inputValue123: any = (<HTMLInputElement>document.getElementById("inputDiv"));
  public tempArrayAttributeNames = [];
  public tempArrayAttributex1 = [];
  public tempArrayAttributey1 = [];
  public tempArrayAttributex2 = [];
  public tempArrayAttributey2 = [];
  public tempArrayAttributePgNum = [];
  public pdf: PDFDocumentProxy;
  public GetProfile =
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
    pgNum: 1,
  };
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
    pgNum: 1,
  };
  public colorIndex: number = 0;
  cropperPosition: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };
 
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
    this.onGetUniqueProfiles();
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
        this.interface.pgNum = this.currentpage;
      } else {
        this.currentpage--;
        this.interface.pgNum = this.currentpage;
      }
    }
  }

  public next() {
    if (this.totalPages > this.currentpage) {
      this.currentpage++;
      this.interface.pgNum = this.currentpage;
    } else {
      this.currentpage = 1;
      this.interface.pgNum = this.currentpage;
    }
    return;
  }
  public upatePage(attr: string){
    for(let i = 0; i < this.tempArrayAttributeNames.length; i++){
    if(attr == this.tempArrayAttributeNames[i]){
      this.GetProfile.coordinatesx1 = this.tempArrayAttributex1[i];
      this.GetProfile.coordinatesy1 = this.tempArrayAttributey1[i];
      this.GetProfile.coordinatesx2 = this.tempArrayAttributex2[i];
      this.GetProfile.coordinatesy2 = this.tempArrayAttributey2[i];
      this.GetProfile.pgNum = this.tempArrayAttributePgNum[i];
      this.GetProfile.attribute123 = this.tempArrayAttributeNames[i];
    }

    }
    this.currentpage = this.GetProfile.pgNum;
    this.isButtonReady = true;
    return;
  }
  //#endregion
  
  //#region Html2Canvas
  
public async test(event:any){
    this.interface.attribute123 = event.target.id;
     await html2canvas(document.querySelector(".pdf-container") as HTMLElement).then((canvas: any) => {
      this.getCanvasToStorage(canvas)
    })
      this.cropperPosition.x1 = this.GetProfile.coordinatesx1;
      this.cropperPosition.y1 = this.GetProfile.coordinatesy1;
      this.cropperPosition.x2 = this.GetProfile.coordinatesx2;
      this.cropperPosition.y2 = this.GetProfile.coordinatesy2;
    this.isPdfUploaded = false;
    this.isButtonReady = false;
    this.isPdf2Image = true;
    return;
}


  public pdfToCanvas(event:any, index:number| null, attr: string | null ) {    
    for(let i = 0; i < this.tempArrayAttributeNames.length; i++){
    if(attr == this.tempArrayAttributeNames[i]){
      this.GetProfile.coordinatesx1 = this.tempArrayAttributex1[i];
      this.GetProfile.coordinatesy1 = this.tempArrayAttributey1[i];
      this.GetProfile.coordinatesx2 = this.tempArrayAttributex2[i];
      this.GetProfile.coordinatesy2 = this.tempArrayAttributey2[i];
      this.GetProfile.pgNum = this.tempArrayAttributePgNum[i];
      this.GetProfile.attribute123 = this.tempArrayAttributeNames[i];
    }

    }
    if(this.currentpage != this.GetProfile.pgNum){
    }
    if(index != null){
    this.undefinedMeterData[index][1] = "red"
    this.interface.attribute123 = event.target.id;
  }
    
     html2canvas(document.querySelector(".pdf-container") as HTMLElement).then((canvas: any) => {
      this.getCanvasToStorage(canvas)
    })
    if(index == null){
      this.cropperPosition.x1 = this.GetProfile.coordinatesx1;
      this.cropperPosition.y1 = this.GetProfile.coordinatesy1;
      this.cropperPosition.x2 = this.GetProfile.coordinatesx2;
      this.cropperPosition.y2 = this.GetProfile.coordinatesy2;

    }
    this.isPdfUploaded = false;
    this.isPdf2Image = true;
    this.last_attritbute = event.target.id;
    if(index != null){
      this.updateAttributeColor(index);
    }
  }
  

  croppedImage: any = null;
  aspectRatio = 1;
  resizeToWidth = 0;
  resizeToHeight = 0;
  cropperMinWidth = 0;
  cropperMinHeight = 0;
  onlyScaleDown = false;
  imageQuality = 100;
  autoCrop = true;
  backgroundColor = '';
  disabled = false;
  canvasRotation = 0;
  transform = {};
  allowMoveImage = false;
  hidden = false;
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageLoaded(): void {
    // Do something when the image is loaded
  }

  cropperReady(dimensions: Dimensions): void {
    const { x1, y1, x2, y2 } = this.calculateInitialPosition(dimensions);
    this.cropperPosition = { x1, y1, x2, y2 };
  }

  calculateInitialPosition(dimensions: Dimensions): CropperPosition {
    const x1 = this.GetProfile.coordinatesx1;
    const y1 = this.GetProfile.coordinatesy1;
    const x2 = this.GetProfile.coordinatesx2;
    const y2 = this.GetProfile.coordinatesy2;
    return { x1, y1, x2, y2 };
  }

  cropperReady1(dimensions: Dimensions): void {
    const { x1, y1, x2, y2 } = this.calculateInitialPosition1(dimensions);
    this.cropperPosition = { x1, y1, x2, y2 };
  }

  calculateInitialPosition1(dimensions: Dimensions): CropperPosition {
    const x1 = 192;
    const y1 = 227;
    const x2 = 452;
    const y2 = 320;
    return { x1, y1, x2, y2 };
  }
  
  private getCanvasToStorage(canvas:any){
    let ctx = canvas.getContext('2d');
    ctx.scale(1, 1);
    let image = canvas.toDataURL("image/png").replace("image/png", "image/png");
    window.sessionStorage.setItem("pdf2Img", image);
  }
  //#endregion

  //#region Image Cropper
  public cropImage(event: ImageCroppedEvent ){
    this.cropingImage = event.base64;
    sessionStorage.setItem("CrppdImg", this.cropingImage);
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

  private updateAttributeColor(index:number){
    //store the index variable when it is sent from pdfToCanvas for when this function is called from HTML file
    this.colorIndex = index;
  }

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
    this.newScanProfile.pgNum = this.interface.pgNum;
    // show/hide divs
    this.isPdf2Image = false;
    this.isOcrResult = true;

    const worker = createWorker();
    this.undefinedMeterData[this.colorIndex][1] = "lightgray"
    await (await worker).load();
    await (await worker).loadLanguage('eng');
    await (await worker).initialize('eng');
    const {data: { text } } = await (await worker).recognize(this.cropingImage);
    sessionStorage.setItem("CrppdImg", this.cropingImage); 
    this.ocrResult = text;

    this.ocrResult = this.ocrResult.replace(/[$\n]/g, '') //splice out $ and new lines
    this.add_to_json(this.last_attritbute, this.ocrResult);
    this.set_json();
    await (await worker).terminate();

    this.Test123();
    this.interface.coordinatesx1 = 0;
    this.interface.coordinatesy1 = 0;
    this.interface.coordinatesx2 = 0;
    this.interface.coordinatesy2 = 0;
    this.interface.attribute123 = "";
    this.isPdfUploaded = true;
    this.startProcessing(null);
    return;
  }

  async endProfile(){
    this.onGetUniqueProfiles();
    const worker1 = createWorker();
    this.showFileUploadDiv = false;
    sessionStorage.removeItem("pdf2Img");
    sessionStorage.removeItem("CrppdImg");
    this.showScanProfileSelectorDiv = true;
    this.showUtilitySelectorDiv = false;
    this.showPdfModalDiv = false;
    this.showCropButtons = false;
    this.currentpage = 1;
    await (await worker1).terminate();
  }

  async endProfile1(){
    this.onGetUniqueProfiles();
    const worker1 = createWorker();
    this.showFileUploadDiv1 = false;
    this.showScanProfileSelectorDiv = true;
    this.showUtilitySelectorDiv = false;
    this.showPdfModalDiv1 = false;
    this.showCropButtons = false;
    sessionStorage.removeItem("pdf2Img");
    sessionStorage.removeItem("CrppdImg");
    await (await worker1).terminate();
    this.tempArrayAttributeNames = [];
    this.counterVar = 0;
    this.currentpage = 1;
    location.reload();
    return;
  }

  
//#endregion

  async add_to_json(key:string, value:any){

    this.JSON_object[key] = value;
    
    }

  public clear_json(){
    this.JSON_object = {}
  }

  public set_json(){
    sessionStorage.setItem("scan_output", JSON.stringify(this.JSON_object));
  }

  public get_json(){

    return this.JSON_object;
  }

  onGetUniqueProfiles() {
    this.scanProfileDbService.getAll().subscribe(profiles => {
      // Filter out profiles with duplicate presetName
      this.uniqueProfiles = profiles.filter((profile, index, self) =>
        index === self.findIndex(p => p.presetName === profile.presetName)
      );
    });
  }
  async startProcessing(event: any | null){
    
    if(event != null){
      this.GetProfile.name123 = event.target.value;
    }
      this.scanProfileDbService.getByPresetName(this.GetProfile.name123).subscribe(profiles => {
      let tempArray = profiles;
      
      if(event != null){
      this.showFileUploadDiv1 = true;
      this.showScanProfileSelectorDiv = false;
      
      }
      
      let i = 0;
      
      if(this.counterVar == 0){
        for(i = 0; i < tempArray.length; i++){
        this.tempArrayAttributeNames.push(tempArray[i].attribute);
        this.tempArrayAttributex1.push(tempArray[i].x1);
        this.tempArrayAttributey1.push(tempArray[i].y1);
        this.tempArrayAttributex2.push(tempArray[i].x2);
        this.tempArrayAttributey2.push(tempArray[i].y2);
        this.tempArrayAttributePgNum.push(tempArray[i].pgNum);
      }
      }
      this.counterVar++;
    });
    
    return;
}
  async doOCR2(){
    // show/hide divs
    this.isPdf2Image = false;
    this.isOcrResult = true;
    const worker = createWorker();
    this.undefinedMeterData[this.colorIndex][1] = "lightgray"
    await (await worker).load();
    await (await worker).loadLanguage('eng');
    await (await worker).initialize('eng');
    const {data: { text } } = await (await worker).recognize(this.cropingImage);
    sessionStorage.setItem("CrppdImg", this.cropingImage); 
    this.ocrResult = text;
    this.ocrResult = this.ocrResult.replace(/[$\n]/g, '') //splice out $ and new lines
    if(this.ocrResult == ""){
      alert("Nothing was able to be read from the image. Please try again.");
      this.startProcessing(null);
      this.currentpage = 1;
      this.isButtonReady = false;
      this.isPdfUploaded = true;
      return;
    }
    this.add_to_json(this.GetProfile.attribute123, this.ocrResult);
    this.set_json();
    await (await worker).terminate();
    this.startProcessing(null);
    this.currentpage = 1;
    this.isButtonReady = false;
    this.isPdfUploaded = true;
    return;
  }
  deletePreset(){
    return;
  }
//edit bill component
  }