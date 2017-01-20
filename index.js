var Express = require('express')
var open = require('open')
var path = require('path')

var app = new Express()

app.use(Express.static(path.resolve(__dirname,'public')))

app.get('/', function(req, res){
	res.sendFile(path.resolve(__dirname,'views/home.html'))
})

app.listen(4000)

console.log("app is listen to port 4000")

open('http://localhost:4000')