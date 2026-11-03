// Scripted answers for the on-page agent. Every fact here must match index.html and the CV.
window.AGENT = {
  intro: {
    q: 'Who is Sachchidananda?',
    a: 'An engineer from Odisha who builds <b>AI systems</b> and thinks about the <b>business behind them</b>. Dual degree from NIT Rourkela, GATE AIR 492, GMAT Focus 625. He has shipped a medical-records agent, a scheme finder for older adults and a drone survey workflow.',
    cite: ['about.md', 'education.md'], go: '#about',
    trace: [['plan', 'intent.classify("profile")', 120], ['retrieve', 'search("about", k=3)', 260], ['verify', 'check(cv.pdf)', 200], ['reason', 'rank(evidence)', 160], ['answer', 'compose(cite=true)', 300]]
  },
  questions: [
    {
      id: 'ai', q: 'What has he built with AI?',
      keys: ['ai', 'built', 'build', 'project', 'projects', 'shipped', 'llm', 'agent', 'rag', 'langgraph', 'work', 'made', 'portfolio', 'code', 'github'],
      a: '<b>Medical Docs Bot</b>: a vision LLM reads prescriptions and lab reports, and a LangGraph agent answers questions with citations, at about $0.0006 per document. <b>Scheme Saathi</b>: an English/Hindi helper for older adults to find government schemes. He is also doing the Applied AI program at IIT Hyderabad.',
      cite: ['projects/medical-docs-bot', 'projects/scheme-saathi'], go: '#work',
      trace: [['plan', 'intent.classify("projects")', 110], ['retrieve', 'qdrant.search("ai", k=4)', 320], ['verify', 'github.repos()', 280], ['reason', 'rank(impact)', 190], ['answer', 'compose(cite=true)', 340]]
    },
    {
      id: 'lead', q: 'Can he lead and manage?',
      keys: ['lead', 'leader', 'leadership', 'manage', 'management', 'manager', 'team', 'people', 'business', 'kpmg', 'toyota', 'client', 'stakeholder', 'gmat', 'nhrc', 'experience', 'internship'],
      a: 'At <b>KPMG</b> he turned churn data into dashboards for client meetings and found a hidden 3% order-value drop. At <b>Toyota Kirloskar</b> he segmented regional sales. At the <b>NHRC</b> he interviewed 65 households for a policy report. GMAT Focus: <b>625</b>.',
      cite: ['work/kpmg', 'work/toyota', 'work/nhrc'], go: '#lead',
      trace: [['plan', 'intent.classify("leadership")', 120], ['retrieve', 'search("roles", k=3)', 280], ['verify', 'check(dates)', 220], ['reason', 'rank(scope)', 180], ['answer', 'compose(cite=true)', 300]]
    },
    {
      id: 'study', q: 'What did he study?',
      keys: ['study', 'studied', 'education', 'degree', 'college', 'university', 'nit', 'iit', 'gate', 'toefl', 'score', 'scores', 'cgpa', 'grade', 'rank', 'course', 'certificate'],
      a: '<b>Dual Degree (B.Tech + M.Tech)</b> at NIT Rourkela, 2021–2026: B.Tech 7.68, M.Tech 7.88. Now in the <b>Applied AI Professional Program</b> at IIT Hyderabad. Scores: GATE AIR <b>492</b> of 6,732, GMAT Focus <b>625</b>, TOEFL iBT <b>90/120</b>.',
      cite: ['education.md', 'scores.json'], go: '#edu',
      trace: [['plan', 'intent.classify("education")', 100], ['retrieve', 'search("education", k=3)', 240], ['verify', 'check(scorecards)', 300], ['reason', 'sort(by=date)', 150], ['answer', 'compose(cite=true)', 280]]
    },
    {
      id: 'tools', q: "What's in his toolkit?",
      keys: ['skill', 'skills', 'tool', 'tools', 'toolkit', 'stack', 'python', 'sql', 'fastapi', 'tech', 'language', 'languages', 'know', 'power', 'tableau'],
      a: '<b>Python</b> and <b>SQL</b> first. FastAPI and Pydantic for services. LangChain and LangGraph for agents and RAG. Qdrant and pgvector for search. Langfuse and LangSmith for traces and evals. Power BI, Tableau and Excel for the business side.',
      cite: ['tools.json'], go: '#tools',
      trace: [['plan', 'intent.classify("skills")', 100], ['retrieve', 'list_tools()', 200], ['verify', 'match(projects)', 260], ['reason', 'group(by=layer)', 170], ['answer', 'compose(cite=true)', 260]]
    },
    {
      id: 'care', q: 'What does he care about?',
      keys: ['care', 'cares', 'idea', 'ideas', 'passion', 'like', 'love', 'hobby', 'hobbies', 'write', 'writing', 'poetry', 'read', 'reading', 'book', 'books', 'society', 'social', 'city', 'delhi', 'health', 'medicine', 'why'],
      a: 'Building things that help people. He wants to point LLMs at <b>Delhi\'s city problems</b> like air and heat, at the slow paperwork in <b>medicine</b>, and at the small tasks that eat <b>everyday hours</b>. Off the clock he writes poetry, essays and stories, and reads novels.',
      cite: ['ideas.md', 'notebook.md'], go: '#ideas',
      trace: [['plan', 'intent.classify("values")', 130], ['retrieve', 'search("ideas", k=3)', 260], ['verify', 'check(github)', 200], ['reason', 'reflect()', 240], ['answer', 'compose(cite=true)', 320]]
    },
    {
      id: 'reach', q: 'How do I reach him?',
      keys: ['reach', 'contact', 'email', 'mail', 'hire', 'linkedin', 'talk', 'call', 'connect', 'message', 'cv', 'resume'],
      a: 'Email <b>sachchidananda13@gmail.com</b>. He is also on <b>LinkedIn</b> and <b>GitHub</b> (sachchi-sapiens). Based in Bhubaneswar, Odisha.',
      cite: ['contact.md'], go: '#contact',
      trace: [['plan', 'intent.classify("contact")', 90], ['retrieve', 'get("contact")', 140], ['verify', 'ping(links)', 180], ['reason', 'skip()', 40], ['answer', 'compose(cite=true)', 200]]
    }
  ],
  fallback: 'I only know what is on this page. Try one of the questions above, or ask about his projects, leadership, studies, skills, ideas or contact.'
};
