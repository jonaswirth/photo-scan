import { Component, inject, OnInit } from '@angular/core';
import { ProcessingService } from '../processing.service';
import cv from "@techstark/opencv-js"
import { Router } from '@angular/router';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test {
  private processingService = inject(ProcessingService)
  private router = inject(Router)

  processImage(): void {
    const sourceImg = document.getElementById("img")
    const mat = cv.imread(sourceImg!)

    this.processingService.currentImage = mat
    const edges = this.processingService.findCorners()

    this.router.navigate(["/corners"])
  }
}
