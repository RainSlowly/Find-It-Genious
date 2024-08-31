import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NpcService {
apiUrl = environment.apiUrl + '/npc';
apiUrlStory = environment.apiUrl + '/story';
apiUrlChara = environment.apiUrl + '/characters';
  constructor(private http: HttpClient) { }

  getNpcs(): Observable<any>{
    return this.http.get<any>(this.apiUrl)
  }
  
  getNpc(name:string): Observable<any>{
    return this.http.get<any>(this.apiUrl +'/'+name)
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
