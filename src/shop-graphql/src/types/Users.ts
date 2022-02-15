import 'reflect-metadata'
import { ObjectType, Field, InputType} from 'type-graphql'

@InputType()
export class NewUserInput {
    @Field()
        email: string

    @Field()
        firstName: string

    @Field()
        lastName: string

    @Field()
        password: string

    @Field({nullable: true})
        phone: string

    @Field({nullable: true})
        address: string

    @Field({nullable: true})
        city: string

    @Field({nullable: true})
        zipCode: string
}


@ObjectType()
class UserStatus {
    @Field()
        id: number

    @Field()
        name: string
}

@ObjectType()
export class User {
    @Field()
        id: number

    @Field()
        email: string

    @Field()
        firstName: string

    @Field()
        lastName: string

    @Field({nullable: true})
        phone: string

    @Field({nullable: true})
        address: string

    @Field({nullable: true})
        city: string

    @Field({nullable: true})
        zipCode: string

    @Field()
        status: UserStatus
}

@InputType()
export class UpdateUserInput {
    @Field({nullable: true})
        email: string

    @Field({nullable: true})
        firstName: string

    @Field({nullable: true})
        lastName: string

    @Field({nullable: true})
        password: string

    @Field({nullable: true})
        phone: string

    @Field({nullable: true})
        address: string

    @Field({nullable: true})
        city: string

    @Field({nullable: true})
        zipCode: string

    @Field({nullable: true})
        statusId: number
}

@ObjectType()
export class UserTokens {
    @Field()
        token: string
    
    @Field()
        refreshToken: string
}

@ObjectType()
export class RefreshedToken {
    @Field()
        token: string
}