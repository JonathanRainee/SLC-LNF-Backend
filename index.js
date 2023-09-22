const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const {PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient()

app.use(bodyParser.json())

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get("/items", async(req, res)=>{
    const allItem = await prisma.item.findMany()
    res.json(allItem)
})

app.post("/items", async(req, res)=>{
    const item = req.body
    const newItem = await prisma.item.create({ data: {
            name: item.name,
            type: item.type,
            foundAt: item.foundAt,
            foundDate: new Date(item.foundDate),
            description: item.description
        }
    })
    res.json(newItem)
})

app.delete("/items", async(req, res)=>{
    const d = req.body
    const delItem = await prisma.item.delete({ 
        where: {
            id: String(d.id)
        },
    })

    res.send(d)
})

app.put("/items", async(req, res)=>{
    const item = req.body
})

app.listen(3001, ()=> console.log(`server running on port ${3001}`))