import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { createWorker } from 'tesseract.js'
import { IdbUtilityMeter, IdbUtilityMeterData } from '../models/idb';
import { SourceOptions } from 'src/app/facility/utility-data/energy-consumption/energy-source/edit-meter-form/editMeterOptions';
import * as _ from 'lodash';
import { UtilityMeterScanProfileService } from '../indexedDB/utilityMeterScanProfile-db.service';
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
  public colorIndex: number = null;
  // public sourceOptions: Array<string> = SourceOptions;      // provides the types of utilities

    //"Getter method", Angular will call the getter method whenever it needs to update the value of the `src` attribute.
    get strdPdf2Img(): string {
      return this.rtrvPdf2ImgFrmStrg() || '';
    }
  
    get strdCrppdImg(): string {
      return this.rtrvCrppdImgFrmStrg() || '';
    }  
//#endregion

  constructor() {}

  ngOnInit(): void {
    this.undefinedMeterData = Object.entries(this.editMeterData).filter(
      ([key, value]) => value === undefined || value === null || value === '' || value === false || value === 'false' || key.includes('checked')
    );
    console.log(this.undefinedMeterData)
    this.undefinedMeterData = this.undefinedMeterData.map(subArray => [
      _.startCase(subArray[0]),
      subArray[1]
    ]);
    this.undefinedMeterData = this.undefinedMeterData
  }

  skipToUploadPdf() {
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
  public pdfToCanvas(event:any, index:number) {
    this.undefinedMeterData[index][1] = "red"
    html2canvas(document.querySelector(".pdf-container") as HTMLElement).then((canvas: any) => {
      this.getCanvasToStorage(canvas)
    })
    this.isPdfUploaded = false;
    this.isPdf2Image = true;
    
    //send the index of the button clicked in undefinedMeterData array to doOCR function
    this.doOCR(index);
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
  }
  //#endregion

  //#region Saving to Storage Session
  private rtrvPdf2ImgFrmStrg(){
    return window.sessionStorage.getItem("pdf2Img");
  }

  private rtrvCrppdImgFrmStrg(){
    return window.sessionStorage.getItem("CrppdImg");
  }
  //#endregion

  //#region Tesseract
  async doOCR(index:number){
    //store the index variable when it is sent from pdfToCanvas for when this function is called from HTML file
    if (index != null)
      this.colorIndex = index
    //Function only needs to run when the HTML file sends index = null.
    if (index == null){
      this.isPdf2Image = false;
      this.isOcrResult = true;
    const worker = createWorker({
      logger: m => console.log(m),
    });
    this.undefinedMeterData[this.colorIndex][1] = "lightgray"
    await (await worker).load();
    await (await worker).loadLanguage('eng');
    await (await worker).initialize('eng');
    const {data: { text } } = await (await worker).recognize(this.cropingImage);
    sessionStorage.setItem("CrppdImg", this.cropingImage);
    this.ocrResult = text;
    console.log(text);
    await (await worker).terminate();
    }
  }
//#endregion

}