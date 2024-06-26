import { google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

export async function authenticateGmail() {
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
  const { client_secret, client_id } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3000");

  const token = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')) : await getNewToken(oAuth2Client);
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return reject(err);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        resolve(token);
      });
    });
  });
}
