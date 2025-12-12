// components/GrounderProfileForm.tsx
/**
 * Grounder Profile Questionnaire
 * 
 * Multi-step form for collecting founder profile data
 * Enables adaptive financial planning
 * 
 * Based on grounder_profile.py schema
 */

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';


// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface GrounderProfile {
  // Section 1: Experience & Qualification
  experience_years: number;
  experience_level?: 'einsteiger' | 'junior' | 'senior' | 'expert';
  industry: IndustryType;
  relevant_certifications: number;
  previous_self_employment: boolean;
  
  // Section 2: Network & Customers
  network_strength: 'none' | 'weak' | 'medium' | 'strong';
  first_customers_pipeline: number;
  has_former_colleagues: boolean;
  networking_memberships: string[];
  has_referral_partners: boolean;
  
  // Section 3: Financial Situation
  startup_capital_available: number;
  capital_source: string[];
  monthly_fixed_obligations: number;
  emergency_fund_months: number;
  
  // Section 4: Living Situation
  family_status: 'single' | 'partnerschaft' | 'familie_1_kind' | 'familie_2_kinder' | 'familie_3plus_kinder';
  partner_income_monthly?: number;
  partner_covers_living: boolean;
  can_reduce_living_costs: boolean;
  living_reduction_months: number;
  living_reduction_percent: number;
  
  // Section 5: Availability
  hours_per_week_available: number;
  part_time_job_possible: boolean;
  part_time_job_type: 'none' | 'anstellung' | 'freelance' | 'minijob';
  part_time_hours_per_week: number;
  part_time_income_monthly: number;
  part_time_duration_months: number;
  
  // Section 6: Other
  home_office_available: boolean;
  equipment_already_owned: boolean;
  has_existing_business: boolean;
  marketing_budget_monthly: number;
  risk_tolerance: 'low' | 'medium' | 'high';
}

type IndustryType = 
  | 'consulting'
  | 'coaching'
  | 'handwerk'
  | 'einzelhandel'
  | 'online'
  | 'freiberufler'
  | 'gastronomie'
  | 'dienstleistung'
  | 'software'
  | 'ecommerce';


// ============================================================================
// FORM SECTIONS
// ============================================================================

const FORM_SECTIONS = [
  {
    id: 'experience',
    title: 'Erfahrung & Qualifikation',
    description: 'Ihre berufliche Erfahrung hilft uns, realistische Umsatz-Kurven zu berechnen',
    icon: '🎓'
  },
  {
    id: 'network',
    title: 'Netzwerk & Kunden',
    description: 'Ihr Netzwerk beschleunigt den Start - Ex-Kollegen können erste Kunden sein',
    icon: '🤝'
  },
  {
    id: 'financial',
    title: 'Finanzielle Situation',
    description: 'Startkapital und Rücklagen bestimmen Ihren finanziellen Spielraum',
    icon: '💰'
  },
  {
    id: 'living',
    title: 'Lebensumstände',
    description: 'Partner-Einkommen oder flexible Living Costs verbessern Ihre Cashflow-Situation',
    icon: '🏠'
  },
  {
    id: 'availability',
    title: 'Verfügbarkeit & Teilzeit',
    description: 'Ein Teilzeit-Job parallel kann die ersten Monate überbrücken',
    icon: '⏰'
  }
];


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GrounderProfileForm({ 
  onComplete,
  onCancel 
}: { 
  onComplete: (profile: GrounderProfile) => void;
  onCancel?: () => void;
}) {
  // Current step
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState<Partial<GrounderProfile>>({
    // Defaults
    relevant_certifications: 0,
    previous_self_employment: false,
    first_customers_pipeline: 0,
    has_former_colleagues: false,
    networking_memberships: [],
    has_referral_partners: false,
    monthly_fixed_obligations: 0,
    emergency_fund_months: 0,
    partner_covers_living: false,
    can_reduce_living_costs: false,
    living_reduction_months: 0,
    living_reduction_percent: 0,
    hours_per_week_available: 30,
    part_time_job_possible: false,
    part_time_job_type: 'none',
    part_time_hours_per_week: 0,
    part_time_income_monthly: 0,
    part_time_duration_months: 0,
    home_office_available: true,
    equipment_already_owned: false,
    has_existing_business: false,
    marketing_budget_monthly: 200,
    risk_tolerance: 'medium'
  });
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Confidence score (calculated)
  const [confidenceScore, setConfidenceScore] = useState<number>(0);


  // ========================================================================
  // HELPERS
  // ========================================================================
  
  const updateField = (field: keyof GrounderProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Step 0: Experience
    if (currentStep === 0) {
      if (!formData.experience_years && formData.experience_years !== 0) {
        newErrors.experience_years = 'Bitte Jahre Berufserfahrung angeben';
      }
      if (!formData.industry) {
        newErrors.industry = 'Bitte Branche auswählen';
      }
    }
    
    // Step 1: Network
    if (currentStep === 1) {
      if (!formData.network_strength) {
        newErrors.network_strength = 'Bitte Netzwerk-Stärke angeben';
      }
    }
    
    // Step 2: Financial
    if (currentStep === 2) {
      if (!formData.startup_capital_available && formData.startup_capital_available !== 0) {
        newErrors.startup_capital_available = 'Bitte Startkapital angeben';
      }
    }
    
    // Step 3: Living
    if (currentStep === 3) {
      if (!formData.family_status) {
        newErrors.family_status = 'Bitte Familienstatus auswählen';
      }
    }
    
    // Step 4: Availability
    if (currentStep === 4) {
      if (!formData.hours_per_week_available) {
        newErrors.hours_per_week_available = 'Bitte Stunden pro Woche angeben';
      }
      if (formData.hours_per_week_available && formData.hours_per_week_available < 15) {
        newErrors.hours_per_week_available = 'Mindestens 15h/Woche für Gründungszuschuss erforderlich!';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const calculateConfidence = (): number => {
    let score = 0;
    
    // Experience (0-30)
    if (formData.experience_years) {
      if (formData.experience_years >= 10) score += 30;
      else if (formData.experience_years >= 5) score += 25;
      else if (formData.experience_years >= 2) score += 15;
      else score += 5;
    }
    
    // Network (0-25)
    if (formData.network_strength === 'strong') score += 25;
    else if (formData.network_strength === 'medium') score += 15;
    else if (formData.network_strength === 'weak') score += 5;
    
    // First customers (0-20)
    score += Math.min(20, (formData.first_customers_pipeline || 0) * 5);
    
    // Previous self-employment (0-10)
    if (formData.previous_self_employment) score += 10;
    
    // Certifications (0-10)
    score += Math.min(10, (formData.relevant_certifications || 0) * 3);
    
    // Former colleagues (0-5)
    if (formData.has_former_colleagues) score += 5;
    
    return Math.min(100, score);
  };
  
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < FORM_SECTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Final step - calculate confidence and submit
        const confidence = calculateConfidence();
        setConfidenceScore(confidence);
        onComplete(formData as GrounderProfile);
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };


  // ========================================================================
  // RENDER SECTIONS
  // ========================================================================
  
  const renderExperienceSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="experience_years">
          Jahre Berufserfahrung in der Branche *
        </Label>
        <Input
          id="experience_years"
          type="number"
          min={0}
          max={50}
          value={formData.experience_years || ''}
          onChange={(e) => updateField('experience_years', parseInt(e.target.value) || 0)}
          className={errors.experience_years ? 'border-red-500' : ''}
        />
        {errors.experience_years && (
          <p className="text-sm text-red-500 mt-1">{errors.experience_years}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="industry">Branche *</Label>
        <Select 
          value={formData.industry} 
          onValueChange={(value) => updateField('industry', value as IndustryType)}
        >
          <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
            <SelectValue placeholder="Bitte auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consulting">Consulting / Beratung</SelectItem>
            <SelectItem value="coaching">Coaching</SelectItem>
            <SelectItem value="handwerk">Handwerk</SelectItem>
            <SelectItem value="dienstleistung">Dienstleistung</SelectItem>
            <SelectItem value="freiberufler">Freiberufler</SelectItem>
            <SelectItem value="software">Software-Entwicklung</SelectItem>
            <SelectItem value="online">Online-Business</SelectItem>
            <SelectItem value="ecommerce">E-Commerce</SelectItem>
            <SelectItem value="einzelhandel">Einzelhandel</SelectItem>
            <SelectItem value="gastronomie">Gastronomie</SelectItem>
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-red-500 mt-1">{errors.industry}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="certifications">
          Relevante Zertifikate / Qualifikationen
        </Label>
        <Input
          id="certifications"
          type="number"
          min={0}
          value={formData.relevant_certifications || 0}
          onChange={(e) => updateField('relevant_certifications', parseInt(e.target.value) || 0)}
        />
        <p className="text-sm text-gray-500 mt-1">
          z.B. Meisterbrief, IHK-Zertifikat, Branchenzertifizierungen
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="prev_self"
          checked={formData.previous_self_employment}
          onCheckedChange={(checked) => updateField('previous_self_employment', checked)}
        />
        <Label htmlFor="prev_self" className="font-normal">
          Ich war bereits selbständig
        </Label>
      </div>
    </div>
  );
  
  const renderNetworkSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="network">Netzwerk-Stärke *</Label>
        <Select 
          value={formData.network_strength} 
          onValueChange={(value) => updateField('network_strength', value)}
        >
          <SelectTrigger className={errors.network_strength ? 'border-red-500' : ''}>
            <SelectValue placeholder="Bitte auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Kein relevantes Netzwerk</SelectItem>
            <SelectItem value="weak">Schwaches Netzwerk (wenige Kontakte)</SelectItem>
            <SelectItem value="medium">Gutes Netzwerk</SelectItem>
            <SelectItem value="strong">Sehr starkes Netzwerk</SelectItem>
          </SelectContent>
        </Select>
        {errors.network_strength && (
          <p className="text-sm text-red-500 mt-1">{errors.network_strength}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="pipeline">
          Potenzielle Kunden bereits im Gespräch
        </Label>
        <Input
          id="pipeline"
          type="number"
          min={0}
          value={formData.first_customers_pipeline || 0}
          onChange={(e) => updateField('first_customers_pipeline', parseInt(e.target.value) || 0)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Konkrete Interessenten, nicht nur Kontakte
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="colleagues"
          checked={formData.has_former_colleagues}
          onCheckedChange={(checked) => updateField('has_former_colleagues', checked)}
        />
        <Label htmlFor="colleagues" className="font-normal">
          Ich kann Ex-Kollegen als erste Kunden akquirieren
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="referral"
          checked={formData.has_referral_partners}
          onCheckedChange={(checked) => updateField('has_referral_partners', checked)}
        />
        <Label htmlFor="referral" className="font-normal">
          Ich habe Empfehlungspartner (Steuerberater, Anwälte, etc.)
        </Label>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          💡 Ein starkes Netzwerk ermöglicht 30-40% höhere Startauslastung!
        </AlertDescription>
      </Alert>
    </div>
  );
  
  const renderFinancialSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="capital">Verfügbares Startkapital (EUR) *</Label>
        <Input
          id="capital"
          type="number"
          min={0}
          step={1000}
          value={formData.startup_capital_available || ''}
          onChange={(e) => updateField('startup_capital_available', parseFloat(e.target.value) || 0)}
          className={errors.startup_capital_available ? 'border-red-500' : ''}
        />
        {errors.startup_capital_available && (
          <p className="text-sm text-red-500 mt-1">{errors.startup_capital_available}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Eigenkapital + verfügbare Finanzierung
        </p>
      </div>
      
      <div>
        <Label htmlFor="emergency">Notfall-Rücklage (Monate)</Label>
        <Input
          id="emergency"
          type="number"
          min={0}
          max={24}
          value={formData.emergency_fund_months || 0}
          onChange={(e) => updateField('emergency_fund_months', parseInt(e.target.value) || 0)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Anzahl Monate Lebenshaltungskosten als Rücklage
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ⚠️ Mindestens 10.000 EUR Startkapital empfohlen für sicheren Start
        </AlertDescription>
      </Alert>
    </div>
  );
  
  const renderLivingSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="family">Familienstatus *</Label>
        <Select 
          value={formData.family_status} 
          onValueChange={(value) => updateField('family_status', value)}
        >
          <SelectTrigger className={errors.family_status ? 'border-red-500' : ''}>
            <SelectValue placeholder="Bitte auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="partnerschaft">Partnerschaft</SelectItem>
            <SelectItem value="familie_1_kind">Familie (1 Kind)</SelectItem>
            <SelectItem value="familie_2_kinder">Familie (2 Kinder)</SelectItem>
            <SelectItem value="familie_3plus_kinder">Familie (3+ Kinder)</SelectItem>
          </SelectContent>
        </Select>
        {errors.family_status && (
          <p className="text-sm text-red-500 mt-1">{errors.family_status}</p>
        )}
      </div>
      
      {formData.family_status && formData.family_status !== 'single' && (
        <div>
          <Label htmlFor="partner_income">
            Monatliches Partner-Einkommen (EUR)
          </Label>
          <Input
            id="partner_income"
            type="number"
            min={0}
            step={100}
            value={formData.partner_income_monthly || ''}
            onChange={(e) => updateField('partner_income_monthly', parseFloat(e.target.value) || undefined)}
          />
          <p className="text-sm text-gray-500 mt-1">
            Reduziert Ihren Bedarf aus dem Geschäft
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="reduce_living"
          checked={formData.can_reduce_living_costs}
          onCheckedChange={(checked) => updateField('can_reduce_living_costs', checked)}
        />
        <Label htmlFor="reduce_living" className="font-normal">
          Ich kann meinen Lebensstandard temporär reduzieren
        </Label>
      </div>
      
      {formData.can_reduce_living_costs && (
        <>
          <div>
            <Label htmlFor="reduction_months">Für wie viele Monate?</Label>
            <Input
              id="reduction_months"
              type="number"
              min={0}
              max={12}
              value={formData.living_reduction_months || 0}
              onChange={(e) => updateField('living_reduction_months', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="reduction_percent">Um wie viel Prozent?</Label>
            <Input
              id="reduction_percent"
              type="number"
              min={0}
              max={50}
              step={5}
              value={formData.living_reduction_percent || 0}
              onChange={(e) => updateField('living_reduction_percent', parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-gray-500 mt-1">
              z.B. 25% = Von 3.300 EUR auf 2.475 EUR reduzieren
            </p>
          </div>
        </>
      )}
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          💡 Partner-Einkommen oder reduzierte Living Costs verbessern Ihren Cashflow erheblich!
        </AlertDescription>
      </Alert>
    </div>
  );
  
  const renderAvailabilitySection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="hours">
          Stunden pro Woche für Gründung verfügbar *
        </Label>
        <Input
          id="hours"
          type="number"
          min={15}
          max={80}
          value={formData.hours_per_week_available || ''}
          onChange={(e) => updateField('hours_per_week_available', parseInt(e.target.value) || 0)}
          className={errors.hours_per_week_available ? 'border-red-500' : ''}
        />
        {errors.hours_per_week_available && (
          <p className="text-sm text-red-500 mt-1">{errors.hours_per_week_available}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Mindestens 15 Stunden für Gründungszuschuss erforderlich
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="part_time"
          checked={formData.part_time_job_possible}
          onCheckedChange={(checked) => {
            updateField('part_time_job_possible', checked);
            if (!checked) {
              updateField('part_time_hours_per_week', 0);
              updateField('part_time_income_monthly', 0);
              updateField('part_time_duration_months', 0);
            }
          }}
        />
        <Label htmlFor="part_time" className="font-normal">
          Teilzeit-Job parallel möglich (zur Überbrückung)
        </Label>
      </div>
      
      {formData.part_time_job_possible && (
        <>
          <div>
            <Label htmlFor="pt_hours">Stunden pro Woche Teilzeit-Job</Label>
            <Input
              id="pt_hours"
              type="number"
              min={0}
              max={30}
              value={formData.part_time_hours_per_week || 0}
              onChange={(e) => updateField('part_time_hours_per_week', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="pt_income">Monatliches Einkommen Teilzeit-Job (EUR)</Label>
            <Input
              id="pt_income"
              type="number"
              min={0}
              step={100}
              value={formData.part_time_income_monthly || 0}
              onChange={(e) => updateField('part_time_income_monthly', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="pt_duration">Für wie viele Monate?</Label>
            <Input
              id="pt_duration"
              type="number"
              min={0}
              max={12}
              value={formData.part_time_duration_months || 0}
              onChange={(e) => updateField('part_time_duration_months', parseInt(e.target.value) || 0)}
            />
            <p className="text-sm text-gray-500 mt-1">
              z.B. 6 Monate à 1.200 EUR = 7.200 EUR zusätzlich
            </p>
          </div>
          
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              ✅ Ein Teilzeit-Job kann Ihren Cashflow um {(formData.part_time_income_monthly || 0) * (formData.part_time_duration_months || 0)} EUR verbessern!
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );


  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  const section = FORM_SECTIONS[currentStep];
  const progress = ((currentStep + 1) / FORM_SECTIONS.length) * 100;
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">{section.icon}</span>
          <span className="text-sm text-gray-500">
            Schritt {currentStep + 1} von {FORM_SECTIONS.length}
          </span>
        </div>
        <CardTitle>{section.title}</CardTitle>
        <CardDescription>{section.description}</CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      
      <CardContent>
        {currentStep === 0 && renderExperienceSection()}
        {currentStep === 1 && renderNetworkSection()}
        {currentStep === 2 && renderFinancialSection()}
        {currentStep === 3 && renderLivingSection()}
        {currentStep === 4 && renderAvailabilitySection()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handleBack}
          disabled={!onCancel && currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Abbrechen' : 'Zurück'}
        </Button>
        
        <Button onClick={handleNext}>
          {currentStep === FORM_SECTIONS.length - 1 ? (
            <>
              Fertigstellen
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Weiter
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
