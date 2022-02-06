import 'reflect-metadata'
import { ObjectType, Field} from 'type-graphql'

@ObjectType()
export class User {
    @Field((type) => String)
        email: string
    @Field((type) => String, { nullable: true })
        name?: string | null
}