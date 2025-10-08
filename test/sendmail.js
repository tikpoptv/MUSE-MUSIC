import axios from "axios";
import "dotenv/config";

async function getToken() {
  const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const { data } = await axios.post(url, params);
  return data.access_token;
}

async function sendMail() {
  const token = await getToken();
  const email = {
    message: {
      subject: "Hello from Graph API 👋",
      body: { contentType: "Text", content: "This is a test email sent via Microsoft Graph API!" },
      toRecipients: [{ emailAddress: { address: process.env.RECIPIENT_EMAIL } }],
    },
    saveToSentItems: "false",
  };

  await axios.post(
    `https://graph.microsoft.com/v1.0/users/${process.env.SENDER_EMAIL}/sendMail`,
    email,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  console.log("✅ Email sent!");
}

sendMail().catch((err) => {
  console.error("❌ Error:", err.response?.data || err);
});
