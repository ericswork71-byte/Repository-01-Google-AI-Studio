export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio
}

export interface FormTemplate {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  defaultFields: FormField[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    title: 'Subscribe to Our Journal',
    subtitle: 'Stay Curious',
    description: 'A minimalist newsletter landing page designed to build an audience and share thoughts weekly.',
    defaultFields: [
      {
        id: '1',
        type: 'text',
        label: 'First Name',
        name: 'first_name',
        placeholder: 'Alex',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Email Address',
        name: 'email',
        placeholder: 'alex@example.com',
        required: true,
      }
    ]
  },
  {
    id: 'contact',
    name: 'Contact & Lead Capture',
    title: 'Let\'s Create Something Great',
    subtitle: 'Get In Touch',
    description: 'A modern, clean contact form for independent creators, agencies, or freelancers to collect detailed project leads.',
    defaultFields: [
      {
        id: '1',
        type: 'text',
        label: 'Your Name',
        name: 'name',
        placeholder: 'Jane Doe',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Your Email',
        name: 'email',
        placeholder: 'jane@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'select',
        label: 'What are you building?',
        name: 'project_type',
        required: false,
        options: ['Mobile Application', 'SaaS Platform', 'Static Website', 'E-Commerce Store', 'Other'],
      },
      {
        id: '4',
        type: 'textarea',
        label: 'Project Details / Message',
        name: 'message',
        placeholder: 'Tell us about your timeline, ideas, and goals...',
        required: true,
      }
    ]
  },
  {
    id: 'rsvp',
    name: 'Event Invitation & RSVP',
    title: 'Summer Solstice Gathering',
    subtitle: 'Join Us Under the Stars',
    description: 'A cozy invite for summer dinners, local meetups, community workshops, or intimate birthday parties.',
    defaultFields: [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        name: 'full_name',
        placeholder: 'Sam Wilson',
        required: true,
      },
      {
        id: '2',
        type: 'select',
        label: 'Will you attend?',
        name: 'attendance',
        required: true,
        options: ['Yes, absolute certainty!', 'No, regretfully declining', 'Maybe, count me as tentative'],
      },
      {
        id: '3',
        type: 'select',
        label: 'Bringing a guest?',
        name: 'guests',
        required: true,
        options: ['0 - Flying solo', '1 - Bringing a plus-one', '2 - Dynamic trio'],
      },
      {
        id: '4',
        type: 'text',
        label: 'Dietary Restrictions / Preferences',
        name: 'dietary',
        placeholder: 'e.g., Vegan, Nut Allergy, none',
        required: false,
      }
    ]
  },
  {
    id: 'feedback',
    name: 'Product / Client Feedback',
    title: 'Help Us Shape the Future',
    subtitle: 'User Experience Survey',
    description: 'Gather actionable reviews, feature request logs, or experience ratings from your initial testers.',
    defaultFields: [
      {
        id: '1',
        type: 'text',
        label: 'What did you enjoy most?',
        name: 'highlights',
        placeholder: 'The seamless drag & drop visual feel...',
        required: true,
      },
      {
        id: '2',
        type: 'select',
        label: 'How would you rate your experience?',
        name: 'rating',
        required: true,
        options: ['⭐⭐⭐⭐⭐ (Excellent)', '⭐⭐⭐⭐ (Great)', '⭐⭐⭐ (Average)', '⭐⭐ (Needs work)', '⭐ (Disappointing)'],
      },
      {
        id: '3',
        type: 'textarea',
        label: 'Any specific suggestions for improvement?',
        name: 'suggestions',
        placeholder: 'It would be amazing to see keyboard shortcuts...',
        required: false,
      },
      {
        id: '4',
        type: 'checkbox',
        label: 'May we contact you for follow-up questions?',
        name: 'allow_followup',
        required: false,
      }
    ]
  }
];

export interface ThemeStyle {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  textTitleClass: string;
  textSubtitleClass: string;
  textBodyClass: string;
  inputClass: string;
  buttonClass: string;
  accentClass: string;
  fontFamily: string;
  badgeClass: string;
}

export const THEME_STYLES: ThemeStyle[] = [
  {
    id: 'modernist',
    name: 'Modernist Slate (Light)',
    bgClass: 'bg-slate-50 text-slate-800',
    cardClass: 'bg-white border border-slate-200/80 rounded-2xl shadow-sm',
    textTitleClass: 'font-sans font-semibold text-slate-900 tracking-tight',
    textSubtitleClass: 'font-mono uppercase tracking-widest text-[11px] text-indigo-600 font-bold',
    textBodyClass: 'text-slate-600 text-sm leading-relaxed',
    inputClass: 'bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition shadow-sm font-sans',
    accentClass: 'text-indigo-600',
    fontFamily: 'font-sans',
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100'
  },
  {
    id: 'editorial',
    name: 'Warm Editorial (Serif)',
    bgClass: 'bg-[#faf6f0] text-amber-950',
    cardClass: 'bg-[#fcfaf7] border border-amber-900/10 rounded-lg shadow-sm',
    textTitleClass: 'font-serif text-3xl font-medium text-amber-950 italic',
    textSubtitleClass: 'font-serif uppercase tracking-wider text-xs text-amber-800/80 font-semibold',
    textBodyClass: 'text-amber-900/80 text-sm font-serif leading-relaxed',
    inputClass: 'bg-[#fdfcfb] border border-amber-900/20 rounded text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 text-sm font-serif transition',
    buttonClass: 'bg-amber-950 hover:bg-amber-900 text-white font-medium rounded text-sm px-5 py-2.5 transition font-serif tracking-wide',
    accentClass: 'text-amber-900',
    fontFamily: 'font-serif',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-200/40'
  },
  {
    id: 'cyber',
    name: 'Cyber Mint (Deep Dark)',
    bgClass: 'bg-zinc-950 text-zinc-100',
    cardClass: 'bg-zinc-900/80 border border-zinc-800 rounded-none shadow-[0_0_15px_rgba(0,0,0,0.5)]',
    textTitleClass: 'font-mono font-bold text-zinc-100 tracking-tight uppercase text-2xl',
    textSubtitleClass: 'font-mono tracking-wider text-xs text-emerald-400 select-none border-b border-zinc-800 pb-1 inline-block w-full',
    textBodyClass: 'text-zinc-400 text-xs font-mono leading-relaxed',
    inputClass: 'bg-zinc-950 border border-zinc-800 rounded-none text-emerald-400 placeholder-zinc-600 font-mono focus:outline-none focus:border-emerald-400 text-xs focus:ring-1 focus:ring-emerald-400/20 transition',
    buttonClass: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono rounded-none text-xs tracking-wider px-5 py-2.5 transition border border-emerald-400',
    accentClass: 'text-emerald-400',
    fontFamily: 'font-mono',
    badgeClass: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 font-mono text-[10px]'
  },
  {
    id: 'funky',
    name: 'Soft Lavender (Playful)',
    bgClass: 'bg-[#f4f1fa] text-purple-950',
    cardClass: 'bg-white border-2 border-purple-200 rounded-3xl shadow-[4px_4px_0px_0px_#dbd4f0]',
    textTitleClass: 'font-sans font-black tracking-tight text-purple-950 text-2xl',
    textSubtitleClass: 'font-sans font-bold tracking-normal text-xs text-purple-500 uppercase',
    textBodyClass: 'text-purple-800/80 text-sm leading-relaxed',
    inputClass: 'bg-purple-50/50 border-2 border-purple-100 rounded-2xl text-purple-950 placeholder-purple-300 focus:outline-none focus:ring-0 focus:border-purple-400 text-sm font-semibold transition',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm px-5 py-2.5 transition shadow-[2px_2px_0px_0px_#dbd4f0] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]',
    accentClass: 'text-purple-600',
    fontFamily: 'font-sans',
    badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200 font-bold'
  }
];

export interface FormPlatformGuide {
  id: string;
  name: string;
  brandColor: string;
  logoText: string;
  isBackendOnly: boolean;
  difficulty: 'Super Simple' | 'Beginner' | 'Intermediate';
  tagline: string;
  steps: string[];
  formActionTip: string;
  proTips: string;
}

export const PLATFORM_GUIDES: FormPlatformGuide[] = [
  {
    id: 'tally',
    name: 'Tally.so (Easiest Full Form)',
    brandColor: 'text-[#ec4899]',
    logoText: 'Tally',
    isBackendOnly: false,
    difficulty: 'Super Simple',
    tagline: 'Best for modern, gorgeous, code-free forms widget embeds.',
    steps: [
      'Create a free account on Tally.so.',
      'Click "New page" and type "/" to add headers, text, input fields, ratings or dropdowns, styling it like a Notion document.',
      'Click the "Publish" button in the top right.',
      'Go to "Share" and click "Embed" to copy your direct widget URL.',
      'Under our "Embed Iframe" tab, paste this URL to practice embedding it beautifully on your web page layout!'
    ],
    formActionTip: '<iframe src="https://tally.so/embed/YOUR_FORM_ID?alignLeft=1&hideTitle=1" width="100%" height="500" frameborder="0" marginheight="0" marginwidth="0" title="Contact Form"></iframe>',
    proTips: 'Tally provides 99% of its premium creator features entirely for free (unlimited forms, unlimited responses, file uploads) which is why web creators adore it for custom sites.'
  },
  {
    id: 'googleforms',
    name: 'Google Forms (100% Free Sheets Integration)',
    brandColor: 'text-[#a855f7]',
    logoText: 'Google',
    isBackendOnly: false,
    difficulty: 'Beginner',
    tagline: 'Best for sending form entries directly into a Google Sheet spreadsheet.',
    steps: [
      'Go to forms.google.com and click the "+" icon to start a new blank form.',
      'Add your questions, matching the data types (email, text, multiple choices).',
      'Click the "Send" button in the upper right, choose the "< >" (embed HTML option), and note the iframe URL of the form.',
      'Alternatively, did you know you can submit standard HTML forms directly to Google Forms? This is done by looking up the entry.xxxx IDs in the source code of Google Forms and placing them as the "name" attributes in your HTML, then setting the post action URL! Try to read standard embeds for starting.'
    ],
    formActionTip: '<iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>',
    proTips: 'In the responses tab on Google Forms, click the green spreadsheet icon to create active live sync to Google Sheets, which you can then link to other free tools.'
  },
  {
    id: 'formspree',
    name: 'Formspree (Best for custom HTML code)',
    brandColor: 'text-[#ef4444]',
    logoText: 'Formspree',
    isBackendOnly: true,
    difficulty: 'Beginner',
    tagline: 'Best for styling your own custom HTML codes without writing server-side scripts.',
    steps: [
      'Create an account at Formspree.io (completely free tier available).',
      'Create a new project & a target form named after your page.',
      'Formspree will immediately generate a unique API endpoint url, looking like: https://formspree.io/f/xoqjnyvq.',
      'In your HTML code, replace the form action attribute with that URL, and set method="POST".',
      'Crucial: Check that all your input tags contain a "name" attribute so Formspree recognizes the inputs.'
    ],
    formActionTip: '<form action="https://formspree.io/f/YOUR_FORM_KEY" method="POST">\n  <input type="email" name="email" required />\n  <button type="submit">Submit</button>\n</form>',
    proTips: 'Formspree works entirely client-side. The free plan allows up to 50 submissions per month, spam protection (via reCAPTCHA), and sends email alerts instantly. If you need more free, check out Basin (usebasin.com) which has 100 entries/month free!'
  },
  {
    id: 'basin',
    name: 'Basin / Web3Forms (High Limits Free API)',
    brandColor: 'text-[#0ea5e9]',
    logoText: 'Basin',
    isBackendOnly: true,
    difficulty: 'Intermediate',
    tagline: 'High submission quotas for static web pages and custom HTML CSS code.',
    steps: [
      'Register on Usebasin.com or Web3forms.com.',
      'Generate a unique form key token.',
      'Embed this token inside your form action target or a hidden input.',
      'Now, any client submitting your HTML form will be securely parsed, sent through spam filters, and stored in your dashboard!',
      'You can also configure custom redirection pages or email automated replies on submission.'
    ],
    formActionTip: '<form action="https://usebasin.com/f/YOUR_FORM_KEY" method="POST">\n  <label>Your Name</label>\n  <input type="text" name="name" required />\n  <button type="submit">Deploy Form</button>\n</form>',
    proTips: 'Web3Forms lets you receive submissions completely free without signing up for an account during testing! It is a great way to start practicing forms instantly.'
  }
];

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why is the "name" attribute on an <input> tag extremely important for free forms builders?',
    options: [
      'It dictates the CSS color of the input background.',
      'It tells the backend forms server what key label to assign to the user\'s submitted text value.',
      'It prevents users from typing illegal characters in the form.',
      'It is only used by search engines and has no effect on submissions.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Without a "name" attribute (e.g., name="email"), the browser will NOT submit that input file data when the form sends. Free forms backends like Formspree, Basin, and Formspark rely entirely on these name attributes to organize your data into neat columns or email outputs.'
  },
  {
    id: 2,
    question: 'Which method attribute should you almost always assign to a form tag when submitting custom user inputs?',
    options: [
      'method="GET" - because it gets resources',
      'method="POST" - because it sends data securely inside the request payload body',
      'method="PUSH" - because it pushes content on screens',
      'method="SUBMIT" - because it fires submissions'
    ],
    correctAnswerIndex: 1,
    explanation: 'HTTP "POST" sends form data inside the body of the request, keeping sensitive information hidden from search bars. method="GET" appends form inputs directly to the address URL parameters, which is insecure and text length-constrained.'
  },
  {
    id: 3,
    question: 'What is the role of the "placeholder" attribute on an input field?',
    options: [
      'It validates the input field strictly using regular expressions.',
      'It specifies the field title displayed above the input box.',
      'It shows a faint guiding text inside the input box which disappears once the user begins typing.',
      'It blocks hackers from submitting raw scripts to your form.'
    ],
    correctAnswerIndex: 2,
    explanation: 'A placeholder (placeholder="alex@gmail.com") is purely visual guidance for input expectations. It is not equivalent to a default value, nor is it a label (which screen readers require for accessibility).'
  },
  {
    id: 4,
    question: 'Where can you deploy your designed form page completely for free with high performance?',
    options: [
      'By hosting it on local hard drives using USB controllers.',
      'Services like Netlify, Vercel, GitHub Pages, or Cloudflare Pages.',
      'You must buy a physical Linux server racks for home configuration.',
      'Standard Google Drive folders are currently the only secure public hosts.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Modern platforms like Netlify, Vercel, GitHub Pages, and Cloudflare Pages allow developers to host static HTML, CSS, and JS files for 100% free with continuous deployment directly from a GitHub repository or direct folder drag-and-drop!'
  },
  {
    id: 5,
    question: 'If you want to use a gorgeous existing design in Tally.so or Google Forms inside your custom landing website, what HTML tag should you use?',
    options: [
      'The <embed-link> tag',
      'The <canvas> container tag',
      'An <iframe> tag, setting the "src" attribute to your published form link',
      'The <object-data> tag'
    ],
    correctAnswerIndex: 2,
    explanation: 'An <iframe> (Inline Frame) acts as a window to display another document/web page directly inside your currently designed page. It is highly convenient when you have drag-and-drop form builders.'
  }
];
