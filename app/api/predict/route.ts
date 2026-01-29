import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const BACKEND_URL = 'http://localhost:8000';
  
  try {
    const body = await request.json();
    
    // Transformation IMPORTANTE : strings → numbers
    // ✅ CORRECT - Cette version est dans votre dernier message
    const transformedBody = {
      person_age: Number(body.person_age),
      person_gender: body.person_gender,  // OK - string
      person_education: body.person_education,  // OK - string
      person_income: Number(body.person_income),
      person_emp_exp: Number(body.person_emp_exp),
      person_home_ownership: body.person_home_ownership,  // OK - string
      loan_amnt: Number(body.loan_amnt),
      loan_intent: body.loan_intent,  // OK - string
      loan_int_rate: Number(body.loan_int_rate),
      loan_percent_income: Number(body.loan_percent_income),
      cb_person_cred_hist_length: Number(body.cb_person_cred_hist_length),
      credit_score: Number(body.credit_score),
      previous_loan_defaults_on_file: body.previous_loan_defaults_on_file  // OK - string
    };
    
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedBody),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Service temporairement indisponible' },
      { status: 500 }
    );
  }
}