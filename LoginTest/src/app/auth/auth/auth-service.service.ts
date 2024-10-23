import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, pipe, tap } from 'rxjs';
import { IAccessData } from '../../interfaces/iaccess-data';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Iuser } from '../../interfaces/iuser';
import { ILoginRequest } from '../../interfaces/i-login-request';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  jwtHelper: JwtHelperService = new JwtHelperService();

  registerUrl: string = environment.registerUrl;
  loginUrl: string = environment.loginUrl;

  authSubJect$ = new BehaviorSubject<IAccessData | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreUser();
  }

  register(newUser: Partial<Iuser>) {
    return this.http.post<IAccessData>(this.registerUrl, newUser);
  }

  login(authData: ILoginRequest) {
    return this.http.post<IAccessData>(this.loginUrl, authData).pipe(
      tap((accessData) => {
        this.authSubJect$.next(accessData);
        localStorage.setItem('accessData', JSON.stringify(accessData));

        const expDate = this.jwtHelper.getTokenExpirationDate(
          accessData.accessToken
        );

        if (!expDate) return;

        this.autoLogout(expDate);
      })
    );
  }

  logout() {
    this.authSubJect$.next(null);
    localStorage.removeItem('accessData');
    this.router.navigate(['/auth/login']);
  }

  autoLogout(exDate: Date) {
    const expMs = exDate.getTime() - new Date().getTime();

    setTimeout(() => {
      this.logout();
    }, expMs);
  }

  restoreUser() {
    const userJson: string | null = localStorage.getItem('accessData');
    if (!userJson) return;

    const accessData: IAccessData = JSON.parse(userJson);

    if (this.jwtHelper.isTokenExpired(accessData.accessToken)) {
      localStorage.removeItem('accessData');
      return;
    }
    this.authSubJect$.next(accessData);
  }
}
