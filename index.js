const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

app.use(bodyParser.json())

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get("/items", async(req, res)=>{
    const allItem = await prisma.item.findMany()
    res.json(allItem)
})

app.get("/itemSearch", async(req, res)=>{
    const d = req.body
    if(d.type == null && d.foundAt == null){
        const allItem = await prisma.item.findMany({
            where:{
                name:{
                    contains: d.name
                }
            }
        })
        res.json(allItem)
    }
    else if(d.name == null && d.foundAt == null){
        const allItem = await prisma.item.findMany({
            where:{
                type: d.type
            }
        })
        res.json(allItem)
    }
    else if(d.name == null && d.type == null){
        const allItem = await prisma.item.findMany({
            where:{
                foundAt: d.foundAt
            }
        })
        res.json(allItem)
    }
    else if(d.name != null && d.type != null && d.foundAt == null){
        const allItem = await prisma.item.findMany({
            where:{
                AND:[
                    {
                        name:{
                            contains: d.name
                        },
                        type:{
                            equals: d.type
                        }
                    }
                ]
            }
        })
        res.json(allItem)
    }
    else if(d.name != null && d.foundAt != null && d.type == null){
        const allItem = await prisma.item.findMany({
            where:{
                AND:[
                    {
                        name:{
                            contains: d.name
                        },
                        foundAt: d.foundAt
                    }
                ]
            }
        })
        res.json(allItem)
    }
    else if(d.foundAt != null && d.type != null && d.name == null){
        const allItem = await prisma.item.findMany({
            where:{
                AND:[
                    {
                        type:{
                            equals: d.type
                        },
                        foundAt: d.foundAt
                    }
                ]
            }
        })
        res.json(allItem)
    }
    else if(d.name != null && d.type != null && d.foundAt != null){
        const allItem = await prisma.item.findMany({
            where: {
                AND: [
                    {
                        name: {
                            contains: d.name,
                        },
                    },
                    {
                        type: {
                            equals: d.type,
                        },
                    },
                    {
                        foundAt: {
                            equals: d.foundAt,
                        },
                    },
                ],
            },
        });
        res.json(allItem)
    }
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
    const d = req.body
    const updateItem = await prisma.item.update({
        where:{
            id: String(d.id)
        },
        data:{
            name: d.name,
            type: d.type,
            foundAt: d.foundAt,
            foundDate: new Date(d.foundDate),
            description: d.description
        }
    })
    res.json(updateItem)
})

app.post("/insertAdmin", async(req, res)=>{
    const d = req.body
    let defaultPass = "eSElCeLOseNFaUn777"
    let bcyptedPass

    bcrypt.hash(defaultPass, 10, async function(err, hashedPassword) {
        if (err) {
            console.error('Error hashing password:', err);
        } else {
            bcyptedPass = hashedPassword;
            const newAdmin = await prisma.admin.create({ data: {
                    username: String(d.username),
                    password: bcyptedPass
                }
            })
            res.json(newAdmin)
        }
    });
})

app.listen(3001, ()=> console.log(`server running on port ${3001}`))