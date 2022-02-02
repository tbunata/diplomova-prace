import express from 'express'
import expressWs from 'express-ws'
import morgan from 'morgan';

export const app = expressWs(express()).app

import { usersRouter } from './users/router'
import { productsRouter } from './products/router';
import { categoriesRouter } from './categories/router';
import { cartsRouter } from './carts/router';


app.use(morgan('tiny'));

app.use(express.json())
app.use('/users', usersRouter)
app.use('/products', productsRouter)
app.use('/categories', categoriesRouter)
app.use('/carts', cartsRouter)