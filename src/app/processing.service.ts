import { Injectable } from '@angular/core';
import cv, { CV_32F } from "@techstark/opencv-js";

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
    let lines = this.findLines(dst)


    //console.log(clusterCenters)
    //lines = clusterCenters

    const colors = [[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255], [255, 255, 0, 255], [0, 0, 0, 0]]

    // draw lines
    for (let i = 0; i < lines.length; ++i) {
      let rho = lines[i].rho
      let theta = lines[i].theta
      let a = Math.cos(theta);
      let b = Math.sin(theta);
      let x0 = a * rho;
      let y0 = b * rho;
      let startPoint = { x: x0 - 1000 * b, y: y0 + 1000 * a };
      let endPoint = { x: x0 + 1000 * b, y: y0 - 1000 * a };

      let color = colors[i]

      cv.line(src, startPoint, endPoint, color);
    }

    return src
  }

  /**
   * Find all lines using hough lines, then first seperate vertical and horizontal lines by rho and then seperate each into two clusters based on theta
   * @param mat 
   * @returns 
   */
  //TODO: refactor this horrible code
  private findLines(mat: cv.Mat): { rho: number, theta: number }[] {
    let lines = new cv.Mat()
    cv.HoughLines(mat, lines, 1, Math.PI / 180, 40, 0, 0, 0, Math.PI)

    let mappedLines = this.mapLines(lines)

    //If rho is negative, flip its sign and correct theta, see: https://stackoverflow.com/questions/24752497/math-average-out-lines-in-polar-coordinate-system-c-opencv
    for (let line of mappedLines) {
      if (line.rho < 0) {
        line.rho = Math.abs(line.rho)
        //TODO: not sure if this approach works in every case. Could lead to negative theta in the result?
        line.theta = line.theta - Math.PI
      }
    }

    // Distinguish between horizontal and vertical lines, based only on theta
    // Convert angles to coordinates on unit cycle, see: https://stackoverflow.com/questions/46565975/find-intersection-point-of-two-lines-drawn-using-houghlines-opencv
    let thetas = mappedLines.map(x => [Math.cos(x.theta * 2), Math.sin(x.theta * 2)])
    console.log(thetas)

    let thetaCv = cv.matFromArray(mappedLines.length, 2, cv.CV_32F, thetas.flat())

    console.log(mappedLines)

    const criteria = new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10, 0.1)
    const labels = new cv.Mat()
    const clusterCenters = new cv.Mat()
    cv.kmeans(thetaCv, 2, labels, criteria, 10, 0, clusterCenters)

    let horizontalLines = []
    let verticalLines = []

    for (let i = 0; i < mappedLines.length; i++) {
      if (labels.data32S[i] === 1) {
        horizontalLines.push(mappedLines[i])
      } else {
        verticalLines.push(mappedLines[i])
      }
    }

    //Seperate each group (vertical, horizontal) into two parallel lines, based only on rho
    const verticalMat = cv.matFromArray(verticalLines.length, 1, cv.CV_32F, verticalLines.map(x => [x.rho]).flat())
    const verticalLabels = new cv.Mat()
    const verticalCenters = new cv.Mat()
    cv.kmeans(verticalMat, 2, verticalLabels, criteria, 10, 0, verticalCenters)

    const verticalLeft = []
    const verticalRight = []

    for (let i = 0; i < verticalLabels.rows; i++) {
      if (verticalLabels.data32S[i] == 1) {
        verticalLeft.push(verticalLines[i])
      } else {
        verticalRight.push(verticalLines[i])
      }
    }

    const horizontalMat = cv.matFromArray(horizontalLines.length, 1, cv.CV_32F, horizontalLines.map(x => [x.rho]).flat())
    const horizontalLabels = new cv.Mat()
    const horizontalCenters = new cv.Mat()
    cv.kmeans(horizontalMat, 2, horizontalLabels, criteria, 10, 0, horizontalCenters)

    const horizontalTop = []
    const horizontalBottom = []

    for (let i = 0; i < horizontalLabels.rows; i++) {
      if (horizontalLabels.data32S[i] === 1) {
        horizontalTop.push(horizontalLines[i])
      } else {
        horizontalBottom.push(horizontalLines[i])
      }
    }

    console.log("H T", horizontalTop)
    console.log("H B", horizontalBottom)

    const finalLines = []
    finalLines.push(this.averageLines(verticalLeft))
    finalLines.push(this.averageLines(verticalRight))
    finalLines.push(this.averageLines(horizontalTop))
    finalLines.push(this.averageLines(horizontalBottom))

    console.log(finalLines)

    return finalLines
  }

  private mapLines(mat: cv.Mat): { rho: number, theta: number }[] {
    const lines = []
    for (let i = 0; i < mat.rows; i++) {
      lines.push({ rho: mat.data32F[i * 2], theta: mat.data32F[i * 2 + 1] })
    }
    return lines;
  }

  private averageLines(lines: { rho: number, theta: number }[]): { rho: number, theta: number } {
    let mean_rho = 0
    let mean_theta = 0

    for (let line of lines) {
      mean_rho += line.rho
      mean_theta += line.theta
    }

    return {
      rho: mean_rho / lines.length,
      theta: mean_theta / lines.length
    }
  }

  private getIntersections() {

  }
}
