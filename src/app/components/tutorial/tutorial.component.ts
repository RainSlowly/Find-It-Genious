import { Component, HostListener, OnDestroy, OnInit, Inject, PLATFORM_ID, AfterViewInit, AfterViewChecked } from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { TimeService } from '../../service/time.service';
import { Subscription, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../service/navigation.service';
import { delay } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { NpcService } from '../../service/npc.service';
import { LoginService } from '../../service/login.service';
import { AudioService } from '../../service/audio.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.css'
})
export class TutorialComponent implements OnInit, OnDestroy, AfterViewChecked{
    
    // logica del livello generale
      images:any;
      imageUrlOk= false;
      currentPoints:number=0;
      currentLevel:number = 0;
      maxLevel:number=0
      private timerSub! : Subscription;
      private isUpSub!: Subscription;
      currentTime :number = 60;
      totalTime= 60;
      timeModifier=this.currentTime/this.totalTime;
      usedHint:number=0;
      usedZoom:boolean=false;
      notFounded:number=0;
      areas:any;
      hintVisible:boolean=false
      hintPosition = { x: 0, y: 0 };
      hintImage:string="http://localhost:3000/public/images/hint.gif";
      correctVisible = false;
      clickPosition = { x: 0, y: 0 };
      correctImage:string="http://localhost:3000/public/images/hint.gif";
      isPlatFormBrowser:boolean;
      mapUpdated:number=0;
      npc:any[]=[];
      currentNpc:any;
      currentLine:string='';
      showDialogue:boolean=false;
      cdLeft: number = 30; 
      dashOffset: number = 0;
      timerVisible: boolean = false;
      private totalCd: number = 30; 
      circumference: number = 2 * Math.PI * 15.9155;
      speechVisible:boolean=false;
      blockClick:boolean=false;
      pointImage:string="http://localhost:3000/public/images/pointer.png";
      pointVisible:boolean=false;
      pointPosition= {x:0, y:0};
      hintActive:boolean=false;
      progressVisible:boolean=false;
      zoomVisible:boolean=false;
      
  
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
     this.levelInitialState()
      };
  
      levelInitialState():void{
        this.levelsService.getLevel(0).subscribe((data:any)=>{
          this.images=data;
          this.areas=this.images.areas;
          if (this.isPlatFormBrowser && this.images && this.images.music && this.images.music.src && this.images.music.type) {
            this.audioService.play(this.images.music.src, this.images.music.type, true)
          }
        });
        this.npcService.getNpc().subscribe((data:any)=>{
          this.npc=data;
          this.currentNpc=this.npc.find(npc=>npc.name==="tutorialMarsh")
          this.currentLine=this.currentNpc.phrases[0]
        })
        this.resetDashOffset()
        this.showDialogue=true;
        this.blockClick=true;
        window.setTimeout(() => {
          this.showDialogue=false;},8800);
        window.setTimeout(() => {
          this.showDialogue=true;
          this.currentLine=this.currentNpc.phrases[1];
      }, 9000);
      window.setTimeout(() => {
        this.showDialogue=false;},17800);
        window.setTimeout(() => {
           this.pointVisible=true;
           this.showDialogue=true;
           this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
           this.currentLine=this.currentNpc.phrases[0]
           this.blockClick=false;
       }, 18000);
        
      }
      
      ngAfterViewChecked(): void {
          if (this.isPlatFormBrowser && this.mapUpdated<3 && this.images) {
            this.updateMap();
            this.showPointer(this.images.areas[3])
            console.log(this.pointPosition)
            this.mapUpdated ++ ; 
            
            console.log("ho updetato dal view",this.mapUpdated)}       
      }
      
  
    ngOnDestroy():void {
      if (this.timerSub) {
        this.timerSub.unsubscribe();
      }
      this.timeService.stopCountdown();
      this.audioService.stop(this.images.music.src);
    }
  
    resetLevel():void{
      this.levelInitialState()
    }
  
    @HostListener('window:resize', ['$event'])
    onResize() {
      this.updateMap();
      console.log(this.images)
      console.log(this.images.areas)
      
    }
  
    updateMap(): void{
      if (this.images && typeof document !== 'undefined'){
        const img = document.getElementById('findImage') as HTMLImageElement;
        if (img) {
          const currentW = img.clientWidth;
          const currentH = img.clientHeight;
          const wRatio = currentW / this.images.originalWidth;
          const hRatio = currentH / this.images.originalHeight;
    
          console.log(currentH, currentW);
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
    this.showDialogue=false;
   if(area===this.images.areas[3]){
          setTimeout(() => {
            this.showDialogue=true;;
          }, 760);   
      this.currentNpc=this.npc.find(npc=>npc.name==="tutorialMarsh")
       this.currentLine=this.currentNpc.phrases[2]
        this.pointVisible=false;
        area.founded=true
        this.timeModifier = this.currentTime / this.totalTime;
        const obtainedPoints = area.points * this.timeModifier;
        this.currentPoints += obtainedPoints;
        this.clickPosition = { 
          x: event.clientX - 485, 
          y: event.clientY - 150
        };
    
        this.correctImage = `http://localhost:3000/public/images/correct.gif?${new Date().getTime()}`;
        this.correctVisible = true;
        this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)
        setTimeout(() => {
          this.correctVisible = false;
        }, 1760);
        setTimeout(() => {
          this.showDialogue = false;
          this.blockClick=true;
          this.timeService.resetCountdown();
          this.progressVisible=true;
      }, 6500);
      setTimeout(() => {
        this.showDialogue=true;
        this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
        this.currentLine=this.currentNpc.phrases[1]
        this.timeService.startCountdown();
        this.timerSub= this.timeService.currentTime$.subscribe(time => {
            this.currentTime = time;
            if (typeof document !== 'undefined'){
            const progress = document.querySelector(".progress") as HTMLDivElement;
            const value = this.currentTime/this.totalTime*100;
            progress.style.setProperty("--progress", `${value}%`);
          }
          });
    }, 6600);

      setTimeout(() => {
        this.showDialogue=false;
        this.images.areas[2].founded=false;
        this.showPointer(this.images.areas[2])},12500);
        setTimeout(() => {
           this.pointVisible=true;
           this.currentNpc=this.npc.find(npc=>npc.name==="tutorialMarsh")
           this.currentLine=this.currentNpc.phrases[3]
           this.blockClick=false;
       }, 12600); 
      }
  if(area===this.images.areas[2]){
        this.showDialogue=true;
        this.pointVisible=false;
        this.timeService.stopCountdown();
        this.images.areas[1].founded=false;
        this.images.areas[0].founded=false;
        this.images.areas[4].founded=false; 
        area.founded=true
        this.timeModifier = this.currentTime / this.totalTime;
        const obtainedPoints = area.points * this.timeModifier;
        this.currentPoints += obtainedPoints;
        this.clickPosition = { 
          x: event.clientX - 485, 
          y: event.clientY - 150
        };
        this.updateObjectives()
        this.correctImage = `http://localhost:3000/public/images/correct.gif?${new Date().getTime()}`;
        this.correctVisible = true;
        this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)
        setTimeout(() => {
          this.correctVisible = false;
        }, 1760);
      setTimeout(() => {
      this.showDialogue=false;
      },5000);
      setTimeout(() => {
        this.showDialogue=true;
      this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
      this.currentLine=this.currentNpc.phrases[2]
      this.blockClick=true;
      },5100); 
      setTimeout(() => {
        this.showDialogue=false;
        },9500);
       setTimeout(() => {
        this.showDialogue=true;
        this.currentNpc=this.npc.find(npc=>npc.name==="tutorialMarsh")
        this.currentLine=this.currentNpc.phrases[4]
        },9600);
        setTimeout(() => {
          this.showDialogue=false;
          },13500);
         setTimeout(() => {
          this.showDialogue=true;
          this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
          this.currentLine=this.currentNpc.phrases[3]
          this.hintActive=true;
          },13600);
          setTimeout(() => {
            this.showDialogue=false;
            },17800);
            setTimeout(() => {
              this.showDialogue=true;
              this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
              this.currentLine=this.currentNpc.phrases[4]
              this.showPointer('hint');
              this.pointVisible=true;
              this.blockClick=false;
              this.timeService.startCountdown()
              },17900);
        }
        if(area===this.images.areas[1]){
          this.currentNpc=this.npc.find(npc=>npc.name==="tutorialMarsh")
        this.currentLine=this.currentNpc.phrases[5]
          this.showDialogue=true;
          this.timeService.stopCountdown();
          area.founded=true
          this.timeModifier = this.currentTime / this.totalTime;
          const obtainedPoints = area.points * this.timeModifier;
          this.currentPoints += obtainedPoints;
          this.clickPosition = { 
            x: event.clientX - 485, 
            y: event.clientY - 150
          };
          this.updateObjectives()     
            
        this.correctImage = `http://localhost:3000/public/images/correct.gif?${new Date().getTime()}`;
        this.correctVisible = true;
        this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)
        setTimeout(() => {
          this.correctVisible = false;
        }, 1760);
          setTimeout(() => {
            this.showDialogue=false;
            },5000);
            setTimeout(() => {
              this.showDialogue=true;
           
            this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
            this.currentLine=this.currentNpc.phrases[5]
            this.blockClick=true;
            },5100); 
            setTimeout(() => {
              this.showDialogue=false;
              },9500);
             setTimeout(() => {
              this.showDialogue=true;
              this.zoomVisible=true;
              this.showPointer('zoom');
              this.pointVisible=true;
              this.blockClick=false;
              this.currentNpc=this.npc.find(npc=>npc.name==="tutorialEzio")
              this.currentLine=this.currentNpc.phrases[6]
              },9600);
        }if(area===this.images.areas[0]){
          area.founded=true
          this.timeModifier = this.currentTime / this.totalTime;
          const obtainedPoints = area.points * this.timeModifier;
          this.currentPoints += obtainedPoints;
          this.clickPosition = { 
            x: event.clientX - 485, 
            y: event.clientY - 150
          };
          
        this.correctImage = `http://localhost:3000/public/images/correct.gif?${new Date().getTime()}`;
        this.correctVisible = true;
        this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)

        setTimeout(() => {
          this.correctVisible = false;
        }, 1760);
          this.updateObjectives()
        }if(area===this.images.areas[4]){
          this.loginService.nextMaxLevel(1);
          area.founded=true
          this.timeModifier = this.currentTime / this.totalTime;
          const obtainedPoints = area.points * this.timeModifier;
          this.currentPoints += obtainedPoints;
          this.clickPosition = { 
            x: event.clientX - 485, 
            y: event.clientY - 150
          };
        this.correctImage = `http://localhost:3000/public/images/correct.gif?${new Date().getTime()}`;
        this.correctVisible = true;
        this.audioService.play(this.images.foundSFX.src,this.images.foundSFX.type, false)

        setTimeout(() => {
          this.correctVisible = false;
        }, 1760);
          this.updateObjectives()
        }
        if (!area.founded) {
          const allFounded = this.images.areas.every((area: any) => area.founded)
          console.log(allFounded)
          if (this.images.isSpecial===true){
          this.updateObjectives()
          console.log (this.images.objectives)
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
  
    activateZoom():void{
      this.usedZoom=true;
      this.showDialogue=true;
      this.pointVisible=false;
      this.blockClick=false;
      this.currentNpc=this.npc.find(npc=>npc.name==="tutorialMarsh")
      this.currentLine=this.currentNpc.phrases[6]
      setTimeout(() => {
        this.showDialogue=false;
        },5500);
      
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
      this.audioService.play('http://localhost:3000/public/audio/hint.mp3', 'SFX', false);
      if (this.usedHint===0){
        this.showHint(this.images.areas[1])
        this.showDialogue=false;
        this.pointVisible=false;
        this.usedHint++;
       this.startCD();
      }
      if (this.usedHint>0 && this.images.areas[1].founded===true){
      const notFoundedAreas =this.images.areas.filter((area:any)=> !area.founded);
     if (notFoundedAreas.length>0){
      const randomIndex = Math.floor(Math.random() * notFoundedAreas.length);
      const areaToShow = notFoundedAreas[randomIndex];
      this.showHint(areaToShow);
      this.usedHint++;
      this.startCD();
     }};
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
    
      this.hintPosition.x = hintX - 92;
      this.hintPosition.y = hintY - 85; 
      this.hintImage = `http://localhost:3000/public/images/hint.gif?${new Date().getTime()}`;
      this.hintVisible=true;
      setTimeout(()=>{
      this.hintVisible=false},2240)
      console.log(this.hintPosition.x,this.hintPosition.y,area)
    }
  
    showPointer(area:any){
      
 
     let pointerX, pointerY;
  
     if (area.shape === 'rect') {
      const coords = area.newCoords.split(',').map(Number);
      pointerX = (coords[0] + coords[2]) / 2;
      pointerY = (coords[1] + coords[3]) / 2;
     } else if (area.shape === 'circle') {
      const coords = area.newCoords.split(',').map(Number);
      pointerX = coords[0];
      pointerY = coords[1];
     } else if (area.shape === 'poly') {
      const coords = area.newCoords.split(',').map(Number);
       let sumX = 0, sumY = 0;
       const numPoints = coords.length / 2;
       for (let i = 0; i < coords.length; i += 2) {
         sumX += coords[i];
         sumY += coords[i + 1];
       }
       pointerX= sumX / numPoints;
       pointerY = sumY / numPoints;
     }else if (area==='hint') {
      pointerX = -110;
      pointerY = 150;
     }else if (area==='zoom') {
      pointerX = -110;
      pointerY = 75;
     }
   
     this.pointPosition.x = pointerX +250;
     this.pointPosition.y = pointerY + 75; }

    endLevel():void{
      this.navigationService.goToNextPage(1,"story");
    }
}
