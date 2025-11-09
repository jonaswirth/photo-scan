import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { PrcoessingService as ProcessingService } from '../processing.service';

@Component({
  selector: 'app-camera',
  imports: [MatButton, MatIcon, RouterLink],
  templateUrl: './camera.html',
  styleUrl: './camera.scss',
})
export class Camera implements OnInit, OnDestroy {
  private processingService = inject(ProcessingService)
  private router = inject(Router)

  private video: HTMLVideoElement | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private debugImage: HTMLImageElement | undefined;
  private mediaStream: MediaStream | undefined;

  //TODO: Set resolution dynamically
  width = 500;
  height = 707;

  ngOnInit(): void {
    this.video = document.getElementById("video") as HTMLVideoElement
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement

    navigator.mediaDevices?.getUserMedia({
      video: { width: { exact: this.width }, height: { exact: this.height } },
    })
      .then((localMediaStream) => {
        if (this.video == null) {
          throw "Video element not found"
        }
        this.mediaStream = localMediaStream
        this.video.srcObject = this.mediaStream

        this.video.setAttribute("width", `${this.width}px`)
        this.video.setAttribute("height", `${this.height}px`)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  ngOnDestroy(): void {
    this.mediaStream?.getVideoTracks().forEach(s => s.stop())
  }

  capture(): void {
    const context = this.canvas?.getContext("2d")

    context?.drawImage(this.video!, 0, 0, this.width, this.height)
    const data = this.canvas?.toDataURL("image/png")

    this.processingService.currentImage = data;
    this.router.navigate(['/processing'])
  }
}
