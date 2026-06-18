const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


function generateToken(user){
    return jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    )
}



/**
 * Register User
 */
async function registerUserController(req, res){

    try{

        const { username, email, password } = req.body


        if(!username || !email || !password){
            return res.status(400).json({
                message:"Please provide username, email and password"
            })
        }


        const existingUser = await userModel.findOne({
            $or:[
                {username},
                {email}
            ]
        })


        if(existingUser){
            return res.status(400).json({
                message:"Account already exists with this username or email"
            })
        }


        const hashPassword = await bcrypt.hash(password,10)


        const user = await userModel.create({
            username,
            email,
            password:hashPassword
        })


        const token = generateToken(user)


        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:24*60*60*1000
        })


        res.status(201).json({

            message:"User registered successfully",

            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }

        })


    }catch(error){

        res.status(500).json({
            message:"Internal server error",
            error:error.message
        })

    }

}




/**
 * Login User
 */
async function loginUserController(req,res){

    try{


        const {email,password}=req.body


        const user = await userModel.findOne({email})


        if(!user){

            return res.status(400).json({
                message:"Invalid email or password"
            })

        }



        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )


        if(!isPasswordValid){

            return res.status(400).json({
                message:"Invalid email or password"
            })

        }



        const token = generateToken(user)



        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:24*60*60*1000
        })



        res.status(200).json({

            message:"User logged in successfully",

            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }

        })



    }catch(error){


        res.status(500).json({
            message:"Internal server error",
            error:error.message
        })

    }

}





/**
 * Logout User
 */
async function logoutUserController(req,res){

    try{


        const token = req.cookies?.token


        if(token){

            await tokenBlacklistModel.create({
                token
            })

        }



        res.clearCookie("token")


        res.status(200).json({

            message:"User logged out successfully"

        })


    }catch(error){


        res.status(500).json({
            message:"Internal server error",
            error:error.message
        })


    }


}





/**
 * Get Current User
 */
async function getMeController(req,res){


    try{


        const user = await userModel.findById(req.user.id)



        if(!user){

            return res.status(404).json({
                message:"User not found"
            })

        }



        res.status(200).json({

            message:"User details fetched successfully",

            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }

        })


    }catch(error){


        res.status(500).json({

            message:"Internal server error",
            error:error.message

        })

    }


}



module.exports = {

    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController

}