import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LevelsService {

  apiUrl = environment.apiUrl + '/levels';
  finalUrl= environment.apiUrl + '/finalLevel';
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