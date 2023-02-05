import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get('user-info')
  getAuthorizedUser() {
    return {username: 'Andrii'}
  }
}
