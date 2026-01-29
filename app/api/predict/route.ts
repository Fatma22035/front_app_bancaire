import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // ✅ CORRECT : pas de slash à la fin
  const BACKEND_URL = process.env.BACKEND_URL || 'https://web-production-d72ff.up.railway.app';
  
  try {
    const body = await request.json();
    
    // Transformation
    const transformedBody = {
      person_age: Number(body.person_age),
      person_gender: body.person_gender,
      person_education: body.person_education,
      person_income: Number(body.person_income),
      person_emp_exp: Number(body.person_emp_exp),
      person_home_ownership: body.person_home_ownership,
      loan_amnt: Number(body.loan_amnt),
      loan_intent: body.loan_intent,
      loan_int_rate: Number(body.loan_int_rate),
      loan_percent_income: Number(body.loan_percent_income),
      cb_person_cred_hist_length: Number(body.cb_person_cred_hist_length),
      credit_score: Number(body.credit_score),
      previous_loan_defaults_on_file: body.previous_loan_defaults_on_file
    };
    
    // Log pour débogage (seulement en développement)
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Envoi à:', `${BACKEND_URL}/predict`);
      console.log('📦 Données:', transformedBody);
    }
    
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur backend:', response.status, errorText);
      throw new Error(`Erreur backend: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { 
        error: 'Service temporairement indisponible',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        approved: false,
        probability: 0,
        reason: "Erreur technique lors de l'analyse"
      },
      { status: 500 }
    );
  }
}