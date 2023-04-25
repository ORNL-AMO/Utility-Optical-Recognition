import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import { Dimensions, ImageCroppedEvent, CropperPosition } from 'ngx-image-cropper'
import { createWorker } from 'tesseract.js'
import { IdbUtilityMeter, IdbUtilityMeterData, utilityMeterScanProfile } from '../models/idb';
import { SourceOptions } from 'src/app/facility/utility-data/energy-consumption/energy-source/edit-meter-form/editMeterOptions';
import * as _ from 'lodash';
import { UtilityMeterScanProfileService } from '../indexedDB/utilityMeterScanProfile-db.service';
import { UtilityMeterDataService } from '../facility/utility-data/energy-consumption/utility-meter-data/utility-meter-data.service';


@Component({
  selector: 'app-utility-optical-recognition',
  templateUrl: './utility-optical-recognition.component.html',
  styleUrls: ['./utility-optical-recognition.component.css']
})


export class UtilityOpticalRecognitionComponent implements OnInit {
  //#region Variables
  @ViewChild(PdfViewerComponent, {static: false}) private pdfViewer: PdfViewerComponent;
  @Input() editMeter: IdbUtilityMeter;
  @Input() editMeterData: IdbUtilityMeterData;
  @Input() meterDataForm: FormGroup;
  public undefinedMeterData;

  public page: number = 1;
  public counterVar: number = 0;
  public imageChangedEvent: any = '';

  //#region divs
  public showFileUploadDiv1:boolean = false;
  public showScanProfileSelectorDiv: boolean = true;        //aka preset profiles
  public showUtilitySelectorDiv: boolean = false;
  public show_ocr_results_div: boolean = false;
  public showFileUploadDiv: boolean = false;
  public showPdfModalDiv: boolean = false;
  public showPdfModalDiv1: boolean = false;
  public showCropButtons: boolean = false;
  public showPdfDiv: boolean = false;
  public showToDoAlert: boolean = false;
  public lastPdfModalID: number = 0;
  //#endregion

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
  public JSON_object: any[] = [];
  public uniqueProfiles: utilityMeterScanProfile[];
  public inputValue123: any = (<HTMLInputElement>document.getElementById("inputDiv"));
  public tempArrayAttributeNames = [];
  public tempArrayAttributex1 = [];
  public tempArrayAttributey1 = [];
  public tempArrayAttributex2 = [];
  public tempArrayAttributey2 = [];
  public tempArrayAttributePgNum = [];
  public buttonColors: string[] = [];
  public profileNameSave: string = '';
  public deleteIndex: number;
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

  //#region bill attributes
  // public undefinedMeterData: any;
  public colorIndex: number = 0;
  public toDo: any[] = [];
  //#endregion

  //#region cropper variables
  cropperPosition: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };
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
  //#endregion

  //"Getter method", Angular will call the getter method whenever it needs to update the value of the `src` attribute.
  get strdPdf2Img(): string {
    return this.rtrvPdf2ImgFrmStrg() || '';
  }

  get strdCrppdImg(): string {
    return this.rtrvCrppdImgFrmStrg() || '';
  }

//#endregion

  constructor(
    private scanProfileDbService: UtilityMeterScanProfileService,
    private utilityMeterDataService: UtilityMeterDataService,
  ) {}

  ngOnInit(): void {
    this.setupBillAttributes();
    // start scan profile
    this.newScanProfile = this.scanProfileDbService.getnewUtilityMeterProfile();
    this.interface.accountId = this.editMeter.accountId;
    this.interface.source123 = this.editMeter.source;
    this.onGetUniqueProfiles();
  }

  setupBillAttributes() {
    // filter out unnecessary attributes
    if(this.editMeter.source == 'Electricity'){
      this.undefinedMeterData = this.utilityMeterDataService.getElectricityMeterDataForm(this.editMeterData);
    } else {
      this.undefinedMeterData = this.utilityMeterDataService.getGeneralMeterDataForm(this.editMeterData, true, true);
    }

    // set object to iterable array
    this.undefinedMeterData = Object.entries(this.undefinedMeterData.value);

    // update attribute names from camelCase to Title Case
    this.undefinedMeterData = this.undefinedMeterData.map(subArray => [
      _.startCase(subArray[0]), subArray[1]
    ]);
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
        reader.readAsArrayBuffer($img.files[0]);

        // update divs
        this.isPdfUploaded = true;
        this.showPdfDiv = true;
        this.showCropButtons = true;
      }
    } else{
      alert('please upload pdf file')
    }
    //setup required attributes
    this.undefinedMeterData.forEach(subArray => {
      if(subArray.includes('Read Date')){
        this.toDo.push(subArray[0]);
      } else if(subArray.includes('Total Volume')){
        this.toDo.push(subArray[0]);
      } else if(subArray.includes('Total Energy Use')){
        this.toDo.push(subArray[0]);
      }
    });

    this.tempArrayAttributeNames.forEach(subArray => {
      if(subArray.includes('Read Date')){
        this.toDo.push(subArray[0]);
      } else if(subArray.includes('Total Volume')){
        this.toDo.push(subArray[0]);
      } else if(subArray.includes('Total Energy Use')){
        this.toDo.push(subArray[0]);
      }
    });
    //filter out duplicates and single letters (i.e. 'R' 'T');
    this.toDo = this.toDo.filter((item, index) => this.toDo.indexOf(item) === index && item.length > 1);
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

  public upatePage(attr: string, index: number | null, event: any){
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
    if (index != null) {
      this.updateAttributeColor(index);
      this.GetProfile.attribute123 = event.target.id;
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

    // set cropper positions
    this.cropperPosition.x1 = this.GetProfile.coordinatesx1;
    this.cropperPosition.y1 = this.GetProfile.coordinatesy1;
    this.cropperPosition.x2 = this.GetProfile.coordinatesx2;
    this.cropperPosition.y2 = this.GetProfile.coordinatesy2;

    // show/hide divs
    this.isPdfUploaded = false;
    this.isButtonReady = false;
    this.isPdf2Image = true;

    return;
  }

  public pdfToCanvas(event: any, index: number | null, attr: string | null ) {
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

    if(index != null){
      this.updateAttributeColor(index);
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
  }

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
    // convert attribute name from Title Case to camelCase
    // this.newScanProfile.attribute = _.camelCase(this.newScanProfile.attribute);

    // add new scan profile row
    this.scanProfileDbService.updateWithObservable(this.newScanProfile).subscribe((addedProfile: utilityMeterScanProfile) => {
      console.log("Added profile:", addedProfile);

      // if toDo list item, remove it from toDo list
      if(addedProfile.attribute.includes("Read Date")){
        this.toDo = this.toDo.filter(item => item !== "Read Date");
      } else if(addedProfile.attribute.includes("Total Energy Use")){
        this.toDo = this.toDo.filter(item => item !== "Total Energy Use");
      } else if(addedProfile.attribute.includes("Total Volume")){
        this.toDo = this.toDo.filter(item => item !== "Total Volume");
      }

      // if toDo list is empty, hide it
      if(this.toDo.length == 0){
        this.showToDoAlert = false;
      }

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
      return; //input validation to verify they do not remove the input field and try to submit
    }

    (<HTMLInputElement>document.getElementById("inputDiv")).removeAttribute("style");
    return; //happy case success
  }
  //#endregion

  //When called this function will turn the selected attribute red
  private updateAttributeColor(index:number){
    //store the index variable when it is sent from pdfToCanvas for when this function is called from HTML file
    this.colorIndex = index;
    this.buttonColors[index] = "red";
  }

  //When called this function will turn the saved attribute lightgray
  private setButtonColorGrey() {
    this.buttonColors[this.colorIndex] = "lightgray";
  }

  //#region Tesseract
  async doOCR(){
    // set scan profile
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

    // OCR
    const worker = createWorker();
    this.setButtonColorGrey();
    await (await worker).loadLanguage('eng');
    await (await worker).initialize('eng');
    const {data: { text } } = await (await worker).recognize(this.cropingImage);
    sessionStorage.setItem("CrppdImg", this.cropingImage);
    this.ocrResult = text;

    this.ocrResult = this.ocrResult.replace(/[^\d.]/g, "") //splice out everything besides numbers and "."
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

  saveChanges(event: MouseEvent): void {
    const clickedButton = event.target as HTMLButtonElement;

    if (clickedButton.id === 'saveAll') {
      this.endProfile();
    } else if (clickedButton.id === 'dupSaveProfileChanges') {
      if(this.toDo.length == 0){
        this.showToDoAlert = false;
        this.show_ocr_results_div = true; 
        this.showPdfModalDiv1 = false; 
        this.lastPdfModalID = 1;
      } else {
        this.showToDoAlert = true;
      }
    } else if (clickedButton.id === 'saveProfileChanges') {
      if(this.toDo.length == 0){
        this.show_ocr_results_div = true; 
        this.showPdfModalDiv = false; 
        this.lastPdfModalID = 0;
      } else {
        this.showToDoAlert = true;
      }
    } else {
      console.error('Unexpected button clicked');
    }
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

    for(var index in this.undefinedMeterData){
      this.undefinedMeterData[index][1] = "black";
    this.buttonColors[index] = "black";
    }

    // reset divs
    this.showFileUploadDiv1 = false;
    this.showFileUploadDiv= false;
    this.showScanProfileSelectorDiv = true;
    this.showUtilitySelectorDiv = false;
    this.showPdfModalDiv1 = false;
    this.showPdfModalDiv = false;
    this.showCropButtons = false;
    this.showPdfDiv = false;
    this.show_ocr_results_div = false;

    // reset session storage
    sessionStorage.removeItem("pdf2Img");
    sessionStorage.removeItem("CrppdImg");

    // reset OCR
    await (await worker1).terminate();
    this.set_json(); //Set json from updated text boxes

    this.JSON_object.forEach(item => {
      this.setFormControlValue(item.key, item.value);
    })

    this.clear_json();
    this.set_json();

    // reset variables
    this.tempArrayAttributeNames = [];
    this.counterVar = 0;
    this.currentpage = 1;
    location.reload();
    for(var index in this.undefinedMeterData){
      this.undefinedMeterData[index][1] = "black";
      this.buttonColors[index] = "black";
    }
    this.undefinedMeterData = [];
    this.toDo = [];

    return;
  }
//#endregion

  setFormControlValue(controlName: string, newValue: any) {
    this.meterDataForm.controls[controlName].setValue(newValue);
  }

  toCamelCase(str: string) {
    str = str.charAt(0).toLowerCase() + str.slice(1);
    return str.replace(/\s(.)/g, function(match, group1) {
      return group1.toUpperCase();
    });
  }

  async add_to_json(key:string, value:any){
    key = this.toCamelCase(key);
    const index = this.JSON_object.findIndex(item => item.key === key);
    if(index !== -1){
      this.JSON_object[index].value = value;
    } else {
      this.JSON_object.push({key: key, value: value});;
    }
  }

  public clear_json(){
    this.JSON_object = [];
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

  updateValue(key: string, event: any) {
    const index = this.JSON_object.findIndex(item => item.key === key);
    if (index !== -1) {
      this.JSON_object[index].value = event.target.value;
    }
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
        this.saveProfileName(event.target.value);
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
    this.setButtonColorGrey();
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
    if(this.GetProfile.attribute123.includes("Read Date")){
      this.toDo = this.toDo.filter(item => item !== "Read Date");
    } else if(this.GetProfile.attribute123.includes("Total Energy Use")){
      this.toDo = this.toDo.filter(item => item !== "Total Energy Use");
    } else if(this.GetProfile.attribute123.includes("Total Volume")){
      this.toDo = this.toDo.filter(item => item !== "Total Volume");
    }

    // if toDo list is empty, hide it
    if(this.toDo.length == 0){
      this.showToDoAlert = false;
    }
    await (await worker).terminate();
    this.startProcessing(null);
    this.currentpage = 1;
    this.isButtonReady = false;
    this.isPdfUploaded = true;

    return;
  }

  deletePreset(){
    for (var index in this.uniqueProfiles)
      console.log(this.uniqueProfiles[index])
    let test = this.saveProfileName(null);

    for(var index in this.uniqueProfiles){
      if(test == this.uniqueProfiles[index].presetName)
        this.deleteIndex = Number(index);
    }
    delete this.uniqueProfiles[this.deleteIndex];

    for (var index in this.uniqueProfiles)
      console.log(this.uniqueProfiles[index])
  }

  saveProfileName(name:string | null){
    if (name != null)
      this.profileNameSave = name;

    return this.profileNameSave;
  }
}

