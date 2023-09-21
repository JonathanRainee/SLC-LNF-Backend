const express = require("express")
const app = express()
const {PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient()

app.use(express.json())

app.get("/", async(req, res)=>{
    const allItem = await prisma.item.findMany()
    res.json(allItem)
})

app.post("/", async(req, res)=>{
    const item = req.body
    const name = String(item.name)
    console.log("hehe");
    console.log(`${name}`);
    const newItem = await prisma.item.create({ data: {
        name: String(item.name),
        type: String(item.type),
        foundAt: Number(item.foundAt),
        foundDate: new Date(item.foundDate),
        description: String(item.description)
    } })
    res.json(newItem)
})

app.listen(3001, ()=> console.log(`server running on port ${3001}`))