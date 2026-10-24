export type SupportedLanguage = 'en' | 'hi' | 'gu'

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
]

export function detectLanguageFromState(state?: string): SupportedLanguage {
  if (!state) return 'en'
  const s = state.trim().toLowerCase()
  if (s.includes('gujarat') || s.includes('surat') || s.includes('ahmedabad') || s.includes('vadodara') || s.includes('rajkot') || s === 'gj') {
    return 'gu'
  }
  const hindiStates = [
    'uttar pradesh', 'delhi', 'madhya pradesh', 'rajasthan', 'bihar',
    'haryana', 'uttarakhand', 'himachal', 'jharkhand', 'chhattisgarh',
    'punjab', 'chandigarh', 'up', 'mp', 'dl', 'rj', 'hr', 'br'
  ]
  if (hindiStates.some((st) => s.includes(st))) {
    return 'hi'
  }
  return 'en'
}

export interface ReturnI18nDictionary {
  title: string
  subtitle: string
  languageSelectorLabel: string
  suggestedBadge: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string
  guidelinesHeader: string
  guidelines: {
    title: string
    desc: string
  }[]
  videoGuideline: {
    title: string
    desc: string
  }
  reasons: { [key: string]: string }
  selectReasonPlaceholder: string
  detailedNotesLabel: string
  detailedNotesPlaceholder: string
  uploadPhotosTitle: string
  uploadPhotosDesc: string
  uploadVideoTitle: string
  uploadVideoDesc: string
  dragDropOrBrowse: string
  fileLimitNotice: string
  aiNoticeHeader: string
  aiNoticeText: string
  submitButtonText: string
  submittingText: string
  verifyingAiText: string
  cancelText: string
  backText: string
  nextText: string
  errors: {
    selectReason: string
    uploadAtLeastOnePhoto: string
    fileTooLarge: string
    invalidFileType: string
    alreadySubmitted: string
    windowExpired: string
  }
  outcomes: {
    matchConfirmedTitle: string
    matchConfirmedDesc: string
    pickupScheduleTitle: string
    pickupInstructions: string[]
    reviewRequiredTitle: string
    reviewRequiredDesc: string
    reviewTimeline: string
    evidenceRequiredTitle: string
    evidenceRequiredDesc: string
    appealNotice: string
  }
  trackingTitle: string
  waybillLabel: string
  statusLabels: { [key: string]: string }
}

export const RETURN_DICTIONARIES: Record<SupportedLanguage, ReturnI18nDictionary> = {
  en: {
    title: 'Return or Exchange Saree',
    subtitle: 'Automated AI visual verification for fast doorstep reverse pickup',
    languageSelectorLabel: 'Preferred Language',
    suggestedBadge: 'Suggested based on your address',
    step1Title: 'Select Reason & Instructions',
    step1Desc: 'Review policy guidelines and select return reason',
    step2Title: 'Upload Photos & Video',
    step2Desc: 'Provide clear photos for automated catalogue image matching',
    step3Title: 'Instant Verification Result',
    step3Desc: 'AI comparison outcome and reverse pickup details',
    guidelinesHeader: 'Photo Guidelines for Fast Approval',
    guidelines: [
      {
        title: 'Full Saree Spread',
        desc: 'Unfold saree on a flat surface under good daylight showing overall body color and pattern.',
      },
      {
        title: 'Border & Pallu Close-up',
        desc: 'Take a clear close-up of the border zari, embroidery, and pallu motifs.',
      },
      {
        title: 'Defect or Variation Area',
        desc: 'If damaged, stained, or incorrect color, capture a focused photo of that specific area.',
      },
      {
        title: 'Original Tags & Packaging',
        desc: 'Ensure brand tags, barcode slips, and polybag/box packaging are included.',
      },
    ],
    videoGuideline: {
      title: 'Short 360° Video (Optional but Recommended)',
      desc: 'Record a 5–15 second video slowly showing the product and unboxing details.',
    },
    reasons: {
      DEFECTIVE_OR_DAMAGED: 'Damaged or defective saree received',
      WRONG_PRODUCT: 'Completely wrong saree / color sent',
      COLOR_VARIATION: 'Significant color mismatch from website',
      FABRIC_QUALITY: 'Fabric texture or feel not as expected',
      MISSING_BLOUSE_OR_ACCESSORY: 'Missing unstitched blouse piece or tassel',
      NOT_AS_DESCRIBED: 'Design or embroidery differs from catalogue',
    },
    selectReasonPlaceholder: 'Select a reason for return',
    detailedNotesLabel: 'Additional Comments (Optional)',
    detailedNotesPlaceholder: 'Describe any specific issue with the saree in detail...',
    uploadPhotosTitle: 'Upload Saree Photos (Min 1, Max 5)',
    uploadPhotosDesc: 'Clear JPG, PNG, or WebP images up to 10MB each',
    uploadVideoTitle: 'Upload Short Video (Optional, Max 30MB)',
    uploadVideoDesc: 'MP4 or WebM short video clip showing the item',
    dragDropOrBrowse: 'Click to browse or drag & drop files here',
    fileLimitNotice: 'Our AI compares these photos directly with the master catalogue design.',
    aiNoticeHeader: 'How Our Automatic Verification Works',
    aiNoticeText:
      'Our Computer Vision system matches your uploaded photos against the master saree catalogue images (analyzing primary color, zari weaving, pallu print, and border layout). Eligible matches are approved immediately for reverse pickup!',
    submitButtonText: 'Submit & Verify Product',
    submittingText: 'Uploading Media...',
    verifyingAiText: 'Running AI Visual Comparison...',
    cancelText: 'Cancel',
    backText: 'Back',
    nextText: 'Continue to Media Upload',
    errors: {
      selectReason: 'Please select a reason for the return request.',
      uploadAtLeastOnePhoto: 'Please upload at least one clear photo of the product.',
      fileTooLarge: 'File exceeds maximum allowed size.',
      invalidFileType: 'Unsupported file format. Please upload JPG, PNG, WebP, or MP4.',
      alreadySubmitted: 'A return request has already been filed for this item.',
      windowExpired: 'Return window of 7 days has expired for this delivered item.',
    },
    outcomes: {
      matchConfirmedTitle: 'Return Request Automatically Approved!',
      matchConfirmedDesc:
        'Our visual verification confirmed high similarity with the catalogue product. Your return is approved.',
      pickupScheduleTitle: 'Doorstep Pickup Scheduled',
      pickupInstructions: [
        'Fold the saree neatly in its original plastic wrap and outer box.',
        'Keep all brand tags, fold cardboards, and blouse fabric attached.',
        'Our logistics courier partner (Delhivery) will collect the parcel within 24–48 hours.',
        'You do not need to print a label; the courier agent will bring the barcode tag.',
      ],
      reviewRequiredTitle: 'Under Specialist Manual Review',
      reviewRequiredDesc:
        'We noticed subtle visual variations or lighting differences between your photos and the catalogue design. Your request is in safe hands and has been forwarded to our quality verification team.',
      reviewTimeline: 'Our verification team reviews requests within 24 business hours. You will receive an SMS and email update.',
      evidenceRequiredTitle: 'Additional Photos Required',
      evidenceRequiredDesc:
        'The uploaded photos were too blurry or dim for conclusive AI matching. Please provide clearer photos showing the full saree and border.',
      appealNotice:
        'Important: Requests are never automatically rejected due to AI confidence. You may appeal or upload more photos anytime.',
    },
    trackingTitle: 'Reverse Logistics Tracking',
    waybillLabel: 'Return Tracking # (AWB)',
    statusLabels: {
      PENDING: 'Initiated',
      UNDER_REVIEW: 'Under Manual Review',
      APPROVED: 'Return Approved',
      REJECTED: 'Return Rejected',
      PICKED_UP: 'Item Picked Up',
      RECEIVED: 'Warehouse Received',
      REFUNDED: 'Refund Completed',
    },
  },

  hi: {
    title: 'साड़ी वापसी या एक्सचेंज अनुरोध',
    subtitle: 'तेज़ डोरस्टेप पिकअप के लिए स्वचालित एआई फोटो सत्यापन',
    languageSelectorLabel: 'पसंदीदा भाषा (Language)',
    suggestedBadge: 'आपके पते के अनुसार सुझाई गई भाषा',
    step1Title: 'कारण और नियम चुनें',
    step1Desc: 'वापसी नीति देखें और वापसी का कारण चुनें',
    step2Title: 'साड़ी की तस्वीरें और वीडियो अपलोड करें',
    step2Desc: 'कैटलॉग मिलान के लिए स्पष्ट तस्वीरें प्रदान करें',
    step3Title: 'सत्यापन परिणाम',
    step3Desc: 'एआई मिलान परिणाम और पिकअप निर्देश',
    guidelinesHeader: 'तेज़ मंज़ूरी के लिए फोटो दिशानिर्देश',
    guidelines: [
      {
        title: 'पूरी साड़ी फैलाकर फोटो लें',
        desc: 'साड़ी को अच्छी रोशनी में समतल जगह पर पूरा फैलाकर फोटो लें ताकि रंग और डिज़ाइन साफ दिखें।',
      },
      {
        title: 'बॉर्डर और पल्लू का क्लोज़-अप',
        desc: 'साड़ी के बॉर्डर (ज़री/कढ़ाई) और पल्लू के डिज़ाइन की नज़दीकी व स्पष्ट तस्वीर लें।',
      },
      {
        title: 'खराबी या भिन्नता का स्थान',
        desc: 'यदि उत्पाद में कोई खराबी, दाग या कटा-फटा भाग है, तो उस हिस्से की साफ़ फोटो लें।',
      },
      {
        title: 'मूल टैग और पैकेजिंग',
        desc: 'साड़ी का मूल ब्रांड टैग, मोड़ का गत्ता और मूल बैग साथ रखें।',
      },
    ],
    videoGuideline: {
      title: 'छोटा वीडियो (वैकल्पिक परंतु अनुशंसित)',
      desc: 'साड़ी को घुमाकर दिखाते हुए 5–15 सेकंड का एक छोटा वीडियो बनाएं।',
    },
    reasons: {
      DEFECTIVE_OR_DAMAGED: 'खराब या क्षतिग्रस्त साड़ी प्राप्त हुई',
      WRONG_PRODUCT: 'गलत साड़ी या गलत रंग भेजा गया',
      COLOR_VARIATION: 'वेबसाइट से रंग में स्पष्ट अंतर है',
      FABRIC_QUALITY: 'कपड़े की गुणवत्ता उम्मीद के मुताबिक नहीं है',
      MISSING_BLOUSE_OR_ACCESSORY: 'ब्लाउज पीस या लटकन गायब है',
      NOT_AS_DESCRIBED: 'डिज़ाइन या कढ़ाई कैटलॉग से भिन्न है',
    },
    selectReasonPlaceholder: 'वापसी का कारण चुनें',
    detailedNotesLabel: 'अतिरिक्त विवरण (वैकल्पिक)',
    detailedNotesPlaceholder: 'साड़ी से जुड़ी किसी भी समस्या का संक्षेप में विवरण लिखें...',
    uploadPhotosTitle: 'साड़ी की तस्वीरें अपलोड करें (कम से कम 1, अधिकतम 5)',
    uploadPhotosDesc: 'स्पष्ट JPG, PNG या WebP तस्वीरें (अधिकतम 10MB प्रति फोटो)',
    uploadVideoTitle: 'छोटा वीडियो अपलोड करें (वैकल्पिक, अधिकतम 30MB)',
    uploadVideoDesc: 'MP4 या WebM वीडियो क्लिप',
    dragDropOrBrowse: 'फ़ाइलें चुनने के लिए क्लिक करें या यहाँ खींचकर लाएँ',
    fileLimitNotice: 'हमारा एआई सिस्टम इन तस्वीरों की तुलना मूल कैटलॉग फोटो से करता है।',
    aiNoticeHeader: 'हमारा स्वचालित सत्यापन कैसे काम करता है',
    aiNoticeText:
      'हमारी कंप्यूटर विज़न तकनीक आपकी अपलोड की गई तस्वीरों की तुलना हमारे मूल कैटलॉग से करती है (रंग, ज़री, पल्लू प्रिंट और बॉर्डर का मिलान)। सही मिलान पाए जाने पर वापसी तुरंत स्वीकृत हो जाती है!',
    submitButtonText: 'जमा करें और उत्पाद सत्यापित करें',
    submittingText: 'फ़ाइलें अपलोड हो रही हैं...',
    verifyingAiText: 'एआई द्वारा फोटो मिलान किया जा रहा है...',
    cancelText: 'रद्द करें',
    backText: 'पीछे जाएँ',
    nextText: 'फोटो अपलोड करने के लिए आगे बढ़ें',
    errors: {
      selectReason: 'कृपया वापसी का कारण चुनें।',
      uploadAtLeastOnePhoto: 'कृपया उत्पाद की कम से कम एक स्पष्ट तस्वीर अपलोड करें।',
      fileTooLarge: 'फ़ाइल का आकार सीमा से अधिक है।',
      invalidFileType: 'अमान्य फ़ाइल प्रकार। कृपया JPG, PNG, WebP या MP4 अपलोड करें।',
      alreadySubmitted: 'इस वस्तु के लिए पहले से ही वापसी अनुरोध दर्ज है।',
      windowExpired: 'इस ऑर्डर की 7 दिनों की वापसी अवधि समाप्त हो चुकी है।',
    },
    outcomes: {
      matchConfirmedTitle: 'वापसी अनुरोध स्वतः स्वीकृत हो गया!',
      matchConfirmedDesc:
        'हमारे विज़न सिस्टम ने कैटलॉग उत्पाद के साथ समानता की पुष्टि की है। आपका वापसी अनुरोध स्वीकार कर लिया गया है।',
      pickupScheduleTitle: 'घर से पिकअप निर्धारित',
      pickupInstructions: [
        'साड़ी को मूल प्लास्टिक कवर और बॉक्स में अच्छी तरह पैक करें।',
        'सभी ब्रांड टैग, बारकोड और ब्लाउज पीस साथ में रखें।',
        'हमारे कूरियर पार्टनर (ब्लू डार्ट एक्सप्रेस) 24–48 घंटों में आपके पते से पार्सल उठा लेंगे।',
        'आपको कोई लेबल प्रिंट करने की आवश्यकता नहीं है; कूरियर एजेंट स्वयं बारकोड लाएगा।',
      ],
      reviewRequiredTitle: 'विशेषज्ञ टीम द्वारा समीक्षाधीन',
      reviewRequiredDesc:
        'तस्वीरों में रोशनी या कोण के कारण हमें मामूली अंतर दिखा है। आपका अनुरोध पूरी तरह सुरक्षित है और हमारी गुणवत्ता टीम इसकी मानवीय जांच कर रही है।',
      reviewTimeline: 'हमारी टीम 24 कार्य घंटों में समीक्षा पूरी कर लेगी। आपको एसएमएस व ईमेल पर सूचना मिलेगी।',
      evidenceRequiredTitle: 'अतिरिक्त साक्ष्य आवश्यक',
      evidenceRequiredDesc:
        'अपलोड की गई तस्वीरें धुंधली थीं। कृपया पूरी साड़ी और बॉर्डर की अधिक स्पष्ट तस्वीरें प्रदान करें।',
      appealNotice:
        'महत्वपूर्ण: एआई स्कोर के आधार पर कोई भी वापसी खारिज नहीं की जाती। आप कभी भी अतिरिक्त जानकारी दे सकते हैं।',
    },
    trackingTitle: 'रिवर्स पिकअप ट्रैकिंग',
    waybillLabel: 'वापसी ट्रैकिंग नंबर (AWB)',
    statusLabels: {
      PENDING: 'अनुरोध प्राप्त',
      UNDER_REVIEW: 'समीक्षाधीन (Under Review)',
      APPROVED: 'वापसी स्वीकृत (Approved)',
      REJECTED: 'अस्वीकृत',
      PICKED_UP: 'पिकअप संपन्न',
      RECEIVED: 'गोदाम में प्राप्त',
      REFUNDED: 'रिफंड पूर्ण',
    },
  },

  gu: {
    title: 'સાડી રિટર્ન અથવા એક્સચેન્જ વિનંતી',
    subtitle: 'ઝડપી ડોરસ્ટેપ રિવર્સ પિકઅપ માટે ઓટોમેટિક AI ફોટો વેરિફિકેશન',
    languageSelectorLabel: 'પસંદગીની ભાષા (Language)',
    suggestedBadge: 'તમારા સરનામાના આધારે સૂચવેલ ભાષા',
    step1Title: 'કારણ અને સૂચનાઓ પસંદ કરો',
    step1Desc: 'નીતિ માર્ગદર્શિકા જુઓ અને રિટર્નનું કારણ પસંદ કરો',
    step2Title: 'સાડીના ફોટા અને વિડિયો અપલોડ કરો',
    step2Desc: 'કેટલોગ ઇમેજ મેચિંગ માટે સ્પષ્ટ ફોટો પૂરા પાડો',
    step3Title: 'ત્વરિત વેરિફિકેશન પરિણામ',
    step3Desc: 'AI સરખામણી પરિણામ અને પિકઅપ વિગતો',
    guidelinesHeader: 'ઝડપી મંજૂરી માટે ફોટો માર્ગદર્શિકા',
    guidelines: [
      {
        title: 'આખી સાડી પાથરીને ફોટો લો',
        desc: 'સાડીને સારા અજવાળામાં સપાટ જગ્યાએ સંપૂર્ણ ખુલ્લી રાખીને ફોટો લો જેથી કલર અને ડિઝાઈન ચોખ્ખી દેખાય.',
      },
      {
        title: 'બોર્ડર અને પલ્લુનો ક્લોઝ-અપ',
        desc: 'સાડીની બોર્ડર (ઝરી/એમ્બ્રોઇડરી) અને પલ્લુની ડિઝાઈનનો નજીકથી સ્પષ્ટ ફોટો લો.',
      },
      {
        title: 'ખામી કે તફાવત વાળી જગ્યા',
        desc: 'જો કોઈ ખામી, ડાઘ કે ખોટો રંગ આવ્યો હોય તો તે ભાગનો ખાસ ફોકસ કરીને ફોટો લો.',
      },
      {
        title: 'ઓરિજિનલ ટેગ અને પેકિંગ',
        desc: 'સાડીના ઓરિજિનલ ટેગ, વાળવાના પૂંઠા અને પ્લાસ્ટિક બેગ સાથે રાખવા જરૂરી છે.',
      },
    ],
    videoGuideline: {
      title: 'ટૂંકો વિડિયો (વૈકલ્પિક પરંતુ ખૂબ ઉપયોગી)',
      desc: 'સાડીને ચારે બાજુથી બતાવતો 5–15 સેકન્ડનો નાનો વિડિયો રેકોર્ડ કરો.',
    },
    reasons: {
      DEFECTIVE_OR_DAMAGED: 'ખામીયુક્ત અથવા નુકસાન પામેલ સાડી મળી છે',
      WRONG_PRODUCT: 'સંપૂર્ણપણે ખોટી સાડી અથવા ખોટો કલર મોકલેલ છે',
      COLOR_VARIATION: 'વેબસાઇટ કરતા કલરમાં મોટો તફાવત છે',
      FABRIC_QUALITY: 'કાપડની ગુણવત્તા અપેક્ષા મુજબ નથી',
      MISSING_BLOUSE_OR_ACCESSORY: 'બ્લાઉઝ પીસ અથવા લટકણ ગાયબ છે',
      NOT_AS_DESCRIBED: 'ડિઝાઇન અથવા વર્ક કેટલોગ મુજબ નથી',
    },
    selectReasonPlaceholder: 'રિટર્ન કરવાનું કારણ પસંદ કરો',
    detailedNotesLabel: 'વધારાની વિગત (વૈકલ્પિક)',
    detailedNotesPlaceholder: 'સાડી સાથે જોડાયેલ કોઈપણ સમસ્યા વિશે વિગત લખો...',
    uploadPhotosTitle: 'સાડીના ફોટા અપલોડ કરો (ઓછામાં ઓછો 1, વધુમાં વધુ 5)',
    uploadPhotosDesc: 'સ્પષ્ટ JPG, PNG અથવા WebP ફોટા (પ્રતિ ફોટો મહત્તમ 10MB)',
    uploadVideoTitle: 'ટૂંકો વિડિયો અપલોડ કરો (વૈકલ્પિક, મહત્તમ 30MB)',
    uploadVideoDesc: 'MP4 અથવા WebM વિડિયો ક્લિપ',
    dragDropOrBrowse: 'ફાઇલ પસંદ કરવા ક્લિક કરો અથવા અહીં ખેંચી લાવો',
    fileLimitNotice: 'અમારી AI સિસ્ટમ આ ફોટોની સરખામણી મૂળ કેટલોગ ફોટા સાથે કરે છે.',
    aiNoticeHeader: 'અમારું ઓટોમેટિક વેરિફિકેશન કેવી રીતે કાર્ય કરે છે',
    aiNoticeText:
      'અમારી કમ્પ્યુટર વિઝન સિસ્ટમ તમારા અપલોડ કરેલ ફોટાને અસલ કેટલોગ ડિઝાઇન (મુખ્ય રંગ, ઝરી વણાટ, પલ્લુ પ્રિન્ટ અને બોર્ડર) સાથે સરખાવે છે. સાચો મેળ થતાં જ તરત જ રિટર્ન મંજૂર થઈ જાય છે!',
    submitButtonText: 'સબમિટ કરો અને પ્રોડક્ટ વેરિફાય કરો',
    submittingText: 'ફોટા અપલોડ થઈ રહ્યા છે...',
    verifyingAiText: 'AI દ્વારા ફોટો મેચિંગ થઈ રહ્યું છે...',
    cancelText: 'રદ કરો',
    backText: 'પાછળ જાઓ',
    nextText: 'ફોટો અપલોડ કરવા આગળ વધો',
    errors: {
      selectReason: 'કૃપા કરીને રિટર્નનું કારણ પસંદ કરો.',
      uploadAtLeastOnePhoto: 'કૃપા કરીને પ્રોડક્ટનો ઓછામાં ઓછો એક સ્પષ્ટ ફોટો અપલોડ કરો.',
      fileTooLarge: 'ફાઇલનું કદ મર્યાદા કરતા વધારે છે.',
      invalidFileType: 'અમાન્ય ફાઇલ પ્રકાર. કૃપા કરીને JPG, PNG, WebP અથવા MP4 અપલોડ કરો.',
      alreadySubmitted: 'આ આઇટમ માટે પહેલેથી જ રિટર્ન વિનંતી સબમિટ થયેલી છે.',
      windowExpired: 'આ ડિલિવર થયેલ આઇટમની 7 દિવસની રિટર્ન મુદત પૂરી થઈ ગઈ છે.',
    },
    outcomes: {
      matchConfirmedTitle: 'રિટર્ન વિનંતી આપમેળે મંજૂર થઈ ગઈ!',
      matchConfirmedDesc:
        'અમારી વિઝન સિસ્ટમે કેટલોગ પ્રોડક્ટ સાથે મેળ ખાવાની પુષ્ટિ કરી છે. તમારી રિટર્ન વિનંતી સ્વીકારવામાં આવી છે.',
      pickupScheduleTitle: 'ઘરેથી પિકઅપ સુનિશ્ચિત',
      pickupInstructions: [
        'સાડીને તેના અસલ પ્લાસ્ટિક કવર અને બોક્સમાં સરખી રીતે પેક કરો.',
        'બધા બ્રાન્ડ ટેગ, બારકોડ અને બ્લાઉઝ પીસ સાથે રાખો.',
        'અમારા કુરિયર પાર્ટનર (બ્લુ ડાર્ટ એક્સપ્રેસ) 24–48 કલાકમાં તમારા ઘરેથી પાર્સલ લઈ જશે.',
        'તમારે કોઈ લેબલ પ્રિન્ટ કરવાની જરૂર નથી; કુરિયર એજન્ટ જાતે બારકોડ લાવશે.',
      ],
      reviewRequiredTitle: 'નિષ્ણાત ટીમ દ્વારા રિવ્યૂ હેઠળ',
      reviewRequiredDesc:
        'ફોટામાં લાઇટિંગ અથવા એંગલના કારણે થોડો તફાવત જણાયો છે. તમારી વિનંતી સંપૂર્ણ સુરક્ષિત છે અને અમારી ક્વોલિટી ટીમ તેની મેન્યુઅલ તપાસ કરી રહી છે.',
      reviewTimeline: 'અમારી ટીમ 24 કામકાજના કલાકોમાં તપાસ પૂર્ણ કરશે. તમને SMS અને ઇમેઇલ દ્વારા જાણ કરવામાં આવશે.',
      evidenceRequiredTitle: 'વધારાના ફોટાની જરૂર છે',
      evidenceRequiredDesc:
        'અપલોડ કરેલા ફોટા ઝાંખા હતા. કૃપા કરીને આખી સાડી અને બોર્ડરનો વધુ સ્પષ્ટ ફોટો અપલોડ કરો.',
      appealNotice:
        'મહત્વપૂર્ણ: AI સ્કોરના આધારે ક્યારેય રિટર્ન રિજેક્ટ થતું નથી. તમે ગમે ત્યારે વધારાની વિગતો આપી શકો છો.',
    },
    trackingTitle: 'રિવર્સ પિકઅપ ટ્રેકિંગ',
    waybillLabel: 'રિટર્ન ટ્રેકિંગ નંબર (AWB)',
    statusLabels: {
      PENDING: 'વિનંતી પ્રાપ્ત',
      UNDER_REVIEW: 'તપાસ હેઠળ (Under Review)',
      APPROVED: 'રિટર્ન મંજૂર (Approved)',
      REJECTED: 'નામંજૂર',
      PICKED_UP: 'પિકઅપ સંપન્ન',
      RECEIVED: 'ગોડાઉનમાં મળેલ',
      REFUNDED: 'રિફંડ પૂર્ણ',
    },
  },
}
