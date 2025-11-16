import { Component, inject, OnInit } from '@angular/core';
import { PrcoessingService as ProcessingService } from '../processing.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import * as cv from "@techstark/opencv-js"

@Component({
  selector: 'app-processing',
  imports: [MatButton, MatIcon],
  templateUrl: './processing.html',
  styleUrl: './processing.scss',
})
export class Processing implements OnInit {
  private router = inject(Router)
  private processingService = inject(ProcessingService)

  get currentImage() {
    return this.processingService.currentImage
  }

  ngOnInit(): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    const context = canvas!.getContext("2d")
    context?.drawImage(this.currentImage!, 0, 0, 500, 707)

    const mat = cv.imread(canvas!)

    const proc = this.processingService.processImage(mat)
    cv.imshow(canvas!, proc)
  }

  confirm() {
    if (this.currentImage) {
      // this.processingService.processedImages.push(this.currentImage)
      this.processingService.currentImage = undefined;
    }
    this.router.navigate(["/main"])
  }

  cancel() {
    this.processingService.currentImage = undefined;
    this.router.navigate(["/main"])
  }
}
