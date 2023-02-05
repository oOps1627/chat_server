import { Body, Controller, Delete, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "../users/user.schema";
import { LoginDto } from "./dto/login.dto";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private _authService: AuthService) {
  }

  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 201, type: User })
  @Post("login")
  login(@Body() body: LoginDto, @Res() res: Response) {
    this._authService.authorize(res, body);
    res.sendStatus(201);
  }

  @Delete("logout")
  logout(@Res() res: Response) {
    this._authService.unAuthorize(res);
    res.sendStatus(201);
  }

  @Post("register")
  register(@Res() res: Response, @Body() body: RegisterDto) {
    this._authService.register(body);
    return res.status(HttpStatus.CREATED).json({
      message: "User has been registered successfully"
    });
  }
}
