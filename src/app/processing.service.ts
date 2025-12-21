import { Injectable } from '@angular/core';
import cv, { CV_32F } from "@techstark/opencv-js";
import { Line, Point } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProcessingService {
  public currentImage: HTMLCanvasElement | undefined
  public processedImages: string[] = []

  public processImage(input: cv.Mat): Point[] {
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
    return this.findEdges(dst)
  }

  /**
   * Find all lines using hough lines, then first seperate vertical and horizontal lines by rho and then seperate each into two clusters based on theta
   * @param mat 
   * @returns 
   */
  //TODO: refactor this horrible code
  private findEdges(mat: cv.Mat): Point[] {
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

    const left = this.averageLines(verticalLeft)
    const right = this.averageLines(verticalRight)
    const top = this.averageLines(horizontalTop)
    const bottom = this.averageLines(horizontalBottom)

    console.log(left)
    console.log(right)
    console.log(top)
    console.log(bottom)

    const topLeft = this.findIntersection(top, left)
    const topRight = this.findIntersection(top, right)
    const bottomLeft = this.findIntersection(bottom, left)
    const bottomRight = this.findIntersection(bottom, right)

    return [topLeft, topRight, bottomLeft, bottomRight]
  }

  private mapLines(mat: cv.Mat): Line[] {
    const lines = []
    for (let i = 0; i < mat.rows; i++) {
      lines.push({ rho: mat.data32F[i * 2], theta: mat.data32F[i * 2 + 1] })
    }
    return lines;
  }

  private averageLines(lines: Line[]): Line {
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

  //Calculate intersection given two points on each line: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
  private findIntersection(line1: Line, line2: Line): Point {
    let a = Math.cos(line1.theta);
    let b = Math.sin(line1.theta);
    let x = a * line1.rho;
    let y = b * line1.rho;

    let x1 = x - 100 * b
    let y1 = y + 100 * a
    let x2 = x + 100 * b
    let y2 = x - 100 * a

    a = Math.cos(line2.theta)
    b = Math.sin(line2.theta)
    x = a * line2.rho
    y = b * line2.rho

    let x3 = x - 100 * b
    let y3 = y + 100 * a
    let x4 = x + 100 * b
    let y4 = y - 100 * a

    return {
      x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
      y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
    }
  }
}
