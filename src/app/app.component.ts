import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'find-it-genious';
   
  ngOnInit() {
    this.scaleContent();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.scaleContent();
  }

  scaleContent() {
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
