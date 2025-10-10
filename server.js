import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Firebase setup
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore();

// M-Pesa payment route
app.post("/pay", async (req, res) => {
  const { phone, amount } = req.body;
  const accessToken = process.env.MPESA_TOKEN;

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.SHORTCODE,
        Password: process.env.PASSWORD,
        Timestamp: process.env.TIMESTAMP,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "KaribuBnB Host Payment",
        TransactionDesc: "Payment for Host Subscription"
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    await db.collection("hostPayments").add({
      phone,
      amount,
      status: "Pending",
      createdAt: new Date()
    });

    res.json({ success: true, message: "STK Push sent! Enter M-Pesa PIN to complete." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Payment failed. Try again." });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
