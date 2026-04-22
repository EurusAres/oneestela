import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting payment proof column fix...');

    const results = {
      payment_proofs: { before: null as any, after: null as any },
      users: { before: null as any, after: null as any }
    };

    // Fix payment_proofs.proof_url
    try {
      const columns1 = await executeQuery(
        `SHOW COLUMNS FROM payment_proofs WHERE Field = 'proof_url'`,
        []
      ) as any[];
      results.payment_proofs.before = columns1[0];

      await executeQuery(
        `ALTER TABLE payment_proofs 
         MODIFY COLUMN proof_url LONGTEXT`,
        []
      );

      const updatedColumns1 = await executeQuery(
        `SHOW COLUMNS FROM payment_proofs WHERE Field = 'proof_url'`,
        []
      ) as any[];
      results.payment_proofs.after = updatedColumns1[0];
      
      console.log('Successfully updated payment_proofs.proof_url to LONGTEXT');
    } catch (error) {
      console.error('Error updating payment_proofs.proof_url:', error);
      results.payment_proofs.error = error instanceof Error ? error.message : String(error);
    }

    // Fix users.profile_picture_url
    try {
      const columns2 = await executeQuery(
        `SHOW COLUMNS FROM users WHERE Field = 'profile_picture_url'`,
        []
      ) as any[];
      results.users.before = columns2[0];

      await executeQuery(
        `ALTER TABLE users 
         MODIFY COLUMN profile_picture_url LONGTEXT`,
        []
      );

      const updatedColumns2 = await executeQuery(
        `SHOW COLUMNS FROM users WHERE Field = 'profile_picture_url'`,
        []
      ) as any[];
      results.users.after = updatedColumns2[0];
      
      console.log('Successfully updated users.profile_picture_url to LONGTEXT');
    } catch (error) {
      console.error('Error updating users.profile_picture_url:', error);
      results.users.error = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully updated image columns to LONGTEXT',
      results
    });
  } catch (error) {
    console.error('Error fixing payment proof column:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
