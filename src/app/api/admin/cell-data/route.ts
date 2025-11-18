import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: number;
  username?: string;
  role?: string;
}

// POST - Update or create cell value (Admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const managerId = decoded.userId;
    const userRole = decoded.role || 'agent';

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { sheet_id, field_id, uuid, value } = await request.json();

    if (!sheet_id || !field_id || !uuid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if cell exists for this admin (user_id IS NULL)
    const existingCell: any[] = await prisma.$queryRaw`
      SELECT * FROM cells 
      WHERE sheet_id = ${sheet_id} 
      AND field_id = ${field_id} 
      AND uuid = ${uuid}
      AND user_id IS NULL
      LIMIT 1
    `;

    if (existingCell.length > 0) {
      // Update existing cell
      await prisma.$executeRaw`
        UPDATE cells 
        SET value = ${value}
        WHERE id = ${existingCell[0].id}
      `;
      
      return NextResponse.json({ 
        success: true, 
        cellId: existingCell[0].id,
        action: 'updated'
      });
    } else {
      // Create new cell (user_id is NULL for admin)
      await prisma.$executeRaw`
        INSERT INTO cells (manager_id, user_id, sheet_id, field_id, uuid, value, created_at)
        VALUES (${managerId}, NULL, ${sheet_id}, ${field_id}, ${uuid}, ${value}, ${new Date().toISOString()})
      `;

      return NextResponse.json({ 
        success: true,
        action: 'created'
      });
    }
  } catch (error) {
    console.error('Error updating cell:', error);
    return NextResponse.json(
      { error: 'Failed to update cell' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a row (Admin only)
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const userRole = decoded.role || 'agent';

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');
    const sheetId = searchParams.get('sheet_id');

    if (!uuid || !sheetId) {
      return NextResponse.json(
        { error: 'Missing uuid or sheet_id' },
        { status: 400 }
      );
    }

    // Admin can only delete their own rows (user_id IS NULL)
    await prisma.$executeRaw`
      DELETE FROM cells 
      WHERE uuid = ${uuid} 
      AND sheet_id = ${parseInt(sheetId)}
      AND user_id IS NULL
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting row:', error);
    return NextResponse.json(
      { error: 'Failed to delete row' },
      { status: 500 }
    );
  }
}
