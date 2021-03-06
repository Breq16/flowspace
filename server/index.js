require("dotenv").config()

const Koa = require("koa")
const bodyparser = require("koa-bodyparser")
const websocket = require("koa-easy-ws")

const { rateLimit } = require("./middleware/rateLimit")
const authMiddleware = require("./middleware/auth")
const { errorHandler, errorCatcher } = require("./middleware/error")
const requireLogin = require("./middleware/requireLogin")
const cors = require("./middleware/cors")
const gateway = require("./middleware/gateway")

const indexRoutes = require("./routes/index")
const avatarRoutes = require("./routes/avatar")
const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")
const relationshipRoutes = require("./routes/relationship")
const messagesRoutes = require("./routes/messages")
const postsRoutes = require("./routes/posts")
const feedRoutes = require("./routes/feed")
const commentsRoutes = require("./routes/comments")

const app = new Koa()


// BigInt JSON Serialization hack using prototype manipulation
BigInt.prototype.toJSON = function() { return this.toString() }


// App Configuration
app.use(cors)

app.use(errorCatcher)
app.on("error", errorHandler)

app.use(bodyparser({
    enableTypes: ["json", "form", "text"]
}))

// Preliminary Authentication Middleware
app.use(authMiddleware)

app.use(rateLimit)

// Unprotected Routes
app.use(indexRoutes.routes())
app.use(indexRoutes.allowedMethods())

// Avatars are public
app.use(avatarRoutes.routes())
app.use(avatarRoutes.allowedMethods())

// (auth routes must be unprotected, how else would users get a token?)
app.use(authRoutes.routes())
app.use(authRoutes.allowedMethods())

// WebSocket / Gateway Server
// Unprotected since the JavaScript WebSockets API doesn't allow setting
// the Authorization header. We roll our own auth packet system
app.use(websocket())
app.use(gateway)

// Authentication Required Middleware -- login required beyond this point
app.use(requireLogin)

// Protected Routes
app.use(profileRoutes.routes())
app.use(profileRoutes.allowedMethods())

app.use(relationshipRoutes.routes())
app.use(relationshipRoutes.allowedMethods())

app.use(messagesRoutes.routes())
app.use(messagesRoutes.allowedMethods())

app.use(postsRoutes.routes())
app.use(postsRoutes.allowedMethods())

app.use(feedRoutes.routes())
app.use(feedRoutes.allowedMethods())

app.use(commentsRoutes.routes())
app.use(commentsRoutes.allowedMethods())


if (require.main === module) {
    app.listen(process.env.PORT || 5000, process.env.HOST || "0.0.0.0")
}

module.exports = app