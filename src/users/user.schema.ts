import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { transformID } from "../helpers/json-transformer";

@Schema({
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: transformID
    }
})
export class User {
    id: string;

    @ApiProperty({type: 'string'})
    @Prop({unique: true, required: true})
    username: string;

    @Exclude()
    @ApiProperty({type: 'string'})
    @Prop({required: true})
    password: string;

    @Exclude()
    public currentHashedRefreshToken?: string;

    @ApiProperty({type: 'number', isArray: true})
    @Prop({default: []})
    roomsIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
