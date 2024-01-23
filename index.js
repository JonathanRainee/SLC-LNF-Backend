const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const cors = require('cors');
require('dotenv').config

const { upload } = require('./middleware/multer')
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const { auth } = require('./config/firebase.config')
const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");

app.use(bodyParser.json())

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

const corsOptions = {
  origin: 'http://localhost:3000',
};  

async function uploadImage(file) {
  const storageFB = getStorage();
  await signInWithEmailAndPassword(auth, process.env.FIREBASE_USER, process.env.FIREBASE_AUTH)
  const dateTime = Date.now();
  const fileName = `images/${dateTime}`
  const storageRef = ref(storageFB, fileName)
  const metadata = {
      contentType: file.type,
  }
  await uploadBytesResumable(storageRef, file.buffer, metadata);
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

app.use(cors(corsOptions));

app.get("/items", async(req, res)=>{
    const allItem = await prisma.item.findMany()
    res.json(allItem)
})

app.get("/itemSearch", async(req, res)=>{
  const d = req.query
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
                contains: d.type,
              },
            },
            {
              foundAt: {
                contains: d.foundAt,
              },
            },
        ],
    },
  });
  res.json(allItem)
})

app.post("/items", async(req, res)=>{
    const item = req.body
    const newItem = await prisma.item.create({ data: {
        name: item.name,
        type: item.type,
        foundAt: item.foundAt,
        foundDate: new Date(item.foundDate),
        description: item.description,
        imageLink: item.imageLink
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
            description: d.description,
            imageLink: d.imageLink
        }
    })
    res.json(updateItem)
})

app.get("/getAdmin", async(req, res)=>{
    const d = req.body
    const admin = await prisma.admin.findUnique({
        where: {
            username: d.username,
        },
    });
    res.json(admin)
})

app.post("/login", async(req, res)=>{
    const d = req.body
    // const d = req.query
    const admin = await prisma.admin.findUnique({
        where: {
            username: d.username,
        },
    });

    if(!admin){
      return res.status(401).json({message: "User not found"})
    }

    try {
        const match = await bcrypt.compare(d.password, admin.password)
        if(match){
          res.status(200).json({ message: 'Authentication successful' });
        }else if(!match){
          res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        next(error);
    }
})

app.post("/insertAdmin", async(req, res)=>{
    const d = req.body
    let defaultPass = "eSElCeLOseNFaUn777"
    let bcyptedPass
    const loop = 10

    bcrypt.hash(defaultPass, loop, async function(err, hashedPassword) {
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

app.post('/upload', upload, async (req, res) => {
    const file = {
        type: req.file.mimetype,
        buffer: req.file.buffer
    }
    try {
      const buildImage = uploadImage(file, 'single').then((e)=>{
        res.send({
            status: "SUCCESS",
            link: e
        })
      })
    } catch(err) {
      console.log(err);
    }
})

app.get('/getRoom', async(req, res)=>{
  const uniqueRooms = await prisma.item.findMany({
    distinct: ['foundAt'],
    select: {
      foundAt: true,
    },
  });
  res.json(uniqueRooms)
})

app.get('/getType', async(req, res)=>{
  const uniqueTypes = await prisma.item.findMany({
    distinct: ['type'],
    select: {
      type: true,
    },
  });
  res.json(uniqueTypes)
})

app.listen(3001, ()=> console.log(`server running on port ${3001}`))