const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const send = require("send");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

function sendEmail({ user_email,subject, message, fullName, tele }) {
    return new Promise((resolve, reject) => {
        var transport = nodemailer.createTransport({
            service: "gmail",
       
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mail_configs = {
            from: {
                name: fullName,
                address:user_email
            },
            to:process.env.EMAIL_REC,
            subject: subject || "Pour vous contacter",
            text: message,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3 style="color: black;">Nouveau message de ${fullName}</h3>
                    <p><strong>Email:</strong> ${user_email}</p>
                    <h3><strong> Télé:</strong>${tele ||'No number' }</h3>
                    <p><strong>Message:</strong></p>
                    <p style="padding: 15px;">
                        ${message}
                    </p>
                  
                </div>
            `
        };

        transport.sendMail(mail_configs, function (error, info) {
            if (error) {
                console.log(error);
                return reject({ message: "Error" });
            }
            return resolve({ message: "Email sent successfully" });
        });
    });
}


app.post("/send_email", (req, res) => {
    const { user_email, message, fullName, tele } = req.body;

    if (!user_email || !message||!fullName||!tele) {
        return res.status(400).send("Recipient email and message are required");
    }

    sendEmail({ user_email, fullName, tele, message })
        .then(response => res.send(response.message))
        .catch(error => res.status(500).send(error.message));
});

app.post("/send_devis", (req, res) => {
    const { user_email,subject, message, fullName, tele } = req.body;
    if (!user_email || !fullName || !tele || !message||!subject) {
        return res.status(400).send("Recipient email and message are required");
    }

    sendEmail({ user_email,subject, fullName, tele, message })
        .then(response => res.send(response.message))
        .catch(error => res.status(500).send(error.message));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
