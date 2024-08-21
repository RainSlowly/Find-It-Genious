import { Component, OnInit , HostListener} from '@angular/core';
import { PointsService } from '../../service/points.service';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { LevelsService } from '../../service/levels.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-leadboard',
  templateUrl: './leadboard.component.html',
  styleUrl: './leadboard.component.css'
})
export class LeadboardComponent implements OnInit{

  leaderboards: any[] = [];
  maxLevel:number = 0;
  levels:any[] = [];
  TAG:string = ""
  constructor(private pointService : PointsService,
     private route:ActivatedRoute, 
     private loginService:LoginService,
    private levelsService:LevelsService){}

  ngOnInit(): void {
   this.maxLevel=(this.loginService.user.actualMaxLevel>12)?12 : this.loginService.user.actualMaxLevel;
   this.TAG= this.loginService.user.userTag
   this.levelsService.getLevels().subscribe((data:any)=>{
    this.levels=data;
   })
   this.loadLeaderBoard();
   
  }
  
  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent): void {
    const container = document.querySelector('.allLeads') as HTMLElement;
  console.log(event,"scroll")
    if (container) {
      event.preventDefault();
  
      // Moltiplica deltaY per un fattore per regolare la velocità dello scroll
      container.scrollLeft += event.deltaY * 18; 
    }
  }
  scroll(container: HTMLDivElement, direction: 'left' | 'right') {
    const scrollAmount = container.offsetWidth / 3; // Scrolla di 1/3 della larghezza visibile
  
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  }
  loadLeaderBoard():void{
    const requests = [];
    for (let i = 1; i <= this.maxLevel; i++) {
      requests.push(this.pointService.getLeadboard(i));
    }
    forkJoin(requests).subscribe(
      results => {
        this.leaderboards = results;
        console.log(this.leaderboards)
      },
      error => {
        console.error('Error loading leaderboards:', error);
      }
    );
  }
}
