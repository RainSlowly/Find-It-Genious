import { Component, OnDestroy, OnInit } from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { AudioService } from '../../service/audio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-level-selector',
  templateUrl: './level-selector.component.html',
  styleUrl: './level-selector.component.css'
})
export class LevelSelectorComponent implements OnInit,OnDestroy {
levels: any[]=[];
userStars:any[]=[];
selectedStars:number[]=[];
maxLevel:number=0;
apiUrl = environment.apiUrl;

private soundTimeout: any;

  constructor(private levelsService: LevelsService,
              private route :ActivatedRoute,
              private loginService: LoginService,
              private audioService:AudioService){}

  ngOnInit(): void {
    this.levelsService.getLevels().subscribe((data:any)=>{
      data.sort((a: any, b: any) => {
        const numA = parseInt(a.name.replace('level', ''), 10);
        const numB = parseInt(b.name.replace('level', ''), 10);
        return numA - numB;
      });
      this.levels = data.filter((item: any) => {
        const levelNumber = parseInt(item.name.replace('level', ''), 10);
        return levelNumber >= 1 && levelNumber <= 13;
      });
      this.maxLevel = this.loginService.user.actualMaxLevel;
      this.userStars = this.loginService.user.actualStars;
      this.levels.forEach((level, index) => {
        const stars = this.getStarsForLevel(index + 1);
        this.selectedStars[index] = stars;
        console.log(this.selectedStars, stars)
      });

    })
    this.audioService.play(environment.apiUrl + '/public/audio/labSfx.mp3', "BGAudio",true);
 
  }
 

getStarsForLevel(level: number): number {
  const levelData = this.userStars.find((star: any) => star.level === level);
  console.log(levelData)
  return levelData ? levelData.stars : 0;
}
playSound(): void {
  if (this.soundTimeout) {
    clearTimeout(this.soundTimeout);
  }
  this.soundTimeout = setTimeout(() => {
    this.audioService.play(environment.apiUrl + '/public/audio/buttonHover.mp3', 'SFX', false);
    this.soundTimeout = null;
  }, 100);
}
ngOnDestroy(): void {
  this.audioService.stop(environment.apiUrl + '/public/audio/labSfx.mp3');
}

}
