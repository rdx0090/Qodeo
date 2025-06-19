// This file is a Serverless Function that will run on Vercel's servers.

// We need to use 'require' because this is a Node.js environment
const admin = require('firebase-admin');

// We will get the service account key from Vercel's environment variables
// This is the SAFE way to handle secret keys
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    });
  }
} catch (e) {
  console.error('Firebase Admin Init Error:', e);
}

const db = admin.firestore();

// The main function that handles the request
module.exports = async (req, res) => {
  const slug = req.query.slug;

  if (!slug) {
    return res.status(400).json({ error: 'QR Code identifier is missing.' });
  }

  try {
    const linkDoc = await db.collection('links').doc(slug).get();

    if (!linkDoc.exists) {
      return res.status(404).json({ error: 'This QR Code does not exist or has been deleted.' });
    }

    const { originalUrl } = linkDoc.data();
    
    // Perform a 307 Temporary Redirect to the destination URL
    res.redirect(307, originalUrl);

  } catch (error) {
    console.error('Redirection Error:', error);
    res.status(500).json({ error: 'Could not process the QR Code. Please try again later.' });
  }
};
