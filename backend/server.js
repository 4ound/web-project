const express = require("express")
const app = express()

app.get("/", function (req, res) {
    // res.send(process.env.RESPONSE)
    res.send("Hello world!!!")
})
app.listen(process.env.PORT)