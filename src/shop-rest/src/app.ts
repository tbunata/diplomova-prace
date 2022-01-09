import express from 'express'
import morgan from 'morgan';
import { usersRouter } from './users/router'
import { productsRouter } from './products/router';

export const app = express()

app.use(morgan('tiny'));

app.use(express.json())
app.use('/users', usersRouter)
app.use('/products', productsRouter)
