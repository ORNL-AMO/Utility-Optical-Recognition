import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityOpticalRecognitionComponent } from './utility-optical-recognition.component';

describe('UtilityOpticalRecognitionComponent', () => {
  let component: UtilityOpticalRecognitionComponent;
  let fixture: ComponentFixture<UtilityOpticalRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UtilityOpticalRecognitionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilityOpticalRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
