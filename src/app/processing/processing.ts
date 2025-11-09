import { Component, inject } from '@angular/core';
import { PrcoessingService } from '../processing.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-processing',
  imports: [MatButton, MatIcon],
  templateUrl: './processing.html',
  styleUrl: './processing.scss',
})
export class Processing {
  private router = inject(Router)
  private processingService = inject(PrcoessingService)

  get currentImage() {
    return this.processingService.currentImage
  }

  confirm() {
    if (this.currentImage) {
      this.processingService.processedImages.push(this.currentImage)
      this.processingService.currentImage = undefined;
    }
    this.router.navigate(["/main"])
  }

  cancel() {
    this.processingService.currentImage = undefined;
    this.router.navigate(["/main"])
  }
}
