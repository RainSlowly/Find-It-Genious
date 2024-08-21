import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router:Router) { }

  goToNextPage(id: number, nextRoute: string) {
     this.router.navigate([`${nextRoute}/${id}`]); }

  goToSubPage(id: number, subRoute:number){
    this.router.navigate([`levels/${id}/${subRoute}`]);
  }
}
