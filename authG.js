import { google } from "googleapis";
import 'dotenv/config';

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);
const scope = "https://www.googleapis.com/auth/calendar";
let token;

export async function DoAuth(req, res) {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scope
    });
    res.redirect(url)
}

export async function GetAuth(req, res) {
    const tokenGenerate = await oauth2Client.getToken(req.query.code)
    oauth2Client.setCredentials(tokenGenerate);
    token = await tokenGenerate.tokens.access_token
    res.json('Auth Successful')
}

export function GetToken(){
    if (token) {
        return token
    } else {
        return null
    }
}


