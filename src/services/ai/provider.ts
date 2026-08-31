import { AIResponse, AISource } from "@/types";

export interface AICompletionOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  sources?: AISource[];
  contextType?: string;
}

export class AIProvider {
  private static instance: AIProvider;
  private apiKey: string | undefined;
  private modelName: string;
  private providerType: string;

  private constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.modelName = process.env.AI_MODEL || "gemini-1.5-flash";
    this.providerType = process.env.AI_PROVIDER || (this.apiKey ? "gemini" : "demo");
  }

  public static getInstance(): AIProvider {
    if (!AIProvider.instance) {
      AIProvider.instance = new AIProvider();
    }
    return AIProvider.instance;
  }

  public isDemoMode(): boolean {
    return !this.apiKey || this.providerType === "demo";
  }

  public async generateText(
    prompt: string,
    options: AICompletionOptions = {}
  ): Promise<AIResponse<string>> {
    const startTime = Date.now();

    // If external AI key is available, attempt real API request
    if (this.apiKey && this.apiKey.trim().length > 5 && this.providerType !== "demo") {
      try {
        const response = await this.callExternalAI(prompt, options);
        return {
          status: "success",
          data: response,
          sources: options.sources || [],
          latencyMs: Date.now() - startTime,
          isDemo: false,
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "AI service unavailable";
        console.warn(`[AI Provider] External call failed, falling back to Demo Engine: ${errorMessage}`);
        // Fall back gracefully with clear demo attribution
      }
    }

    // Fallback: Clinically-accurate Homoeopathic reasoning engine
    const demoResponse = this.generateDemoResponse(prompt, options);
    return {
      status: "demo",
      data: demoResponse,
      sources: options.sources || [],
      latencyMs: Date.now() - startTime,
      isDemo: true,
    };
  }

  private async callExternalAI(prompt: string, options: AICompletionOptions): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    const payload = {
      contents: [
        {
          parts: [
            { text: `${options.systemPrompt ? `[SYSTEM INSTRUCTIONS]\n${options.systemPrompt}\n\n` : ""}[USER PROMPT]\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens ?? 1500,
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Google AI API returned status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response from AI service");
    }
    return candidateText;
  }

  private generateDemoResponse(prompt: string, options: AICompletionOptions): string {
    const raw = prompt.trim();
    const lower = raw.toLowerCase();

    // ----------------------------------------------------
    // 1. MULTILINGUAL QUERIES (Marathi / Hindi / Hinglish)
    // ----------------------------------------------------
    if (
      lower.includes("madhe") ||
      lower.includes("kay ahe") ||
      lower.includes("kashala") ||
      lower.includes("sang") ||
      lower.includes("sope") ||
      lower.includes("samjhav")
    ) {
      if (lower.includes("repertory") || lower.includes("rubric")) {
        return `Repertory म्हणजे homoeopathic symptoms चा एक **systematic index** (अनुक्रमणिका) आहे, ज्याच्या मदतीने योग्य rubrics आणि remedies शोधता येतात.

**सोपे उदाहरण:**
समजा रुग्णाला 'सकाळी डोकेदुखी वाढते' (headache worse in the morning) असा त्रास आहे, तर Repertory मध्ये *HEAD - PAIN - Morning* या rubric खाली योग्य औषधे सापडतात.

**महत्त्वाचा मुद्दा:**
Repertory हे Materia Medica मध्ये अचूक औषध शोधण्याचे साधन आहे, ते थेट प्रिस्क्रिप्शन देत नाही.

तुम्हाला BHMS केस उदाहरणासह अधिक जाणून घ्यायचे आहे का?`;
      }

      if (lower.includes("organon") || lower.includes("aphorism") || lower.includes("vital force")) {
        return `Organon of Medicine हे **Dr. Samuel Hahnemann** यांनी लिहिलेले Homoeopathy चे मूळ तत्त्वज्ञान (philosophical foundation) आहे.

**मुख्य मुद्दे:**
1. **Vital Force (§9):** मानवी शरीराचे आरोग्य सांभाळणारी आंतरिक जीवनशक्ती.
2. **Similia Similibus Curentur (§26):** 'समान लक्षणांवर समान औषध' हा निसर्गाचा उपचारात्मक नियम.
3. **Individualization (§153):** प्रत्येक रुग्णाच्या विशिष्ट व वैशिष्ट्यपूर्ण (characteristic) लक्षणांवर भर.

तुम्हाला विशिष्ट Aphorism बद्दल सविस्तर माहिती हवी आहे का?`;
      }

      return `नमस्कार! Homoeopathy च्या कोणत्याही विषयाबद्दल (Organon, Materia Medica, Repertory, Pharmacy) सोप्या भाषेत समजून घेण्यासाठी मी तयार आहे.

तुम्हाला कोणत्या विषयाचा अभ्यास करायचा आहे?`;
    }

    if (
      lower.includes("kya hai") ||
      lower.includes("samjhao") ||
      lower.includes("batao") ||
      lower.includes("kaise") ||
      lower.includes("kare")
    ) {
      if (lower.includes("repertory") || lower.includes("rubric")) {
        return `Repertory लक्षणों (symptoms) की एक **systematic index** है, जो केस टेकिंग के बाद सही rubrics और remedies तक पहुंचने में मदद करती है।

**उदाहरण:**
यदि किसी मरीज का सिरदर्द सुबह बढ़ता है, तो Repertory में इसे *HEAD - PAIN - Morning* rubric के रूप में देखा जाता है।

**याद रखने योग्य बात:**
Repertory केवल एक reference guide है; अंतिम remedy selection हमेशा Materia Medica के totality of symptoms पर आधारित होता है।

क्या आप इसे किसी BHMS केस स्टडी के साथ समझना चाहते हैं?`;
      }

      if (lower.includes("organon") || lower.includes("vital force") || lower.includes("miasm")) {
        return `Organon of Medicine होम्योपैथी की बुनियादी नियमावली और दर्शन (philosophy) है, जिसे **Dr. Samuel Hahnemann** ने लिखा था।

**3 मुख्य सिद्धांत:**
1. **Vital Force (§9):** हमारे शरीर को स्वस्थ रखने वाली आत्मिक जीवन-शक्ति।
2. **Similia Principle (§26):** जो पदार्थ स्वस्थ व्यक्ति में लक्षण पैदा कर सकता है, वही बीमार व्यक्ति में उसी लक्षण को ठीक कर सकता है।
3. **Characteristic Symptoms (§153):** सामान्य लक्षणों की तुलना में अनोखे और विशेष लक्षणों को प्राथमिकता।

क्या आप किसी विशेष Aphorism की व्याख्या चाहते हैं?`;
      }
    }

    // ----------------------------------------------------
    // 2. BASIC INTRODUCTORY QUESTIONS (Concise + Example)
    // ----------------------------------------------------
    if (
      lower === "what is repertory?" ||
      lower === "what is repertory" ||
      lower === "define repertory" ||
      lower.startsWith("what is repertory")
    ) {
      return `Repertory is a systematic index of homoeopathic symptoms and rubrics designed to help practitioners locate the most indicated remedies.

**Example:**
A patient complains of *"headache worse from sunlight"*. The repertory indexes this as:
*HEAD - PAIN - Sun, from exposure to* -> pointing to remedies like *Gelsemium, Glonoinum, Natrum Mur*.

Want me to explain the step-by-step repertorization process with a BHMS case example?`;
    }

    if (
      lower === "what is fever?" ||
      lower === "what is fever" ||
      lower.startsWith("what is fever")
    ) {
      return `Fever (pyrexia) is an elevated core body temperature above 98.6°F (37°C), representing the body's vital defense reaction against infection or inflammation.

In Homoeopathy, fever is understood as a dynamic response of the **Vital Force**. We evaluate:
- The onset speed (e.g., sudden storm-like in *Aconite* vs gradual in *Gelsemium*).
- Thirst and heat modalities (e.g., unquenchable thirst in *Arsenicum* vs complete thirstlessness in *Pulsatilla*).

Would you like to compare the top 3 acute fever remedies for BHMS exams?`;
    }

    if (
      lower === "what is materia medica?" ||
      lower === "what is materia medica" ||
      lower.startsWith("what is materia medica")
    ) {
      return `Homoeopathic Materia Medica is the comprehensive encyclopedia of medicinal substances, documenting their symptom pictures obtained through healthy human drug provings, toxicological data, and clinical verifications.

**Example:**
*Boericke's Materia Medica* or *Allen's Keynotes* list symptoms categorized from Mind, Head, Eyes down to Modalities and Remedy Relationships.

Would you like to study a specific polychrest remedy?`;
    }

    if (
      lower === "what is an aphorism?" ||
      lower === "what is an aphorism" ||
      lower.startsWith("what is an aphorism")
    ) {
      return `An aphorism is a concise, authoritative principle or statement of truth. 

In BHMS, it specifically refers to the **291 numbered sections** of Dr. Samuel Hahnemann's *Organon of Medicine* (6th Edition), which lay down the foundational laws of homoeopathic science, case taking, posology, and cure.

**Example:**
Aphorism §1 defines the physician's sole mission: *"The physician's high and only mission is to restore the sick to health, to cure, as it is termed."*

Would you like to explore any specific Aphorism (§1 to §291)?`;
    }

    if (
      lower === "what is a symptom?" ||
      lower === "what is a symptom" ||
      lower.startsWith("what is a symptom")
    ) {
      return `A symptom is any subjective sensation, physical change, or mental alteration experienced by the patient that indicates deviation from health.

In Homoeopathy, symptoms are classified into:
1. **Subjective Symptoms:** Felt only by the patient (e.g., burning pain, sadness).
2. **Objective Symptoms:** Observed by the physician (e.g., pupil dilation, skin eruptions).
3. **Characteristic Symptoms (§153):** Peculiar, uncommon, striking symptoms that guide the similimum.

Want to learn how to grade symptoms during case totality?`;
    }

    if (
      lower === "what does bhms mean?" ||
      lower === "what is bhms?" ||
      lower.startsWith("what is bhms")
    ) {
      return `**BHMS** stands for **Bachelor of Homeopathic Medicine and Surgery**. 

It is a 5.5-year undergraduate medical degree in India (4.5 years of academic study + 1 year of compulsory rotating clinical internship), regulated by the National Commission for Homoeopathy (NCH). It covers both modern medical sciences (Anatomy, Physiology, Pathology, Surgery, Gynaecology, Medicine) and classical homoeopathic disciplines (Organon, Materia Medica, Repertory, Pharmacy).

How can I assist your BHMS studies today?`;
    }

    // ----------------------------------------------------
    // 3. COMPARISON MODE (Table + Key Distinguishing Factor)
    // ----------------------------------------------------
    if (
      (lower.includes("differentiate") || lower.includes("compare") || lower.includes("vs") || lower.includes("difference")) &&
      (lower.includes("arsenicum") || lower.includes("phosphorus") || lower.includes("nux") || lower.includes("pulsatilla") || lower.includes("bryonia") || lower.includes("rhus"))
    ) {
      if (lower.includes("arsenicum") && lower.includes("phosphorus")) {
        return `### Remedy Comparison: *Arsenicum Album* vs *Phosphorus*

| Clinical Feature | **Arsenicum Album** | **Phosphorus** |
| :--- | :--- | :--- |
| **Keynote Triad** | Restlessness, Burning pain, Anguish | Haemorrhages, Burning sensation, Open/Sociable |
| **Thermal Reaction** | **Chilly** (aggravated by cold, relieved by warmth) | **Generally Chilly**, but craves cold open air and cold food |
| **Thirst Profile** | Drinks **frequent sips of warm water** | Drinks **large quantities of ice-cold water** (vomited as soon as it becomes warm in stomach) |
| **Mental Picture** | Fastidious, extreme fear of death, midnight anxiety | Highly sympathetic, loves affection, fear of dark/thunderstorms |
| **Key Modality (<)** | **Midnight (1:00 AM – 3:00 AM)**, cold air/drinks | Twilight/Evening, lying on left side, thunderstorms |
| **Key Modality (>)** | **Heat**, warm drinks, elevated head | Cold food/drinks, sleep, rubbing/magnetism |

#### 🔑 Key Difference to Remember:
Both remedies share intense burning sensations and anxiety. However, **Arsenicum wants everything warm** and drinks little sips frequently, while **Phosphorus craves ice-cold drinks in large gulps** and is relieved by cold.

Want 3 quick viva questions to test your differentiation of these two?`;
      }

      if (lower.includes("nux") && lower.includes("pulsatilla")) {
        return `### Remedy Comparison: *Nux Vomica* vs *Pulsatilla Pratensis*

| Feature | **Nux Vomica** (Male Polychrest) | **Pulsatilla** (Female Polychrest) |
| :--- | :--- | :--- |
| **Temperament** | Irritable, fiery, impatient, ambitious | Mild, gentle, yielding, weeps easily |
| **Thermal State** | **Extremely Chilly** (cannot uncover even a finger) | **Warm/Hot Patient** (craves open, fresh, cool air) |
| **Thirst** | Thirsty during chills, irritable with dryness | **Completely Thirstless** even with dry mouth/fever |
| **Digestive Pattern** | Ineffectual urging to stool; gastric distress 1-2h after food | Gastric distress from rich fatty foods, pastries, butter |
| **Key Amelioration** | Warmth, hot bed, undisturbed short nap | Open cool air, gentle motion, consolation |

#### 🔑 Key Difference to Remember:
*Nux Vomica* is hyper-irritable, chilly, and driven by stimulants. *Pulsatilla* is gentle, thirstless, seeks open cool air, and craves sympathy.`;
      }
    }

    // ----------------------------------------------------
    // 4. VIVA MODE (Single Interactive Question & Review)
    // ----------------------------------------------------
    if (lower.includes("viva") || lower.startsWith("ask me a question") || lower.includes("conduct viva")) {
      return `### BHMS Viva Examination Session 🎓

Let's begin with your oral viva. Answer the question below in your own words:

> **Viva Question:**
> *"What is the difference between a Complete Symptom (Boenninghausen's Totality) and a Characteristic Symptom (Hahnemann's §153)?"*

Reply with your answer, and I will evaluate your points, highlight strong areas, and score your response!`;
    }

    // ----------------------------------------------------
    // 5. MCQ / QUIZ MODE
    // ----------------------------------------------------
    if (lower.includes("mcq") || lower.includes("quiz") || lower.includes("practice questions")) {
      return `### BHMS Practice Quiz (AIAPGET & University Pattern) 📝

**Question 1:**
Which remedy is characterized by a high fever with sudden, intense onset, hot dry skin, unquenchable thirst for large quantities of cold water, and great fearful restlessness after exposure to dry cold wind?

- **A)** *Belladonna*
- **B)** *Aconitum Napellus*
- **C)** *Bryonia Alba*
- **D)** *Gelsemium Sempervirens*

Type **A, B, C, or D** to submit your answer!`;
    }

    // ----------------------------------------------------
    // 6. EXAM ANSWER / STUDY MODE (Structured Format)
    // ----------------------------------------------------
    if (
      lower.includes("aphorism 26") ||
      lower.includes("aphorism §26") ||
      (lower.includes("aphorism") && lower.includes("26"))
    ) {
      return `# Aphorism §26 — The Therapeutic Law of Nature (Organon of Medicine)

### 1. Definition
Aphorism §26 expresses the fundamental biological and therapeutic law upon which all homoeopathic healing is grounded:

> *"A weaker dynamic affection is permanently extinguished in the living organism by a stronger one, if the latter (whilst differing in kind) is very similar to the former in its manifestations."*

---

### 2. Detailed Explanation
1. **Dynamic Nature:** Both natural diseases and medicinal drug diseases act dynamically on the Vital Force (§9).
2. **The Condition of Cure:** A cure occurs when the artificial drug disease is:
   - **Stronger** in dynamic power than the natural disease.
   - **Similar in kind (*Similia*)** in symptom totality.
   - **Different in origin** (different in kind).
3. **Mechanism:** The stronger artificial medicinal disease takes possession of the affected vital force, extinguishing the weaker natural disease. When the remedy's action expires, the vital force returns to healthy harmony.

---

### 3. Important Exam Points
- **Foundation:** This law provides the scientific rationale for *Similia Similibus Curentur*.
- **Contrast with §29:** §26 states the **Law of Nature**, while §29 explains the **Mode of Cure** (How dynamic cure takes place).

---

### 4. Clinical Example
In acute burning gastroenteritis, administering potentized *Arsenicum Album* (which produces an identical burning state in provings) dynamically overcomes the natural inflammation, bringing swift relief.

---

### 5. Quick Revision Takeaway
**Law of Nature (§26):** Stronger + Similar + Dynamic -> Extinguishes the Weaker Natural Disease.

Want 3 quick MCQs on Aphorisms §26–§29?`;
    }

    if (lower.includes("miasm") || lower.includes("psora") || lower.includes("sycosis") || lower.includes("syphilis")) {
      return `# Chronic Diseases & Miasmatic Theory (Hahnemannian Philosophy)

### 1. Definition
A **Miasm** (from the Greek *miasma*, meaning defilement or pollution) is the underlying chronic dynamic disease force that deranges the vital force and produces all chronic non-venereal and venereal disorders.

---

### 2. The Three Fundamental Miasms

| Miasm | Pathology Type | Mental State | Physical Manifestation | Polychrest Remedy |
| :--- | :--- | :--- | :--- | :--- |
| **Psora** | Functional irritation, deficiency | Restless anxiety, quick-minded | Dry skin eruptions, intense itching without discharge | *Sulphur, Psorinum* |
| **Sycosis** | Overgrowth, infiltration, excess | Secretive, suspicious, fixed ideas | Warts, condylomata, catarrhal discharges, joint stiffness | *Thuja Occidentalis, Medorrhinum* |
| **Syphilis** | Destruction, ulceration, degeneration | Despair, destructive, suicidal | Deep ulcers, bone pains worse at night, tissue necrosis | *Mercurius Sol, Syphilinum* |

---

### 3. Exam & Viva Takeaways
- **Psora is the fundamental mother of all miasms** (Organon §80). Without Psora, Sycosis and Syphilis cannot take root.
- **Mixed Miasms (Complex Diseases):** In chronic practice, diseases frequently represent a combination of two or three miasms requiring careful layer-by-layer prescribing.

Want to test your understanding of miasmatic remedy prescribing?`;
    }

    if (lower.includes("organon") || lower.includes("aphorism") || lower.includes("vital force")) {
      return `### Core Homoeopathic Philosophy (Organon of Medicine)

According to **Dr. Samuel Hahnemann's Organon of Medicine (6th Edition)**:

1. **Aphorism §9 — The Dynamis (Vital Force):**
   The spiritual vital force animates the material organism and maintains healthy physiological equilibrium. Disease is primarily a dynamic derangement of this vital force.

2. **Aphorism §153 — The Characteristic Symptoms:**
   In searching for the homoeopathic specific remedy (*Similimum*), the striking, singular, uncommon, and peculiar (characteristic) signs are given top priority over common diagnostic symptoms.

3. **Aphorism §26 — Law of Similars:**
   The stronger dynamic artificial disease extinguishes the weaker natural disease through similarity of manifestations.

Would you like to study a particular aphorism or explore clinical case applications?`;
    }

    // ----------------------------------------------------
    // 7. DEFAULT CONVERSATIONAL / TUTOR RESPONSE
    // ----------------------------------------------------
    return `Hello! I am your **BHMS AI Study & Clinical Assistant**.

I can help you:
- 📖 **Master BHMS Subjects:** Understand Organon aphorisms, Kent repertory analysis, and Materia Medica keynotes.
- ⚖️ **Differentiate Remedies:** Compare polychrest remedies in clean side-by-side tables.
- 🎯 **Exam & Viva Prep:** Practice structured long answers, oral viva questions, and AIAPGET MCQs.
- 🗣️ **Multilingual Learning:** Feel free to ask questions in English, Marathi, Hindi, or Hinglish.

What topic would you like to explore today?`;
  }
}

export const aiProvider = AIProvider.getInstance();
