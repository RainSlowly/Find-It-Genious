import { Component, OnDestroy, OnInit,ChangeDetectorRef } from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { PointsService } from '../../service/points.service';
import { NpcService } from '../../service/npc.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../service/navigation.service';
import { LoginService } from '../../service/login.service';
import { Subscription } from 'rxjs';
import { AudioService } from '../../service/audio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-level-results',
  templateUrl: './level-results.component.html',
  styleUrl: './level-results.component.css'
})
export class LevelResultsComponent implements OnInit, OnDestroy{

  userName:string="";
  tag:string="";
  totalScore:number=0;
  currentLevel:number=0;
  npc:any;
  selectedNpc:any;
  npcImg:string='';
  phrase:string='';
  leaderBoard:any;
  isFirstTime:boolean=true;
  stars:number=0;
  image:string="";
  usedZoom:boolean=false;
  usedHint:number=0;
  timeLeft:number=0;
  showStars:boolean=false;
  apiUrl = environment.apiUrl;

  constructor(private levelsService:LevelsService, 
    private pointService:PointsService, 
    private npcService:NpcService,
    private route :ActivatedRoute, 
    private navigationService:NavigationService,
    private loginService: LoginService,
    private audioService: AudioService,
    private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.userName=this.loginService.user.username;
    this.audioService.play(environment.apiUrl + '/public/audio/results.mp3',"BGMusic", false)
    this.tag=this.loginService.user.userTag
    const id= this.route.snapshot.params
    console.log('Parametro id (snapshot):', id);
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Parametro id:', id);
      if (id !== null) {
        this.currentLevel = +id;
      } else {
        console.error('Parametro id è null');
      }
    }); 
    this.levelsService.getLevel(this.currentLevel).subscribe((data:any)=>{
      this.image=data.imageUrl;
     })   
    this.calculateScore();
        if([1, 3, 7].includes(this.currentLevel)) {
         if (this.totalScore>100 && this.totalScore < 1900){
           this.selectedNpc = "zweiLow";
         } if(this.totalScore == 0){
           this.selectedNpc  = "zweiZero";
         } if (this.totalScore > 1900 && this.totalScore<4000 ){
           this.selectedNpc = "zweiGood1";
         }if (this.totalScore > 4000){
           this.selectedNpc = "zweiGood2";
         } 
      }else if (this.currentLevel===2){
        if (this.totalScore>100 && this.totalScore < 1900){
          this.selectedNpc = "maidLow";
        } if(this.totalScore == 0){
          this.selectedNpc = "maidZero";
        } if (this.totalScore > 1900 ){
          this.selectedNpc ="maidGood";
        }
      }else if (this.currentLevel===4){
        if (this.totalScore>100 && this.totalScore < 1900){
          this.selectedNpc ="isoLow";
        } if(this.totalScore == 0){
          this.selectedNpc ="isoZero";
        } if (this.totalScore > 1900 ){
          this.selectedNpc = "isoGood";
        }
      } else if (this.currentLevel===5){
          this.selectedNpc ="maid5";
      } else if (this.currentLevel===6){
        if (this.totalScore>100 && this.totalScore < 1900){
          this.selectedNpc = "magdaLow";
        } if(this.totalScore == 0){
          this.selectedNpc ="magdaZero";
        } if (this.totalScore > 1900 ){
          this.selectedNpc ="magdaGood";
        }
      } else if (this.currentLevel===8){
        this.selectedNpc ="isobald8";
      }else if (this.currentLevel===9){
        this.selectedNpc ="magda9";
      }else if (this.currentLevel===10){
        this.selectedNpc ="magda10";
      }else if (this.currentLevel===11){
         this.selectedNpc ="isobald11";
      }else if (this.currentLevel===12){
        this.selectedNpc ="marsh12";
     }
    
    
    this.npcService.getNpc(this.selectedNpc).subscribe((data:any)=>{
      this.npc=data; 
      console.log("l'npc",this.npc)
        const randomIndex = Math.floor(Math.random() * this.npc.phrases.length);
        this.phrase = this.npc.phrases[randomIndex];
        this.npcImg= this.npc.img;
      
    });

      this.postPoints(this.userName,this.tag,this.currentLevel,this.totalScore);
      this.updateStars();
      this.loginService.nextMaxLevel(this.currentLevel)
      this.loginService.updateUser().subscribe(
        response => {

            console.log(response);
        },
        error => {
            console.error(error);
        }
    );
  }
      
  
  nextPage():void {
    this.navigationService.goToNextPage(this.currentLevel+1,"story");
  }

  retry():void{
    this.navigationService.goToNextPage(this.currentLevel,"level");
  }
  postPoints(name:string,tag: string, level:number,points:number):void{
    this.pointService.postPoints(name, tag, level, points).subscribe(
      response => {
        this.pointService.getLeadboard(this.currentLevel).subscribe((data:any)=>{
          this.leaderBoard=data.slice(0,10);})
        console.log('Risposta dal backend:', response);
      },
      error => {
        console.error('Errore durante la chiamata POST:', error);
      }
    );
    console.log("I just posted", name,tag, level,points);
  }

  calculateScore():void{
    let calculatedPoints =this.levelsService.levelPoints;
    this.usedZoom=this.levelsService.usedZoom
    this.usedHint=this.levelsService.usedHint
    this.timeLeft=this.levelsService.timeLeft
    if (this.usedZoom) {
        calculatedPoints -= 500;
    } 
    if (this.usedHint > 0) {
        calculatedPoints -= 200 * this.levelsService.usedHint;
    } 
    if (this.levelsService.notFounded > 0) {
        calculatedPoints -= 150 * this.levelsService.notFounded;
    } 
    if (this.levelsService.usedHint === 0) {
        calculatedPoints += 500;
    } 
    if (this.levelsService.timeLeft > 0) {
        calculatedPoints += this.levelsService.timeLeft * 50;
    }

    this.totalScore += (calculatedPoints<0)? 0 :calculatedPoints;
    this.calculateStars();
  }

calculateStars():void{
  console.log('Initial Stars:', this.stars);
  if (this.totalScore > 3000) {
    this.stars++;
    console.log('Stars after score check:', this.stars);
  }
  if (this.levelsService.timeLeft > 19) {
    this.stars++;
    console.log('Stars after time check:', this.stars);
  }
  if (!this.levelsService.usedZoom && this.levelsService.usedHint === 0) {
    this.stars++;
    console.log('Stars after zoom/hint check:', this.stars);
  }
  console.log(this.stars)
  this.cdr.detectChanges();
  this.showStars=true;
}

  updateStars():void{
    this.loginService.calculateStars(this.currentLevel,this.stars)
  }
  playSound(): void{
    this.audioService.play(environment.apiUrl + '/public/audio/buttonHover.mp3', 'SFX', false)
  }
  

  ngOnDestroy(): void {
    this.audioService.stop(environment.apiUrl + '/public/audio/results.mp3')
  }
}
