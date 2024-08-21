import { Component, OnDestroy } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { AudioService } from '../../service/audio.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  private typingSubject = new Subject<void>();

  isLogged:boolean=false;
  userName: string = "";
  tag : string = "";
  stars: any[]=[];
  password: string ="";
  openLog:boolean=false;
  isFadingOut:boolean=false;
  errorMessage:any;


  constructor(private loginService : LoginService,
     private router:Router,
     private audioService:AudioService ) 
     {this.typingSubject.pipe(debounceTime(50)).subscribe(() => {
      this.audioService.play("http://localhost:3000/public/audio/type.mp3","SFX", false);
    });}

  start():void{
    this.isFadingOut=true;
    setTimeout(() => {
      this.audioService.play("http://localhost:3000/public/audio/login.mp3","BGMusic", true),
      this.audioService.play("http://localhost:3000/public/audio/labBG.mp3","BGAudio", true),
      this.openLog=true;
    }, 2000);
  }

  onKeyup(){
    this.typingSubject.next();
  }


  onSubmit(){
    this.loginService.login(this.userName,this.tag,this.password).subscribe(user => {
      console.log('User authenticated:', user);
      this.isLogged=true;
      this.stars = user.stars;
      console.log('le stelle sono', this.stars,'è loggato',this.isLogged)
      this.router.navigate(['/menu'], { state: { user } });
    },
    err => {
      console.error('Error authenticating user:', err);
      this.errorMessage = "password non valida.";
    }
  );
}

ngOnDestroy(): void {
  this.audioService.stop("http://localhost:3000/public/audio/login.mp3");
  this.audioService.stop("http://localhost:3000/public/audio/labBG.mp3")
}
}