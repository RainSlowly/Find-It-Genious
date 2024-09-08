import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../service/audio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
messageVisible:boolean=false;
inputVisible:boolean=false;
messages:any[]=["Il gioco offre un tutorial per capire i concetti base e le sue funzioni. Se lo desideri puoi saltare il tutorial e giocare direttamente dal primo livello! Vuoi saltare il tutorial e iniziare subito a giocare? (Perderai alcune piccole parti della storia iniziale.)", "Sei davvero sicuro di voler saltare il tutorial? Sicuro sicuro? Va bene ma dovrai leggere una veloce spiegazione del gioco per capire almeno le funzioni di base."];
message:string="";
constructor( private audioService:AudioService,
             private router:Router
            ){}

  ngOnInit(): void {
    this.message=this.messages[0]
    this.messageVisible=true;
    //this.audioService.play("https://find-it-genious.onrender.com/public/audio/menum","SFX",false)

  }

  next():void{
    if(this.message === this.messages[0]){
      this.messageVisible=false;
      this.message=this.messages[1];
      this.audioService.play('https://find-it-genious.onrender.com/public/audio/button.mp3', 'SFX', false)
    setTimeout(() => {
      this.messageVisible=true;
      //this.audioService.play("https://find-it-genious.onrender.com/public/audio/menu.mp3","SFX",false)
    }, 500);
    }else if (this.message === this.messages[1]){
      this.messageVisible=false;
      this.audioService.play('https://find-it-genious.onrender.com/public/audio/button.mp3', 'SFX', false)
      setTimeout(() => {
        this.inputVisible=true;
        //this.audioService.play("https://find-it-genious.onrender.com/public/audio/menu.mp3","SFX",false)
      }, 500);
    }
  }


  playSound(): void{
    this.audioService.play('https://find-it-genious.onrender.com/public/audio/buttonHover.mp3', 'SFX', false)
  }

  startTutorial():void{
    this.audioService.play('https://find-it-genious.onrender.com/public/audio/button.mp3', 'SFX', false);
    this.router.navigate(['/tutorial'])
  }
  skipTutorial():void{
    this.audioService.play('https://find-it-genious.onrender.com/public/audio/button.mp3', 'SFX', false);
    this.router.navigate(['/story/1'])
}
}
