import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:3000'

export async function GET(request: Request, { params }: { params: { path: string } }) {
  const path = params.path
  const url = new URL(request.url)
  const queryString = url.search
  
  try {
    const response = await fetch(`${API_URL}/api/${path}${queryString}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request, { params }: { params: { path: string } }) {
  const path = params.path
  const body = await request.json()
  
  try {
    const response = await fetch(`${API_URL}/api/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })
  }
}
