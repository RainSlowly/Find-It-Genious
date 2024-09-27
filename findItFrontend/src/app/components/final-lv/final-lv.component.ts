import { Component,OnDestroy,OnInit,Inject, PLATFORM_ID} from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { TimeService } from '../../service/time.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../service/navigation.service';
import { NpcService } from '../../service/npc.service';
import { AudioService } from '../../service/audio.service';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-final-lv',
  templateUrl: './final-lv.component.html',
  styleUrl: './final-lv.component.css'
})
export class FinalLvComponent implements OnInit, OnDestroy {

  hp:any[]=[1,2,3,4,5];
  actualHP:number=5;
  phase:number=0;
  level:any;
  buttons:any;
  backgroundVideo:string='';
  backgroundImage:string='';
  isRotating = false;
  timeoutId: any;
  timeoutIdAutoHit:any;
  timeoutIdNar:any;
  timeinIdNar:any;
  timing:number=3500;
  hitTiming:number=0;
  glitch:any;
  marsh:any;
  magda:any;
  ezio:any;
  isobald:any;
  narratore = {phrases:["il DR. GLITCHSTEIN punta un palmo verso di te!", "il DR. GLITCHSTEIN si prepara a colpire!"]}
  currentNpc:any;
  currentLine:string='';
  showDialogue:boolean=false;
  rotationSpeed =210;
  numberLine:number=0;
  isPlatFormBrowser:boolean;
  isShaking:boolean=false;
  isFlashing:boolean=false;
  blockClick:boolean=false;
  isHitted:boolean=false;
  isLosing:boolean=false;
  battleWon:boolean=false;
  battleLost:boolean=false;
  apiUrl = environment.apiUrl;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private levelsService: LevelsService,
    private route :ActivatedRoute, 
    private navigationService:NavigationService, 
    private npcService:NpcService,
    private audioService: AudioService){ 
    this.isPlatFormBrowser = isPlatformBrowser(platformId)
  }


    methodsMap = {
      correctClick: this.correctClick.bind(this),
      wrongClick: this.wrongClick.bind(this)
      };

    ngOnInit():void{
    this.levelsService.getFinal().subscribe((data:any)=>{
      this.level = data[0];
      if (this.level && this.level.buttons && this.level.background && this.level.video) {
        this.buttons = this.level.buttons;
        this.backgroundImage = this.level.background[0];
        this.backgroundVideo = this.level.video;
        if(this.level.music && this.level.music.src){
          this.audioService.play(this.level.music.src,this.level.music.type)
        }
      
      } else {
        console.error('Level data is incomplete:', this.level);
      }
    },
    (error: any) => {
      console.error('Error fetching final level:', error);
    }
  );
    this.npcService.getNpc("finalLVMr").subscribe((data:any)=>{
      this.marsh=data;
      this.currentNpc=this.marsh
    });
    this.npcService.getNpc("finalLV").subscribe((data:any)=>{
      this.glitch=data;
    });
    this.npcService.getNpc("finalLVMg").subscribe((data:any)=>{
      this.magda=data;
    });
    this.npcService.getNpc("finalLVI").subscribe((data:any)=>{
      this.isobald=data;
    })
    this.npcService.getNpc("finalLVE").subscribe((data:any)=>{
      this.ezio=data;
    })
    if (this.isPlatFormBrowser){
    window.setTimeout(() => this.startRotation(), 1000);
    }
  }
  
  ngOnDestroy() {
    clearTimeout(this.timeoutId);
    clearTimeout(this.timeoutIdAutoHit)
  }

 buttonClick(button:string):void{
  if(button== "DELETE"){
    this.correctClick()
  }else{
    this.wrongClick();
  }
 }

 activateAnimation():void{
  if (this.phase!==4){
  this.isShaking=true;
  this.isFlashing=true;
  setTimeout(() => {
    this.showDialogue=true;},300);
  this.blockClick=true;
  }else if (this.phase===4){
    setTimeout(() => {
      this.showDialogue=true;},300);
  this.blockClick=true;
  this.isLosing=true;
  }
 }
 deactivateAnimation():void{
  this.isShaking=false;
  this.isFlashing=false;
  this.showDialogue=false;
  this.blockClick=false;
 }
  correctClick():void{
    this.showDialogue=false;
    if (this.timeoutIdNar) {
      clearTimeout(this.timeoutIdNar);
      }
      if ( this.timeinIdNar) {
        clearTimeout( this.timeinIdNar);
        }
    this.autoHit(); 
    this.audioService.play(environment.apiUrl + '/public/audio/finalhit.mp3',"SFX", false)
    if(this.phase===0){
      this.activateAnimation()
      this.currentNpc=this.marsh;
      this.currentLine=this.currentNpc.phrases[0]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      this.backgroundImage=this.level.background[1];
      this.timing=2500;
         
    }if(this.phase===1){
      this.activateAnimation()
      this.currentNpc=this.ezio;
      this.currentLine=this.currentNpc.phrases[0];
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      this.backgroundImage=this.level.background[2];
      this.timing=2000;
    }if(this.phase===2){
      this.activateAnimation()
      this.currentNpc=this.isobald;
      this.currentLine=this.currentNpc.phrases[0];
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      this.backgroundImage=this.level.background[3];
      this.timing=1700;
      this.rotationSpeed = 300;
    }if(this.phase===3){
      this.activateAnimation()
      this.currentNpc=this.magda;
      this.currentLine=this.currentNpc.phrases[0];
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      this.backgroundImage=this.level.background[4];
      this.rotationSpeed = 120;
      this.timing=1200;
    }if(this.phase===4){
      this.activateAnimation()
      this.currentNpc=this.glitch
      this.currentLine=this.currentNpc.phrases[4]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      this.backgroundImage=this.level.background[4]
      this.rotationSpeed=0;
      
      setTimeout(() => {
        this.backgroundImage=this.level.background[5];
        this.isLosing=false; 
        this.showDialogue = false;
        this.battleWon=true;
        this.audioService.play(environment.apiUrl + '/public/audio/fadingGlitch.mp3','SFX',false)
      }, 9000)
      setTimeout(() => {
        this.audioService.stop(this.level.music.src)
        this.navigationService.goToNextPage(14,"story")
      }, 12000);
      return
    }
    this.phase++;
    setTimeout(() => {this.isShaking=false; this.isFlashing=false}, 2000);
   
    setTimeout(() => {  this.showDialogue = false;this.startRotation();}, 7000);
    setTimeout(() => {
      this.blockClick=false;
  }, 7500);
 
  }

  wrongClick():void {
   this.actualHP--;
   this.showDialogue=false;
   if (this.timeoutIdNar) {
    clearTimeout(this.timeoutIdNar);
    }
   if ( this.timeinIdNar) {
     clearTimeout( this.timeinIdNar);
     }
   this.autoHit();
   this.audioService.play(environment.apiUrl + '/public/audio/heartlost.mp3',"SFX", false)
   this.audioService.play(environment.apiUrl + '/public/audio/receivedHit.mp3',"SFX", false)
   this.isHitted=true;
    if(this.actualHP===0){
      setTimeout(() => {
      this.showDialogue=true;},100);
      this.blockClick=true;
      this.currentNpc=this.ezio;
      this.currentLine=this.currentNpc.phrases[1]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      setTimeout(() => {
        this.battleLost=true;
        this.showDialogue=false;
    }, 7000);
    setTimeout(() => {
      this.audioService.stop(this.level.music.src)
      this.navigationService.goToNextPage(15,"story")    
  }, 10000);
    }if(this.actualHP===1){
      setTimeout(() => {
        this.showDialogue=true;},300);
      this.blockClick=true;
      this.currentNpc=this.glitch;
      this.currentLine=this.currentNpc.phrases[3]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
        this.startRotation();
    }, 7000);
    }if(this.actualHP===2){
      setTimeout(() => {
        this.showDialogue=true;},300);
      this.blockClick=true;
      this.currentNpc=this.glitch;
      this.currentLine=this.currentNpc.phrases[2]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
        this.startRotation();
    }, 7000);
    }if(this.actualHP===3){
      setTimeout(() => {
        this.showDialogue=true;},300);
      this.blockClick=true;
      this.currentNpc=this.glitch;
      this.currentLine=this.currentNpc.phrases[1]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
        this.startRotation();
    }, 7000);
    }if(this.actualHP===4){
      setTimeout(() => {
        this.showDialogue=true;},300);
      this.blockClick=true;
      this.currentNpc=this.marsh;
      this.currentLine=this.currentNpc.phrases[1]
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
    }, 4300);
    setTimeout(() => {
      this.showDialogue = true;
      this.blockClick=true;
      this.currentNpc=this.glitch;
      this.currentLine=this.currentNpc.phrases[0];
      this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
  }, 4400);
   setTimeout(() => {
    this.showDialogue = false;
    this.blockClick=false;
    this.isHitted=false;
    this.startRotation();
   }, 12000);
    }
  }

  autoHit():void{
    if (this.hitTiming === 0 && this.actualHP !== 0) {
      this.hitTiming = 35000;
    

  this.timeinIdNar=setTimeout(() => {
        this.showDialogue = true;
        this.currentNpc=this.narratore;
        this.currentNpc.character="Narratore";
        this.currentLine=this.currentNpc.phrases[0];
        this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
    }, 18000);
   this.timeoutIdNar= setTimeout(() => {
      this.showDialogue = false;
  }, 24000);
      this.timeoutIdAutoHit = setTimeout(() => {
          this.wrongClick();
          this.hitTiming = 0;
      }, this.hitTiming);
  } else if (this.hitTiming > 0 && this.actualHP !== 0) {
      if (this.timeoutIdAutoHit) {
          clearTimeout(this.timeoutIdAutoHit);
      }
      this.hitTiming = 32000;
      this.timeinIdNar=setTimeout(() => {
        this.showDialogue = true;
        this.currentNpc=this.narratore;
        this.currentNpc.character="Narratore";
        this.currentLine=this.currentNpc.phrases[1];
        this.numberLine = Math.max(Math.floor(this.currentLine.length / 21), 1);
    }, 15000);
    this.timeoutIdNar = setTimeout(() => {
      this.showDialogue = false;
  }, 21000);

      this.timeoutIdAutoHit = setTimeout(() => {
          this.wrongClick();
          this.hitTiming = 0;
      }, this.hitTiming);
  }

}

  startRotation() {
    if(!this.showDialogue){this.rotationSpeed=210;
      this.timeoutId = setInterval(() => this.updateAngles(), 50)
      setTimeout(() => this.stopRotation(), 2000);
    }else{this.stopRotation()}
  }
    stopRotation() {
      this.rotationSpeed=0;
      if(!this.showDialogue){
      setTimeout(() => this.startRotation(), this.timing);
      }else{
        return;
      }
     }
  updateAngles() {
     // Velocità di rotazione in gradi per aggiornamento
    this.buttons.forEach((button:any) => {
      button.angle = (button.angle + this.rotationSpeed) % 360;
    });
  }

  getBackgroundImageStyle(i: number) {
    const imageUrl = this.actualHP <= i
      ?  `${this.apiUrl}/public/images/hpLost.png`
      : `${this.apiUrl}/public/images/hp.gif`;

    return {
      'background-image': `url(${imageUrl})`
    };
  }


  getStyle(button:any) {
    const angle = button.angle;
    const radius = 330; // Raggio del cerchio
    const centerX = -760; // Centro del contenitore
    const centerY = 550; // Centro del contenitore
    const x = centerX + radius * Math.cos(angle * (Math.PI / 180)) - 25; // 25 è metà della larghezza del bottone
    const y = centerY + radius * Math.sin(angle * (Math.PI / 180)) - 25; // 25 è metà dell'altezza del bottone

    return {
     'cursor': `url(${this.apiUrl}/public/customCursor_1.cur), auto`,
      top: `${y}px`,
      left: `${x}px`
    };
  }
}
