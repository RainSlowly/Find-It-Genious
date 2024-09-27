import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AudioService } from './service/audio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'find-it-genious';
  isPlatFormBrowser:boolean;
  isDarkMode:boolean=false;

  constructor(@Inject(PLATFORM_ID) platformId: Object,
              private audioService:AudioService){
    this.isPlatFormBrowser = isPlatformBrowser(platformId)}

  ngOnInit() {
    this.scaleContent();
    this.audioService.darkMode$.subscribe((isDark)=>{
      this.isDarkMode=isDark;
      if ( this.isPlatFormBrowser && this.isDarkMode) {
        document.body.classList.add('darkMode');
      } else if(this.isPlatFormBrowser && this.isDarkMode!==true){
        document.body.classList.remove('darkMode');
      }
      console.log('Dark mode:', this.isDarkMode);

    })
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
