/**
 * Seeds the shared, unowned `demo_tweets` collection.
 *
 * Demo tweets replace live Twitter/X results when no API credentials are
 * configured (or when USE_DEMO_TWEETS=true). They have no `userId` and no
 * `sessionId`: the normal fetch-and-analyze flow copies a random/matching
 * sample into the caller's session at request time.
 *
 * Usage:
 *   npx ts-node scripts/seed-demo-tweets.ts
 *   npx ts-node scripts/seed-demo-tweets.ts --reset
 *
 * The generator is deterministic, so re-running without --reset updates the
 * same tweetIds instead of creating duplicates.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DemoTweet } from '../models/DemoTweet';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/tweetwatch';

type Template = {
  /** `{subject}` is replaced with one entry from the cluster's subjects. */
  text: string;
};

type Cluster = {
  topic: string;
  region: string;
  lang: string;
  hashtags: string[];
  subjects: string[];
  templates: Template[];
  /** How many tweets to generate for this cluster. */
  count: number;
};

/**
 * Curated clusters. Each one mixes neutral commentary with a few mildly
 * hostile opinions so the classifier sees a realistic spread. None of the
 * templates contain slurs, target real people, or call for violence.
 */
const CLUSTERS: Cluster[] = [
  {
    topic: 'immigration',
    region: 'US',
    lang: 'en',
    hashtags: ['immigration', 'border', 'visa'],
    subjects: [
      'immigrants',
      'asylum seekers',
      'the new border policy',
      'work visa holders',
      'refugee families',
    ],
    templates: [
      { text: 'Honestly, {subject} are making life harder for everyone else here.' },
      { text: 'We need a fair and humane process for {subject}, not panic.' },
      { text: 'The debate about {subject} has turned into pure scaremongering.' },
      { text: 'New data on {subject} is worth reading before sharing hot takes.' },
      { text: 'Politicians keep using {subject} to distract from real problems.' },
      { text: 'I am tired of hearing about {subject} every single day.' },
    ],
    count: 20,
  },
  {
    topic: 'elections',
    region: 'India',
    lang: 'en',
    hashtags: ['elections', 'vote', 'democracy'],
    subjects: [
      'the ruling party',
      'the opposition',
      'young voters',
      'the election commission',
      'local candidates',
    ],
    templates: [
      { text: 'The campaign around {subject} is all noise and no policy.' },
      { text: 'Every party promises the world to {subject} and delivers nothing.' },
      { text: 'I still believe {subject} can change things if they actually vote.' },
      { text: 'The coverage of {subject} is biased and everyone can see it.' },
      { text: 'People defending {subject} clearly have not read the manifesto.' },
      { text: 'This election is less about {subject} and more about survival.' },
    ],
    count: 20,
  },
  {
    topic: 'religion',
    region: 'India',
    lang: 'en',
    hashtags: ['religion', 'faith', 'community'],
    subjects: [
      'religious minorities',
      'the temple committee',
      'faith leaders',
      'the new prayer hall',
      'interfaith groups',
    ],
    templates: [
      { text: 'Respect for {subject} should not be optional in a diverse country.' },
      { text: 'The argument over {subject} is being amplified by bad actors.' },
      { text: 'I disagree with {subject} but they still have every right to exist.' },
      { text: 'Politicians are using {subject} to divide people again.' },
      { text: 'There is no reason {subject} should be treated as second class.' },
      { text: 'The media only covers {subject} when it can create outrage.' },
    ],
    count: 20,
  },
  {
    topic: 'caste',
    region: 'India',
    lang: 'hi',
    hashtags: ['caste', 'equality', 'reservation'],
    subjects: [
      'दलित समुदाय',
      'आरक्षण',
      'पिछड़े वर्ग',
      'ग्रामीण परिवार',
      'युवा छात्र',
    ],
    templates: [
      { text: '{subject} के साथ भेदभाव आज भी आम बात है।' },
      { text: '{subject} को बराबरी का हक मिलना चाहिए, इसमें कोई विवाद नहीं।' },
      { text: '{subject} के नाम पर वोट मांगना आसान है, बदलाव लाना मुश्किल।' },
      { text: 'लोग {subject} की समस्या को जानबूझकर नजरअंदाज करते हैं।' },
      { text: '{subject} पर बहस होनी चाहिए, लेकिन तथ्यों के साथ।' },
      { text: 'हर पार्टी {subject} को सिर्फ चुनाव के समय याद करती है।' },
    ],
    count: 20,
  },
  {
    topic: 'gender',
    region: 'UK',
    lang: 'en',
    hashtags: ['gender', 'equality', 'women'],
    subjects: [
      'women in leadership',
      'working mothers',
      'the gender pay gap',
      'girls in STEM',
      'single parents',
    ],
    templates: [
      { text: 'The gender pay gap is still real and {subject} feel it every month.' },
      { text: 'We keep celebrating {subject} without changing the structures around them.' },
      { text: 'It is exhausting that {subject} still have to prove themselves twice as hard.' },
      { text: 'The conversation about {subject} needs fewer slogans and more policy.' },
      { text: 'Flexible work would help {subject} far more than another awareness campaign.' },
      { text: 'Some people still think {subject} should stay quiet and grateful.' },
    ],
    count: 20,
  },
  {
    topic: 'lgbtq',
    region: 'US',
    lang: 'en',
    hashtags: ['lgbtq', 'pride', 'equality'],
    subjects: [
      'queer students',
      'trans colleagues',
      'same-sex couples',
      'pride events',
      'lgbtq youth',
    ],
    templates: [
      { text: 'Every school should be a safe place for {subject}.' },
      { text: 'The backlash against {subject} is a warning sign, not a victory.' },
      { text: 'I support {subject} and I am not going to apologise for it.' },
      { text: 'Local leaders keep using {subject} as a culture-war prop.' },
      { text: 'Access to healthcare for {subject} should not be a political debate.' },
      { text: 'The stories of {subject} deserve to be heard, not erased.' },
    ],
    count: 20,
  },
  {
    topic: 'racism',
    region: 'US',
    lang: 'en',
    hashtags: ['racism', 'equality', 'diversity'],
    subjects: [
      'Black families',
      'Latino workers',
      'Asian students',
      'Indigenous communities',
      'immigrant shopkeepers',
    ],
    templates: [
      { text: 'Racism against {subject} did not disappear, it just changed shape.' },
      { text: 'Companies hire {subject} for diversity photos and ignore them after.' },
      { text: 'The way {subject} are treated in housing is still deeply unfair.' },
      { text: 'We need to talk about {subject} without getting defensive.' },
      { text: 'Every statistic about {subject} tells the same story of exclusion.' },
      { text: 'It is not enough to say you support {subject}; act like it.' },
    ],
    count: 20,
  },
  {
    topic: 'cricket',
    region: 'India',
    lang: 'en',
    hashtags: ['cricket', 'teamindia', 'worldcup'],
    subjects: [
      'the batting order',
      'the bowling attack',
      'young debutants',
      'the selectors',
      'the home crowd',
    ],
    templates: [
      { text: 'The pressure on {subject} after one bad match is unreal.' },
      { text: 'Honestly, {subject} deserve more patience than they get online.' },
      { text: 'The selectors have mismanaged {subject} for years now.' },
      { text: 'Fans blaming {subject} after a loss need to calm down.' },
      { text: 'This team will only improve if {subject} get a proper run.' },
      { text: 'The commentary around {subject} is more dramatic than the match.' },
    ],
    count: 20,
  },
  {
    topic: 'bollywood',
    region: 'India',
    lang: 'hi',
    hashtags: ['bollywood', 'cinema', 'film'],
    subjects: ['नए कलाकार', 'फिल्म समीक्षक', 'निर्माता', 'दर्शक', 'सोशल मीडिया ट्रोल्स'],
    templates: [
      { text: '{subject} पर बिना तथ्य के आरोप लगाना गलत है।' },
      { text: '{subject} को भी अपनी बात कहने का हक है।' },
      { text: 'फिल्म इंडस्ट्री में {subject} के साथ भेदभाव साफ दिखता है।' },
      { text: '{subject} की मेहनत को सिर्फ बॉक्स ऑफिस से मत आंकिए।' },
      { text: 'हर फिल्म के बाद {subject} को जज करना थका देता है।' },
      { text: 'सोशल मीडिया ने {subject} के लिए सब कुछ मुश्किल बना दिया है।' },
    ],
    count: 20,
  },
  {
    topic: 'climate',
    region: 'Europe',
    lang: 'en',
    hashtags: ['climate', 'sustainability', 'greenenergy'],
    subjects: [
      'the new climate targets',
      'renewable projects',
      'small farmers',
      'coastal towns',
      'urban commuters',
    ],
    templates: [
      { text: 'The climate plan ignores {subject} and that is a serious flaw.' },
      { text: 'We cannot keep delaying action while {subject} pay the price.' },
      { text: 'The transition will fail unless {subject} are part of the design.' },
      { text: 'Every promise on {subject} needs a budget and a deadline.' },
      { text: 'It is easy to talk about {subject} and hard to change anything.' },
      { text: 'The protests around {subject} deserve a serious response.' },
    ],
    count: 20,
  },
  {
    topic: 'economy',
    region: 'UK',
    lang: 'en',
    hashtags: ['economy', 'inflation', 'jobs'],
    subjects: [
      'small businesses',
      'young workers',
      'renters',
      'pensioners',
      'public services',
    ],
    templates: [
      { text: 'Inflation is still squeezing {subject} while wages stay flat.' },
      { text: 'The budget offers nothing real for {subject}.' },
      { text: 'Every recovery headline forgets {subject} at the bottom.' },
      { text: 'If {subject} cannot afford to live, the economy is not working.' },
      { text: 'Politicians talk about growth but never about {subject}.' },
      { text: 'The help announced for {subject} is too small and too late.' },
    ],
    count: 20,
  },
  {
    topic: 'war',
    region: 'MENA',
    lang: 'ar',
    hashtags: ['war', 'peace', 'ceasefire'],
    subjects: ['المدنيين', 'اللاجئين', 'الأطفال', 'فرق الإغاثة', 'المفاوضات'],
    templates: [
      { text: 'يجب حماية {subject} في أي اتفاق سلام.' },
      { text: 'لا يمكن الحديث عن {subject} دون ذكر المسؤولية الإنسانية.' },
      { text: 'الصمت تجاه {subject} ليس حيادًا.' },
      { text: 'كل يوم تأخير يكلف {subject} أكثر.' },
      { text: 'الحل السياسي وحده يمكن أن يحمي {subject}.' },
      { text: 'التغطية الإعلامية لـ {subject} تحتاج إلى دقة أكبر.' },
    ],
    count: 20,
  },
  {
    topic: 'health',
    region: 'US',
    lang: 'en',
    hashtags: ['health', 'healthcare', 'wellbeing'],
    subjects: [
      'uninsured families',
      'rural clinics',
      'nurses',
      'mental health patients',
      'older adults',
    ],
    templates: [
      { text: 'The cost of care is still crushing {subject}.' },
      { text: 'Rural clinics closing is a crisis for {subject}.' },
      { text: 'We need to fund {subject} before the next emergency.' },
      { text: 'Mental health support for {subject} is still an afterthought.' },
      { text: 'No one should go bankrupt because {subject} got sick.' },
      { text: 'The system keeps treating {subject} like a number.' },
    ],
    count: 20,
  },
  {
    topic: 'education',
    region: 'India',
    lang: 'en',
    hashtags: ['education', 'schools', 'students'],
    subjects: [
      'government school students',
      'teachers',
      'first-generation learners',
      'college aspirants',
      'rural schools',
    ],
    templates: [
      { text: 'The dropout rate among {subject} should worry everyone.' },
      { text: 'Teachers cannot fix {subject} without basic resources.' },
      { text: 'Every policy on {subject} sounds good until the funding disappears.' },
      { text: 'Digital classes are useless for {subject} without devices.' },
      { text: 'We keep measuring {subject} by exam scores alone.' },
      { text: 'The future of {subject} matters more than any ranking.' },
    ],
    count: 20,
  },
  {
    topic: 'technology',
    region: 'US',
    lang: 'en',
    hashtags: ['tech', 'ai', 'privacy'],
    subjects: [
      'AI tools',
      'data brokers',
      'gig workers',
      'open-source developers',
      'small startups',
    ],
    templates: [
      { text: 'The rules around {subject} are years behind the products.' },
      { text: 'We should not let {subject} set the terms for everyone else.' },
      { text: 'The hype around {subject} is hiding a lot of labour.' },
      { text: 'Privacy for {subject} is not a premium feature.' },
      { text: 'Every breakthrough built on {subject} needs public oversight.' },
      { text: 'The promises made about {subject} rarely survive contact with reality.' },
    ],
    count: 20,
  },
  {
    topic: 'immigration',
    region: 'Mexico',
    lang: 'es',
    hashtags: ['inmigracion', 'frontera', 'migrantes'],
    subjects: [
      'los migrantes',
      'las familias solicitantes',
      'los trabajadores temporales',
      'los refugiados',
      'las comunidades fronterizas',
    ],
    templates: [
      { text: 'El debate sobre {subject} necesita más humanidad y menos miedo.' },
      { text: '{subject} merecen un proceso justo y transparente.' },
      { text: 'Los políticos usan a {subject} solo para ganar votos.' },
      { text: 'La información sobre {subject} se manipula constantemente.' },
      { text: 'Nadie debería ser criminalizado por buscar una vida mejor como {subject}.' },
      { text: 'Las comunidades que reciben a {subject} necesitan apoyo real.' },
    ],
    count: 20,
  },
  {
    topic: 'economy',
    region: 'Brazil',
    lang: 'pt',
    hashtags: ['economia', 'emprego', 'inflacao'],
    subjects: [
      'os trabalhadores informais',
      'as pequenas empresas',
      'os jovens',
      'as famílias pobres',
      'os aposentados',
    ],
    templates: [
      { text: 'A economia não melhora enquanto {subject} continuarem sem apoio.' },
      { text: 'O governo fala de crescimento e esquece {subject}.' },
      { text: 'A inflação está a destruir o orçamento de {subject}.' },
      { text: 'Sem {subject}, nenhuma recuperação é real.' },
      { text: 'As promessas para {subject} ficam sempre no papel.' },
      { text: 'Precisamos de políticas concretas para {subject}.' },
    ],
    count: 20,
  },
  {
    topic: 'elections',
    region: 'Indonesia',
    lang: 'id',
    hashtags: ['pemilu', 'demokrasi', 'politik'],
    subjects: [
      'pemilih muda',
      'partai oposisi',
      'calon lokal',
      'komisi pemilu',
      'masyarakat desa',
    ],
    templates: [
      { text: 'Debat soal {subject} harus berisi gagasan, bukan caci maki.' },
      { text: '{subject} berhak mendapat informasi yang jujur.' },
      { text: 'Politik identitas merusak diskusi tentang {subject}.' },
      { text: 'Janji kampanye untuk {subject} selalu hilang setelah pemilu.' },
      { text: 'Partisipasi {subject} akan menentukan hasil akhir.' },
      { text: 'Media terlalu sibuk mencari sensasi dari {subject}.' },
    ],
    count: 20,
  },
  {
    topic: 'climate',
    region: 'France',
    lang: 'fr',
    hashtags: ['climat', 'ecologie', 'transition'],
    subjects: [
      'les agriculteurs',
      'les quartiers populaires',
      'les jeunes',
      'les villes côtières',
      'les salariés',
    ],
    templates: [
      { text: 'La transition climatique doit inclure {subject}.' },
      { text: 'On ne peut pas parler d’écologie sans écouter {subject}.' },
      { text: 'Les promesses faites à {subject} restent sans budget.' },
      { text: '{subject} subissent déjà les effets du dérèglement.' },
      { text: 'Chaque mesure doit être expliquée clairement à {subject}.' },
      { text: 'Sans {subject}, la politique climatique échouera.' },
    ],
    count: 20,
  },
  {
    topic: 'education',
    region: 'Bangladesh',
    lang: 'bn',
    hashtags: ['শিক্ষা', 'স্কুল', 'ছাত্র'],
    subjects: ['গ্রামের ছাত্ররা', 'শিক্ষকরা', 'সরকারি স্কুল', 'প্রথম প্রজন্মের শিক্ষার্থীরা', 'মেয়েরা'],
    templates: [
      { text: '{subject} এর জন্য মানসম্মত শিক্ষা নিশ্চিত করতে হবে।' },
      { text: '{subject} ছাড়া শিক্ষার কোনো সংস্কার সফল হবে না।' },
      { text: 'সরকার {subject} এর সমস্যা শুধু নির্বাচনের সময় মনে করে।' },
      { text: 'ডিজিটাল ক্লাস {subject} এর জন্য বাস্তবসম্মত নয়।' },
      { text: '{subject} এ বিনিয়োগ ছাড়া ভবিষ্যৎ নেই।' },
      { text: 'শিক্ষার মান শুধু {subject} দিয়ে মাপা উচিত নয়।' },
    ],
    count: 20,
  },
  {
    topic: 'agriculture',
    region: 'India',
    lang: 'mr',
    hashtags: ['शेती', 'शेतकरी', 'पीक'],
    subjects: ['शेतकरी', 'तरुण शेतकरी', 'छोटे उत्पादक', 'ग्रामीण कुटुंबे', 'शेतमजूर'],
    templates: [
      { text: '{subject} साठी योग्य भरपाई आणि आधार हवा.' },
      { text: '{subject} च्या समस्या ऐकल्या जात नाहीत.' },
      { text: 'सरकार {subject} ला फक्त जाहिरातीत आठवते.' },
      { text: 'हवामान बदलाचा सर्वात मोठा फटका {subject} ला बसतो.' },
      { text: '{subject} शिवाय ग्रामीण अर्थव्यवस्था उभी राहणार नाही.' },
      { text: '{subject} च्या मदतीसाठी ठोस योजना हवी.' },
    ],
    count: 20,
  },
  {
    topic: 'cinema',
    region: 'India',
    lang: 'ta',
    hashtags: ['சினிமா', 'திரைப்படம்', 'கலை'],
    subjects: ['இளம் நடிகர்கள்', 'திரைப்பட ஊழியர்கள்', 'விமர்சகர்கள்', 'புதிய இயக்குநர்கள்', 'ரசிகர்கள்'],
    templates: [
      { text: '{subject} க்கு நியாயமான ஊதியம் கிடைக்க வேண்டும்.' },
      { text: '{subject} பற்றிய விமர்சனம் தகுந்ததாக இருக்க வேண்டும்.' },
      { text: 'திரையுலகில் {subject} புறக்கணிக்கப்படுவது தவறு.' },
      { text: 'சமூக வலைதளங்கள் {subject} மீது அதிக அழுத்தம் கொடுக்கின்றன.' },
      { text: '{subject} இல்லாமல் திரைத்துறை இயங்காது.' },
      { text: '{subject} குறித்த செய்திகள் சரிபார்க்கப்பட வேண்டும்.' },
    ],
    count: 20,
  },
  {
    topic: 'politics',
    region: 'India',
    lang: 'ta',
    hashtags: ['அரசியல்', 'தேர்தல்', 'மக்கள்'],
    subjects: ['இளைஞர்கள்', 'விவசாயிகள்', 'தொழிலாளர்கள்', 'மகளிர்', 'முதியோர்'],
    templates: [
      { text: '{subject} பற்றிய வாக்குறுதிகள் நிறைவேற்றப்பட வேண்டும்.' },
      { text: '{subject} இல்லாமல் எந்த மாற்றமும் நடக்காது.' },
      { text: 'அரசியல்வாதிகள் {subject} ஐ தேர்தலின் போது மட்டும் நினைக்கிறார்கள்.' },
      { text: '{subject} க்கு எதிரான பாகுபாடு ஏற்க முடியாதது.' },
      { text: '{subject} குரலை ஊடகங்கள் கேட்பதில்லை.' },
      { text: '{subject} நலனுக்கான திட்டங்கள் தெளிவாக இருக்க வேண்டும்.' },
    ],
    count: 20,
  },
  {
    topic: 'football',
    region: 'Brazil',
    lang: 'pt',
    hashtags: ['futebol', 'esporte', 'torcida'],
    subjects: [
      'os jogadores jovens',
      'os torcedores',
      'os clubes pequenos',
      'as jogadoras',
      'os treinadores',
    ],
    templates: [
      { text: 'O debate sobre {subject} precisa de mais respeito.' },
      { text: 'Os comentaristas tratam {subject} como se fossem descartáveis.' },
      { text: '{subject} merecem condições dignas para competir.' },
      { text: 'A pressão sobre {subject} nas redes sociais passou dos limites.' },
      { text: 'Sem investimento, {subject} nunca vão evoluir.' },
      { text: 'O futebol só melhora quando {subject} são ouvidos.' },
    ],
    count: 20,
  },
];

/**
 * A small set of deliberately hostile but mild examples. They are synthetic,
 * contain no slurs, target no real person, and never call for violence.
 * They are stored like any other raw tweet; the classifier scores them at
 * fetch time, not at seed time.
 */
const HATE_EXAMPLES: {
  text: string;
  topic: string;
  region: string;
  lang: string;
  hashtags: string[];
}[] = [
  {
    text: 'People from that religion do not belong in this country. Simple as that.',
    topic: 'religion',
    region: 'UK',
    lang: 'en',
    hashtags: ['religion', 'immigration'],
  },
  {
    text: 'These migrants are ruining our neighbourhoods and should go back where they came from.',
    topic: 'immigration',
    region: 'US',
    lang: 'en',
    hashtags: ['immigration', 'border'],
  },
  {
    text: 'Women should stay out of politics and focus on the home. That is the natural order.',
    topic: 'gender',
    region: 'India',
    lang: 'en',
    hashtags: ['gender', 'women'],
  },
  {
    text: 'That community is inherently lazy and can never be trusted with responsibility.',
    topic: 'racism',
    region: 'US',
    lang: 'en',
    hashtags: ['racism', 'equality'],
  },
  {
    text: 'We should ban all refugees before they destroy our culture and our values.',
    topic: 'immigration',
    region: 'Europe',
    lang: 'en',
    hashtags: ['immigration', 'refugees'],
  },
  {
    text: 'Nobody wants these people living next door to their children.',
    topic: 'immigration',
    region: 'UK',
    lang: 'en',
    hashtags: ['immigration', 'community'],
  },
  {
    text: 'The country was better before they let so many of them in.',
    topic: 'immigration',
    region: 'US',
    lang: 'en',
    hashtags: ['immigration', 'border'],
  },
  {
    text: 'These people are a disease on our society and everyone knows it.',
    topic: 'racism',
    region: 'UK',
    lang: 'en',
    hashtags: ['racism', 'hate'],
  },
  {
    text: 'I do not want my kids taught by people with that lifestyle. Keep it away from schools.',
    topic: 'lgbtq',
    region: 'US',
    lang: 'en',
    hashtags: ['lgbtq', 'education'],
  },
  {
    text: 'That caste should know its place and stop demanding equality.',
    topic: 'caste',
    region: 'India',
    lang: 'en',
    hashtags: ['caste', 'equality'],
  },
  {
    text: 'Foreigners are stealing our jobs and deserve to be thrown out immediately.',
    topic: 'economy',
    region: 'UK',
    lang: 'en',
    hashtags: ['economy', 'immigration'],
  },
  {
    text: 'Their kind will never integrate, so why pretend otherwise?',
    topic: 'religion',
    region: 'France',
    lang: 'en',
    hashtags: ['religion', 'immigration'],
  },
];

/** Synthetic author pools, kept generic and clearly fake. */
const AUTHOR_NAMES = [
  'Aarav Mehta',
  'Priya Nair',
  'Rohan Kulkarni',
  'Sneha Iyer',
  'Vikram Singh',
  'Ananya Das',
  'Kabir Sharma',
  'Meera Joshi',
  'Arjun Rao',
  'Ishita Bose',
  'Daniel Carter',
  'Maya Thompson',
  'Liam O’Connor',
  'Grace Adeyemi',
  'Noah Bennett',
  'Sofia Ramirez',
  'Elena García',
  'Mateo Silva',
  'Camila Rocha',
  'Lucas Almeida',
  'Amina Haddad',
  'Yusuf Karim',
  'Layla Mansour',
  'Omar Farouk',
  'Chloé Martin',
  'Hugo Laurent',
  'Inès Dubois',
  'Budi Santoso',
  'Siti Rahma',
  'Agus Wijaya',
  'Rina Patel',
  'Tanvir Ahmed',
  'Nadia Islam',
  'Rafiq Chowdhury',
  'Suresh Patil',
  'Anjali Deshmukh',
  'Karthik Subramanian',
  'Divya Raman',
  'Naveen Kumar',
  'Farah Khan',
];

const AUTHOR_REGIONS: Record<string, string[]> = {
  India: ['Aarav Mehta', 'Priya Nair', 'Rohan Kulkarni', 'Sneha Iyer', 'Vikram Singh', 'Ananya Das', 'Kabir Sharma', 'Meera Joshi', 'Arjun Rao', 'Ishita Bose', 'Rina Patel', 'Suresh Patil', 'Anjali Deshmukh', 'Karthik Subramanian', 'Divya Raman', 'Naveen Kumar'],
  US: ['Daniel Carter', 'Maya Thompson', 'Grace Adeyemi', 'Noah Bennett', 'Sofia Ramirez', 'Farah Khan'],
  UK: ['Liam O’Connor', 'Grace Adeyemi', 'Noah Bennett', 'Daniel Carter'],
  Europe: ['Chloé Martin', 'Hugo Laurent', 'Inès Dubois', 'Liam O’Connor'],
  France: ['Chloé Martin', 'Hugo Laurent', 'Inès Dubois'],
  MENA: ['Amina Haddad', 'Yusuf Karim', 'Layla Mansour', 'Omar Farouk'],
  Mexico: ['Sofia Ramirez', 'Elena García', 'Mateo Silva'],
  Brazil: ['Camila Rocha', 'Lucas Almeida', 'Mateo Silva'],
  Indonesia: ['Budi Santoso', 'Siti Rahma', 'Agus Wijaya'],
  Bangladesh: ['Tanvir Ahmed', 'Nadia Islam', 'Rafiq Chowdhury'],
};

const toUsername = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/** Deterministic PRNG so re-runs produce the same documents. */
let seed = 20261025;
const random = (): number => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const randomInt = (min: number, max: number): number =>
  Math.floor(random() * (max - min + 1)) + min;

const fill = (template: string, subject: string): string =>
  template.replace(/\{subject\}/g, subject);

const hashtagsFor = (cluster: Cluster): string[] => {
  const tags = new Set<string>();
  cluster.hashtags.forEach((tag) => tags.add(tag.toLowerCase()));
  tags.add(cluster.topic.toLowerCase());
  return Array.from(tags).slice(0, 5);
};

const authorFor = (region: string, index: number) => {
  const pool = AUTHOR_REGIONS[region] || AUTHOR_NAMES;
  const name = pool[index % pool.length];
  const username = toUsername(name);
  return {
    id: `demo_author_${toUsername(name)}`,
    name,
    username,
    verified: random() < 0.12,
  };
};

const createdAtFor = (index: number): Date => {
  // Spread tweets over the last 45 days so date filters and charts look alive.
  const daysAgo = randomInt(0, 45);
  const hoursAgo = randomInt(0, 23);
  const minutesAgo = randomInt(0, 59);
  return new Date(
    Date.now() -
      daysAgo * 24 * 60 * 60 * 1000 -
      hoursAgo * 60 * 60 * 1000 -
      minutesAgo * 60 * 1000
  );
};

type DemoDoc = {
  tweetId: string;
  text: string;
  createdAt: Date;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
    verified: boolean;
  };
  publicMetrics: {
    retweetCount: number;
    likeCount: number;
    replyCount: number;
    quoteCount: number;
  };
  lang: string;
  hashtags: string[];
};

const buildClusterTweets = (cluster: Cluster): DemoDoc[] => {
  const docs: DemoDoc[] = [];

  for (let i = 0; i < cluster.count; i += 1) {
    const subject = cluster.subjects[i % cluster.subjects.length];
    const template =
      cluster.templates[Math.floor(i / cluster.subjects.length) % cluster.templates.length];
    const text = fill(template.text, subject).trim();

    if (text.length > 280) {
      throw new Error(
        `Generated tweet exceeds 280 characters (${text.length}): ${text}`
      );
    }

    const tweetNumber = String(i + 1).padStart(3, '0');
    const author = authorFor(cluster.region, i + cluster.topic.length);
    docs.push({
      tweetId: `demo_${cluster.topic}_${cluster.lang}_${tweetNumber}`,
      text,
      createdAt: createdAtFor(i),
      authorId: author.id,
      author,
      publicMetrics: {
        retweetCount: randomInt(0, 900),
        likeCount: randomInt(0, 6000),
        replyCount: randomInt(0, 350),
        quoteCount: randomInt(0, 120),
      },
      lang: cluster.lang,
      hashtags: hashtagsFor(cluster),
    });
  }

  return docs;
};

const buildHateTweets = (): DemoDoc[] =>
  HATE_EXAMPLES.map((example, index) => {
    if (example.text.length > 280) {
      throw new Error(`Hate example exceeds 280 characters: ${example.text}`);
    }

    const author = authorFor(example.region, index + 7);
    return {
      tweetId: `demo_hate_${String(index + 1).padStart(3, '0')}`,
      text: example.text,
      createdAt: createdAtFor(index),
      authorId: author.id,
      author,
      publicMetrics: {
        retweetCount: randomInt(10, 400),
        likeCount: randomInt(50, 2500),
        replyCount: randomInt(5, 200),
        quoteCount: randomInt(1, 80),
      },
      lang: example.lang,
      hashtags: Array.from(
        new Set([...example.hashtags, example.topic].map((tag) => tag.toLowerCase()))
      ),
    };
  });

const main = async (): Promise<void> => {
  const reset = process.argv.includes('--reset');

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}`);

  await DemoTweet.syncIndexes();

  if (reset) {
    const deleted = await DemoTweet.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} existing demo tweets`);
  }

  const docs = [...CLUSTERS.flatMap(buildClusterTweets), ...buildHateTweets()];

  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { tweetId: doc.tweetId },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await DemoTweet.bulkWrite(operations, { ordered: false });
  const total = await DemoTweet.countDocuments({});

  console.log(
    `Upserted ${result.upsertedCount} new and updated ${result.modifiedCount} existing demo tweets`
  );
  console.log(`Collection now holds ${total} demo tweets`);

  const byLang = await DemoTweet.aggregate([
    { $group: { _id: '$lang', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log(
    'By language:',
    byLang.map((row) => `${row._id}:${row.count}`).join(', ')
  );
  console.log(
    `Includes ${HATE_EXAMPLES.length} deliberately hostile examples (unlabelled; scored only at fetch time)`
  );

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Demo tweet seeding failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
