import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filename = body.filename || `upload_${Date.now()}.jpg`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_PHOTOS_CLIENT_ID,
      process.env.GOOGLE_PHOTOS_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_PHOTOS_REFRESH_TOKEN });
    const tokenResponse = await oauth2Client.getAccessToken();
    const accessToken = tokenResponse?.token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
    }

    const uploadResponse = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-type': 'application/octet-stream',
        'X-Goog-Upload-File-Name': filename,
        'X-Goog-Upload-Protocol': 'raw'
      },
      body: imageBuffer
    });

    const uploadToken = await uploadResponse.text();
    if (!uploadResponse.ok) {
      throw new Error(uploadToken);
    }

    const createResponse = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        albumId: body.albumId,
        newMediaItems: [
          { simpleMediaItem: { uploadToken, fileName: filename } }
        ]
      })
    });

    const createResult = await createResponse.json();
    if (!createResponse.ok) {
      throw new Error(createResult.error?.message || 'Failed to create media item');
    }

    return NextResponse.json({ success: true, result: createResult });
  } catch (err: any) {
    console.error('Google Photos upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
