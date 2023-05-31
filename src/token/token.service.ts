import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { IncomingHttpHeaders } from "http";
import { JwtService } from "@nestjs/jwt";
import { parse } from "cookie";
import { CookieOptions } from "express-serve-static-core";
import { InjectModel } from "@nestjs/mongoose";
import { Token } from "./token.schema";
import { HydratedDocument, Model } from "mongoose";

export interface ITokenInfo {
  userId: string;
  username: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

interface ITokenOptions {
  KEY: string;
  EXPIRATION: string;
  SECRET: string;
}

const ACCESS_TOKEN: ITokenOptions = {
  KEY: "access_token",
  EXPIRATION: "30m",
  SECRET: "russia sucks",
}

const REFRESH_TOKEN: ITokenOptions = {
  KEY: "refresh_token",
  EXPIRATION: "30d",
  SECRET: "russia is bad country",
}

@Injectable()
export class TokenService {
  constructor(
    private _jwtService: JwtService,
    @InjectModel(Token.name) private _tokenModel: Model<HydratedDocument<Token>>
  ) {
  }

  getDecodedAccessToken(headers: IncomingHttpHeaders): ITokenInfo | undefined {
    const token: string = this._getTokenFromCookies(headers, ACCESS_TOKEN);

    return this._decodeToken(token, ACCESS_TOKEN);
  }

  getDecodedRefreshToken(headers: IncomingHttpHeaders): ITokenInfo | undefined {
    const token: string = this._getTokenFromCookies(headers, REFRESH_TOKEN);

    return this._decodeToken(token, REFRESH_TOKEN);
  }

  generateTokens(tokenInfo: ITokenInfo): ITokens {
    return {
      accessToken: this._generateToken(tokenInfo, ACCESS_TOKEN),
      refreshToken: this._generateToken(tokenInfo, REFRESH_TOKEN),
    };
  }

  async isRefreshTokenValid(headers: IncomingHttpHeaders): Promise<boolean> {
    const userId = this.getDecodedAccessToken(headers)?.userId;
    const refreshToken = this._getTokenFromCookies(headers, REFRESH_TOKEN);
    
    const pair: Token = await this._tokenModel.findOne({userId}).exec();

    return pair && pair.refreshToken === refreshToken;
  }

  async saveTokens(res: Response, tokens: ITokens): Promise<void> {
    this._setAccessTokenToCookies(res, tokens.accessToken);
    this._setRefreshTokenToCookies(res, tokens.refreshToken);
    await this._setRefreshTokenToDB(res, tokens.refreshToken);
  }

  async deleteTokens(res: Response): Promise<void> {
    this._setAccessTokenToCookies(res, null);
    this._setRefreshTokenToCookies(res, null);
    await this._deleteRefreshTokenFromDB(res);
  }

  private _getTokenFromCookies(headers: IncomingHttpHeaders, options: ITokenOptions): string | undefined {
    let cookies;
    try {
      cookies = parse(headers.cookie);
    } catch (error) {
      console.error(error);
      return;
    }

    return cookies[options.KEY];
  }

  private _setTokenToCookies(res: Response, token: string, tokenOptions: ITokenOptions): void {
    const cookieOptions: CookieOptions = { httpOnly: true };

    res.cookie(tokenOptions.KEY, token ?? '', cookieOptions);
  }

  private _setAccessTokenToCookies(res: Response, token: string): void {
   this._setTokenToCookies(res, token, ACCESS_TOKEN);
  }

  private _setRefreshTokenToCookies(res: Response, token: string): void {
    this._setTokenToCookies(res, token, REFRESH_TOKEN);
  }

  private async _setRefreshTokenToDB(res: Response, refreshToken: string): Promise<void> {
    const userId = this.getDecodedAccessToken(res.req.headers)?.userId;
    const pair = await this._tokenModel.findOne({ userId }).exec();
    const newToken: Token = { refreshToken, userId };
    if (pair) {
      await pair.updateOne(newToken);
    } else {
      await this._tokenModel.create(newToken);
    }
  }

  private async _deleteRefreshTokenFromDB(res: Response): Promise<void> {
    const userId = this.getDecodedAccessToken(res.req.headers)?.userId;
    await this._tokenModel.findOneAndDelete({ userId }).exec();
  }

  private _generateToken(tokenInfo: ITokenInfo, options: ITokenOptions): string {
    return this._jwtService.sign(tokenInfo, {
      secret: options.SECRET,
      expiresIn: options.EXPIRATION
    });
  }

  private _decodeToken(token: string, options: ITokenOptions): ITokenInfo {
    let decodedToken: ITokenInfo;

    try {
      decodedToken = this._jwtService.verify(token, { secret: options.SECRET }) as ITokenInfo;
    } catch (error) {
      console.error("Token expired or invalid");
    }

    return decodedToken;
  }
}
