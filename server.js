import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Access token helper
async function getAccessToken() {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  );

  return response.data.access_token;
}

// Payment endpoint
app.post("/pay", async (req, res) => {
  const { phone, amount } = req.body;
  try {
    const accessToken = await getAccessToken();

    const Timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const Password = Buffer.from(
      `${process.env.SHORTCODE}${process.env.PASSKEY}${Timestamp}`
    ).toString("base64");

    await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.SHORTCODE,
        Password,
        Timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "KaribuBnB Host Payment",
        TransactionDesc: "Payment for Host Registration"
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    await db.collection("hostPayments").add({
      phone,
      amount,
      status: "Pending",
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "M-Pesa STK Push sent! Please check your phone to complete the payment."
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Payment request failed. Please try again."
    });
  }
});

// Daraja callback
app.post("/callback", async (req, res) => {
  const body = req.body;
  console.log("Callback received:", JSON.stringify(body, null, 2));

  if (body.Body.stkCallback.ResultCode === 0) {
    const metadata = body.Body.stkCallback.CallbackMetadata.Item;
    const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value;
    await db.collection("hostPayments").add({
      phone,
      status: "Success",
      timestamp: new Date()
    });
  }
  res.json({ message: "Callback processed" });
});

app.get("/", (req, res) => res.send("KaribuBnB Payments API working ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
