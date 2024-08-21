import { Component, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-magnifier',
  templateUrl: './image-magnifier.component.html',
  styleUrls: ['./image-magnifier.component.css']
})
export class ImageMagnifierComponent implements OnChanges {
  @Input() imageSrc!: string;
  @Input() areas!: { shape: string, newCoords: string, name: string }[];
  @Input() findClickHandler!: (event: MouseEvent, area: any) => void;
  @Output() areaClick = new EventEmitter<any>();

  @ViewChild('imgMagnifier', { static: true }) imgMagnifier!: ElementRef;
  @ViewChild('magnifier', { static: true }) magnifier!: ElementRef;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageSrc']) {
      this.updateMagnifierBackground();
    }
  }

  moveMagnifier(event: MouseEvent) {
    const img = this.imgMagnifier.nativeElement;
    const magnifier = this.magnifier.nativeElement;
    const pos = this.getCursorPos(event, img);
    const zoom = 3;

    const w = magnifier.offsetWidth / 2;
    const h = magnifier.offsetHeight / 2;
    const bw = 3;

    if (pos.x > img.width - (w / zoom) || pos.x < w / zoom || pos.y > img.height - (h / zoom) || pos.y < h / zoom) {
      magnifier.style.display = 'none';
      return;
    } else {
      magnifier.style.display = 'block';
    }

    magnifier.style.left = (pos.x - w) + 'px';
    magnifier.style.top = (pos.y - h) + 'px';
    magnifier.style.backgroundPosition = `-${(pos.x * zoom - w + bw)}px -${(pos.y * zoom - h + bw)}px`;
    magnifier.style.backgroundSize = (img.width * zoom) + 'px ' + (img.height * zoom) + 'px';
  }

  getCursorPos(event: MouseEvent, img: HTMLImageElement) {
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x: x, y: y };
  }

  private updateMagnifierBackground() {
    const magnifier = this.magnifier.nativeElement;
    magnifier.style.backgroundImage = `url(${this.imageSrc})`;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const pos = this.getCursorPos(event, this.imgMagnifier.nativeElement);
    const area = this.getMapArea(pos.x, pos.y);
    console.log(this.areas)
    if (area) {
      this.handleAreaClick(event, area);
    }
  }

  getMapArea(x: number, y: number) {
    if (!this.areas) return null;

    for (const area of this.areas) {
      const coords = area.newCoords.split(',').map(Number);
      if (coords.length === 0) continue;

      if (area.shape === 'rect') {
        if (x >= coords[0] && x <= coords[2] && y >= coords[1] && y <= coords[3]) {
          return area;
        }
      } else if (area.shape === 'circle') {
        const centerX = coords[0];
        const centerY = coords[1];
        const radius = coords[2];
        if (Math.pow((x - centerX), 2) + Math.pow((y - centerY), 2) <= Math.pow(radius, 2)) {
          return area;
        }
      } else if (area.shape === 'poly') {
        if (this.isPointInPoly(coords, x, y)) {
          return area;
        }
      }
    }
    return null;
  }

  isPointInPoly(coords: number[], x: number, y: number): boolean {
    let inside = false;
    for (let i = 0, j = coords.length / 2 - 1; i < coords.length / 2; j = i++) {
      const xi = coords[i * 2], yi = coords[i * 2 + 1];
      const xj = coords[j * 2], yj = coords[j * 2 + 1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  handleAreaClick(event: MouseEvent, area: any) {
    if (this.findClickHandler && this.areas!=undefined) {
      this.findClickHandler(event, area);
    }
  }
}