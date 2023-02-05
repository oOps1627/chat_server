import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { parse } from "cookie";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.schema";

const ACCESS_TOKEN_KEY = 'access_token';

@Injectable()
export class AuthService {
  constructor(
    private _jwtService: JwtService,
    private _usersService: UsersService
  ) {
  }

  async authorize(response: Response, loginDto: LoginDto): Promise<any> {
    const user: User = await this._usersService.getUserByUsername(loginDto.username);
    if (!user) {
      throw new HttpException(response, HttpStatus.NOT_FOUND, { description: "User with this username not exist" });
    }

    if (!this._isPasswordsMatch(loginDto, user)) {
      throw new HttpException(response, HttpStatus.UNAUTHORIZED, { description: "Password is incorrect" });
    }

    const token = this._generateToken(user);

    this._setTokenToCookies(response, token);
  }

  unAuthorize(response: Response): void {
    this._setTokenToCookies(response, null);
  }

  async register(body: RegisterDto): Promise<User> {
    const user: User = await this._usersService.createUser(body);

    return user;
  }

  isAuthorized(req: Request): boolean {
    const token = this._getTokenFromCookies(req.cookies);

    return token && !this._isTokenExpired(token);
  }

  private _setTokenToCookies(res: Response, token: string): void {
    res.cookie(ACCESS_TOKEN_KEY, token);
  }

  private _getTokenFromCookies(cookies: string): string | undefined {
    const parsedCookies = parse(cookies);
    return parsedCookies[ACCESS_TOKEN_KEY];
  }

  private _isTokenExpired(token: string): boolean {
    return false; // TODO: check expiration;
  }

  private _generateToken(user: User): string {
    return this._jwtService.sign(user, {secret: 'Fuck russia', expiresIn: '1h'});
  }

  private _isPasswordsMatch(loginDto: LoginDto, user: User): boolean {
    return loginDto.password === user.password;
  }
}
