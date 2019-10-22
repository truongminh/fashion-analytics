const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const productRouter = require('./routers/product')
const app = express()

app.use(express.json())
//app.use(userRouter)
//app.use(taskRouter)
app.use(productRouter)

//app.get('/test', async (req, res) => {
//   res.send("hello khanh")
//})

module.exports = app