const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(o => o.trim())

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true)
        if (frontendOrigins.indexOf(origin) !== -1) return callback(null, true)
        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
}))
/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
/**using all the routes here */
app.use("/api/auth", authRouter)
console.log("INTERVIEW ROUTES LOADED")
app.use("/api/interview", interviewRouter)
module.exports = app 