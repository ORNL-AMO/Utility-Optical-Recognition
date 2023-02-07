import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { createWorker } from 'tesseract.js'

@Component({
  selector: 'app-utility-optical-recognition',
  templateUrl: './utility-optical-recognition.component.html',
  styleUrls: ['./utility-optical-recognition.component.css']
})
export class UtilityOpticalRecognitionComponent {
  //#region Variables
  public showScanProfileSelector: boolean = true;        //aka preset profiles
  public showUtilitySelector: boolean = false;
  public showPdfModalDiv: boolean = false;
  public showCropButtons: boolean = false;
  public showPdfDiv: boolean = false;
  public isPdfUploaded :boolean = false;
  public isPdf2Image :boolean = false;
  public isOcrResult :boolean = false;
  public is :boolean = false;
  public pdfSrc: any = '';
  public totalPages: number = 0;
  public currentpage: number = 0;
  public cropingImage: any = '';
  public ocrResult: any = '';

    //"Getter method", Angular will call the getter method whenever it needs to update the value of the `src` attribute.
    get strdPdf2Img(): string {
      return this.rtrvPdf2ImgFrmStrg() || '';
    }
  
    get strdCrppdImg(): string {
      return this.rtrvCrppdImgFrmStrg() || '';
    }  
//#endregion

  constructor(public activeModal: NgbActiveModal) {}

  // closeModal() {            
  //   document.getElementById("modalUploadPDF").style.display = "none";
  // }

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
  public pdfToCanvas() {       
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
    async doOCR(){
      this.isPdf2Image = false;
      this.isOcrResult = true;
    const worker = createWorker({
      logger: m => console.log(m),
    });
    await (await worker).load();
    await (await worker).loadLanguage('eng');
    await (await worker).initialize('eng');
    const {data: { text } } = await (await worker).recognize(this.cropingImage);
    sessionStorage.setItem("CrppdImg", this.cropingImage);
    this.ocrResult = text;
    console.log(text);
    await (await worker).terminate();
  }
//#endregion

}
