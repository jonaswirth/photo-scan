import { Injectable } from '@angular/core';
import cv from "@techstark/opencv-js";

@Injectable({
  providedIn: 'root',
})
export class PrcoessingService {
  public currentImage: HTMLCanvasElement | undefined
  public processedImages: string[] = []

  public processImage(input: cv.Mat): cv.Mat {
    let src = input
    let dst = new cv.Mat()
    src.copyTo(dst)

    //Detecting the edges:
    //1. convert to B/W
    //2. edge detection
    //3. hough lines
    //4. kmeans => 4 clusters

    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)

    const kernel = cv.Mat.ones(10, 10, cv.CV_8U)
    cv.morphologyEx(dst, dst, cv.MORPH_OPEN, kernel)

    cv.Canny(dst, dst, 200, 300)

    //return dst

    let lines = new cv.Mat()
    cv.HoughLines(dst, lines, 1, Math.PI / 180, 40, 0, 0, 0, Math.PI)

    const criteria = new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10, 0.1)
    const labels = new cv.Mat()
    const clusterCenters = new cv.Mat()
    cv.kmeans(lines, 4, labels, criteria, 10, 0, clusterCenters)
    console.log(labels)
    //console.log(clusterCenters)
    //lines = clusterCenters

    const colors = [[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255], [255, 255, 0, 255], [0, 0, 0, 0]]

    // draw lines
    for (let i = 0; i < lines.rows; ++i) {
      let rho = lines.data32F[i * 2];
      let theta = lines.data32F[i * 2 + 1];
      let a = Math.cos(theta);
      let b = Math.sin(theta);
      let x0 = a * rho;
      let y0 = b * rho;
      let startPoint = { x: x0 - 1000 * b, y: y0 + 1000 * a };
      let endPoint = { x: x0 + 1000 * b, y: y0 - 1000 * a };

      let color = colors[labels.data32S[i]]

      cv.line(src, startPoint, endPoint, color);
    }

    return src
  }
}
