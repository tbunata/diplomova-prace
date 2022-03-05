import { createApp } from './app'

const PORT = process.env.PORT || 3333

const serverStart = async () => {
    const app = await createApp()
    app.listen(PORT, () =>
        console.log(`🚀 Server ready and listening at ==> http://localhost:${PORT}/graphql`)
    )
}

serverStart()