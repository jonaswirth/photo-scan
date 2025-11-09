import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [MatButton, MatIcon, RouterLink],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {

}
