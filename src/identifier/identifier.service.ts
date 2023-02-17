import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { User } from "../users/user.schema";
import { IncomingHttpHeaders } from "http";
import { JwtService } from "@nestjs/jwt";
import { parse } from "cookie";

interface IDecodedToken {
  userId: string;
  username: string;
}

const TOKEN_KEY = "access_token";
const TOKEN_TYPE = "Bearer";
const TOKEN_EXPIRATION = "1h";
const TOKEN_SECRET = "Fuck russia";

@Injectable()
export class IdentifierService {
  constructor(
    private _jwtService: JwtService
  ) {
  }

  identify(headers: IncomingHttpHeaders): IDecodedToken | undefined {
    const token = this.getToken(headers);

    return this._parseToken(token);
  }

  mark(response: Response, user: User): void {
    if (!user) {
      this._setTokenToCookies(response, null);
      return;
    }

    const token = this._generateToken(user);
    this._setTokenToCookies(response, token);
  }

  getToken(headers: IncomingHttpHeaders): string | undefined {
    let cookies;
    try {
      cookies = parse(headers.cookie);
    } catch (error) {
      console.error(error);
      return;
    }

    const [tokenType, token] = (cookies[TOKEN_KEY] ?? "").split(" ");
    if (!token || tokenType !== TOKEN_TYPE) {
      return;
    }

    return token;
  }

  private _setTokenToCookies(res: Response, token: string): void {
    if (!token) {
      res.cookie(TOKEN_KEY, "");
      return;
    }
    res.cookie(TOKEN_KEY, `${TOKEN_TYPE} ${token}`);
  }


  private _generateToken(user: User): string {
    return this._jwtService.sign({
      userId: user.id,
      username: user.username
    } as IDecodedToken, { secret: TOKEN_SECRET, expiresIn: TOKEN_EXPIRATION });
  }

  private _parseToken(token: string): IDecodedToken {
    let decodedToken: IDecodedToken;

    try {
      decodedToken = this._jwtService.verify(token, { secret: TOKEN_SECRET }) as IDecodedToken;
    } catch (error) {
      console.error('Token expired or invalid');
    }

    return decodedToken;
  }
}
