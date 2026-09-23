import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoPage } from './nuevo.page';

describe('NuevoPage', () => {
  let component: NuevoPage;
  let fixture: ComponentFixture<NuevoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
