import { Injectable } from '@angular/core';
import cv, { CV_32F, Exception } from "@techstark/opencv-js";
import { Line, Point } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  public currentImage?: cv.Mat;
  public currentImageCorners?: Point[]
  public processedImages: string[] = []

  // See prototype/corner_detection.py
  public findCorners(): Point[] {
    if (!this.currentImage) {
      throw Error("Image not set")
    }
    console.log("Debug: start find corners")
    // Input
    let src = this.currentImage
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

      //TODO: if more than one contours with 4 points are detected decide which one is the document

      if (approx.rows === 4) {
        corners = [
          { x: Math.round(approx.data32S[0] * scale_ratio), y: Math.round(approx.data32S[1] * scale_ratio) },
          { x: Math.round(approx.data32S[2] * scale_ratio), y: Math.round(approx.data32S[3] * scale_ratio) },
          { x: Math.round(approx.data32S[4] * scale_ratio), y: Math.round(approx.data32S[5] * scale_ratio) },
          { x: Math.round(approx.data32S[6] * scale_ratio), y: Math.round(approx.data32S[7] * scale_ratio) },
        ]
        console.log("Potential corners:", corners)
      }
    }

    this.currentImageCorners = this.orderClockwise(corners)
    console.log(this.currentImageCorners)
    return corners;
  }

  public processImage() {
    if (!this.currentImage) {
      throw Error("Image not set")
    }
    if (!this.currentImageCorners) {
      throw Error("Corners not set")
    }
    // Input
    let src = this.currentImage
    let dst = new cv.Mat()
    src.copyTo(dst)

    //Homography transform
    const c = this.currentImageCorners
    const dst_width = this.currentImage.cols
    const dst_height = this.currentImage.rows

    const srcCornersArr = [c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y]
    console.log("Corners:", srcCornersArr)
    let mat_source = cv.matFromArray(4, 1, cv.CV_32FC2, srcCornersArr)
    const dstCornersArr = [0, 0, dst_width - 1, 0, dst_width - 1, dst_height - 1, 0, dst_height - 1]
    let mat_dest = cv.matFromArray(4, 1, cv.CV_32FC2, dstCornersArr)


    let transform_mat = cv.getPerspectiveTransform(mat_source, mat_dest)


    let size = new cv.Size(dst_width, dst_height)
    cv.warpPerspective(src, dst, transform_mat, size, cv.INTER_LINEAR)

    this.currentImage = dst
  }

  private debugMat(mat: cv.Mat): void {
    console.log(`Debug: Height: ${mat.rows} Width: ${mat.cols} Channels: ${mat.channels()} Type: ${mat.type()}`)
  }

  private visualizeMat(mat: cv.Mat): void {
    const debugCanvas = document.getElementById("debug-canvas")
    if (debugCanvas) {
      cv.imshow("debug-canvas", mat)
    }
  }

  //Order the corners clockwise: top-left, top-right, bottom-right, bottom-left
  private orderClockwise(points: Point[]): Point[] {
    console.log(points)
    points.sort((a, b) => a.y - b.y)
    const top = points.slice(0, 2).sort((a, b) => a.x - b.x)
    const bottom = points.slice(2, 4).sort((a, b) => a.x - b.x)

    console.log("top", top)
    console.log("bottom", bottom)

    return [
      top[0],
      top[1],
      bottom[1],
      bottom[0]
    ]
  }
}
