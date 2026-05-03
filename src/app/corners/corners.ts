import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ProcessingService } from '../processing.service';
import * as cv from "@techstark/opencv-js"
import { Point } from '../types';

@Component({
  selector: 'app-corners',
  imports: [],
  templateUrl: './corners.html',
  styleUrl: './corners.scss',
})
export class Corners implements OnInit, AfterViewInit {
  private readonly CORNER_RADIUS: number = 10
  private readonly CORNER_LINE_WIDTH = 2
  private readonly EDGES_LINE_WIDTH = 1

  private processingService = inject(ProcessingService)

  @ViewChild('canvas')
  private canvas?: ElementRef<HTMLCanvasElement>
  private ctx?: CanvasRenderingContext2D
  private corners?: Point[]
  private dragPoint: number = -1


  get currentImage() {
    return this.processingService.currentImage
  }

  ngOnInit(): void {
    this.corners = this.processingService.currentImageCorners
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext("2d") ?? undefined

    cv.imshow(this.canvas?.nativeElement!, this.currentImage!)

    if (this.ctx && this.corners) {
      this.drawCorners()
    }

    this.canvas?.nativeElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas?.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas?.nativeElement.addEventListener('mouseup', () => this.dragPoint = -1)
  }

  onMouseDown(event: MouseEvent) {
    let pos = this.getPosition(event)
    this.dragPoint = this.getCornerAt(pos)
  }

  onMouseMove(event: MouseEvent) {
    if (this.corners && this.dragPoint > -1) {
      var pos = this.getPosition(event)
      this.corners[this.dragPoint].x = pos.x
      this.corners[this.dragPoint].y = pos.y
      this.drawCorners()
    }
  }

  private getPosition(event: MouseEvent) {
    var rect = this.canvas!.nativeElement.getBoundingClientRect()
    var x = event.clientX - rect.left
    var y = event.clientY - rect.top
    return { x, y }
  }

  private getCornerAt(point: Point) {
    if (!this.corners) {
      return -1
    }
    for (let i = 0; i < 4; i++) {
      if (Math.abs(this.corners[i].x - point.x) < this.CORNER_RADIUS && Math.abs(this.corners[i].y - point.y)) {
        return i
      }
    }
    return -1
  }

  private drawCorners() {
    if (!this.canvas || !this.corners || !this.ctx) {
      return
    }

    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
    //TODO: not ideal for performance to redraw the image all the time. Maybe stack two canvases above each other?
    cv.imshow(this.canvas?.nativeElement!, this.currentImage!)

    this.ctx.lineWidth = this.CORNER_LINE_WIDTH
    for (const corner of this.corners) {
      this.ctx.strokeStyle = "red"
      this.ctx.beginPath()
      this.ctx.arc(corner.x, corner.y, this.CORNER_RADIUS, 0, Math.PI * 2, true)
      this.ctx.stroke()
    }

    this.ctx.lineWidth = this.EDGES_LINE_WIDTH
    this.ctx.strokeStyle = "black"
    this.ctx.beginPath()
    this.ctx.moveTo(this.corners[0].x, this.corners[0].y)

    for (let i = 0; i < 4; i++) {
      this.ctx.lineTo(this.corners[(i + 1) % 4].x, this.corners[(i + 1) % 4].y)
    }
    this.ctx.stroke()
  }
}
