import 'reflect-metadata'
import { ObjectType, Field, InputType} from 'type-graphql'

@ObjectType()
class OrderItem {
    @Field()
        id: number

    @Field()
        productId: number

    @Field()
        name: string

    @Field()
        description: string

    @Field()
        price: number

    @Field()
        quantity: number
}

@ObjectType()
class OrderStatus {
    @Field()
        id: number

    @Field()
        name: string
}

@ObjectType()
export class Order {
    @Field()
        id: number

    @Field()
        userId: number

    @Field()
        created: Date

    @Field()
        updated: Date

    @Field()
        status: OrderStatus

    @Field()
        price: number

    @Field(type => [OrderItem])
        items: OrderItem[]
}