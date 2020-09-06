var express = require("express");
var http = require("http");
var app = express();

app.use(express.static("public"));
app.get("/", function(request, response) {
  response.sendStatus(200);
});

var listener = app.listen(process.env.PORT, function() {});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 270000);
