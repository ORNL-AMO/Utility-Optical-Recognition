import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilityOpticalRecognitionComponent } from './utility-optical-recognition.component';
import { RouterModule } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [UtilityOpticalRecognitionComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PdfViewerModule,
    ImageCropperModule,
  ],
  exports: [UtilityOpticalRecognitionComponent]
})
export class UtilityOpticalRecognitionModule { }
