//need Profile with heroku to run server code. web: node app


const express = require('express');
// used to get input field information
const bodyParser = require('body-parser');
// used for post request
const request = require('request');
// used for url request
const https = require('https');
// create express app
const app = express();

const eVariables = require('dotenv').config();
// set port
const port = process.env.PORT;

//allows us to parse and look into body.
app.use(bodyParser.urlencoded({extended:true}));
// sets the directory to static that express will look into.
app.use(express.static("public"));
// show homepage as the signup file.
app.get('/', (request,response) => {
  response.sendFile(__dirname + "/signup.html")

});

app.post('/', (request,response) => {
  const firstName = request.body.fName;
  const lastName = request.body.lName;
  const userEmail =  request.body.email
  // create data fields to match mailchimp.
  const data = {
    members: [{
      email_address: userEmail,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  }
  // convert data to mailchimp format.
  const jsonData = JSON.stringify(data);
  // console.log(jsonData)
  // set url to post to with audience id.
  const url = "https://us20.api.mailchimp.com/3.0/lists/84320c999e";
  // create request to post, with any string  for auth.
  const options = {
    method: "post",
    // generate apikey from mailchimp and place in the auth section under auth in place of ENTERAPIKEYHERE
    auth: "chris:" + process.env.SECRETKEY
  }
  const mailChimpRequest = https.request(url, options, (mailChimpResponse) => {

    mailChimpResponse.on("data", (returnedData) => {
          let statusCode = mailChimpResponse.statusCode;
          console.log(JSON.parse(returnedData).total_created)
          if(JSON.parse(returnedData).total_created === 0) {
              response.sendFile(__dirname + "/hostedForm.html");
          } else if ( statusCode === 200) {
              response.sendFile(__dirname + "/success.html");
          } else {
            response.sendFile(__dirname + "/failure.html");
          }
    })
  })
  // write json data from post request
  mailChimpRequest.write(jsonData);
  console.log(mailChimpRequest)
  // tell when to stop
  mailChimpRequest.end();
});


app.post("/failure", (request,response) => {
  response.redirect("/")
});

app.listen(port || 2000, () => {
  console.log("Up and running.");
});
