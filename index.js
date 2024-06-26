import express from 'express';
import { authenticateGmail } from './googleOauth.js';
import { google } from 'googleapis';

const app = express();
const port = process.env.PORT || 3000;

import { Queue, Worker } from 'bullmq';
import IORedis from "ioredis";
const connection = new IORedis({
  password: 'QtlE9FH4hyxogHrIR5gmnaoVxzEmhmco',
  host: 'redis-18370.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 18370,
  maxRetriesPerRequest: null,
}
);

const emailQueue = new Queue('emailQueue', { connection });

app.get('/oauth2callback', async (req, res) => {
  const gmailClient = await authenticateGmail();
  // const outlookClient = await authenticateOutlook();

  // Add a job to the queue
  emailQueue.add('processEmail', { gmailClient });

  res.send('Authenticated!');
});


new Worker('emailQueue', async (job) => {
  const { gmailClient } = job.data;

  // Read emails from Gmail and Outlook
  const gmailEmails = await readEmails(gmailClient); // Implement this function
  // const outlookEmails = await readEmails(outlookClient); // Implement this function

  const allEmails = [...gmailEmails];

  for (const email of allEmails) {
    const category = await analyzeEmailContent(email.content);
    const reply = await generateReply(category, email.content);
    await sendReply(email, reply); // Implement this function
  }

}, { connection });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});