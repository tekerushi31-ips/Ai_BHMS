export interface RemedyDetail {
  id: string;
  name: string;
  commonName: string;
  familyOrSource: string;
  keynotes: string[];
  mentalGenerals: string[];
  physicalGenerals: string[];
  particularSymptoms: {
    head?: string;
    stomach?: string;
    respiratory?: string;
    extremities?: string;
    skin?: string;
  };
  modalitiesAggravation: string[];
  modalitiesAmelioration: string[];
  concomitants: string[];
  differentiatingPoints: string[];
  miasmaticAffinity: string;
  sourceReferences: string[];
}

export class MateriaMedicaService {
  private static instance: MateriaMedicaService;

  public static readonly REMEDIES: RemedyDetail[] = [
    {
      id: "aconitum-napellus",
      name: "Aconitum Napellus",
      commonName: "Monkshood",
      familyOrSource: "Ranunculaceae",
      keynotes: [
        "Sudden, violent onset of acute inflammation after dry cold wind exposure.",
        "Overwhelming terror, fear of death, predicts the very hour of demise.",
        "Intense restlessness, unquenchable thirst for large quantities of cold water.",
        "Pulse rapid, full, bounding, hard; high sthenic fever with dry, burning skin.",
      ],
      mentalGenerals: [
        "Agonizing anxiety, restless tossing about in anguish.",
        "Fear of crowds, crossing streets, impending darkness, music is intolerable.",
        "Delirium with sudden fright, clairvoyant forebodings.",
      ],
      physicalGenerals: [
        "Burning internal heat with external shivering.",
        "Ailments from fright, shock, check of perspiration, cold dry winds.",
        "All complaints associated with fear, numbness, and tingling.",
      ],
      particularSymptoms: {
        head: "Violent throbbing, fullness as if brain would burst through forehead.",
        stomach: "Bitter vomiting with perspiration; burning thirst for cold water; everything tastes bitter except water.",
        respiratory: "Dry, croupy, suffocative barking cough; sudden midnight awakening grasping larynx.",
        extremities: "Hot, heavy, numb tingling in left arm and fingers.",
        skin: "Red, hot, swollen, dry without sweat (sweat brings relief).",
      },
      modalitiesAggravation: [
        "Warm room / evening and night (around midnight).",
        "Lying on affected side.",
        "Cold dry winds and drafts.",
        "Tobacco smoke and music.",
      ],
      modalitiesAmelioration: [
        "Open air.",
        "Rest and quiet.",
        "After copious warm perspiration.",
      ],
      concomitants: [
        "Fear and cardiac palpitation with every complaint.",
        "Red face when lying, becoming pale on sitting up.",
      ],
      differentiatingPoints: [
        "Differentiated from Belladonna by marked mental anguish/restlessness and lack of moist sweat.",
        "Differentiated from Arsenicum by acute sudden onset rather than chronic prostration.",
      ],
      miasmaticAffinity: "Acute Psora with high sthenic reactivity.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 11",
        "Allen's Keynotes, p. 15",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 28",
      ],
    },
    {
      id: "arsenicum-album",
      name: "Arsenicum Album",
      commonName: "White Oxide of Arsenic",
      familyOrSource: "Mineral / Arsenic Trioxide",
      keynotes: [
        "Great prostration out of all proportion to the illness.",
        "Burning pains relieved by heat (except head which is relieved by cold).",
        "Intense midnight aggravation (1 to 2 a.m.).",
        "Thirst for small quantities of water at very frequent intervals.",
        "Extreme fastidiousness; everything must be in order and spotless.",
      ],
      mentalGenerals: [
        "Anxiety with fear of death; believes recovery is impossible and taking medicine is useless.",
        "Extreme restlessness; constantly changes bed and room despite exhaustion.",
        "Miserly, dread of poverty, highly fastidious.",
      ],
      physicalGenerals: [
        "Rapid emaciation and rapid sinking of vital forces.",
        "Excoriating, burning, thin, offensive, cadaveric discharges.",
        "Chilly patient, craves warmth, wraps up head.",
      ],
      particularSymptoms: {
        head: "Hemicrania with icy feeling in scalp; relieved by cold bathing.",
        stomach: "Gastric irritability; cannot bear sight or smell of food; vomiting immediately after eating or drinking.",
        respiratory: "Suffocative asthma at 1 to 2 a.m., cannot lie down, must sit bent forward.",
        extremities: "Edema of limbs, twitching, burning in soles of feet.",
        skin: "Dry, rough, scaly, bran-like eruptions with voluptuous itching and burning.",
      },
      modalitiesAggravation: [
        "After midnight (1 to 2 a.m.).",
        "Cold drinks, cold food, cold air, sea bathing.",
        "Lying on back or with head low.",
      ],
      modalitiesAmelioration: [
        "Heat in general (hot applications, warm room, hot drinks).",
        "Elevating head, sitting upright in bed.",
      ],
      concomitants: [
        "Gastric anguish accompanied by cold clammy sweat.",
        "Great irritability of mind accompanied by weakness of body.",
      ],
      differentiatingPoints: [
        "Differentiated from Phosphorus: Arsenic thirst is for sips of warm/cold water; Phos craves cold water in large gulps.",
        "Differentiated from Rhus Tox: Both have restlessness, but Arsenic is mentally anxious & exhausted; Rhus is physically stiff.",
      ],
      miasmaticAffinity: "Tri-miasmatic with strong Syphilitic and Psoric destruction.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 74",
        "Allen's Keynotes, p. 52",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 112",
      ],
    },
    {
      id: "belladonna",
      name: "Belladonna",
      commonName: "Deadly Nightshade",
      familyOrSource: "Solanaceae",
      keynotes: [
        "Violent, acute congestion with intense redness, throbbing heat, and suddenness.",
        "Flushed, fiery red face, injected conjunctiva, dilated glistening pupils.",
        "Throbbing carotids and pulsating temporal arteries.",
        "Hypersensitivity to light, noise, jar, touch, and cold drafts.",
      ],
      mentalGenerals: [
        "Furious acute delirium, tries to bite, strike, spit, or jump out of bed.",
        "Acutely hallucinating; sees black dogs, spectres, monsters, fire.",
        "Violent mania alternating with stupor.",
      ],
      physicalGenerals: [
        "Internal and external burning heat; radiating hot skin that burns the examiner's hand.",
        "Right-sided predominant affinity.",
        "Pains appear suddenly, last indefinitely, and cease suddenly.",
      ],
      particularSymptoms: {
        head: "Violent vascular hammering; worse light, noise, jar; better firm pressure and dark quiet room.",
        stomach: "Great thirst for cold water with inability to swallow; dread of liquids.",
        respiratory: "Dry, spasmodic, tickling cough; bright red swollen fauces and tonsils.",
        extremities: "Cold extremities with hot, congested head.",
        skin: "Smooth, shiny, scarlet redness, erysipelatous inflammation.",
      },
      modalitiesAggravation: [
        "Touch, jar, noise, bright light, motion.",
        "Draft of air, having hair cut, washing head.",
        "Afternoon (3 p.m.) and after lying down.",
      ],
      modalitiesAmelioration: [
        "Semi-erect posture, resting in dark quiet room.",
        "Firm bandaging and hard pressure.",
      ],
      concomitants: [
        "Hot head with cold feet.",
        "Moist sweat on covered parts only.",
      ],
      differentiatingPoints: [
        "Differentiated from Aconite: Belladonna has hallucinations/stupor, dilated pupils, and moist heat; Aconite has conscious fear of death and dry heat.",
        "Differentiated from Glonoinum: Glonoin cannot tolerate any heat or pressure on head; Belladonna is relieved by tight binding.",
      ],
      miasmaticAffinity: "Acute Psoric with rapid vascular engorgement.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 98",
        "Allen's Keynotes, p. 68",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 182",
      ],
    },
    {
      id: "bryonia-alba",
      name: "Bryonia Alba",
      commonName: "Wild Hops / White Bryony",
      familyOrSource: "Cucurbitaceae",
      keynotes: [
        "Extreme aggravation from the slightest motion; absolute relief from perfect rest.",
        "Excessive dryness of all mucous membranes (dry cracked lips, stool dry as burnt).",
        "Stitching, tearing pleuritic and synovial pains.",
        "Amelioration by firm pressure and lying on the painful side.",
        "Thirst for large quantities of cold water at long intervals.",
      ],
      mentalGenerals: [
        "Exceedingly irritable, wants to be left alone in absolute quiet.",
        "Talks constantly about business, daily occupation, and wants to go home.",
        "Apprehension about financial ruin and poverty.",
      ],
      physicalGenerals: [
        "Right-sided remedy; slow, insidious onset of pathology.",
        "Great muscular soreness, aching, and heaviness.",
        "Serous membranes inflammation with plastic exudate (pleura, peritoneum, joints).",
      ],
      particularSymptoms: {
        head: "Bursting frontal headache as if forehead would split; worse opening eyes or stooping.",
        stomach: "Pressure as of a stone in epigastrium after eating; vomiting of bile on least motion.",
        respiratory: "Dry, hard, racking cough; must hold chest with both hands to prevent pain.",
        extremities: "Hot, swollen, red, shiny knee and joint effusions, cannot tolerate motion.",
        skin: "Yellow, pale, or dry with slow eruptions.",
      },
      modalitiesAggravation: [
        "Least motion, exertion, breathing deeply, coughing.",
        "Warm weather, morning on first opening eyes.",
      ],
      modalitiesAmelioration: [
        "Lying on painful side, absolute rest.",
        "Firm bandaging, cold drinks, cool room.",
      ],
      concomitants: [
        "Holding chest or head firmly with hands during coughing.",
        "Stool dry, hard, large, knotty as if burnt.",
      ],
      differentiatingPoints: [
        "Differentiated from Rhus Tox: Bryonia is worse on least motion and better absolute rest; Rhus Tox is worse beginning motion and better continued motion.",
        "Differentiated from Kali Carb: Kali Carb stitching pains occur independent of motion; Bryonia stitches are triggered by motion.",
      ],
      miasmaticAffinity: "Psora-Sycosis with serous effusions and inflammatory dryness.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 115",
        "Allen's Keynotes, p. 84",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 224",
      ],
    },
    {
      id: "gelsemium-sempervirens",
      name: "Gelsemium Sempervirens",
      commonName: "Yellow Jasmine",
      familyOrSource: "Loganiaceae",
      keynotes: [
        "The 3 D's: Dullness, Drowsiness, and Dizziness.",
        "Complete motor paralysis with muscular weakness and profound trembling.",
        "Ailments from anticipatory anxiety, exciting news, or stage fright.",
        "Complete thirstlessness with fever and heavy droopy eyelids (ptosis).",
      ],
      mentalGenerals: [
        "Mental sluggishness, apathy, cannot fix attention.",
        "Anticipatory anxiety causing diarrhea and motor incoordination.",
        "Desire to be quiet, dislikes conversation.",
      ],
      physicalGenerals: [
        "Heaviness of whole body; eyelids so heavy cannot keep them open.",
        "Occipital headache extending to forehead, relieved after profuse urination.",
        "Slow, weak, soft pulse; sensation that heart would stop unless kept moving.",
      ],
      particularSymptoms: {
        head: "Band-like constriction around head; pain starts in nape of neck radiating to occiput.",
        stomach: "Thirstlessness; emotional diarrhea with nervous stomach.",
        respiratory: "Dry, suffocative catarrh with burning nasal excoriation.",
        extremities: "Trembling of hands when lifting; severe loss of muscular power.",
        skin: "Hot, dry, with dusky red suffusion of face.",
      },
      modalitiesAggravation: [
        "Damp weather, humid heat, before thunderstorms.",
        "Bad news, anticipation, emotions.",
        "10 a.m. in the morning.",
      ],
      modalitiesAmelioration: [
        "Profuse urination.",
        "Bending head forward, open air, continuous movement.",
      ],
      concomitants: [
        "Occipital headache relieved by copious pale urination.",
        "Ptosis and heavy eyelids with fever.",
      ],
      differentiatingPoints: [
        "Differentiated from Argentum Nit: Both have anticipation, but Arg Nit is hurried & impulsive; Gelsemium is paralyzed & drowsy.",
        "Differentiated from Baptisia: Baptisia has putridity and bruised soreness; Gelsemium has motor paresis without putrid odors.",
      ],
      miasmaticAffinity: "Psoric nervous debility and neuromuscular weakness.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 287",
        "Allen's Keynotes, p. 142",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 498",
      ],
    },
    {
      id: "lycopodium-clavatum",
      name: "Lycopodium Clavatum",
      commonName: "Club Moss",
      familyOrSource: "Lycopodiaceae",
      keynotes: [
        "4 to 8 p.m. characteristic aggravation.",
        "Right-to-left progression of symptoms (e.g. right throat to left).",
        "Excessive flatulence, abdominal bloating after eating a few mouthfuls.",
        "Desire for warm food and warm drinks; craving for sweets.",
        "Fan-like motion of the alae nasi in respiratory diseases.",
      ],
      mentalGenerals: [
        "Lack of self-confidence yet tyrannical and domineering at home.",
        "Anticipatory apprehension before speaking, but performs excellently once started.",
        "Cannot bear contradiction; intellectual power with weak physical constitution.",
      ],
      physicalGenerals: [
        "Deep metabolic, hepatic, and urinary complaints with red sand in urine.",
        "One foot hot, the other cold; premature aging.",
        "Right-sided liver and kidney affections.",
      ],
      particularSymptoms: {
        head: "Throbbing headache worse after coughing; grey hair in spots.",
        stomach: "Can eat only few mouthfuls then feels bloated to throat; excessive fermentation.",
        respiratory: "Pneumonia with rattling in chest, dyspnea, and flapping of nostrils.",
        extremities: "Sciatica worse right side, cannot lie on painful side.",
        skin: "Dry, harsh, yellow skin, liver spots, brown maculae on abdomen.",
      },
      modalitiesAggravation: [
        "4 to 8 p.m. daily.",
        "Right side, cold food and drinks, oysters, cabbage, beans.",
        "Tight clothing around waist.",
      ],
      modalitiesAmelioration: [
        "Warm drinks and warm food.",
        "Uncovering head, moving about slowly.",
        "After 8 p.m.",
      ],
      concomitants: [
        "Red urates (brick-dust sediment) in urine.",
        "Fan-like motion of nostrils in fever/pneumonia.",
      ],
      differentiatingPoints: [
        "Differentiated from Nux Vomica: Nux is hyper-efficient and aggressive; Lycopodium has inner cowardice and physical weakness.",
        "Differentiated from Carbo Veg: Both have flatulence, but Lycopodium is lower abdomen; Carbo Veg is upper abdomen and craves fanning.",
      ],
      miasmaticAffinity: "Tri-miasmatic deeply anti-Psoric and anti-Sycotic.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 396",
        "Allen's Keynotes, p. 188",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 642",
      ],
    },
    {
      id: "natrum-muriaticum",
      name: "Natrum Muriaticum",
      commonName: "Sodium Chloride / Common Salt",
      familyOrSource: "Mineral",
      keynotes: [
        "Sun headache (10 a.m. to 3 p.m.), mapping tongue, crave salt.",
        "Consolation aggravates; weeps in solitude; dwells on past grievances.",
        "Emaciation most pronounced around the neck despite good appetite.",
        "Greasy, oily skin especially face and hairy scalp.",
        "Herpetic vesicles like pearls around lips and corners of mouth.",
      ],
      mentalGenerals: [
        "Depression and silent grief from disappointed love or mortification.",
        "Cannot weep before others; anger when consoled.",
        "Awkward, drops things from nervous tremor.",
      ],
      physicalGenerals: [
        "Great debility, weary relaxation, anemia with cachectic skin.",
        "Dryness of mucous membranes with watery secretions elsewhere.",
        "Irregular heart with flutterings, worse lying on left side.",
      ],
      particularSymptoms: {
        head: "Throbbing as of little hammers; begins in morning on waking, worse midday.",
        stomach: "Unquenchable thirst; great craving for salt and bitter things; aversion to bread.",
        respiratory: "Tearful eye with cough; fluent coryza like raw egg white.",
        extremities: "Hangnails, cracks in digits, numbness of fingers.",
        skin: "Eczema raw, inflamed, worse at margins of scalp and flexures.",
      },
      modalitiesAggravation: [
        "10 to 11 a.m. / heat of sun / seaside.",
        "Consolation, mental exertion, lying down.",
        "Bread, fat food.",
      ],
      modalitiesAmelioration: [
        "Open air, cold bathing, sweating.",
        "Going without regular meals, lying on right side.",
        "Firm pressure against back.",
      ],
      concomitants: [
        "Crack in the middle of the lower lip.",
        "Urinary incontinence when coughing or walking.",
      ],
      differentiatingPoints: [
        "Differentiated from Ignatia: Ignatia is acute hysteria and sighing; Natrum Mur is chronic deep grief and bitter brooding.",
        "Differentiated from Pulsatilla: Pulsatilla craves consolation; Natrum Mur fiercely rejects consolation.",
      ],
      miasmaticAffinity: "Psoric-Sycotic chronic water-distribution dyscrasia.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 441",
        "Allen's Keynotes, p. 210",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 718",
      ],
    },
    {
      id: "nux-vomica",
      name: "Nux Vomica",
      commonName: "Poison Nut",
      familyOrSource: "Loganiaceae",
      keynotes: [
        "Sedentary, irritable, high-strung, fastidious, ambitious temperament.",
        "Frequent ineffectual urging for stool and micturition (passes little at a time).",
        "Very chilly, cannot uncover the least bit without chilling.",
        "Overindulgence in stimulants, spices, coffee, alcohol, allopathic drugs.",
        "Wakes at 3 a.m., broods over troubles, falls asleep at dawn and wakes tired.",
      ],
      mentalGenerals: [
        "Fiery, quarrelsome, fault-finding, impatient, cannot bear contradiction.",
        "Hypersensitive to noise, light, odors, music, and cold air.",
        "Workaholic driving personality, easily intoxicated.",
      ],
      physicalGenerals: [
        "Spasmodic affections, hyperesthesia of all senses.",
        "Gastrointestinal tract congestion and portal stasis.",
        "Convulsive tendencies with consciousness intact.",
      ],
      particularSymptoms: {
        head: "Occipital and frontal headache; sour taste in morning, coated tongue at back.",
        stomach: "Weight and pain in stomach 1 to 2 hours after eating, wants to vomit but cannot.",
        respiratory: "Nose stuffed at night and in open air, fluent in warm room.",
        extremities: "Cramps in calves and soles; sudden loss of power in limbs.",
        skin: "Red, blotchy, jaundice with itchy skin.",
      },
      modalitiesAggravation: [
        "Morning (on waking and 3 to 4 a.m.).",
        "Cold, dry air, wind, drafts, uncovering.",
        "Mental overwork, stimulants, spices, rich food.",
      ],
      modalitiesAmelioration: [
        "Warmth in general, resting in evening.",
        "Short nap if uninterrupted.",
        "Moist wet weather.",
      ],
      concomitants: [
        "Ineffectual urging for stool accompanying other complaints.",
        "Chilly shivering during micturition or movement.",
      ],
      differentiatingPoints: [
        "Differentiated from Pulsatilla: Nux is chilly, irritable, worse morning; Pulsatilla is warm, mild, worse evening.",
        "Differentiated from Chamomilla: Both irritable, but Nux is driven by ambition and work; Chamomilla is driven by unendurable pain.",
      ],
      miasmaticAffinity: "Acute and Chronic Psora with hyperactive nervous system.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 458",
        "Allen's Keynotes, p. 222",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 754",
      ],
    },
    {
      id: "pulsatilla-pratensis",
      name: "Pulsatilla Pratensis",
      commonName: "Wind Flower / Pasque Flower",
      familyOrSource: "Ranunculaceae",
      keynotes: [
        "Mild, gentle, yielding, tearful disposition; weeps while relating symptoms.",
        "Complete thirstlessness with all complaints (even with fever).",
        "Symptoms constantly changeable and shifting (no two chills, stools, or pains alike).",
        "Warm, suffocative patient; craves cool open fresh air.",
        "Thick, bland, yellowish-green discharges.",
      ],
      mentalGenerals: [
        "Craves affection, sympathy, and consolation which brings immediate relief.",
        "Timid, easily discouraged, fearful of opposite sex and marriage.",
        "Melancholy in evening, religious mania.",
      ],
      physicalGenerals: [
        "Venous congestion, sluggish circulation, varicose veins.",
        "Aversion to fatty, rich foods, pork, warm food, and pastry.",
        "Delayed, scanty, suppressed menses from getting feet wet.",
      ],
      particularSymptoms: {
        head: "Throbbing frontal headache relieved in open air and tight pressure.",
        stomach: "Dry mouth without thirst; taste of food remains for hours; heartburn from fats.",
        respiratory: "Dry cough at night, loose in morning with profuse expectoration.",
        extremities: "Wandering rheumatic pains shifting rapidly from joint to joint.",
        skin: "Measly eruptions, itching worse evening in warm bed.",
      },
      modalitiesAggravation: [
        "Warm closed room, evening and night.",
        "Rich, fatty food, pork, pastry, butter.",
        "Lying on left side or on painless side.",
      ],
      modalitiesAmelioration: [
        "Open cool fresh air.",
        "Consolation and gentle motion.",
        "Cold applications, cold food and drinks.",
      ],
      concomitants: [
        "Weeping with every complaint.",
        "Chilliness with thirstlessness in warm room.",
      ],
      differentiatingPoints: [
        "Differentiated from Silicea: Both have bland discharges, but Pulsatilla is warm and craves open air; Silicea is intensely chilly.",
        "Differentiated from Natrum Mur: Pulsatilla loves and improves with consolation; Natrum Mur hates consolation.",
      ],
      miasmaticAffinity: "Psora-Sycosis with mucous and venous catarrh.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 524",
        "Allen's Keynotes, p. 254",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 838",
      ],
    },
    {
      id: "rhus-toxicodendron",
      name: "Rhus Toxicodendron",
      commonName: "Poison Ivy",
      familyOrSource: "Anacardiaceae",
      keynotes: [
        "Extreme restlessness; cannot rest in any position, constantly changing place.",
        "Aggravation on beginning motion, relief from continuous gentle motion.",
        "Aggravation in cold, damp weather, before thunderstorms, and from getting wet.",
        "Red triangular tip of the tongue.",
        "Ailments from overstraining, lifting, spraining tendons and ligaments.",
      ],
      mentalGenerals: [
        "Apprehensive anxiety, worse at night and twilight.",
        "Fear of being poisoned, thoughts of suicide by drowning.",
        "Great impatience, restless pacing.",
      ],
      physicalGenerals: [
        "Fibrous tissue, tendon, ligament, and aponeurosis affinity.",
        "Stiffness of muscles and joints on first moving after rest.",
        "Urticaria and vesicular skin eruptions with burning and itching.",
      ],
      particularSymptoms: {
        head: "Occipital pain with sensation as if a board were strapped across forehead.",
        stomach: "Great thirst for cold milk or cold water; tongue coated with red triangular tip.",
        respiratory: "Tickling dry cough caused by putting hand out of bed cover.",
        extremities: "Sciatica worse cold damp weather, better walking and heat.",
        skin: "Vesicles on erythematous base, herpes zoster, intense burning.",
      },
      modalitiesAggravation: [
        "Rest, first beginning motion, after midnight.",
        "Cold, damp, rainy weather, getting wet while sweating.",
        "Lying on back or right side.",
      ],
      modalitiesAmelioration: [
        "Continuous motion, walking about, changing position.",
        "Warm, dry weather, hot applications, warm wraps.",
      ],
      concomitants: [
        "Triangular red tip on clean or coated tongue.",
        "Desire for cold milk which agrees.",
      ],
      differentiatingPoints: [
        "Differentiated from Bryonia: Rhus is better continuous motion; Bryonia is worse any motion.",
        "Differentiated from Rhododendron: Rhus is worse before and during storms; Rhododendron is worse before and relieved once storm breaks.",
      ],
      miasmaticAffinity: "Psora-Syphilis with fibrous hypertrophy and vesicular dyscrasia.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 544",
        "Allen's Keynotes, p. 268",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 868",
      ],
    },
    {
      id: "sulphur",
      name: "Sulphur",
      commonName: "Sublimed Sulphur / Brimstone",
      familyOrSource: "Mineral",
      keynotes: [
        "Standing is the most uncomfortable position; cannot stand still, must walk.",
        "11 a.m. empty sinking faint hunger in epigastrium.",
        "Burning sensations in palms, soles, vertex; sticks feet out of bed at night.",
        "Redness of all orifices (lips, eyelids, nostrils, anus, meatus).",
        "Aversion to washing and bathing; skin looks dirty, dry, scaly.",
      ],
      mentalGenerals: [
        "The ragged philosopher: full of grandiose theories, selfish, indolent.",
        "Dislikes order and routine; collects useless old objects valuing them as treasures.",
        "Melancholy, philosophical brooding on religious questions.",
      ],
      physicalGenerals: [
        "Great King of Anti-Psorics; awakens latent reactive power.",
        "Offensive, acrid, excoriating discharges.",
        "Hot patient, worse from heat of bed and woolens.",
      ],
      particularSymptoms: {
        head: "Constant heat on vertex with cold feet; throbbing frontal pain.",
        stomach: "Cannot wait for noon meal, faint weakness at 11 a.m.; craves sweets and alcohol.",
        respiratory: "Dyspnea at night, must have windows wide open; suffocative rattling.",
        extremities: "Hot burning soles, thrusts feet out of covers at night.",
        skin: "Voluptuous itching, scratching gives pleasure followed by intense burning.",
      },
      modalitiesAggravation: [
        "Standing, bathing/washing, 11 a.m., morning in bed.",
        "Heat of bed, warm room, woolens.",
        "Milk and sweet foods.",
      ],
      modalitiesAmelioration: [
        "Dry warm weather, lying on right side.",
        "Continuous gentle movement.",
      ],
      concomitants: [
        "Redness of all natural orifices.",
        "Morning diarrhea driving out of bed at 5 a.m.",
      ],
      differentiatingPoints: [
        "Differentiated from Psorinum: Sulphur is hot and dislikes washing; Psorinum is intensely chilly and wears fur hat in summer.",
        "Differentiated from Pulsatilla: Both are hot and thirstless, but Sulphur is dirty, ragged, and philosophical; Pulsatilla is sweet, yielding, and neat.",
      ],
      miasmaticAffinity: "Fundamental King of Psora.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 612",
        "Allen's Keynotes, p. 296",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 950",
      ],
    },
    {
      id: "thuja-occidentalis",
      name: "Thuja Occidentalis",
      commonName: "Arbor Vitae / Tree of Life",
      familyOrSource: "Coniferae",
      keynotes: [
        "Great King of Anti-Sycotics; fig-warts, condylomata, excrescences, polypi.",
        "Fixed idea that body is made of glass and will break, or live animal in abdomen.",
        "Perspiration sweet-smelling like honey, on uncovered parts only (or only on genitals).",
        "Bad effects of vaccination, gonorrhea, suppressed skin eruptions.",
        "Forked urinary stream with cutting pain after urination.",
      ],
      mentalGenerals: [
        "Fixed delusions: under the influence of a superior power, fragile as glass.",
        "Emotional sensitivity: music causes weeping and trembling.",
        "Hurried speech, ill-humor in morning.",
      ],
      physicalGenerals: [
        "Overgrowth of tissues, warts on pedunculated stalks, cauliflower excrescences.",
        "Left-sided affinity, chilly patient, worse cold damp weather.",
        "Teeth decay at the roots/crowns remain sound.",
      ],
      particularSymptoms: {
        head: "Pain as if a nail were driven into vertex or frontal eminence.",
        stomach: "Sensation as if something alive were jumping or moving in abdomen.",
        respiratory: "Short breath, dry hacking cough, worse after vaccination.",
        extremities: "Nails brittle, ribbed, deformed; warts on hands and fingers.",
        skin: "Polypi, warts, brown spots, greasy face with shine like varnish.",
      },
      modalitiesAggravation: [
        "Cold, damp weather, humid atmosphere, 3 a.m. and 3 p.m.",
        "Vaccination, tea, coffee, fatty food, onions.",
      ],
      modalitiesAmelioration: [
        "Warmth, dry weather, drawing limbs up.",
        "Open air, sneezing, loose discharges.",
      ],
      concomitants: [
        "Sweat on uncovered parts only, smelling of honey or burnt straw.",
        "Forked or split stream of urine.",
      ],
      differentiatingPoints: [
        "Differentiated from Medorrhinum: Medorrhinum is hot and better at seaside; Thuja is chilly and worse cold damp.",
        "Differentiated from Nitric Acid: Both have warts, but Nitric Acid has splinter-like stitching pains.",
      ],
      miasmaticAffinity: "Primary Sovereign Anti-Sycotic.",
      sourceReferences: [
        "Boericke's Materia Medica, p. 638",
        "Allen's Keynotes, p. 308",
        "Kent's Lectures on Homoeopathic Materia Medica, p. 988",
      ],
    },
  ];

  public static getInstance(): MateriaMedicaService {
    if (!MateriaMedicaService.instance) {
      MateriaMedicaService.instance = new MateriaMedicaService();
    }
    return MateriaMedicaService.instance;
  }

  public getAllRemedies(): RemedyDetail[] {
    return MateriaMedicaService.REMEDIES;
  }

  public compareRemedies(remedyIds: string[]): RemedyDetail[] {
    return MateriaMedicaService.REMEDIES.filter((r) => remedyIds.includes(r.id));
  }
}

export const materiaMedicaService = MateriaMedicaService.getInstance();
