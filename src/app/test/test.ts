import { Component, inject, OnInit } from '@angular/core';
import { ProcessingService } from '../processing.service';
import cv from "@techstark/opencv-js"

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test implements OnInit {
  processingService = inject(ProcessingService)

  ngOnInit(): void {
    cv.onRuntimeInitialized = () => this.processImage()

  }

  processImage(): void {
    const sourceImg = document.getElementById("img")
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    console.log("READ")
    console.log(cv.getBuildInformation())
    const mat = cv.imread(sourceImg!)

    const edges = this.processingService.processImage(mat)

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(sourceImg as CanvasImageSource, 0, 0, 347, 462)
    for (const edge of edges) {
      ctx?.fillRect(edge.x - 5, edge.y - 5, 10, 10)
    }
  }

}
