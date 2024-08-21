import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NpcService {
apiUrl = 'http://localhost:3000/npc'
apiUrlStory = "http://localhost:3000/story"
apiUrlChara = "http://localhost:3000/characters"
  constructor(private http: HttpClient) { }

  getNpc(): Observable<any>{
    return this.http.get<any>(this.apiUrl)
  }
  
  getStory(id:any):Observable<any>{
    return this.http.get<any>(this.apiUrlStory + '/story'+ id)
  }

  getCharacterProfiles():Observable<any>{
    return this.http.get<any>(this.apiUrlChara)
  }

  getLevelNpc(id:any):Observable<any>{
    return this.http.get<any>(this.apiUrl +'/level'+id)
  }
}
