import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// 🔸 Firebase init
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

// 🔸 M-Pesa credentials
const shortcode = process.env.SHORTCODE;
const passkey = process.env.PASSKEY;
const callbackURL = process.env.CALLBACK_URL;

// 🔸 Generate access token
async function getAccessToken() {
  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { auth: { username: process.env.CONSUMER_KEY, password: process.env.CONSUMER_SECRET } }
  );
  return data.access_token;
}

// 🔸 Payment route
app.post("/pay", async (req, res) => {
  const { phone, amount } = req.body;
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0,14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackURL,
        AccountReference: "KaribuBnBHost",
        TransactionDesc: "Host subscription payment"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await db.collection("hostPayments").add({ phone, amount, status:"Pending", created:new Date() });
    res.json({ success:true, message:"Enter your M-Pesa PIN to complete payment." });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.json({ success:false, message:"Payment request failed." });
  }
});

app.listen(3000, ()=>console.log("Server running on port 3000"));
