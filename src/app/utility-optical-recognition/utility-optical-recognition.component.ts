import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-utility-optical-recognition',
  templateUrl: './utility-optical-recognition.component.html',
  styleUrls: ['./utility-optical-recognition.component.css']
})
export class UtilityOpticalRecognitionComponent {

  public showScanProfileSelector: boolean = true;        //aka preset profiles
  public showUtilitySelector: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}

  // closeModal() {            
  //   document.getElementById("modalUploadPDF").style.display = "none";
  // }


  
}
