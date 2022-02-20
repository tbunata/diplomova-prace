import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import Express from 'express'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { verifyToken } from './auth/auth-middleware'
import { authChecker } from './auth/auth-checker'

import { CategoryResolver } from './resolvers/Categories'
import { CartResolver } from './resolvers/Carts'
import { ProductResolver } from './resolvers/Products'
import { UserResolver } from './resolvers/Users'

const app = Express()
app.use(Express.json())
app.use(verifyToken)


const main = async () => {
    const schema = await buildSchema({
        resolvers: [
            CartResolver,
            CategoryResolver,
            ProductResolver,
            UserResolver,
        ],
        emitSchemaFile: true,
        validate: false,
        authChecker: authChecker,
    })

    const server = new ApolloServer({
        schema,
        plugins: [ ApolloServerPluginLandingPageGraphQLPlayground ],
        context: ({ req }) => {
            const context = {
                req,
                user: req.user,
            }
            return context
        }
    })

    await server.start()
    server.applyMiddleware({ app })
    
    app.listen({ port: 3333 }, () =>
        console.log(
            `🚀 Server ready and listening at ==> http://localhost:3333${server.graphqlPath}`
        )
    )
}

main().catch((error) => {
    console.log(error, 'error')
})