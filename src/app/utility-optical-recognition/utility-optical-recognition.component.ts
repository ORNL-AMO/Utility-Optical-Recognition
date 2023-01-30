import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-utility-optical-recognition',
  templateUrl: './utility-optical-recognition.component.html',
  styleUrls: ['./utility-optical-recognition.component.css']
})
export class UtilityOpticalRecognitionComponent {

  public showUtilitySelector: boolean = true;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {            
    document.getElementById("modalUploadPDF").style.display = "none";
 }
  
}
