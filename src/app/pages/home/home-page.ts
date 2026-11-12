import { isPlatformServer } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly renderedOn = isPlatformServer(inject(PLATFORM_ID)) ? 'server' : 'browser';
}
