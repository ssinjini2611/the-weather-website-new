import { API_KEY } from './config.js';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import schedule from 'node-schedule';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import sendEmail from './mailer.js';
import path from 'path';
import cors from 'cors'; 

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd())));


app.get('/', (req, res) => {
  const filePath = path.join(process.cwd(), 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    }
  });
});


// Replacing the connection string with own MongoDB connection string
const url = 'mongodb+srv://sinjinisarkar:fgthyu09@cluster0.p7gyjz5.mongodb.net/?retryWrites=true&w=majority'
const dbName = 'weatherapp';

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db(dbName);

//periodically send weather updates to subscribed email addresses
const job = schedule.scheduleJob('*/1 * * * *', async () => {
  console.log('Sending weather updates to subscribed email addresses...');

const data = await db.collection('emails').find().toArray();

  
  data.map((d) => {
  
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${d.location}&appid=${API_KEY}&units=metric`)
   .then(res => res.json())
  .then(data => {
                const currentTemp = data.main.temp;
                const feelsLikeTemp = data.main.feels_like;
                const description = data.weather[0].description;

                const message = `
                  Good morning!

                  Here is today's weather update for ${d.location}:

                  Current temperature: ${currentTemp} degrees Celsius
                  Feels like: ${feelsLikeTemp} degrees Celsius
                  Description: ${description}

                  Have a great day!
                `;
                 setTimeout(
                   function() {
                      sendEmail(d.email, message);
                   }, 3000
                 )
              })
  
  })
  
});



app.post('/subscribe', (req, res) => {
  
  const email = req.body.email;
  const location = req.body.location;
  console.log(`New subscription request from ${email} and ${location}`);
  
  db.collection('emails').insertOne({
    location: location,
    email: email
  }, function(err, result) {
    console.log("Inserted a document into the mycollection collection.");
    client.close();
  });
  
  return {
    status: true
  }
});


app.get('/weather/:location', (req, res) => {
  const location = req.params.location;
  

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});


app.listen(3000, () => {
  console.log('Server started on port 3000');
});



