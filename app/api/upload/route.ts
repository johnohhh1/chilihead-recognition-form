// app/api/upload/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const credentials = {
  type: 'service_account',
  project_id: 'chilis-recognition',
  private_key_id: '0bd23075afafcf544a5f4dd1596f501329411ade',
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLuxefeE+OIa/o\n3hUbJxM9JWyb53FSKCA5Z6AjubSN0U9DXEcf+7rbUK+VyzKaoTijekRafKKKBZI8\nwW2fc7KQHe8PN0nZ3vqAjbH8Q1He8BwWLhYjHQGuPJz+ZxrjK2HMTB/VXmSoZrEX\nlx5y9gQLu7CNuC6O3ZxDyFyq+sPqiV/p9vzRaNsJ6d5FW4+BMRTxAyO5jyEpVkgT\nH0m0kGc49GFdJTWBNzPpSTvR0sMI5ZPTOFtNtPJ5uQrgfJDuXLk6922L8EmV0AXw\nX1rW1SO77tX8inVITiKqW0gPpnIGlP4y0wXcD1zawpG30knh6wowCeYkLGXw1WoF\nk/uSh1pTAgMBAAECggEATjI88nIIwwqODMj0++uHGGCda8etOLX7DF2IWz4Dna1Z\niYbJK+8AfP5erpWEElLQPPsIclzFPEnAI/6wN1P+lQ9QOxxjBbNundoFF0i1i2bI\nuQCucYLIKtrL/V+Qs+HqUzJiw5BL/VERJvdTcheYXPKI5RRtFlvcBy5H1z6R5Rpu\nlUAg17w9sZ8QfWgBQWhQmsJM9yUjNixK+eJx4PWW1WpOfzAyx2T3bCyOBV/LD4NG\ndEe4ekPE6u9MFIUxxJ7xIjl9OvIbsmmLCjCNwnBFjQZ71JPYkNYfafcwVAOBZZAG\nSim5+rSIAXZk8UJvh8Rg0yrxzYKdREf7Ze2nX5MlyQKBgQD0ZNO9o10HIDtcr6zN\nIln+84QHbgvScNhDQykEVHQUx9fE1wqIoF0+r6MJeSghLk68ItmYYPg9WhG6PzuN\n/ZuZdFhZX0+xKXEFUuohajIWnUjMKAyT+zRSWGTc3pr3c2QSyaysn2HQSsd6UOUc\neo16FTkhd2AoXEzkNcLWJy2guwKBgQDVZ+l3H/M3FcQpdNNvlz2w/J3+6gpnqqv0\n7JDIP7eci+BJmx4xG8eIvF6IV/dZEbXJTuHDesQs95gkB9TPhxAhqXpe1ZBXU0RO\n74pXopsVKrKrboKfBA2AgqoAPQJ8/cgkhyBVHGQVX5HBFqVHOzAGRpbunDcOfzRj\nAcqHKbu/SQKBgA9O1Xh2aBhPK4i1tEQxF6QBis6QVQs8aD9mUIZl59N5ZQl+UrmW\nGeEYTUUFor7ZULM2F50UzdfB8YRR+5/8N6fYAsSuVKaLKvojZGjtZu/FsE6hX5BR\nVsilosO26cwAHU+T9E3nuc+7L114/bDX+E6iT67J9GryxRoyR970G0aLAoGBALXb\nHzDMoU5H1iodzDBECeZQ37Ljbop4/qBxF9ANvEJDUJZpAYmHyrnTDBvUGoxkcy1h\nczJJ4/MN6zCJG+jdh/mnmwhFpgNEielaZ+HWR6H6CNfeDKHFqlvg/U3Gr+Ajw/Kc\n1AizcPZlwqdwzNeusHYooWYk6SYJcHMOi7Ay+DNBAoGAYXF6eVr2O30uO1DVS++j\neVVUOj64L3q9TZfQODhF6BdAbADkltJodbR2N3h/1O545LcipM4T5LM6a9zHA7Mp\ne3QVC5HqBfXvKluDlxNqniwAqTghdl5jjGxHOrLThbVlz0A9TnM71lW8feL05LrT\nAT9YrHNQfAcL2yJaaSjnXSY=\n-----END PRIVATE KEY-----\n",
  client_email: 'driveuploader@chilis-recognition.iam.gserviceaccount.com',
  client_id: '113091879668430188956'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Initialize Google Drive client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    const drive = google.drive({ version: 'v3', auth });

    // Create filename with date
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const filename = `ATL_Recognition_${date}.jpg`;

    // Convert buffer to readable stream
    const stream = new Readable();
    stream._read = () => {};
    stream.push(imageBuffer);
    stream.push(null);

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: 'image/jpeg',
        parents: ['1lLckn9QHO85l227_9M1whAwD_jwWUoco']
      },
      media: {
        mimeType: 'image/jpeg',
        body: stream
      }
    });

    return NextResponse.json({
      success: true,
      fileId: response.data.id
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload recognition form: ' + error.message },
      { status: 500 }
    );
  }
}