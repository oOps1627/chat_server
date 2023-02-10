import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.schema";

interface IDecodedToken {
    userId: string;
    expiresIn: number;
}

const TOKEN_KEY = 'access_token';
const TOKEN_TYPE = 'Bearer';
const TOKEN_EXPIRATION = '1h';
const TOKEN_SECRET = 'Fuck russia';

@Injectable()
export class AuthService {
    constructor(
        private _jwtService: JwtService,
        private _usersService: UsersService
    ) {
    }

    isAuthorized(req: Request): boolean {
        const token = this._getTokenFromCookies(req.cookies);

        return token && !this._isTokenExpired(token);
    }

    getUserIdFromCookies(cookies: object): string | undefined {
        const token = this._getTokenFromCookies(cookies);

        return token && this._parseToken(token)?.userId;
    }

    async authorize(response: Response, loginDto: LoginDto): Promise<User> {
        const user: User = await this._usersService.getUserByUsername(loginDto.username);
        if (!user) {
            throw new HttpException('User with this username not exist', HttpStatus.NOT_FOUND)
        }


        // if (!this._isPasswordsMatch(loginDto, user)) {
        //     throw new HttpException("Password is incorrect", HttpStatus.UNAUTHORIZED);
        // }

        const token = this._generateToken(user);

        this._setTokenToCookies(response, token);

        return user;
    }

    unAuthorize(response: Response): void {
        this._setTokenToCookies(response, null);
    }

    async register(body: RegisterDto): Promise<User> {
        const user: User = await this._usersService.createUser(body);

        return user;
    }

    private _setTokenToCookies(res: Response, token: string): void {
        if (!token) {
            res.cookie(TOKEN_KEY, '');
            return;
        }
        res.cookie(TOKEN_KEY, `${TOKEN_TYPE} ${token}`);
    }

    private _getTokenFromCookies(cookies: object): string | undefined {
        const [tokenType, token] = (cookies[TOKEN_KEY] ?? '').split(' ');
        if (!token || tokenType !== TOKEN_TYPE) {
            return;
        }

        return token;
    }

    private _isTokenExpired(token: string): boolean {
        return false; // TODO: check expiration;
    }

    private _generateToken(user: User): string {
        return this._jwtService.sign({userId: user.id}, {secret: TOKEN_SECRET, expiresIn: TOKEN_EXPIRATION});
    }

    private _parseToken(token: string): IDecodedToken {
        return this._jwtService.decode(token) as IDecodedToken;
    }

    private _isPasswordsMatch(loginDto: LoginDto, user: User): boolean {
        return loginDto.password === user.password;
    }
}
