import express from 'express'
import morgan from 'morgan';
import { usersRouter } from './users/router'

const app = express()
const port = process.env.PORT || 3000

app.use(morgan('tiny'));

app.use(express.json())
app.use('/users', usersRouter)

app.listen(port, () => {
  console.log(`App listening at port: http://localhost:${port}`)
})