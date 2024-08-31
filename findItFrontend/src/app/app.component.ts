import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'find-it-genious';
  isPlatFormBrowser:boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object){this.isPlatFormBrowser = isPlatformBrowser(platformId)}

  ngOnInit() {
    this.scaleContent();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.scaleContent();
  }

  scaleContent() {
    if (this.isPlatFormBrowser){
    const container = document.getElementById('container');
    const wrapper = document.getElementById('app-root-wrapper');
    
    if (container && wrapper) {
      const scaleX = container.clientWidth / 1920;
      const scaleY = container.clientHeight / 1080;
      const scale = Math.min(scaleX, scaleY);

      wrapper.style.transform = `scale(${scale}) `;
    }
  }
}
}
