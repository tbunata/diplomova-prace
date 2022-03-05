import 'reflect-metadata'
import { ObjectType, Field, InputType} from 'type-graphql'


@ObjectType()
export class Category {
    @Field()
        id: number

    @Field()
        name: string

    @Field()
        description: string
}

@InputType()
export class NewCategoryInput {
    @Field()
        name: string

    @Field()
        description: string
}

@InputType()
export class UpdateCategoryInput {
    @Field({nullable: true})
        name: string

    @Field({nullable: true})
        description: string
}