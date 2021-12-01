import express from 'express'
import { usersRouter } from './users/router'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use('/users', usersRouter)

app.listen(port, ():void => {
  console.log(`App listening at port: http://localhost:${port}`)
})