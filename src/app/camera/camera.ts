import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-camera',
  imports: [MatButton, MatIcon, RouterLink],
  templateUrl: './camera.html',
  styleUrl: './camera.scss',
})
export class Camera implements OnInit {
  private video: HTMLVideoElement | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private debugImage: HTMLImageElement | undefined;

  private width = 500; //fixed
  private height = 500; //calculated based on aspect ratio

  ngOnInit(): void {
    this.video = document.getElementById("video") as HTMLVideoElement
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement
    this.debugImage = document.getElementById("debug") as HTMLImageElement

    navigator.mediaDevices?.getUserMedia({ video: true })
      .then((localMediaStream) => {
        if (this.video == null) {
          throw "Video element not found"
        }
        this.video.srcObject = localMediaStream
        //this.height = this.video.videoHeight / (this.video.videoWidth / this.width)
        this.video.setAttribute("width", `${this.width}px`)
        this.video.setAttribute("height", `${this.height}px`)

        console.log(this.width)
        console.log(this.height)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  capture(): void {

    console.log(this.video)
    console.log(this.canvas)
    console.log(this.debugImage)

    const context = this.canvas?.getContext("2d")

    context?.drawImage(this.video!, 0, 0, this.width, this.height)
    const data = this.canvas?.toDataURL("image/png")

    this.debugImage!.src = data!.toString()
  }
}
