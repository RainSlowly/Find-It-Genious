import { Component, HostListener, OnDestroy, OnInit, Inject, PLATFORM_ID, AfterViewInit, AfterViewChecked } from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { TimeService } from '../../service/time.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../service/navigation.service';
import { delay } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { NpcService } from '../../service/npc.service';
import { LoginService } from '../../service/login.service';
import { AudioService } from '../../service/audio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-levels',
  templateUrl: './levels.component.html',
  styleUrl: './levels.component.css'
})
export class LevelsComponent implements OnInit, OnDestroy, AfterViewChecked{
    
  // logica del livello generale
    images:any;
    imageUrlOk= false;
    currentPoints:number=0;
    currentLevel:number = 0;
    maxLevel:number=0
    private timerSub! : Subscription;
    private isUpSub!: Subscription;
    currentTime :number = 100;
    totalTime= 100;
    timeModifier=this.currentTime/this.totalTime;
    usedHint:number=0;
    usedZoom:boolean=false;
    zoomActive:boolean=false;
    notFounded:number=0;
    areas:any[]=[];
    hintVisible:boolean=false
    hintPosition = { x: 0, y: 0 };
    hintImage:string=environment.apiUrl + "/public/images/hint.gif";
    correctVisible = false;
    clickPosition = { x: 0, y: 0 };
    correctImage:string=environment.apiUrl + "/public/images/correct.gif";
    isPlatFormBrowser:boolean;
    mapUpdated:number=0;
    npc:any;
    npcLines:string[]=[];
    npcLine:string="";
    cdLeft: number = 30; 
    dashOffset: number = 0;
    timerVisible: boolean = false;
    private totalCd: number = 30; 
    circumference: number = 2 * Math.PI * 15.9155;
    speechVisible:boolean=false;
    private img: HTMLImageElement | null = null;
    private document: Document | null=null;
    fadeOut:boolean=false;
    apiUrl = environment.apiUrl;

  constructor(@Inject(PLATFORM_ID) platformId: Object,
              private levelsService: LevelsService, 
              private timeService: TimeService, 
              private route :ActivatedRoute, 
              private navigationService:NavigationService, 
              private npcService: NpcService,
              private loginService: LoginService,
              private audioService: AudioService
            )
  { this.isPlatFormBrowser = isPlatformBrowser(platformId), 
    this.findClick = this.findClick.bind(this);
  }

  ngOnInit(): void {
    this.maxLevel=this.loginService.user.actualMaxLevel
    console.log(this.loginService.user)
    const id= this.route.snapshot.params
    console.log('Parametro id (snapshot):', id);
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Parametro id:', id);
      console.log(this.currentLevel)
      if (id !== null) {
        this.currentLevel = +id;
        if(this.currentLevel>this.maxLevel){
          this.currentLevel=this.maxLevel
          this.navigationService.goToNextPage(this.currentLevel,"level")
        }
      } else {
        console.error('Parametro id è null');
      }
    });
   this.loadLevel()
     
    this.npcService.getLevelNpc(this.currentLevel).subscribe((data:any)=>{
      this.npc=data;
      this.npcLines=this.npc.phrases
      if (this.isPlatFormBrowser && this.images && this.images.music && this.images.music.src && this.images.music.type) {
        this.audioService.play(this.images.music.src, this.images.music.type, true)
      }
      this.levelInitialState()
    })
    
    };

    levelInitialState():void{
      this.resetDashOffset()
      
      this.images.areas.forEach((area:any) => {
        area.founded = false;
      });
      this.currentPoints=0;
      this.usedHint=0;
      this.usedZoom=false;
      this.zoomActive=false;
      this.speechVisible=false;
      console.log(this.areas)
      this.images.areas.forEach((area:any) => {
        area.founded = false;
      });
      if(this.images.isSpecial)
      this.images.objectives.forEach((objective:any) => {
        objective.checked=false;
      });
      this.timeService.stopCountdown()
      this.timeService.resetCountdown();
      this.timeService.startCountdown();

      this.timerSub= this.timeService.currentTime$.subscribe(time => {
          this.currentTime = time;
          if (typeof document !== 'undefined'){
          const progress = document.querySelector(".progress") as HTMLDivElement;
          const value = this.currentTime/this.totalTime*100;
          progress.style.setProperty("--progress", `${value}%`);
          this.updateMap()
        }
        });
        this.isUpSub! = this.timeService.isUp$.subscribe(isUp => {
          if (isUp) {
            this.endLevel();
          }
        });
    }

    async loadLevel() {
      try {
        const data: any = await lastValueFrom(this.levelsService.getLevel(this.currentLevel));
        this.images = data;
        this.areas = this.images.areas;
        this.updateMap(); // Chiamata a updateMap dopo che i dati sono stati caricati
      } catch (error) {
        console.error('Errore nel caricamento dei dati del livello:', error);
      }
    }

    ngAfterViewChecked(): void {
     if (this.timeService.isUp === true) {
        this.endLevel();
      }
    }
    

    ngOnDestroy(): void {
      if (this.timerSub) {
        this.timerSub.unsubscribe();
      }
      this.timeService.stopCountdown();
      if (this.isPlatFormBrowser && this.images && this.images.music && this.images.music.src) {
        this.audioService.stop(this.images.music.src);
      }
    }
    
  resetLevel():void{
    this.fadeOut=true;
    this.timeService.resetCountdown();
    this.timeService.stopCountdown()
    setTimeout(()=>{
      this.levelInitialState()
    },3000)
    setTimeout(()=>{
      this.fadeOut=false;
    },2800)
    
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateMap();
    console.log(this.images)
    console.log(this.images.areas)
  }

  updateMap(): void{
    if (this.images && typeof document !== 'undefined' && this.isPlatFormBrowser){
      const img = document.getElementById('findImage') as HTMLImageElement;
      if (img) {
        const currentW = img.clientWidth;
        const currentH = img.clientHeight;
        const wRatio = currentW / this.images.originalWidth;
        const hRatio = currentH / this.images.originalHeight;
        this.images.areas.forEach((area: any) => {
          const originalCoords = area.coords;
          const newCoords = originalCoords.map((coord: number, index: number) => {
            return index % 2 === 0 ? Math.round(coord * wRatio) : Math.round(coord * hRatio);
          });
          area.newCoords = newCoords.join(',');
        });
      } else {
        console.error('Element with ID findImage not found.');
      }
    }
  }

  findClick(event:MouseEvent, area:any):void {
      event.preventDefault();
      if (!area.founded) {
        let possibleLines=this.npcLines.slice(0,5)
        this.npcLine=possibleLines[Math.floor(Math.random()*possibleLines.length)]
        this.speechVisible=true;
        this.timeModifier = this.currentTime / this.totalTime;
        const obtainedPoints = area.points * this.timeModifier;
        this.currentPoints += obtainedPoints;
        this.calculateCenter(area)
        this.clickPosition = { 
          x: area.centerX-60, 
          y: area.centerY-48
        };
        console.log(this.clickPosition)
        if(this.currentLevel!== 12){
        this.correctImage = `${environment.apiUrl}/public/images/correct.gif?${new Date().getTime()}`;
        this.correctVisible = true;
        this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)
        setTimeout(() => {
          this.correctVisible = false;
        }, 1760);}else if (this.currentLevel===12){
          this.correctImage = `${environment.apiUrl}/public/images/bglitch.gif?${new Date().getTime()}`;
          this.correctVisible = true;
          this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)
          setTimeout(() => {
            this.correctVisible = false;
          }, 1400);
        }
        area.founded = true; 
        
        const allFounded = this.images.areas.every((area: any) => area.founded)
        console.log(allFounded)
        if (this.images.isSpecial===true){
        this.updateObjectives()
      } else if (allFounded) {
          this.endLevel();
        } 
        }
      }

  updateObjectives():void{
      this.images.objectives.forEach((objective:any) => {
        if (!objective.checked){
        objective.checked = objective.areas.every((areaName:string)=> 
          this.images.areas.some((area:any) => area.name === areaName && area.founded
          )
        )}
        if (this.images && this.images.areas){
           const allChecked = this.images.objectives.every((objective: any) => objective.checked);
        if (allChecked) {
          this.endLevel();
        }
        }
      })
  }

  calculateCenter(area: any) {
    const coords = area.newCoords.split(',').map(Number);

    let centerX:number=0, centerY:number=0, width:number=0, height:number=0;

    if (area.shape === 'rect') {
        // Calcola il centro
        centerX = (coords[0] + coords[2]) / 2;
        centerY = (coords[1] + coords[3]) / 2;
        // Calcola larghezza e altezza
        width = Math.abs(coords[2] - coords[0]);
        height = Math.abs(coords[3] - coords[1]);

    } else if (area.shape === 'circle') {
        // Il centro è già definito dalle coordinate
        centerX = coords[0];
        centerY = coords[1];
        // Larghezza e altezza sono entrambe pari al diametro
        width = height = coords[2] * 2;  // Il raggio è coords[2]

    } else if (area.shape === 'poly') {
        let sumX = 0, sumY = 0;
        const numPoints = coords.length / 2;
        let minX = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < coords.length; i += 2) {
            const x = coords[i];
            const y = coords[i + 1];
            sumX += x;
            sumY += y;
            // Trova i minimi e massimi per calcolare larghezza e altezza
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        // Calcola il centro
        centerX = sumX / numPoints;
        centerY = sumY / numPoints;
        // Calcola larghezza e altezza
        width = maxX - minX;
        height = maxY - minY;
    }

    
    // Salva la larghezza e l'altezza medie nell'oggetto area
    area.width = (width+10>100)? 100 : width+10;
    area.height = (height+10>100)? 100 : height+10;

    area.centerX = centerX - width/2.4;
    area.centerY = centerY -height/3.25 ;

}
  activateZoom():void{
    this.usedZoom=true;
    if(this.zoomActive===false){
      this.audioService.play(environment.apiUrl + '/public/audio/zoomin.mp3', 'SFX', false);
      this.npcLine=this.npcLines[7]
      this.speechVisible=true;
      this.zoomActive=true;
    }else if(this.zoomActive===true){
      this.audioService.play(environment.apiUrl + '/public/audio/zoomout.mp3', 'SFX', false);
      this.zoomActive=false;
    }
  }
  
  startCD(): void {
    this.timerVisible = true;
    this.cdLeft = this.totalCd; 
    this.resetDashOffset();
    
    const interval = setInterval(() => {
      if (this.cdLeft  > 0) {
        this.cdLeft--;
        this.updateDashOffset();
      } else {
        clearInterval(interval);
        this.timerVisible = false;
      }
    }, 100);
  }
  resetDashOffset(): void {
    this.dashOffset = this.circumference;
  }

  updateDashOffset(): void {
    const progress = (this.totalCd - this.cdLeft) / this.totalCd;
    this.dashOffset = this.circumference * (1 - progress);
  }

  askAHint():void{
    this.audioService.play(environment.apiUrl + '/public/audio/hint.mp3', 'SFX', false);
    this.usedHint++;
    this.speechVisible=true;
    let possibleLines=this.npcLines.slice(5,7)
    this.npcLine=possibleLines[Math.floor(Math.random()*possibleLines.length)]
    this.startCD();
    const notFoundedAreas =this.images.areas.filter((area:any)=> !area.founded);
   if (notFoundedAreas.length>0){
    const randomIndex = Math.floor(Math.random() * notFoundedAreas.length);
    const areaToShow = notFoundedAreas[randomIndex];
    this.showHint(areaToShow);
   }
  }

  showHint(area:any){
     const coords = area.newCoords.split(',').map(Number);

    let hintX, hintY;
  
    // Calcola il centro in base alla forma
    if (area.shape === 'rect') {
      hintX = (coords[0] + coords[2]) / 2;
      hintY = (coords[1] + coords[3]) / 2;
    } else if (area.shape === 'circle') {
      hintX = coords[0];
      hintY = coords[1];
    } else if (area.shape === 'poly') {
      let sumX = 0, sumY = 0;
      const numPoints = coords.length / 2;
      for (let i = 0; i < coords.length; i += 2) {
        sumX += coords[i];
        sumY += coords[i + 1];
      }
      hintX = sumX / numPoints;
      hintY = sumY / numPoints;
    }
  
    this.hintPosition.x = hintX - 93;
    this.hintPosition.y = hintY - 87; 
    this.hintImage = `${environment.apiUrl}/public/images/hint.gif?${new Date().getTime()}`;
    this.hintVisible=true;
    setTimeout(()=>{
    this.hintVisible=false},2240)
    console.log(this.hintPosition.x,this.hintPosition.y,area)
  }

  endLevel():void{
    this.audioService.stop(this.images.music.src);
    this.navigationService.goToNextPage(this.currentLevel,"results");
     this.notFounded= this.images.areas.filter((area:any) => area.founded === false  
        ).length;
    this.levelsService.obtainLevelPoints(this.currentPoints,this.currentTime,this.usedHint,this.usedZoom,this.notFounded);
    console.log(this.currentPoints,this.currentTime,this.usedHint,this.usedZoom,this.notFounded)
  }
}