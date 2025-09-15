// app/api/upload-photos/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Extract base64 data
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filename = body.filename || body?.metadata?.filename || `ATL_Recognition_${Date.now()}.jpg`;

    // Setup Service Account authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix escaped newlines
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CERT_URL
      },
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    // Initialize Google Drive with service account
    const drive = google.drive({ version: 'v3', auth });

    // Convert buffer to stream for Google Drive API
    const stream = Readable.from(imageBuffer);

    // Upload file to Google Drive
    const fileMetadata = {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'] // Optional: specify a folder
    };

    const media = {
      mimeType: 'image/jpeg',
      body: stream
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    // If you need to share the file publicly or with specific users
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      // The folder permissions will be inherited
    } else {
      // Optionally make the file publicly viewable
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink
    });

  } catch (err: any) {
    console.error('Google Drive upload error:', err);
    
    return NextResponse.json({ 
      error: err.message || 'Upload failed' 
    }, { status: 500 });
  }
}
