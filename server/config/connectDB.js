const mongoose = require('mongoose')


async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        const connection = mongoose.connection

        connection.on('connected',()=>{
            console.log("Connected to Db")
        })

        connection.on('error',(error)=>{
            console.log("Something is wrong in Mongodb",error)
        })
    } catch (error) {
        console.log("Something is wrong", error)
    }
}

module.exports = connectDB
