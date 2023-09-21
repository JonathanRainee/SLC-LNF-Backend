const express = require("express")
const app = express()
const {PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient()

app.use(express.json())

app.get("/", async(req, res)=>{
    const allItem = await prisma.item.findMany()
    res.json(allItem)
})

app.listen(3001, ()=> console.log(`server running on port ${3001}`))