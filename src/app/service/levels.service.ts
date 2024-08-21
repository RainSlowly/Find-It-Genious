import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LevelsService {

  apiUrl = 'http://localhost:3000/levels';
  finalUrl= 'http://localhost:3000/finalLevel';
  levelPoints:number=0;
  timeLeft:number=0;
  usedHint:number=0;
  usedZoom:boolean=false;
  notFounded:number=0;

  constructor(private http: HttpClient) { }

  getLevels(): Observable<any>{
    return this.http.get<any>(this.apiUrl)
  }
  getLevel(id:any): Observable<any>{
    return this.http.get<any>(this.apiUrl + '/level' + id)
  }
  getFinal(): Observable<any>{
    return this.http.get<any>(this.finalUrl)
  }


  obtainLevelPoints(score:number,time:number,hint:number,zoom:boolean,notFound:number):void{
    this.levelPoints=score;
    this.timeLeft=time;
    this.usedHint=hint;
    this.usedZoom=zoom;
    this.notFounded=notFound;
  }

  clearLevelPoints():void{
    this.levelPoints=0;
    this.timeLeft=0;
    this.usedHint=0;
    this.usedZoom=false;
    this.notFounded=0;
  }
}