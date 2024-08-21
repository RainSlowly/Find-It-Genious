import { Component,OnDestroy,OnInit } from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { TimeService } from '../../service/time.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../service/navigation.service';
import { NpcService } from '../../service/npc.service';
import { AudioService } from '../../service/audio.service';

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
  timing:number=3500;
  hitTiming:number=0;
  npc:any[]=[];
  currentNpc:any;
  currentLine:string='';
  showDialogue:boolean=false;
  rotationSpeed =210;
  widthCh:number=0;
  isShaking:boolean=false;
  isFlashing:boolean=false;
  blockClick:boolean=false;
  isHitted:boolean=false;
  isLosing:boolean=false;
  battleWon:boolean=false;
  battleLost:boolean=false;

  constructor(
    private levelsService: LevelsService,
    private route :ActivatedRoute, 
    private navigationService:NavigationService, 
    private npcService:NpcService,
    private audioService: AudioService){ }


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
    this.npcService.getNpc().subscribe((data:any)=>{
      this.npc=data;
      this.currentNpc=this.npc.find(npc=>npc.character==="Ezio")
    })
    window.setTimeout(() => this.startRotation(), 1000);
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
  this.showDialogue=true;
  this.blockClick=true;
  }else if (this.phase===4){
  this.showDialogue=true;
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
    this.autoHit();
    this.audioService.play("http://localhost:3000/public/audio/finalhit.mp3","SFX", false)
    if(this.phase===0){
      this.activateAnimation()
      this.currentNpc=this.npc.find(npc=>npc.character==="Marsh")
      this.currentLine=this.currentNpc.phrases[0]
      this.backgroundImage=this.level.background[1];
      this.timing=2500;
         
    }if(this.phase===1){
      this.activateAnimation()
      this.currentNpc=this.npc.find(npc=>npc.character==="Ezio")
      this.currentLine=this.currentNpc.phrases[0];
      this.backgroundImage=this.level.background[2];
      this.timing=2000;
      console.log(this.currentNpc,this.currentLine)
    }if(this.phase===2){
      this.activateAnimation()
      this.currentNpc=this.npc.find(npc=>npc.character==="Isobald")
      this.currentLine=this.currentNpc.phrases[0];
      this.backgroundImage=this.level.background[3];
      this.timing=1700;
      this.rotationSpeed = 300;
      console.log(this.currentNpc,this.currentLine)
    }if(this.phase===3){
      this.activateAnimation()
      this.currentNpc=this.npc.find(npc=>npc.character==="Magda")
      this.currentLine=this.currentNpc.phrases[0];
      this.backgroundImage=this.level.background[4];
      this.rotationSpeed = 120;
      this.timing=1200;
      console.log(this.currentNpc,this.currentLine)
    }if(this.phase===4){
      this.activateAnimation()
      this.currentNpc=this.npc.find(npc=>npc.character==="DR. GLITCHSTEIN")
      this.currentLine=this.currentNpc.phrases[4]
      this.backgroundImage=this.level.background[4]
      console.log(this.currentNpc,this.currentLine)
      this.rotationSpeed=0;
      
      setTimeout(() => {
        this.backgroundImage=this.level.background[5];
        this.isLosing=false; 
        this.showDialogue = false;
        this.battleWon=true;
        this.audioService.play('http://localhost:3000/public/audio/fadingGlitch.mp3','SFX',false)
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
   this.autoHit();
   this.audioService.play("http://localhost:3000/public/audio/heartlost.mp3","SFX", false)
   this.audioService.play("http://localhost:3000/public/audio/receivedHit.mp3","SFX", false)
   this.isHitted=true;
    if(this.actualHP===0){
      this.showDialogue=true;
      this.blockClick=true;
      this.currentNpc=this.npc.find(npc=>npc.character==="Ezio")
      this.currentLine=this.currentNpc.phrases[1]
     
      setTimeout(() => {
        this.battleLost=true;
        this.showDialogue=false;
    }, 7000);
    setTimeout(() => {
      this.audioService.stop(this.level.music.src)
      this.navigationService.goToNextPage(15,"story")    
  }, 10000);
    }if(this.actualHP===1){
      this.showDialogue=true;
      this.blockClick=true;
      this.currentNpc=this.npc.find(npc=>npc.character==="DR. GLITCHSTEIN")
      this.currentLine=this.currentNpc.phrases[3]
      console.log(this.currentNpc,this.currentLine)
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
        this.startRotation();
    }, 7000);
    }if(this.actualHP===2){
      this.showDialogue=true;
      this.blockClick=true;
      this.currentNpc=this.npc.find(npc=>npc.character==="DR. GLITCHSTEIN")
      this.currentLine=this.currentNpc.phrases[2]
      console.log(this.currentNpc,this.currentLine)
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
        this.startRotation();
    }, 7000);
    }if(this.actualHP===3){
      this.showDialogue=true;
      this.blockClick=true;
      this.currentNpc=this.npc.find(npc=>npc.character==="DR. GLITCHSTEIN")
      this.currentLine=this.currentNpc.phrases[1]
      console.log(this.currentNpc,this.currentLine)
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
        this.startRotation();
    }, 7000);
    }if(this.actualHP===4){
      this.showDialogue=true;
      this.blockClick=true;
      this.currentNpc=this.npc.find(npc=>npc.character==="Marsh")
      this.currentLine=this.currentNpc.phrases[1]
      console.log(this.currentNpc,this.currentLine)
      setTimeout(() => {
        this.showDialogue = false;
        this.blockClick=false;
        this.isHitted=false;
    }, 4300);
    setTimeout(() => {
      this.showDialogue = true;
      this.blockClick=true;
      this.currentNpc=this.npc.find(npc=>npc.character==="DR. GLITCHSTEIN")
      this.currentLine=this.currentNpc.phrases[0];
      console.log(this.currentNpc,this.currentLine)
  }, 4400);
   setTimeout(() => {
    this.showDialogue = false;
    this.blockClick=false;
    this.isHitted=false;
    this.startRotation();
   }, 11000);
    }
  }

  autoHit():void{
    if (this.hitTiming === 0 && this.actualHP !== 0) {
      this.hitTiming = 32000;
      console.log("parto da 32");

      setTimeout(() => {
        this.showDialogue = true;
        this.currentNpc=this.npc.find(npc=>npc.character==="Narratore")
        this.currentLine=this.currentNpc.phrases[0];
        console.log(this.currentNpc,this.currentLine)
    }, 14000);

      this.timeoutIdAutoHit = setTimeout(() => {
          this.wrongClick();
          this.hitTiming = 0;
      }, this.hitTiming);
  } else if (this.hitTiming > 0 && this.actualHP !== 0) {
      if (this.timeoutIdAutoHit) {
          clearTimeout(this.timeoutIdAutoHit);
      }
      this.hitTiming = 27000;
      console.log("parto da 27");
      setTimeout(() => {
        this.showDialogue = true;
        this.currentNpc=this.npc.find(npc=>npc.character==="Narratore")
        this.currentLine=this.currentNpc.phrases[1];
        console.log(this.currentNpc,this.currentLine)
    }, 12000);

      this.timeoutIdAutoHit = setTimeout(() => {
          this.wrongClick();
          this.hitTiming = 0;
      }, this.hitTiming);
  }
  console.log("fine funzione auto");
}

  startRotation() {
    if(!this.showDialogue){this.rotationSpeed=210;
      this.timeoutId = setInterval(() => this.updateAngles(), 50)
      setTimeout(() => this.stopRotation(), 2000);
      console.log("storoteando")
    }else{this.stopRotation()}
  }
    stopRotation() {
      this.rotationSpeed=0;
      console.log("nonsto")
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
  getStyle(button:any) {
    const angle = button.angle;
    const radius = 330; // Raggio del cerchio
    const centerX = -760; // Centro del contenitore
    const centerY = 400; // Centro del contenitore
    const x = centerX + radius * Math.cos(angle * (Math.PI / 180)) - 25; // 25 è metà della larghezza del bottone
    const y = centerY + radius * Math.sin(angle * (Math.PI / 180)) - 25; // 25 è metà dell'altezza del bottone

    return {
      top: `${y}px`,
      left: `${x}px`
    };
  }
}
