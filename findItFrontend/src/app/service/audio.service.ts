import { Injectable, Inject, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCache: { [src: string]: { audioElement: HTMLAudioElement, type: string } } = {};
  volumeSettings: { [type: string]: number } = {
    'BGMusic': 0.05,
    'BGAudio': 0.05,
    'SFX': 0.15
  };
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { // Precarica gli audio più utilizzati
   this.preloadAudio(environment.apiUrl + '/public/audio/type.mp3', 'SFX');
   this.preloadAudio(environment.apiUrl + '/public/audio/found.mp3', 'SFX');
   this.preloadAudio(environment.apiUrl + '/public/audio/hint.mp3', 'SFX');
   this.preloadAudio(environment.apiUrl + '/public/audio/button.mp3', 'SFX');
   this.preloadAudio(environment.apiUrl + '/public/audio/buttonHover.mp3', 'SFX');
   this.preloadAudio(environment.apiUrl + '/public/audio/levelMusic.mp3', 'BGMusic');
  }

  preloadAudio(src: string, type: string) {
    if (isPlatformBrowser(this.platformId)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = this.volumeSettings[type];
        this.audioCache[src] = { audioElement: audio, type: type };
    }
}

play(src: string, type: string = 'SFX', looping: boolean = true) {
  if (isPlatformBrowser(this.platformId)) {
      if (this.audioCache[src]) {
          const cachedAudio = this.audioCache[src];
          cachedAudio.audioElement.volume = this.volumeSettings[type];
          cachedAudio.audioElement.currentTime = 0;
          cachedAudio.audioElement.loop = looping;
          cachedAudio.audioElement.play().catch(error => {
              console.error('Play failed:', error);
          });
      } else {
          this.loadAndPlay(src, type, looping);
      }
  }
}


  loadAndPlay(src: string, type: string,looping:boolean) {
    if (isPlatformBrowser(this.platformId)) {
      const audio = new Audio(src);
      audio.currentTime=0;
      audio.volume = this.volumeSettings[type];
      audio.loop=looping;
      audio.addEventListener('canplaythrough', () => {
        audio.play();
      });
      this.audioCache[src] = { audioElement: audio, type: type };
    }
  }

  playOnceForDuration(src: string, duration: number, type: string = 'SFX') {
    if (isPlatformBrowser(this.platformId)) {
        if (!this.audioCache[src]) {
            this.preloadAudio(src, type);
        }

        if (this.audioCache[src]) {
            const cachedAudio = this.audioCache[src];
            cachedAudio.audioElement.currentTime = 0;
            cachedAudio.audioElement.volume = this.volumeSettings[type];
            cachedAudio.audioElement.play();

            setTimeout(() => {
                cachedAudio.audioElement.pause();
                cachedAudio.audioElement.currentTime = 0; // Reset the audio
            }, duration);
        } else {
            console.error(`Audio file ${src} not found and no source provided`);
        }
    }
}

stop(src: string) {
  if (isPlatformBrowser(this.platformId)) {
      const cachedAudio = this.audioCache[src];

      if (cachedAudio) {
          cachedAudio.audioElement.loop = false;
          cachedAudio.audioElement.pause();
      } else {
          console.warn(`Audio not found in cache: ${src}`);
      }
  }  
}
setVolume(type: string, volume: number) {
  if (this.volumeSettings.hasOwnProperty(type)) {
      this.volumeSettings[type] = volume / 100;

      if (typeof window !== 'undefined') {
          for (let src in this.audioCache) {
              const cachedAudio = this.audioCache[src];
              if (cachedAudio && cachedAudio.type === type) {
                  cachedAudio.audioElement.volume = this.volumeSettings[type];
              }
          }
      } 
  }
}

  getVolume(type: string): number {
    return this.volumeSettings[type] || 1.0;
  }
}