import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProcessingService } from '../processing.service';

@Component({
  selector: 'app-main',
  imports: [MatButton, MatIcon, RouterLink],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  public processingService = inject(ProcessingService)

  currentIndex = 1

}
