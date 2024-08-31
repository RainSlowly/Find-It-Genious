import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private currentTimeSubject = new BehaviorSubject<number>(100);
  currentTime$ = this.currentTimeSubject.asObservable();
  private isUpSubject = new Subject<boolean>();
  isUp$ = this.isUpSubject.asObservable();
  private intervalId:any
  isUp:boolean=false;
  constructor(private ngZone: NgZone) {}

  startCountdown(): void {
    this.stopCountdown();
    let currentTime = this.currentTimeSubject.value;

    if (currentTime > 0) {
      this.ngZone.runOutsideAngular(() => {
       this.intervalId = setInterval(() => {
          currentTime--;
          if (currentTime <= 0) {
            clearInterval(this.intervalId);
            this.ngZone.run(() => this.timeIsUp());
          }
          this.ngZone.run(() => this.currentTimeSubject.next(currentTime));
        }, 1000);
      });
    } else if (currentTime === 0) {
      this.timeIsUp();
    }
  }

  stopCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resetCountdown(): void {
    this.timeisOn()
    this.currentTimeSubject.next(100); // Imposta il valore iniziale, in questo caso 60
    this.startCountdown();

  }

  timeIsUp(): void {
    console.log("tempo scaduto");
    this.isUp = true;
    this.isUpSubject.next(this.isUp);
  }

  timeisOn():void{
    this.isUp=false;
    this.isUpSubject.next(this.isUp);
  }
  
}

