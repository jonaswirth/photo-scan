import { Injectable } from '@angular/core';
import cv, { CV_32F } from "@techstark/opencv-js";
import { Line, Point } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  public currentImage: HTMLCanvasElement | undefined
  public processedImages: string[] = []

  // See prototype/corner_detection.py
  public findCorners(input: cv.Mat): Point[] {
    console.log("Debug: start find corners")
    // Input
    let src = input
    let dst = new cv.Mat()
    src.copyTo(dst)

    console.log("Input:")
    this.debugMat(dst)

    // Downsample
    const DOWNSAMPLE_WIDTH = 400
    const input_height = dst.rows
    const input_width = dst.cols
    const new_width = DOWNSAMPLE_WIDTH
    const new_height = Math.round(new_width * (input_height / input_width))
    const scale_ratio = input_width / new_width

    cv.resize(dst, dst, new cv.Size(new_width, new_height))
    console.log("Debug: resize")
    this.debugMat(dst)

    // Convert to B/W
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0)

    console.log("Debug: convert to B/W")
    this.debugMat(dst)

    // Blur
    const kernel_size = 7
    const kernelArray = new Float32Array(kernel_size ** 2).fill(1 / kernel_size ** 2)
    console.log(kernelArray)

    const kernel = cv.matFromArray(kernel_size, kernel_size, cv.CV_32F, kernelArray);
    cv.filter2D(dst, dst, -1, kernel)

    console.log("Debug: blur")
    this.debugMat(dst)

    // Thresholding (OTSU)
    cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)

    console.log("Debug: treshold")
    this.debugMat(dst)
    this.visualizeMat(dst)

    // Find contours
    let contours = new cv.MatVector()
    let _ = new cv.Mat()
    cv.findContours(dst, contours, _, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

    console.log(`Debug: found ${contours.size()} contour(s)`)

    let corners: Point[] = []
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i)
      let arc_len = cv.arcLength(contour, true)
      let approx = new cv.Mat()
      cv.approxPolyDP(contour, approx, 0.02 * arc_len, true)

      if (approx.rows === 4) {
        corners = [
          { x: approx.data32S[0] * scale_ratio, y: approx.data32S[1] * scale_ratio },
          { x: approx.data32S[2] * scale_ratio, y: approx.data32S[3] * scale_ratio },
          { x: approx.data32S[4] * scale_ratio, y: approx.data32S[5] * scale_ratio },
          { x: approx.data32S[6] * scale_ratio, y: approx.data32S[7] * scale_ratio },
        ]
        break;
      }
    }
    console.log(corners)
    return corners;
  }

  private debugMat(mat: cv.Mat): void {
    console.log(`Debug: Height: ${mat.rows} Width: ${mat.cols} Channels: ${mat.channels()} Type: ${mat.type()}`)
  }

  private visualizeMat(mat: cv.Mat): void {
    cv.imshow("debug-canvas", mat)
  }
}
