const express = require("express")
const app = express()

app.get("/", function (req, res) {
    res.send(process.env.RESPONSE)
})
app.listen(process.env.PORT)