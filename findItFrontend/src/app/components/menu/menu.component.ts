import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { AudioService } from '../../service/audio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {
maxLevel:number=0;
fadeOut:boolean=false;
audioOpen:boolean=false;
bgMusicVolume:number=0;
bgAudioVolume:number=0;
sfxVolume:number=0;
buttonVisible:boolean=false;
apiUrl = environment.apiUrl

constructor(private loginService:LoginService,  private router:Router, private audioService:AudioService){}

ngOnInit(): void {
  this.maxLevel=this.loginService.user.actualMaxLevel
  this.bgMusicVolume=this.audioService.volumeSettings['BGMusic'] * 100;
  this.bgAudioVolume = this.audioService.volumeSettings['BGAudio'] * 100;
  this.sfxVolume = this.audioService.volumeSettings['SFX'] * 100;
  this.audioService.play(this.apiUrl + '/public/audio/normalLab.mp3', 'BGMusic', true)
}

playSound(): void{
  this.audioService.play(this.apiUrl + '/public/audio/buttonHover.mp3', 'SFX', false)
}

start():void{
  this.fadeOut=true;
  this.audioService.play(this.apiUrl + '/public/audio/buttonStart.mp3', 'SFX', false)
 if(this.maxLevel===0) {
  setTimeout(()=>{
    this.router.navigate(['/story/0'])
  }, 3000)}
  else if (this.maxLevel!==0){ 
    setTimeout(()=>{
    this.router.navigate(['/story/' + this.maxLevel])
  }, 3000)}
}

levels():void{
  this.fadeOut=true;
  this.audioService.play(this.apiUrl + '/public/audio/buttonStart.mp3', 'SFX', false)
    setTimeout(()=>{
    this.router.navigate(['/selector'])
  }, 3000)
}



openAudioSettings():void{
  this.audioOpen=true;
  this.buttonVisible=false;
}

closeAudioSettings():void{
  this.audioOpen=false;
  this.buttonVisible=true;
}

onVolumeChange(type: string, event: Event) {
  const target = event.target as HTMLInputElement;
 
  if (target && target.value !== null) {
    const volume = +target.value;
    switch (type) {
      case 'BGMusic':
        this.bgMusicVolume = volume;
        break;
      case 'BGAudio':
        this.bgAudioVolume = volume;
        this.audioService.playOnceForDuration(this.apiUrl + '/public/audio/crowd.mp3', 3200, 'BGAudio')
        break;
      case 'SFX':
        this.sfxVolume = volume;
        this.audioService.play(this.apiUrl + '/public/audio/button.mp3','SFX', false)
        break;
    }

    // Aggiorna il volume nel servizio audio
    this.audioService.setVolume(type, volume);
    console.log(this.audioService.volumeSettings)
  }
}
logOut():void{
  this.loginService.logout()
}


ngOnDestroy(): void {
  this.audioService.stop(this.apiUrl + '/public/audio/normalLab.mp3')
}

}
