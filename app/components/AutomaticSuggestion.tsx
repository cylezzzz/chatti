// app/lib/photoAnalysis.ts
export interface PhotoAnalysisResult {
  imageType: 'portrait' | 'landscape' | 'product' | 'group' | 'animal' | 'architecture' | 'food' | 'unknown';
  quality: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    sharpness: number; // 0-100
    exposure: 'underexposed' | 'optimal' | 'overexposed';
    contrast: number; // 0-100
    noise: 'none' | 'minimal' | 'moderate' | 'heavy';
  };
  composition: {
    faces: number;
    objects: string[];
    backgroundColor: 'simple' | 'complex' | 'cluttered';
    rule_of_thirds: boolean;
  };
  lighting: {
    type: 'natural' | 'artificial' | 'mixed' | 'unknown';
    direction: 'front' | 'back' | 'side' | 'overhead';
    quality: 'soft' | 'harsh' | 'balanced';
    temperature: 'warm' | 'neutral' | 'cool';
  };
  colors: {
    dominantColors: string[];
    saturation: 'low' | 'normal' | 'high' | 'oversaturated';
    vibrancy: number; // 0-100
    colorHarmony: 'monochromatic' | 'complementary' | 'triadic' | 'mixed';
  };
  technicalIssues: string[];
  improvements: AutomaticSuggestion[];
}

export interface AutomaticSuggestion {
  category: 'lighting' | 'color' | 'composition' | 'enhancement' | 'style' | 'creative';
  title: string;
  description: string;
  prompt: string;
  priority: 'high' | 'medium' | 'low';
  oneClick: boolean; // Kann automatisch angewendet werden
}

// Simulierte KI-Bildanalyse (in Production würde Computer Vision API verwendet)
export async function analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
  // Simuliere API-Verzögerung
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock-Analyse basierend auf URL/Bildinhalt (in echt: Computer Vision)
  const mockResult: PhotoAnalysisResult = {
    imageType: 'portrait',
    quality: {
      overall: 'good',
      sharpness: 75,
      exposure: 'underexposed',
      contrast: 60,
      noise: 'minimal'
    },
    composition: {
      faces: 1,
      objects: ['person', 'background', 'clothing'],
      backgroundColor: 'simple',
      rule_of_thirds: false
    },
    lighting: {
      type: 'natural',
      direction: 'front',
      quality: 'soft',
      temperature: 'cool'
    },
    colors: {
      dominantColors: ['#8B4513', '#DEB887', '#F5DEB3', '#4682B4'],
      saturation: 'low',
      vibrancy: 45,
      colorHarmony: 'complementary'
    },
    technicalIssues: [
      'Bild ist leicht unterbelichtet',
      'Geringer Kontrast reduziert Details',
      'Kühle Farbtemperatur für Portrait unvorteilhaft'
    ],
    improvements: generateSmartSuggestions('portrait', 'underexposed', 'low', 75)
  };

  return mockResult;
}

function generateSmartSuggestions(
  imageType: string, 
  exposure: string, 
  saturation: string, 
  sharpness: number
): AutomaticSuggestion[] {
  const suggestions: AutomaticSuggestion[] = [];

  // Belichtungskorrektur
  if (exposure === 'underexposed') {
    suggestions.push({
      category: 'lighting',
      title: 'Belichtung korrigieren',
      description: 'Bild ist zu dunkel - automatische Belichtungskorrektur anwenden',
      prompt: 'Korrigiere die Unterbelichtung, mache das Bild heller aber natürlich, erhalte Details in Schatten und Lichtern',
      priority: 'high',
      oneClick: true
    });
  }

  // Portrait-spezifische Verbesserungen
  if (imageType === 'portrait') {
    suggestions.push({
      category: 'enhancement',
      title: 'Hautglättung',
      description: 'Natürliche Hautverbesserung ohne Überbearbeitung',
      prompt: 'Glätte die Haut natürlich, entferne kleine Unreinheiten, erhalte Hauttextur und Details',
      priority: 'medium',
      oneClick: true
    });

    suggestions.push({
      category: 'lighting',
      title: 'Warme Hauttöne',
      description: 'Farbtemperatur für schmeichelhaftere Hauttöne anpassen',
      prompt: 'Erwärme die Farbtemperatur leicht für natürlichere, schmeichelhaftere Hauttöne',
      priority: 'medium',
      oneClick: true
    });

    suggestions.push({
      category: 'enhancement',
      title: 'Augen betonen',
      description: 'Augen heller und ausdrucksvoller machen',
      prompt: 'Verstärke die Augen: mache sie heller, schärfer und ausdrucksvoller ohne unnatürlich zu wirken',
      priority: 'medium',
      oneClick: false
    });
  }

  // Schärfe-Verbesserung
  if (sharpness < 80) {
    suggestions.push({
      category: 'enhancement',
      title: 'Schärfe optimieren',
      description: 'Intelligente Schärfung für mehr Details',
      prompt: 'Schärfe das Bild intelligent, verbessere Details ohne Artefakte zu erzeugen',
      priority: 'medium',
      oneClick: true
    });
  }

  // Farb-Verbesserungen
  if (saturation === 'low') {
    suggestions.push({
      category: 'color',
      title: 'Farben beleben',
      description: 'Natürliche Farbverstärkung ohne Übersättigung',
      prompt: 'Verstärke die Farben natürlich, mache sie lebendiger aber nicht übersättigt',
      priority: 'medium',
      oneClick: true
    });
  }

  // Kreative Vorschläge
  suggestions.push({
    category: 'style',
    title: 'Professioneller Look',
    description: 'Wandle in hochwertiges Studio-Portrait um',
    prompt: 'Verwandle in professionelles Studio-Portrait: optimale Beleuchtung, sauberer Hintergrund, professionelle Retusche',
    priority: 'low',
    oneClick: false
  });

  suggestions.push({
    category: 'creative',
    title: 'Hintergrund unschärfen',
    description: 'Bokeh-Effekt für bessere Freistellung',
    prompt: 'Erzeuge natürlichen Bokeh-Effekt: Hintergrund weichzeichnen, Person scharf im Fokus',
    priority: 'low',
    oneClick: false
  });

  return suggestions;
}

// Automatische Fragengenerierung wenn Informationen fehlen
export function generateMissingInfoQuestions(prompt: string, analysis: PhotoAnalysisResult): string[] {
  const questions: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Spezifische Objekt-Erkennung
  if (lowerPrompt.includes('entfernen') && !lowerPrompt.includes('was') && !lowerPrompt.includes('welch')) {
    if (analysis.composition.objects.length > 3) {
      questions.push('Welches spezifische Objekt soll entfernt werden? Im Bild sind mehrere Elemente vorhanden.');
    }
  }

  // Farbänderungen
  if (lowerPrompt.includes('farbe') && !lowerPrompt.includes('welche') && !lowerPrompt.includes('zu')) {
    questions.push('Welche Farbe soll geändert werden und in welche neue Farbe?');
  }

  // Personenbezogene Änderungen bei Gruppenbild
  if (analysis.composition.faces > 1) {
    if (lowerPrompt.includes('person') || lowerPrompt.includes('gesicht') || lowerPrompt.includes('haar')) {
      questions.push('Auf welche Person bezieht sich die Änderung? (z.B. "Person links", "Person mit blauer Jacke")');
    }
  }

  // Hintergrund-Änderungen
  if (lowerPrompt.includes('hintergrund') && !lowerPrompt.includes('zu') && !lowerPrompt.includes('durch')) {
    questions.push('Welcher neue Hintergrund soll verwendet werden? (z.B. Strand, Studio, Wald, Stadt)');
  }

  // Kleidungs-Änderungen
  if (lowerPrompt.includes('kleidung') || lowerPrompt.includes('outfit') || lowerPrompt.includes('anziehen')) {
    questions.push('Welche Art von Kleidung? (z.B. Business-Anzug, Casual, Abendkleid, Farbe, Stil)');
  }

  // Stil-Änderungen
  if (lowerPrompt.includes('stil') && !lowerPrompt.includes('wie')) {
    questions.push('Welcher spezifische Stil? (z.B. Vintage, Modern, Cartoon, Realistisch, Künstlerisch)');
  }

  return questions;
}

// Intelligente Prompt-Vervollständigung
export function enhanceUserPrompt(userPrompt: string, analysis: PhotoAnalysisResult): string {
  let enhanced = userPrompt;

  // Kontext basierend auf Bildanalyse hinzufügen
  if (analysis.imageType === 'portrait') {
    enhanced += ', erhalte natürliche Hauttöne und Gesichtsdetails';
  }

  if (analysis.quality.overall === 'poor') {
    enhanced += ', verbessere gleichzeitig die Bildqualität';
  }

  if (analysis.lighting.quality === 'harsh') {
    enhanced += ', sorge für weichere Beleuchtung';
  }

  return enhanced;
}