import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Iuser } from '../../interfaces/iuser';
import { AuthServiceService } from '../auth/auth-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  formData: Partial<Iuser> = {};

  constructor(private authSvc: AuthServiceService, private router: Router) {}

  register() {
    this.authSvc.register(this.formData).subscribe((res) => {
      this.router.navigate(['/auth/login']);
    });
  }
}
