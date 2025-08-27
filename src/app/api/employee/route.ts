import { NextResponse } from 'next/server';

export async function GET() {
  const employees = [
    { id: 'sayudi', email: 'sayudi@example.com', name: 'Sayudi' },
    { id: 'upik', email: 'upik@example.com', name: 'Upik' },
    { id: 'arwan', email: 'arwan@example.com', name: 'Arwan' },
    { id: 'winarno', email: 'winarno@example.com', name: 'Winarno' },
  ];
  return NextResponse.json(employees);
}