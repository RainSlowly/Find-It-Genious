import { Component, OnDestroy, OnInit } from '@angular/core';
import { AudioService } from '../../service/audio.service';
import { NpcService } from '../../service/npc.service';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent implements OnInit, OnDestroy {
  private soundTimeout: any;
  characters:any[]=[];
  activeChara:any;
  activeCharaImg:string="";
  maxLevel:number=0;
  phase:number=0;
  constructor(private audioService:AudioService,
              private npcService:NpcService,
              private loginService:LoginService
  ){}
  
  ngOnInit(): void {
    this.audioService.play("http://localhost:3000/public/audio/labSfx.mp3", "BGAudio",true);
    this.maxLevel=this.loginService.user.actualMaxLevel
    this.npcService.getCharacterProfiles().subscribe((data:any)=>{
      this.characters=data
      console.log(this.characters)
      if(this.maxLevel>7){
        this.phase=1
      }if(this.maxLevel>11){
        this.phase=2
      }
    })
  }

  
  showChara(i:number):void{
  if(this.characters[i].lv<=this.maxLevel){
  this.activeChara=this.characters[i]
  this.activeCharaImg=this.activeChara.img[0]
    }
  }

  changeImg():void{
    if(this.activeCharaImg===this.activeChara.img[0] && this.phase===2){
      this.activeCharaImg=this.activeChara.img[1]
    } else if (this.activeCharaImg===this.activeChara.img[1] && this.phase===2){
      this.activeCharaImg=this.activeChara.img[2]
    }else if (this.activeCharaImg===this.activeChara.img[2] && this.phase===2 && this.activeChara.img[3]!=undefined){
      this.activeCharaImg=this.activeChara.img[3]
    }else if(this.activeCharaImg===this.activeChara.img[2] && this.phase===2){
      this.activeCharaImg=this.activeChara.img[0]
    }else if (this.activeCharaImg===this.activeChara.img[3] && this.phase===2 && this.activeChara.img[3]!=undefined){
      this.activeCharaImg=this.activeChara.img[0]
    }
  }



  playSound(): void {
    if (this.soundTimeout) {
      clearTimeout(this.soundTimeout);
    }
    this.soundTimeout = setTimeout(() => {
      this.audioService.play('http://localhost:3000/public/audio/buttonHover.mp3', 'SFX', false);
      this.soundTimeout = null;
    }, 100);
  }

  ngOnDestroy(): void {
    this.audioService.stop("http://localhost:3000/public/audio/labSfx.mp3");
  }

}
