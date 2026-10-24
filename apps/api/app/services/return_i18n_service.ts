export type SupportedLanguage = 'en' | 'hi' | 'gu'

export interface LocalizedInstruction {
  title: string
  subtitle: string
  guidelinesHeader: string
  guidelines: Array<{
    title: string
    description: string
    icon: string
  }>
  photoRequirements: {
    title: string
    items: string[]
  }
  videoRequirements: {
    title: string
    items: string[]
  }
  packagingPolicy: {
    title: string
    description: string
  }
  acceptedFormats: string
  reasons: Record<string, string>
  statuses: Record<string, string>
  messages: {
    autoApproved: string
    autoApprovedSubtitle: string
    underReview: string
    underReviewSubtitle: string
    insufficientEvidence: string
    insufficientEvidenceSubtitle: string
    possibleMismatch: string
    possibleMismatchSubtitle: string
    pickupInstructions: string
    pickupNote: string
    appealOption: string
  }
}

export const RETURN_TRANSLATIONS: Record<SupportedLanguage, LocalizedInstruction> = {
  en: {
    title: 'Request Return & Replacement',
    subtitle: 'Hassle-free 7-day return with instant AI verification',
    guidelinesHeader: 'How to Take Clear Product Verification Photos',
    guidelines: [
      {
        title: 'Full Saree Spread',
        description: 'Spread the saree on a flat surface with good natural lighting so the overall color and body design are clearly visible.',
        icon: 'Layout',
      },
      {
        title: 'Border & Zari Close-up',
        description: 'Take a close-up photo of the border (किनारी / કાંઠો) and pallu to show the zari work, embroidery, and weaving detail.',
        icon: 'ZoomIn',
      },
      {
        title: 'Defect or Damage Area',
        description: 'If returning due to damage, misprint, or tear, take a clear photo pointing directly at the affected area.',
        icon: 'AlertTriangle',
      },
      {
        title: 'Original Tags & Packaging',
        description: 'Photograph the saree with its brand tags, polybag packaging, and invoice intact as per the return policy.',
        icon: 'Tag',
      },
    ],
    photoRequirements: {
      title: 'Mandatory Photo Requirements',
      items: [
        'Take at least 2 clear photos (maximum 6 photos).',
        'Ensure the photo is sharp, well-lit, and not blurry or out of focus.',
        'Show the actual saree received in the package, not catalogue screenshots.',
        'Accepted formats: JPEG, PNG, WebP (up to 15MB each).',
      ],
    },
    videoRequirements: {
      title: 'Video Guidelines (Recommended for fast approval)',
      items: [
        'Record a short 10 to 30-second video unboxing or inspecting the saree.',
        'Slowly pan over the pallu, borders, and any reported defect.',
        'Accepted formats: MP4, MOV, WebM (up to 50MB).',
      ],
    },
    packagingPolicy: {
      title: 'Return Eligibility & Packaging Policy',
      description: 'The saree must be unused, unwashed, and neatly folded in its original polybag with all brand tags intact. Items customized or altered (e.g., pre-stitched blouses) are not eligible for return.',
    },
    acceptedFormats: 'Supported files: JPG, PNG, WebP, MP4, MOV (Max: 15MB photos, 50MB video)',
    reasons: {
      DAMAGED: 'Damaged or torn in transit',
      DEFECTIVE: 'Manufacturing defect or misprint',
      WRONG_ITEM_RECEIVED: 'Completely different saree received',
      COLOR_MISMATCH: 'Significant color difference from catalogue',
      QUALITY_ISSUE: 'Fabric quality or texture not as expected',
      NOT_AS_DESCRIBED: 'Design or border differs from website description',
      SIZE_FIT_ISSUE: 'Length, width, or blouse piece measurement issue',
    },
    statuses: {
      REQUESTED: 'Return Requested',
      AUTO_APPROVED: 'Auto-Approved by AI Verification',
      APPROVED: 'Return Approved',
      REJECTED: 'Return Rejected',
      UNDER_REVIEW: 'Under Manual Inspection',
      PENDING_EVIDENCE: 'Additional Photos Needed',
      PICKUP_SCHEDULED: 'Reverse Pickup Scheduled',
      RECEIVED: 'Item Received at Warehouse',
      REFUNDED: 'Refund Processed',
      CANCELLED: 'Return Cancelled',
    },
    messages: {
      autoApproved: 'Your return has been automatically approved!',
      autoApprovedSubtitle: 'Our AI visual matching system verified your photos against the original catalogue saree. Reverse pickup has been scheduled.',
      underReview: 'Your return request has been submitted for review.',
      underReviewSubtitle: 'Our customer support specialist is inspecting your photos to ensure accurate processing. You will receive an update within 24 hours.',
      insufficientEvidence: 'Clearer photos required for verification.',
      insufficientEvidenceSubtitle: 'The uploaded photos were slightly blurry or dim. Please upload sharper photos of the saree border and defect for quick approval.',
      possibleMismatch: 'Verification flagged for manual inspection.',
      possibleMismatchSubtitle: 'A noticeable visual difference was detected. Our textile specialist will review your request personally without automatic rejection.',
      pickupInstructions: 'Delhivery Reverse Pickup Instructions',
      pickupNote: 'Please keep the saree packed in its original polybag with tags attached. The courier rider will provide a reverse waybill receipt upon pickup.',
      appealOption: 'If you have any questions or wish to appeal this decision, our team is available on WhatsApp and email.',
    },
  },
  hi: {
    title: 'वापसी एवं प्रतिस्थापन अनुरोध (Return Request)',
    subtitle: '7 दिनों में आसान वापसी — तुरंत एआई सत्यापन के साथ',
    guidelinesHeader: 'सत्यापन के लिए स्पष्ट तस्वीरें कैसे लें',
    guidelines: [
      {
        title: 'पूरी साड़ी का फैलाव',
        description: 'साड़ी को अच्छी रोशनी वाली समतल जगह पर फैलाकर फोटो लें ताकि मुख्य रंग और डिजाइन साफ दिखे।',
        icon: 'Layout',
      },
      {
        title: 'बॉर्डर एवं पल्लू का नजदीकी फोटो',
        description: 'किनारी (बॉर्डर), जरी का काम, कढ़ाई और पल्लू का क्लोज-अप फोटो लें ताकि बुनाई की पहचान हो सके।',
        icon: 'ZoomIn',
      },
      {
        title: 'खराबी या नुकसान का स्थान',
        description: 'यदि साड़ी कटी-फटी, छपाई में दोष या दाग वाली है, तो उस विशेष हिस्से की साफ तस्वीर खींचें।',
        icon: 'AlertTriangle',
      },
      {
        title: 'मूल टैग और पैकेजिंग',
        description: 'साड़ी को उसके ब्रांड टैग, लेबल और मूल पॉलीबैग के साथ रखकर फोटो लें।',
        icon: 'Tag',
      },
    ],
    photoRequirements: {
      title: 'अनिवार्य फोटो आवश्यकताएं',
      items: [
        'कम से कम 2 स्पष्ट तस्वीरें अपलोड करें (अधिकतम 6 तस्वीरें)।',
        'तस्वीरें धुंधली (blurry) या अंधेरे में न हों।',
        'वास्तव में प्राप्त हुई साड़ी की तस्वीर लें, स्क्रीनशॉट मान्य नहीं हैं।',
        'स्वीकृत फाइल प्रकार: JPEG, PNG, WebP (प्रति फाइल अधिकतम 15MB)।',
      ],
    },
    videoRequirements: {
      title: 'वीडियो दिशानिर्देश (त्वरित मंजूरी हेतु अनुशंसित)',
      items: [
        'साड़ी का 10 से 30 सेकंड का एक छोटा वीडियो बनाएं।',
        'वीडियो में पल्लू, बॉर्डर और दोष वाले स्थान को धीरे-धीरे दिखाएं।',
        'स्वीकृत फॉर्मेट: MP4, MOV, WebM (अधिकतम 50MB)।',
      ],
    },
    packagingPolicy: {
      title: 'वापसी पात्रता एवं पैकेजिंग नियम',
      description: 'साड़ी अप्रयुक्त (unused), बिना धोई हुई और सभी मूल टैग्स के साथ होनी चाहिए। सिला हुआ ब्लाउज या आंशिक रूप से बदली गई साड़ियां वापसी योग्य नहीं हैं।',
    },
    acceptedFormats: 'स्वीकृत फाइलें: JPG, PNG, WebP, MP4, MOV (फोटो 15MB, वीडियो 50MB तक)',
    reasons: {
      DAMAGED: 'परिवहन के दौरान कटी-फटी या क्षतिग्रस्त',
      DEFECTIVE: 'निर्माण दोष (मैन्युफैक्चरिंग डिफेक्ट) या खराब छपाई',
      WRONG_ITEM_RECEIVED: 'ऑर्डर से पूरी तरह अलग साड़ी प्राप्त हुई',
      COLOR_MISMATCH: 'कैटलॉग फोटो से रंग में भारी अंतर',
      QUALITY_ISSUE: 'कपड़े (फैब्रिक) की गुणवत्ता उम्मीद के मुताबिक नहीं',
      NOT_AS_DESCRIBED: 'बॉर्डर या डिजाइन वेबसाइट विवरण से भिन्न',
      SIZE_FIT_ISSUE: 'साड़ी या ब्लाउज पीस की लंबाई/चौड़ाई कम है',
    },
    statuses: {
      REQUESTED: 'वापसी अनुरोध प्राप्त हुआ',
      AUTO_APPROVED: 'एआई द्वारा स्वतः स्वीकृत (Auto-Approved)',
      APPROVED: 'वापसी स्वीकृत',
      REJECTED: 'वापसी अस्वीकृत',
      UNDER_REVIEW: 'निरीक्षण जारी (मैन्युअल रिव्यू)',
      PENDING_EVIDENCE: 'अतिरिक्त फोटो आवश्यक',
      PICKUP_SCHEDULED: 'रिवर्स पिकअप निर्धारित',
      RECEIVED: 'वेयरहाउस में साड़ी प्राप्त हुई',
      REFUNDED: 'रिफंड पूर्ण',
      CANCELLED: 'अनुरोध रद्द',
    },
    messages: {
      autoApproved: 'आपकी वापसी स्वतः स्वीकृत हो गई है!',
      autoApprovedSubtitle: 'हमारे एआई विजुअल सिस्टम ने आपकी अपलोड की गई तस्वीरों का कैटलॉग फोटो से मिलान कर लिया है। कूरियर पिकअप निर्धारित किया जा रहा है।',
      underReview: 'आपका अनुरोध समीक्षा के लिए भेजा गया है।',
      underReviewSubtitle: 'हमारे टेक्सटाइल विशेषज्ञ आपकी तस्वीरों की जांच कर रहे हैं। 24 घंटे के भीतर आपको अपडेट मिल जाएगा।',
      insufficientEvidence: 'सत्यापन के लिए स्पष्ट तस्वीरों की आवश्यकता है।',
      insufficientEvidenceSubtitle: 'अपलोड की गई तस्वीरें थोड़ी धुंधली थीं। कृपया अच्छी रोशनी में बॉर्डर और पल्लू की साफ तस्वीरें अपलोड करें।',
      possibleMismatch: 'तस्वीरों में अंतर पाया गया — विशेषज्ञ समीक्षा जारी।',
      possibleMismatchSubtitle: 'साड़ी के रंग या डिजाइन में भिन्नता पाई गई है। इसे स्वतः अस्वीकार नहीं किया गया है, हमारे विशेषज्ञ व्यक्तिगत रूप से जांच करेंगे।',
      pickupInstructions: 'डिलिवरी (Delhivery) रिवर्स पिकअप निर्देश',
      pickupNote: 'कृपया साड़ी को उसके मूल पॉलीबैग में सुरक्षित पैक रखें। डिलीवरी एजेंट पिकअप के समय रसीद प्रदान करेगा।',
      appealOption: 'यदि आपके कोई प्रश्न हैं या आप समीक्षा चाहते हैं, तो हमारी ग्राहक सहायता टीम व्हाट्सएप पर उपलब्ध है।',
    },
  },
  gu: {
    title: 'માલ પરત (Return) કરવાની વિનંતી',
    subtitle: '7 દિવસમાં સરળ રીટર્ન — તુરંત AI ચકાસણી સાથે',
    guidelinesHeader: 'ચકાસણી માટે સાડીના સ્પષ્ટ ફોટા કેવી રીતે લેવા',
    guidelines: [
      {
        title: 'આખી સાડીનો ફેલાવીને ફોટો',
        description: 'સાડીને પૂરતા કુદરતી અજવાળામાં સપાટ જગ્યા પર પાથરીને ફોટો લો જેથી મુખ્ય રંગ અને ડિઝાઇન સ્પષ્ટ દેખાય.',
        icon: 'Layout',
      },
      {
        title: 'કાંઠો (બોર્ડર) અને પલ્લુનો નજીકથી ફોટો',
        description: 'સાડીની કિનારી/કાંઠો, જરી વર્ક, એમ્બ્રોઇડરી અને પલ્લુની ઝીણવટભરી વિગતો દેખાય તેવો ક્લોઝ-અપ ફોટો લો.',
        icon: 'ZoomIn',
      },
      {
        title: 'ખામી કે નુકસાન વાળી જગ્યા',
        description: 'જો સાડી ફાટેલી હોય, છાપકામમાં ખામી હોય કે ડાઘ હોય, તો તે ચોક્કસ ભાગનો સ્પષ્ટ ફોટો પાડો.',
        icon: 'AlertTriangle',
      },
      {
        title: 'ઓરિજિનલ ટેગ અને પેકિંગ',
        description: 'સાડી તેના મૂળ બ્રાન્ડ ટેગ અને પ્લાસ્ટિક પેકિંગ સાથે હોય તેવો ફોટો અપલોડ કરો.',
        icon: 'Tag',
      },
    ],
    photoRequirements: {
      title: 'અનિવાર્ય ફોટો શરતો',
      items: [
        'ઓછામાં ઓછા 2 સ્પષ્ટ ફોટા અપલોડ કરો (મહત્તમ 6 ફોટા).',
        'ફોટા ઝાંખા (blurry) કે અંધારાવાળા ન હોવા જોઈએ.',
        'તમને મળેલી વાસ્તવિક સાડીનો ફોટો લો, સ્ક્રીનશૉટ માન્ય નથી.',
        'માન્ય ફાઇલ પ્રકાર: JPEG, PNG, WebP (દરેક ફાઇલ મહત્તમ 15MB).',
      ],
    },
    videoRequirements: {
      title: 'વીડિયો માર્ગદર્શિકા (ઝડપી મંજૂરી માટે ખાસ ભલામણ)',
      items: [
        'સાડી બતાવતો 10 થી 30 સેકન્ડનો ટૂંકો વીડિયો બનાવો.',
        'વીડિયોમાં પલ્લુ, બોર્ડર અને ખામીવાળો ભાગ ધીમેથી ફેરવીને બતાવો.',
        'માન્ય ફોર્મેટ: MP4, MOV, WebM (મહત્તમ 50MB).',
      ],
    },
    packagingPolicy: {
      title: 'રીટર્ન પાત્રતા અને પેકિંગ નિયમ',
      description: 'સાડી પહેરેલી કે ધોયેલી ન હોવી જોઈએ અને તેના મૂળ પોલીબેગ અને બ્રાન્ડ ટેગ સાથે વ્યવસ્થિત હોવી જરૂરી છે. ઓલ્ટર કરેલી સાડીઓ પરત લેવામાં આવશે નહીં.',
    },
    acceptedFormats: 'માન્ય ફાઇલો: JPG, PNG, WebP, MP4, MOV (ફોટો 15MB, વીડિયો 50MB સુધી)',
    reasons: {
      DAMAGED: 'ડિલિવરી દરમિયાન ફાટેલી કે ક્ષતિગ્રસ્ત સાડી',
      DEFECTIVE: 'કાપડ કે પ્રિન્ટિંગમાં મેન્યુફેક્ચરિંગ ખામી',
      WRONG_ITEM_RECEIVED: 'ઓર્ડર કરતાં સાવ અલગ સાડી આવી ગઈ',
      COLOR_MISMATCH: 'વેબસાઇટના ફોટા કરતાં રંગમાં મોટો તફાવત',
      QUALITY_ISSUE: 'કાપડ (ફેબ્રિક) ની ગુણવત્તા અપેક્ષા મુજબ નથી',
      NOT_AS_DESCRIBED: 'બોર્ડર કે ડિઝાઇન વેબસાઇટની વિગત સાથે મળતી નથી',
      SIZE_FIT_ISSUE: 'સાડી કે બ્લાઉઝ પીસનું માપ ટૂંકું છે',
    },
    statuses: {
      REQUESTED: 'રીટર્ન વિનંતી નોંધાઈ',
      AUTO_APPROVED: 'AI ચકાસણી દ્વારા આપમેળે મંજૂર (Auto-Approved)',
      APPROVED: 'રીટર્ન મંજૂર થયું',
      REJECTED: 'રીટર્ન નામંજૂર થયું',
      UNDER_REVIEW: 'તપાસ ચાલુ છે (મેન્યુઅલ રિવ્યૂ)',
      PENDING_EVIDENCE: 'વધુ સ્પષ્ટ ફોટાની જરૂર છે',
      PICKUP_SCHEDULED: 'સાડી પાછી લેવા (Pickup) નું આયોજન થયું',
      RECEIVED: 'વેરહાઉસમાં સાડી જમા થઈ',
      REFUNDED: 'રૂપિયા પરત (Refund) અપાઈ ગયા',
      CANCELLED: 'વિનંતી રદ કરી',
    },
    messages: {
      autoApproved: 'તમારી રીટર્ન વિનંતી આપમેળે મંજૂર થઈ ગઈ છે!',
      autoApprovedSubtitle: 'અમારા AI વિઝ્યુઅલ સિસ્ટમે તમારા ફોટાની મૂળ કેટલોગ સાડી સાથે ચકાસણી કરી લીધી છે. દિલ્હીવરી (Delhivery) પિકઅપ શિડ્યુલ કરવામાં આવી રહ્યું છે.',
      underReview: 'તમારી વિનંતી ચકાસણી હેઠળ મોકલવામાં આવી છે.',
      underReviewSubtitle: 'અમારા ટેક્સટાઇલ સ્પેશિયાલિસ્ટ તમારા ફોટાની વિગતો ચકાસી રહ્યા છે. 24 કલાકમાં તમને જાણ કરવામાં આવશે.',
      insufficientEvidence: 'ચકાસણી માટે વધુ સ્પષ્ટ ફોટા જરૂરી છે.',
      insufficientEvidenceSubtitle: 'અપલોડ કરેલા ફોટા થોડા ઝાંખા જણાયા છે. કૃપા કરીને સારા અજવાળામાં બોર્ડર અને પલ્લુના સ્પષ્ટ ફોટા ફરીથી અપલોડ કરો.',
      possibleMismatch: 'ફોટામાં તફાવત જણાયો છે — સ્પેશિયાલિસ્ટ તપાસ કરશે.',
      possibleMismatchSubtitle: 'સાડીના રંગ કે ડિઝાઇનમાં તફાવત દેખાયો છે. આ વિનંતી સીધી રદ કરવામાં આવી નથી, અમારા એક્ઝિક્યુટિવ જાતે ચકાસીને નિર્ણય લેશે.',
      pickupInstructions: 'દિલ્હીવરી (Delhivery) રિવર્સ પિકઅપ સૂચનાઓ',
      pickupNote: 'કૃપા કરીને સાડી તેના મૂળ પ્લાસ્ટિક કવર અને ટેગ સાથે તૈયાર રાખો. કુરિયર બોય પિકઅપ સમયે રસીદ આપશે.',
      appealOption: 'જો તમને કોઈ પ્રશ્ન હોય તો અમારી કસ્ટમર સપોર્ટ ટીમ વ્હોટ્સએપ પર હાજર છે.',
    },
  },
}

export class ReturnI18nService {
  /**
   * Suggest preferred language based on Indian state or address text
   */
  public static detectLanguageFromState(stateOrAddress?: any): SupportedLanguage {
    if (!stateOrAddress) return 'en'
    let rawStr = ''
    if (typeof stateOrAddress === 'string') {
      rawStr = stateOrAddress
    } else if (typeof stateOrAddress === 'object') {
      rawStr = [
        stateOrAddress.state,
        stateOrAddress.city,
        stateOrAddress.address,
        stateOrAddress.addressLine1,
        stateOrAddress.addressLine2,
        stateOrAddress.raw,
        JSON.stringify(stateOrAddress),
      ]
        .filter(Boolean)
        .join(' ')
    } else {
      rawStr = String(stateOrAddress)
    }

    const lower = rawStr.toLowerCase()

    // Gujarat detection
    if (lower.includes('gujarat') || lower.includes('guj') || lower.includes('ahmedabad') || lower.includes('surat') || lower.includes('vadodara') || lower.includes('rajkot')) {
      return 'gu'
    }

    // Hindi heartland states
    const hindiStates = [
      'delhi', 'uttar pradesh', 'up', 'madhya pradesh', 'mp', 'rajasthan', 'bihar',
      'haryana', 'himachal', 'jharkhand', 'chhattisgarh', 'uttarakhand', 'punjab', 'chandigarh'
    ]
    for (const st of hindiStates) {
      if (lower.includes(st)) {
        return 'hi'
      }
    }

    return 'en'
  }

  /**
   * Get localized instructions and messages for a given language
   */
  public static getInstructions(language: SupportedLanguage = 'en'): LocalizedInstruction {
    return RETURN_TRANSLATIONS[language] || RETURN_TRANSLATIONS.en
  }

  /**
   * Get policy and guidelines package for return flow
   */
  public static getPolicyAndInstructions(language: SupportedLanguage = 'en') {
    const inst = this.getInstructions(language)
    return {
      language,
      photoGuidelines: inst.guidelines,
      reasons: inst.reasons,
      returnWindowPolicy: language === 'gu'
        ? 'ડિલિવરીના 7 દિવસની અંદર સરળ વળતર'
        : language === 'hi'
        ? 'डिलीवरी के 7 दिनों के भीतर आसान वापसी'
        : 'Easy 7-day return policy',
      instructions: inst,
    }
  }

  /**
   * Get translated reason text
   */
  public static getReasonLabel(reason: string, language: SupportedLanguage = 'en'): string {
    const dict = this.getInstructions(language)
    return dict.reasons[reason] || reason
  }

  /**
   * Get translated status label
   */
  public static getStatusLabel(status: string, language: SupportedLanguage = 'en'): string {
    const dict = this.getInstructions(language)
    return dict.statuses[status] || status
  }
}

export default ReturnI18nService
