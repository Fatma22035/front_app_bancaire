'use client'

import { useState, useEffect } from 'react'

interface AnalysisFactor {
  name: string;
  value: string;
  status: string;
  importance: number;
}

interface ApiResponse {
  approved: boolean;
  prediction: number;
  probability: number;
  reason: string;
  analysis_factors?: AnalysisFactor[];
  feature_importance?: Record<string, number>;
}

export default function Home() {
  const [result, setResult] = useState<string | null>(null)
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [loanRatio, setLoanRatio] = useState<number>(0)
  const [probability, setProbability] = useState<number | null>(null)
  const [analysisFactors, setAnalysisFactors] = useState<AnalysisFactor[]>([])
  
  // États pour les champs de calcul
  const [personIncome, setPersonIncome] = useState<string>('')
  const [loanAmnt, setLoanAmnt] = useState<string>('')

  // Calcul automatique du ratio
  useEffect(() => {
    const income = parseFloat(personIncome) || 0
    const loan = parseFloat(loanAmnt) || 0
    
    if (income > 0 && loan > 0) {
      const ratio = loan / income
      setLoanRatio(ratio)
    } else {
      setLoanRatio(0)
    }
  }, [personIncome, loanAmnt])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    
    // Ajouter le ratio calculé automatiquement
    const finalPayload = {
      ...payload,
      loan_percent_income: loanRatio
    }

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      })

      const data: ApiResponse = await res.json()
      setResult(data.approved ? 'Accordé' : 'Refusé')
      setReason(data.reason)
      setProbability(data.probability || null)
      setAnalysisFactors(data.analysis_factors || [])
    } catch (error) {
      console.error('Error:', error)
      setResult('Erreur')
      setReason('Une erreur est survenue lors de l\'analyse de la demande.')
      setProbability(null)
      setAnalysisFactors([])
    } finally {
      setIsLoading(false)
    }
  }

  const getAnalysisFactors = () => {
    if (analysisFactors.length > 0) {
      return analysisFactors;
    }
    
    // Fallback si l'API ne retourne pas les facteurs
    return [
      {
        name: "Ratio Prêt/Revenu",
        value: `${(loanRatio * 100).toFixed(1)}%`,
        status: loanRatio < 0.25 ? "Favorable" : loanRatio < 0.35 ? "Neutre" : "Risqué",
        importance: 25
      },
      {
        name: "Revenu Annuel",
        value: `${parseFloat(personIncome || "0").toLocaleString()} €`,
        status: parseFloat(personIncome || "0") > 50000 ? "Favorable" : "Neutre",
        importance: 15
      },
      {
        name: "Score de Crédit",
        value: "800",
        status: "Favorable",
        importance: 12
      },
      {
        name: "Taux d'Intérêt",
        value: "7%",
        status: "Neutre",
        importance: 10
      },
      {
        name: "Historique de Crédit",
        value: "4 ans",
        status: "Favorable",
        importance: 6
      },
      {
        name: "Défauts Antérieurs",
        value: "Non",
        status: "Favorable",
        importance: 4
      }
    ];
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-10">
        {/* Titre */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simulation de Prêt Bancaire
          </h1>
          <p className="text-gray-600 text-lg">
            Obtenez une analyse instantanée de votre éligibilité
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Grille des sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Section 1: Informations du Demandeur */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 shadow-lg">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Informations du Demandeur</h2>
                </div>
                <p className="text-gray-600 ml-16">Renseignez vos informations personnelles</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Âge</label>
                    <input 
                      name="person_age" 
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      min="18" 
                      max="100" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Genre</label>
                    <select 
                      name="person_gender" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Niveau d'études</label>
                    <select 
                      name="person_education" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="High School">Lycée / Bac</option>
                      <option value="Associate">DUT / BTS</option>
                      <option value="Bachelor">Licence / Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="Doctorate">Doctorat</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Situation logement</label>
                    <select 
                      name="person_home_ownership" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="RENT">Locataire</option>
                      <option value="OWN">Propriétaire</option>
                      <option value="MORTGAGE">Avec hypothèque</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Expérience pro (années)</label>
                    <input 
                      name="person_emp_exp" 
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      min="0" 
                      max="50" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Revenu annuel (€)</label>
                  <input 
                    name="person_income" 
                    type="number" 
                    value={personIncome}
                    onChange={(e) => setPersonIncome(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    min="0" 
                    step="1000" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Informations de Crédit */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100 shadow-lg">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Informations de Crédit</h2>
                </div>
                <p className="text-gray-600 ml-16">Votre profil financier</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Score de crédit (300-850)</label>
                  <input 
                    name="credit_score" 
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    min="300" 
                    max="850" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Historique crédit (années)</label>
                    <input 
                      name="cb_person_cred_hist_length" 
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      min="0" 
                      max="50" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Défauts de paiement</label>
                    <select 
                      name="previous_loan_defaults_on_file" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="No">Aucun défaut</option>
                      <option value="Yes">Défaut(s) antérieur(s)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Informations du Prêt */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100 shadow-lg">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Informations du Prêt</h2>
                </div>
                <p className="text-gray-600 ml-16">Caractéristiques de la demande</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Montant demandé (€)</label>
                    <input 
                      name="loan_amnt" 
                      type="number" 
                      value={loanAmnt}
                      onChange={(e) => setLoanAmnt(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="0" 
                      step="100" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Taux d'intérêt (%)</label>
                    <input 
                      name="loan_int_rate" 
                      type="number" 
                      step="0.01" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="0" 
                      max="30" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Objet du prêt</label>
                  <select 
                    name="loan_intent" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  >
                    <option value="PERSONAL">Usage personnel</option>
                    <option value="EDUCATION">Éducation / Formation</option>
                    <option value="MEDICAL">Dépenses médicales</option>
                    <option value="VENTURE">Projet entrepreneurial</option>
                    <option value="HOMEIMPROVEMENT">Amélioration habitat</option>
                    <option value="DEBTCONSOLIDATION">Consolidation de dettes</option>
                  </select>
                </div>

                {/* Affichage du ratio calculé */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ratio Prêt/Revenu</h3>
                      <p className="text-sm text-gray-600">Calculé automatiquement</p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      loanRatio < 0.25 ? 'text-green-600' :
                      loanRatio < 0.35 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {(loanRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Indicateur visuel */}
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                        loanRatio < 0.25 ? 'bg-green-500' :
                        loanRatio < 0.35 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(loanRatio * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span className={loanRatio < 0.25 ? 'font-semibold text-green-700' : ''}>
                      Excellent
                    </span>
                    <span className={loanRatio >= 0.25 && loanRatio < 0.35 ? 'font-semibold text-yellow-700' : ''}>
                      Acceptable
                    </span>
                    <span className={loanRatio >= 0.35 ? 'font-semibold text-red-700' : ''}>
                      Risqué
                    </span>
                  </div>
          
                  <input 
                    type="hidden" 
                    name="loan_percent_income" 
                    value={loanRatio}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="text-center pt-8 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-12 py-5 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyse en cours...
                </div>
              ) : (
                'Analyser la demande'
              )}
            </button>
            <p className="text-gray-500 text-sm mt-4 italic">
              Cliquez pour obtenir une simulation instantanée de votre éligibilité
            </p>
          </div>
        </form>

        {/* SECTION RÉSULTAT */}
        {result && (
          <div className={`mt-12 rounded-2xl overflow-hidden shadow-xl ${
            result === 'Accordé' 
              ? 'border border-green-200' 
              : 'border border-red-200'
          }`}>
            {/* Header avec résultat */}
            <div className={`p-8 text-center ${
              result === 'Accordé' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                : 'bg-gradient-to-r from-red-50 to-rose-50'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-left mb-6 md:mb-0">
                  <h2 className={`text-4xl font-bold mb-2 ${
                    result === 'Accordé' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result === 'Accordé' ? 'ACCORDÉ' : 'REFUSÉ'}
                  </h2>
                  <p className="text-gray-600">
                    {probability !== null 
                      ? `Probabilité d'approbation` 
                      : result === 'Accordé' 
                        ? 'Dossier favorable' 
                        : 'Dossier nécessitant révision'}
                  </p>
                </div>
                
                {probability !== null && (
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                      result === 'Accordé' 
                        ? 'bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-300' 
                        : 'bg-gradient-to-br from-red-100 to-red-200 border-4 border-red-300'
                    }`}>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          result === 'Accordé' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {Math.round(probability * 100)}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {probability > 0.7 ? 'Élevée' : probability > 0.4 ? 'Moyenne' : 'Basse'}
                        </div>
                      </div>
                    </div>
                    {/* Anneau de progression */}
                    <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke={result === 'Accordé' ? '#10b981' : '#ef4444'}
                        strokeWidth="4"
                        strokeDasharray={`${probability * 377} 377`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Section "Pourquoi ?" */}
            <div className="p-8 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Pourquoi ?
              </h3>
              <p className="text-gray-700 mb-8">
                Voici les facteurs qui ont contribué à {result === 'Accordé' ? 'l\'approbation' : 'le refus'} de votre demande :
              </p>

              {/* Grille des facteurs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getAnalysisFactors().map((factor, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{factor.name}</h4>
                        <p className={`text-2xl font-bold mt-2 ${
                          factor.status === 'Favorable' ? 'text-green-600' :
                          factor.status === 'Neutre' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {factor.value}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        factor.status === 'Favorable' ? 'bg-green-100 text-green-800' :
                        factor.status === 'Neutre' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {factor.status}
                      </span>
                    </div>
                    
                    {/* Barre d'importance */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Importance</span>
                        <span>{factor.importance.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            factor.status === 'Favorable' ? 'bg-green-500' :
                            factor.status === 'Neutre' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(factor.importance, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explication textuelle */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Explication détaillée
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {reason}
                </p>
              </div>

              {/* Conseil */}
              <div className={`mt-8 p-6 rounded-xl ${
                result === 'Accordé' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    result === 'Accordé' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {result === 'Accordé' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Conseil</h5>
                    <p className="text-gray-700">
                      {result === 'Accordé' 
                        ? 'Votre profil présente des caractéristiques favorables. Nous vous recommandons de maintenir une bonne gestion de vos finances pour préserver votre éligibilité.'
                        : 'Votre dossier présente certains points à améliorer. Nous vous conseillons de renforcer votre score de crédit et de réduire votre ratio dette/revenu pour de futures demandes.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  )
}


