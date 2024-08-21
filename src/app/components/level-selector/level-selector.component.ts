import { Component, OnDestroy, OnInit } from '@angular/core';
import { LevelsService } from '../../service/levels.service';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { AudioService } from '../../service/audio.service';

@Component({
  selector: 'app-level-selector',
  templateUrl: './level-selector.component.html',
  styleUrl: './level-selector.component.css'
})
export class LevelSelectorComponent implements OnInit,OnDestroy {
levels: any[]=[];
userStars:any[]=[];
selectedStars:number[]=[];
maxLevel:number=0
private soundTimeout: any;

  constructor(private levelsService: LevelsService,
              private route :ActivatedRoute,
              private loginService: LoginService,
              private audioService:AudioService){}

  ngOnInit(): void {
    this.levelsService.getLevels().subscribe((data:any)=>{
      this.levels=data.slice(1,14);
      this.maxLevel=this.loginService.user.actualMaxLevel;
      this.userStars=this.loginService.user.actualStars;
      
      console.log(this.userStars, this.loginService.user)

    })
    this.audioService.play("http://localhost:3000/public/audio/labSfx.mp3", "BGAudio",true);
    this.levels.forEach((level, index) => {
      const stars = this.getStarsForLevel(index + 1);
      this.selectedStars[index] = stars;
    });
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
    this.audioService.play('http://localhost:3000/public/audio/buttonHover.mp3', 'SFX', false);
    this.soundTimeout = null;
  }, 100);
}
ngOnDestroy(): void {
  this.audioService.stop("http://localhost:3000/public/audio/labSfx.mp3");
}

}
