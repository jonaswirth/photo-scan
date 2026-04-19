import { Component, inject, OnInit } from '@angular/core';
import { ProcessingService } from '../processing.service';
import * as cv from "@techstark/opencv-js"

@Component({
  selector: 'app-corners',
  imports: [],
  templateUrl: './corners.html',
  styleUrl: './corners.scss',
})
export class Corners implements OnInit {
  private processingService = inject(ProcessingService)

  get currentImage() {
    return this.processingService.currentImage
  }

  ngOnInit(): void {
    console.log(this.currentImage)

    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    const context = canvas!.getContext("2d")

    cv.imshow(canvas, this.currentImage!)

    const corners = this.processingService.currentImageCorners

    if (corners) {
      for (const corner of corners) {
        context?.fillRect(corner.x, corner.y, 5, 5)
      }
    }



  }
}
