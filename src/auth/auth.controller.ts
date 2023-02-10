import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
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
    @HttpCode(HttpStatus.CREATED)
    async login(@Body() body: LoginDto, @Res() res: Response): Promise<void> {
        const user: User = await this._authService.authorize(res, body);
        res.status(HttpStatus.CREATED).send(user);
    }

    @Delete("logout")
    logout(@Res() res: Response) {
        this._authService.unAuthorize(res);
        res.sendStatus(HttpStatus.CREATED);
    }

    @Post("register")
    async register(@Res() res: Response, @Body() body: RegisterDto) {
        await this._authService.register(body);
        return res.status(HttpStatus.CREATED).json({
            message: "User has been registered successfully"
        });
    }
}
