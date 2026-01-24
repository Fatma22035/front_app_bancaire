// app/api/predict/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FastAPI error details:', errorText);
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Service d\'analyse indisponible',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

