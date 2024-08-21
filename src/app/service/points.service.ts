import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointsService {

  apiUrl = 'http://localhost:3000/scores'
  thisLevelPoints:number=0;
  totalPoints:number=0;
  currentPoints: number=0;

  constructor(private http: HttpClient) { }

  getLeadboard(currentLevel:number): Observable<any>{
    return this.http.get<any>(this.apiUrl+'/'+currentLevel)
  }

  getAllLeaderboard():Observable<any>{
    return this.http.get<any>(this.apiUrl)
  }

  postPoints(name:string,tag: string, level:number,points:number):Observable<any>{
    const options = { responseType: 'text' as 'json' }
    console.log('Sending POST request:',this.apiUrl, { userName: name, tag: tag, levelName: level, points: points });
    return this.http.post<any>(this.apiUrl, { userName: name, tag: tag, levelName: level, points: points }, options);
  }
}
