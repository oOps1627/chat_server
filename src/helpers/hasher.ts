import * as bcrypt from "bcrypt";

export class Hasher {
   static hash(message: string): Promise<string> {
    const saltOrRounds = 9;

    return bcrypt.hash(message, saltOrRounds);
  }

  static compare(message: string, hashedMessage: string): Promise<boolean> {
    return bcrypt.compare(message, hashedMessage);
  }
}
