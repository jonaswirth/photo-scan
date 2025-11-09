import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrcoessingService {
  public currentImage: string | undefined;
  public processedImages: string[] = []

  public processImage(input: string) {
    //TODO: process the image
    return input
  }
}
