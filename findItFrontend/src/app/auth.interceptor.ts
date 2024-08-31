import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './service/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loginService:LoginService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.loginService.user;
    if (user.username) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${user.username}`)
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}