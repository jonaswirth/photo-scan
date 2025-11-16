import { Component, inject, OnInit } from '@angular/core';
import { PrcoessingService } from '../processing.service';
import cv from "@techstark/opencv-js"

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test implements OnInit {
  processingService = inject(PrcoessingService)

  ngOnInit(): void {
    cv.onRuntimeInitialized = () => this.processImage()

  }

  processImage(): void {
    const sourceImg = document.getElementById("img")
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    console.log("READ")
    console.log(cv.getBuildInformation())
    const mat = cv.imread(sourceImg!)

    const proc = this.processingService.processImage(mat)
    cv.imshow(canvas!, proc)

  }

}
