import { Component, ElementRef, HostListener, OnDestroy, OnInit, Inject,PLATFORM_ID } from '@angular/core';
import { NpcService } from '../../service/npc.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { NavigationService } from '../../service/navigation.service';
import { AudioService } from '../../service/audio.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrl: './story.component.css'
})
export class StoryComponent implements OnInit, OnDestroy{

  story:{ name: string, music:{src:string,type:string}, sfx:{src:string,type:string}, dialogue: any[], summary: string } = { name: "", music:{src:"",type:""}, sfx:{src:"",type:""},dialogue: [], summary:"" };
  currentStory:number=0;
  currentDialogue:any='';
  currentLine:number=0;
  interpolatedLine:string='';
  currentBackground:string='';
  npcSlots: { left: any, right: any } = { left: null, right: null };
  lastActiveSlot:string='';
  userName:string='';
  skipOpen:boolean=false;
  logOpen:boolean=false;
  widthCh:number=0;
  lineTime:string="3s";
  soundInterval: any;
  bgMusic:string="";
  log:{npc:any,line:any} = {npc:null,line:null}
  logs=[this.log] 

  constructor(
    private npcService:NpcService,
    private navigationService:NavigationService, 
    private route: ActivatedRoute, 
    private router: Router,
    private elementRef: ElementRef, 
    private loginService: LoginService,
    private audioService: AudioService,
    @Inject(PLATFORM_ID) private platformId: Object){}

 ngOnInit(): void {
  const id= this.route.snapshot.params;
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id !== null) {
      this.currentStory = +id;
    }
 });
this.npcService.getStory(this.currentStory).subscribe((data:any)=>{
  this.story=data
  this.currentDialogue=this.story.dialogue[this.currentLine]
  this.currentBackground=this.story.dialogue[this.currentLine].background
  this.assignNpcToSlot(this.currentDialogue)
  this.userName=this.loginService.user.username
  this.interpolatedLine =this.currentDialogue.line.replace(/\$\{userName\}/g, this.userName);
  this.widthCh=(this.interpolatedLine.length>115)? 115 : this.interpolatedLine.length
  this.lineTime = (this.interpolatedLine.length>115)? 115/30 +'s' : this.interpolatedLine.length/30 + 's';
if (this.story.music && this.story.music.src && this.story.music.type &&  isPlatformBrowser(this.platformId)) {
  this.audioService.play(this.story.music.src, this.story.music.type);
  this.bgMusic=this.story.music.src
}
if(this.story.sfx &&  isPlatformBrowser(this.platformId)){
  this.audioService.play(this.story.sfx.src,this.story.sfx.type,true)
}
this.startTypingSound() 
},
(error) => {
  console.error('Error fetching story:', error);
},)

}

  nextDialogue():void{
    this.stopTyping()
    console.log(this.currentDialogue);
    this.currentLine++;
    let addlog = {npc:this.currentDialogue.npc+': ',line:this.interpolatedLine}
    this.logs.push(addlog);
    console.log(this.logs);
    this.audioService.play('http://localhost:3000/public/audio/button.mp3', 'SFX', false)
    if (this.currentLine < this.story.dialogue.length) {
    this.currentDialogue=this.story.dialogue[this.currentLine]
    this.interpolatedLine =this.currentDialogue.line.replace(/\$\{userName\}/g, this.userName);
    this.widthCh=(this.interpolatedLine.length>115)? 115 : this.interpolatedLine.length
     this.lineTime = (this.interpolatedLine.length>115)? 115/30 +'s' : this.interpolatedLine.length/30 + 's';
     this.startTypingSound();
     if(this.currentDialogue.sound &&  isPlatformBrowser(this.platformId)){
      if(this.currentDialogue.sound.type === "BGMusic"){
        this.audioService.stop(this.bgMusic);
        this.audioService.play(this.currentDialogue.sound.src,this.currentDialogue.sound.type,true)
        this.bgMusic=this.currentDialogue.sound.src 
      }if(this.currentDialogue.sound.type === "BGAudio"){
        if(this.story.sfx){
        this.audioService.stop(this.story.sfx.src)
        this.audioService.play(this.currentDialogue.sound.src,this.currentDialogue.sound.type,true);
        }else{
         this.audioService.play(this.currentDialogue.sound.src,this.currentDialogue.sound.type,true);}
      }if(this.currentDialogue.sound.type === "SFX"){
        this.audioService.play(this.currentDialogue.sound.src,this.currentDialogue.sound.type,false)}
    }
    const dialogueText = this.elementRef.nativeElement.querySelector('.typewriter');
    if (dialogueText) {
      dialogueText.style.display = 'none'; // Nascondi l'elemento
      dialogueText.offsetHeight; // Trucco per forzare il repaint del browser
      dialogueText.style.display = 'block'; // Riporta l'elemento a display block
    }
   
      if (this.currentBackground !== this.story.dialogue[this.currentLine].background) {
      this.currentBackground = this.story.dialogue[this.currentLine].background;
      }
     if (this.npcSlots.left.name === this.currentDialogue.npc) {
      this.npcSlots.left.line = this.interpolatedLine;
      this.npcSlots.left.img=this.currentDialogue.img;
      this.lastActiveSlot = 'left';
     } else if (this.npcSlots.right && this.npcSlots.right.name === this.currentDialogue.npc) {
      this.npcSlots.right.line = this.currentDialogue.line;
      this.npcSlots.right.img=this.currentDialogue.img;
      this.lastActiveSlot = 'right';
     } else {
      this.assignNpcToSlot(this.currentDialogue);
     }
    }else if(this.currentLine>this.story.dialogue.length-1){
      this.nextPage()
    } 
  }

  assignNpcToSlot(currentDialogue:any):void{
    if (!this.npcSlots.left && currentDialogue.img !=='') {
      this.npcSlots.left = { name: currentDialogue.npc,img: currentDialogue.img, line: currentDialogue.line};
      this.lastActiveSlot = 'left';
    } else if (!this.npcSlots.right && currentDialogue.img !=='') {
      this.npcSlots.right = { name: currentDialogue.npc,img: currentDialogue.img, line: currentDialogue.line};;
      this.lastActiveSlot = 'right';
    } else {
      if (this.lastActiveSlot === 'left'&& currentDialogue.img !=='') {
        this.npcSlots.right = { name: currentDialogue.npc,img: currentDialogue.img, line: currentDialogue.line};;
        this.lastActiveSlot = 'right';
      } else if (this.lastActiveSlot === 'right'&& currentDialogue.img !==''){
        this.npcSlots.left = { name: currentDialogue.npc,img: currentDialogue.img, line: currentDialogue.line};;
        this.lastActiveSlot = 'left';
      }if(currentDialogue.img===''){
        this.lastActiveSlot='right'
      }}
  }

  showLog():void{
    this.audioService.play('http://localhost:3000/public/audio/button.mp3', 'SFX', false)
  this.logOpen=true;
  }

  closeLog():void{
    this.audioService.play('http://localhost:3000/public/audio/button.mp3', 'SFX', false)  
  this.logOpen=false;
  }

  skipDialogue():void{
    this.audioService.play('http://localhost:3000/public/audio/button.mp3', 'SFX', false)
   this.skipOpen=true;

  }

  closeSkip():void{
    this.audioService.play('http://localhost:3000/public/audio/button.mp3', 'SFX', false)
    this.skipOpen=false
  }
  nextPage():void{
    this.audioService.play('http://localhost:3000/public/audio/button.mp3', 'SFX', false)
    if(this.currentStory===14){
      this.navigationService.goToNextPage(1,"credits")
    } else if (this.currentStory===15){
      this.navigationService.goToNextPage(2,"credits")
    }else if (this.currentStory===0){
      this.router.navigate(['/tutorial'])
    }else if (this.currentStory===13){
      this.router.navigate(['/finalLevel'])
    }else{
    this.navigationService.goToNextPage(this.currentStory,"level")
    console.log(this.currentStory)
    }
  }

  resetTimePerLine() {
    this.lineTime = '0.1s';
  }

  @HostListener('window:keydown',['$event'])
  handleKey(event:KeyboardEvent){
    switch(event.key) {
      case ' ':
        event.preventDefault();
        this.resetTimePerLine()
        console.log("premuto spazio",this.lineTime)
        break;
        case 'Enter':
          this.nextDialogue();
          break;
      case 'Tab':
        event.preventDefault(); 
        if (this.logOpen) {
          this.closeLog();
        } else {
          this.showLog();
        }
        break;
    }
  }

  startTypingSound(): void {
    const lineLength = this.interpolatedLine.length;
    const duration = (lineLength<20)? 1: lineLength / 40;
    const interval = (duration * 2100) / lineLength; 
    this.soundInterval = setInterval(() => {
      this.audioService.play('http://localhost:3000/public/audio/type.mp3','SFX');
    }, interval);

    // Interrompi l'intervallo dopo la durata totale dell'animazione
    setTimeout(() => {
      this.stopTyping();
    }, duration * 1000);
  }

  stopTyping(): void {
    if (this.soundInterval) {
      clearInterval(this.soundInterval);
       this.audioService.stop('http://localhost:3000/public/audio/type.mp3');
    }
  }

playSound(): void{
  this.audioService.play('http://localhost:3000/public/audio/buttonHover.mp3', 'SFX', false)
}

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.story.music.src && this.story.music) {
    this.audioService.stop(this.bgMusic)
  }
  if(this.story.sfx &&  isPlatformBrowser(this.platformId)){
    this.audioService.stop(this.story.sfx.src)
  }
    this. stopTyping()
  }
}
