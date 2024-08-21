import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/users';
  user = {
    username: "",
    userTag: '',
    password: '',
    actualMaxLevel: 0,
    actualStars: [{ level: 0, stars: 0 }],
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromLocalStorage(); // Carica i dati utente all'inizializzazione
  }

  login(userName: string, tag: string, password: string): Observable<any> {
    tag = tag.toUpperCase();
    this.user.username = userName;
    this.user.userTag = tag;
    this.user.password = password;
    return this.http.post<any>(this.apiUrl, { userName, tag, password }).pipe(
      tap(user => {
        this.user.actualMaxLevel = user.maxLevel;
        this.user.actualStars = user.stars;
        this.saveUserToLocalStorage();
      }),
      catchError(error => {
        console.error('Login failed', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  logout(): void {
    this.user = {
      username: "",
      userTag: '',
      password: '',
      actualMaxLevel: 0,
      actualStars: [{ level: 0, stars: 0 }],
    };
    this.removeUserFromLocalStorage();
    this.router.navigate(['/login']);
  }

  saveUserToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('authUser', JSON.stringify(this.user));
    }
  }

  loadUserFromLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('authUser');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  removeUserFromLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authUser');
    }
  }

  isLoggedIn(): boolean {
    return !!this.user.username;
  }

  updateUser(): Observable<any> {
    const { username, userTag, password, actualMaxLevel, actualStars } = this.user;
    console.log("Preparing to patch with:", this.apiUrl, username, userTag, actualMaxLevel, actualStars);

    return this.http.patch<any>(this.apiUrl, { userName: username, tag: userTag,password: password, maxLevel: actualMaxLevel, stars: actualStars }).pipe(
      catchError(error => {
        console.error('Update failed', error);
        return throwError(() => new Error('Update failed'));
      })
    );
  }

  calculateStars(level: number, stars: number): void {
    const existingLevelIndex = this.user.actualStars.findIndex(entry => entry.level === level);

    if(existingLevelIndex!==-1){
       if(this.user.actualStars[existingLevelIndex].stars<stars){
        this.user.actualStars[existingLevelIndex].stars = stars;
       }else{
        return;
       }
    }else{
    this.user.actualStars.push({ level, stars });
   }
   this.saveUserToLocalStorage();
  }

  nextMaxLevel(level: any): void {
    if (this.user.actualMaxLevel < level) {
      this.user.actualMaxLevel++;
      console.log("Aumento il livello a", this.user.actualMaxLevel);
    }else if(this.user.actualMaxLevel === level) {
      this.user.actualMaxLevel++;
      console.log("Aumento il livello a", this.user.actualMaxLevel);
    }else if(this.user.actualMaxLevel> level) {
      console.log("È sotto il livello massimo", this.user.actualMaxLevel);
    }
    console.log(this.user.actualMaxLevel)
    this.saveUserToLocalStorage();
  }
}