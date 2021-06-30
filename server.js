const express = require('express')
const path = require('path')
const app = express()
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'vbkjb2dbdg44dg4db6d4bd77hh%(3@bgfbn.lj/'

app.use(express.static('model'))
mongoose.connect('mongodb://localhost:27017/loginTry1',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post('/api/login', async(req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne ({username}).lean()

    if(!user) {
        return res.json({ status: 'error', error: 'Invalid username/password'})
    }
    if (await bcrypt.compare(password, user.password)){
        const token = jwt.sign({
            id: user._id, username: user.username
        }, JWT_SECRET)

        return res.json({ status: 'ok', data: token})
    }
    res.json({status: 'error', error: 'Invalid username/password'})
})


app.post('/api/register', async (req,res)=>{
    const {username, password: plainTextPassword} = req.body

    if(plainTextPassword.length < 6 ){
        return res.json({ status: 'error', error: 'Password is too small'})
    }
    const password = await bcrypt.hash(plainTextPassword, 10)

    try{
        const response = await User.create({ username, password })
        console.log("User created successfully", response);
    }catch(error) {
        if(error.code === 11000){
            return res.json({status: 'error', error: "Username is already in use"})
        }
        throw error
    }
    res.json({status: 'ok'})
})
app.get("/",(req,res)=>{
    res.set({ "Allow-access-Allow-Origin" : '*'})
    return res.redirect('register.html')
}).listen(3000)
