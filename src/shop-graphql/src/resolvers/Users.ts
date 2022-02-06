import 'reflect-metadata'
import { Resolver, Mutation, Arg, Query } from 'type-graphql'
import { User } from '../types/Users'
import * as UserService from '../services/Users'

@Resolver(User)
export class UserResolver {
    @Query(returns => [User], { nullable: true })
    async allUsers() {
        const users = await UserService.findAll()
        return users
    }
    @Query(returns => String, {nullable: true})
    async hello() {
        return 'Hello'
    }
}
