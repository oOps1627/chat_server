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

    @ApiOperation({summary: "Login user"})
    @ApiResponse({status: HttpStatus.CREATED, type: User})
    @Post("login")
    async login(@Body() body: LoginDto, @Res() res: Response): Promise<void> {
        const user: User = await this._authService.authorize(res, body);
        res.status(HttpStatus.CREATED).send(user);
    }

    @Delete("logout")
    async logout(@Res() res: Response) {
        await this._authService.logout(res);
        res.sendStatus(HttpStatus.CREATED);
    }

    @Post("refresh")
    async refresh(@Res() res: Response): Promise<void> {
        await this._authService.refresh(res);
    }

    @Post("register")
    async register(@Res() res: Response, @Body() body: RegisterDto) {
        await this._authService.register(body);
        return res.status(HttpStatus.CREATED).json({
            message: "User has been registered successfully"
        });
    }
}
