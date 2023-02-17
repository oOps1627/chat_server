import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const isAuthorized = this._authService.isAuthorized(request);

    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return isAuthorized;
  }
}
