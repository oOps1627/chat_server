import * as bcrypt from "bcrypt";

export class PasswordHasher {
   static hashPassword(password: string): Promise<string> {
    const saltOrRounds = 9;

    return bcrypt.hash(password, saltOrRounds);
  }

  static compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
