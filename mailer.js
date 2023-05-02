// import the nodemailer library for sending emails
import nodemailer from 'nodemailer';

// import the emailjs library for email service in browser
import emailjs from '@emailjs/browser';

// create a test email account using nodemailer
let testAccount = await nodemailer.createTestAccount();

// create a transporter object using nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  auth: {
    user: 'weatherapp643@gmail.com',
    pass: 'hawhvohouinihqss'
  }
});

// function to send an email with given email and message
function sendEmail(email, message) {
  
  // define email options such as from, to, subject, and message
  const mailOptions = {
    from: 'weatherapp643@gmail.com',
    to: email,
    subject: 'Daily Weather Update',
    text: message
  };

  // send email using transporter object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error); // log the error if email failed to send
    } else {
      console.log(`Email sent to ${email}: ${info.response}`);// log the successful email sending with recipient email and response info
    }
  });
}

// export the sendEmail function to use it in other files
export default sendEmail;

