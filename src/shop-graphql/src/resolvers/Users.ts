import 'reflect-metadata'
import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from 'type-graphql'
import { User, NewUserInput, UpdateUserInput, UserTokens, RefreshedToken } from '../types/Users'
import * as UserService from '../services/Users'
import { Context } from '../auth/auth-checker'

@Resolver(User)
export class UserResolver {
    @Authorized()
    @Query(returns => [User])
    async allUsers(@Ctx() ctx: Context) {
        const users = await UserService.findAll()
        return users
    }

    // @Authorized()
    @Query(returns => User, {nullable: true})
    async getUser(
        @Arg('id') id: number
    ) {
        return await UserService.find(id)
    }

    @Mutation(returns => User)
    async addUser(
        @Arg('newUserData') newUserData: NewUserInput
    ) {
        return await UserService.create(newUserData)
    }

    @Authorized()
    @Mutation(returns => User, {nullable: true})
    async updateUser(
        @Arg('id') id: number,
        @Arg('updateUserData') updateUserData: UpdateUserInput
    ) {
        return await UserService.update(id, updateUserData)
    }

    @Authorized()
    @Mutation(returns => Boolean)
    async removeUser(
        @Arg('id') id: number
    ) {
        await UserService.remove(id)
        return true
    }

    @Authorized()
    @Mutation(returns => UserTokens)
    async loginUser(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ) {
        const tokens = await UserService.login(email, password)
        return tokens
    }

    @Mutation(returns => RefreshedToken)
    async refreshToken(
        @Arg('email') email: string,
        @Arg('token') token: string
    ) {
        const tokens = await UserService.refreshToken(email, token)
        return tokens
    }
}
