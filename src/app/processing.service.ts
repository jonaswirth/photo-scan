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

    // Downsample
    const DOWNSAMPLE_WIDTH = 800
    const input_height = dst.cols
    const input_width = dst.rows
    const new_width = DOWNSAMPLE_WIDTH
    const new_height = Math.round(new_width * (input_height / input_width))

    console.log("Debug: resize")
    cv.resize(dst, dst, new cv.Size(new_width, new_height))

    // Convert to B/W
    console.log("Debug: convert to B/W")
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)

    // Blur
    console.log("Debug: blur")
    const kernel = cv.Mat.ones(6, 6, cv.CV_8U)
    cv.filter2D(dst, dst, -1, kernel)

    // Thresholding (OTSU)
    console.log("Debug: treshold")
    cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)

    // Find contours
    let contours = new cv.MatVector()
    let _ = new cv.Mat()
    cv.findContours(dst, contours, _, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

    console.log(`Debug: found ${contours.size()} contour(s)`)


    return []
  }
}
