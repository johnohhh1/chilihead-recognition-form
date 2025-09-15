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

    // Parse the service account JSON key
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');

    // Setup Service Account authentication
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    // Initialize Google Drive with service account
    const drive = google.drive({ version: 'v3', auth });

    // Convert buffer to stream
    const stream = Readable.from(imageBuffer);

    // Upload file to Google Drive
    const fileMetadata = {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root']
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
