import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AudioService } from '../../service/audio.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.css'
})
export class CreditsComponent implements OnInit, OnDestroy{

  id:any;
  apiUrl=environment.apiUrl;
  marshImg:string=environment.apiUrl + '/public/images/marsh';
  ezioImg:string=environment.apiUrl + '/public/images/ezio';
  magdaImg:string=environment.apiUrl + '/public/images/magda';
  isobaldImg:string=environment.apiUrl + '/public/images/isobald';
  zweiImg:string=environment.apiUrl + '/public/images/zwei';
  constructor(private route:ActivatedRoute,
              private audioService: AudioService,
  ){}

  ngOnInit(): void {
   this.id= this.route.snapshot.params
    console.log('Parametro id (snapshot):', this.id);
    this.route.paramMap.subscribe(params => {
      this.id= params.get('id');})
      console.log(this.id)
      if(this.id==1){
        this.audioService.play(environment.apiUrl + '/public/audio/soon.mp3',"BGMusic", false)
        this.marshImg=this.marshImg+".png";
        console.log(this.marshImg,this.ezioImg);
        this.ezioImg=this.ezioImg+".png";
        this.magdaImg=this.magdaImg+".png";
        this.isobaldImg=this.isobaldImg+".png";
        this.zweiImg=this.zweiImg+"2.png";
      }else if(this.id==2){
        this.audioService.play(environment.apiUrl + '/public/audio/violetBurn.mp3',"BGMusic", false)
        this.marshImg=this.marshImg+"V.png";
        this.ezioImg=this.ezioImg+"V.png";
        this.magdaImg=this.magdaImg+"V.png";
        this.isobaldImg=this.isobaldImg+"V.png";
        this.zweiImg=environment.apiUrl + '/public/images/gstein.png';
      }
  }
  playSound(): void{
    this.audioService.play(environment.apiUrl + '/public/audio/buttonHover.mp3', 'SFX', false)
  }
  
  ngOnDestroy(): void {
    if(this.id===1){
    this.audioService.stop(environment.apiUrl + '/public/audio/soon.mp3')
    } else if (this.id===2){
       this.audioService.stop(environment.apiUrl + '/public/audio/violetBurn.mp3')
    }
  }
}


