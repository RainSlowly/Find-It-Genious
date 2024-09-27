import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { AudioService } from '../../service/audio.service';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent implements OnInit{

 

  private soundSubject = new Subject<void>();
  private soundTimeout: any;
  audioOpen:boolean=false;
  path:any
  bgMusicVolume:number=0;
  bgAudioVolume:number=0;
  sfxVolume:number=0;
  maxLevel:number=0;
  isDarkMode = false;
  apiUrl = environment.apiUrl;

  @Output() resetLevel = new EventEmitter<void>();
  @Output() darkModeToggle = new EventEmitter<boolean>();
  constructor(private route :ActivatedRoute,
              private loginService:LoginService,
              private router:Router,
              private audioService:AudioService){
              }
ngOnInit(): void {
  this.path = this.route.snapshot.url[0].path
  console.log('zona attuale:', this.path);
  this.bgMusicVolume=this.audioService.volumeSettings['BGMusic'] * 100;
  this.bgAudioVolume = this.audioService.volumeSettings['BGAudio'] * 100;
  this.sfxVolume = this.audioService.volumeSettings['SFX'] * 100;
  this.maxLevel=this.loginService.user.actualMaxLevel;
}

onReset() {
  this.resetLevel.emit();
  
}

playSound(): void {
  if (this.soundTimeout) {
    clearTimeout(this.soundTimeout);
  }
  this.soundTimeout = setTimeout(() => {
    this.audioService.play(this.apiUrl + '/public/audio/buttonHover.mp3', 'SFX', false);
    this.soundTimeout = null;
  }, 100);
}

openAudioSettings():void{
  this.audioOpen=true
}

closeAudioSettings():void{
  this.audioOpen=false
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
        this.audioService.playOnceForDuration(this.apiUrl + '/public/audio/crowd.mp3', 3000, 'BGAudio')
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

toggleDarkMode() {
  this.audioService.toggleDarkMode()
}

continue():void{
    this.router.navigate(['/story/' + this.maxLevel])
}

outClick():void{
  const checkbox = document.getElementById('check') as HTMLInputElement;
  if (checkbox && checkbox.checked) {
    checkbox.checked = false;
  }
  if(this.audioOpen){
    this.audioOpen=false
  }
}

logOut():void{
  this.loginService.logout()
}


}
