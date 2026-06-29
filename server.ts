import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper function to call generateContent with retry and fallback models to prevent transient 503/429 errors
async function generateContentWithRetry(params: {
  model?: string;
  contents: any;
  config?: any;
}): Promise<any> {
  const preferredModel = params.model || 'gemini-3.5-flash';
  const fallbackModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  const modelsToTry = [preferredModel, ...fallbackModels.filter(m => m !== preferredModel)];

  let lastError: any = null;
  
  for (const model of modelsToTry) {
    let retries = 2; // Try up to 3 times per model (initial + 2 retries)
    while (retries >= 0) {
      try {
        const ai = getGemini();
        if (!ai) {
          throw new Error("Gemini API key is not configured.");
        }
        
        console.log(`[Gemini] Attempting generateContent with model: ${model} (${retries} retries left)`);
        const response = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: params.config,
        });
        
        if (response) {
          return response;
        }
        throw new Error("Received empty response from Gemini API");
      } catch (err: any) {
        lastError = err;
        const status = err.status || (err.error?.code) || 0;
        console.warn(`[Gemini] Attempt with model ${model} failed (status: ${status}):`, err.message || err);
        
        // If it's a Bad Request (400), don't waste time retrying this model, switch immediately
        if (status === 400) {
          console.warn(`[Gemini] Bad Request (400) - likely unsupported parameter/schema. Switching to next model...`);
          break;
        }

        if (retries > 0) {
          const delay = (3 - retries) * 1000;
          console.log(`[Gemini] Waiting ${delay}ms before retrying model ${model}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        retries--;
      }
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Helper to check if Gemini is active
app.get('/api/status', (req, res) => {
  const active = getGemini() !== null;
  res.json({
    geminiActive: active,
    userEmail: process.env.USER_EMAIL || 'thedhruvgarg@gmail.com',
  });
});

// Endpoint 1: Intake Agent (Parse Situation)
app.post('/api/intake', async (req, res) => {
  const { situation, currentDate } = req.body;
  if (!situation) {
    return res.status(400).json({ error: 'Situation is required' });
  }

  const ai = getGemini();
  if (ai) {
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: `Parse this natural language input from a user who is facing a deadline. Current local time is: ${currentDate || new Date().toISOString()}. Extract a structured task profile.
        
        User situation: "${situation}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              deadline: {
                type: Type.STRING,
                description: "Estimated deadline date and time as a readable string, e.g., 'Today 5:00 PM', 'Tomorrow 9:00 AM'."
              },
              taskType: {
                type: Type.STRING,
                enum: ['presentation', 'essay', 'report', 'code', 'meeting_prep', 'general'],
                description: "The most fitting task category."
              },
              effortLevel: {
                type: Type.STRING,
                enum: ['low', 'medium', 'high'],
                description: "Estimated depth or size of the work."
              },
              currentProgress: {
                type: Type.STRING,
                enum: ['none', 'partial', 'almost_done'],
                description: "The current state of completion."
              },
              dependencies: {
                type: Type.STRING,
                enum: ['solo', 'group'],
                description: "Whether other people are involved."
              },
              toneSignals: {
                type: Type.OBJECT,
                properties: {
                  panicLevel: {
                    type: Type.STRING,
                    enum: ['low', 'medium', 'high']
                  },
                  stakesContext: {
                    type: Type.STRING,
                    description: "Details about the stakes (e.g., client pitch, academic grade)."
                  }
                },
                required: ['panicLevel', 'stakesContext']
              }
            },
            required: ['deadline', 'taskType', 'effortLevel', 'currentProgress', 'dependencies', 'toneSignals']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          geminiUsed: true,
          profile: {
            ...parsed,
            originalInput: situation
          }
        });
      }
    } catch (err: any) {
      console.error('Gemini intake failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine
  const inputLower = situation.toLowerCase();
  let taskType: 'presentation' | 'essay' | 'report' | 'code' | 'meeting_prep' | 'general' = 'general';
  if (inputLower.includes('deck') || inputLower.includes('presentation') || inputLower.includes('slides') || inputLower.includes('pitch')) {
    taskType = 'presentation';
  } else if (inputLower.includes('essay') || inputLower.includes('paper') || inputLower.includes('write')) {
    taskType = 'essay';
  } else if (inputLower.includes('report') || inputLower.includes('analysis') || inputLower.includes('doc')) {
    taskType = 'report';
  } else if (inputLower.includes('code') || inputLower.includes('program') || inputLower.includes('app') || inputLower.includes('dev')) {
    taskType = 'code';
  } else if (inputLower.includes('meeting') || inputLower.includes('agenda') || inputLower.includes('prep') || inputLower.includes('sync')) {
    taskType = 'meeting_prep';
  }

  const mockProfile = {
    deadline: inputLower.includes('hour') ? 'Today 5:00 PM' : 'Tomorrow 9:00 AM',
    taskType,
    effortLevel: inputLower.includes('important') || inputLower.includes('pitch') || inputLower.includes('exam') ? 'high' : 'medium',
    currentProgress: inputLower.includes('started') || inputLower.includes('blank') ? 'none' : 'partial',
    dependencies: inputLower.includes('team') || inputLower.includes('client') || inputLower.includes('we') ? 'group' : 'solo',
    toneSignals: {
      panicLevel: inputLower.includes('panic') || inputLower.includes('emergency') || inputLower.includes('impossible') ? 'high' : 'medium',
      stakesContext: inputLower.includes('pitch') ? 'High-stakes client presentation' : 'Important deadline'
    },
    originalInput: situation
  };

  res.json({
    geminiUsed: false,
    profile: mockProfile
  });
});

// Endpoint 2: Mission Assessment Engine
app.post('/api/assess', async (req, res) => {
  const { profile, currentDate } = req.body;
  if (!profile) {
    return res.status(400).json({ error: 'Task profile is required' });
  }

  const ai = getGemini();
  if (ai) {
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: `Assess the feasibility of meeting this deadline.
        Current time is: ${currentDate || new Date().toISOString()}.
        Task Profile: ${JSON.stringify(profile)}.
        
        Determine:
        1. A realistic completion probability (0 to 100). If the deadline is extremely tight (e.g. less than 3 hours for high effort), make it lower than 30%.
        2. Time remaining string.
        3. Recommended strategy: FIGHT (if probability >= 30%) or NEGOTIATE (if probability < 30%).
        4. Detailed reasoning context.
        5. Specific challenges, estimated output size, and concrete recommended action items.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              completionProbability: {
                type: Type.INTEGER,
                description: "Feasibility score from 0 to 100."
              },
              timeRemaining: {
                type: Type.STRING,
                description: "Readable text, e.g., '4 hours 15 mins'."
              },
              recommendedStrategy: {
                type: Type.STRING,
                enum: ['FIGHT', 'NEGOTIATE']
              },
              reasoning: {
                type: Type.STRING,
                description: "A professional, direct, grounding explanation of why this probability was calculated."
              },
              details: {
                type: Type.OBJECT,
                properties: {
                  estimatedOutputCount: {
                    type: Type.STRING,
                    description: "e.g., '8-10 slides', '3-4 pages'."
                  },
                  challenges: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  actionItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['estimatedOutputCount', 'challenges', 'actionItems']
              }
            },
            required: ['completionProbability', 'timeRemaining', 'recommendedStrategy', 'reasoning', 'details']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          geminiUsed: true,
          assessment: parsed
        });
      }
    } catch (err: any) {
      console.error('Gemini assessment failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine based on Panic level & Effort level
  let probability = 75;
  let strategy: 'FIGHT' | 'NEGOTIATE' = 'FIGHT';
  let reasoning = '';
  let estimatedOutputCount = '5-6 pages';

  if (profile.taskType === 'presentation') {
    estimatedOutputCount = '10-12 slides';
  } else if (profile.taskType === 'code') {
    estimatedOutputCount = '1-2 operational modules';
  } else if (profile.taskType === 'meeting_prep') {
    estimatedOutputCount = '1 workspace brief';
  }

  // Check impossible triggers
  const lowerInput = profile.originalInput.toLowerCase();
  if (lowerInput.includes('impossible') || lowerInput.includes('1 hour') || lowerInput.includes('30 min') || (profile.effortLevel === 'high' && lowerInput.includes('2 hours'))) {
    probability = 15;
    strategy = 'NEGOTIATE';
    reasoning = "A high-effort task is requested with less than a manageable window. Attempting to force-complete this will result in poor output and high error rates. Immediate communication with stakeholders to defer the deadline is the only responsible action.";
  } else {
    if (profile.effortLevel === 'high') probability -= 20;
    if (profile.toneSignals.panicLevel === 'high') probability -= 10;
    if (profile.currentProgress === 'none') probability -= 15;
    if (probability < 30) {
      strategy = 'NEGOTIATE';
      reasoning = "The time available is insufficient to meet the quality standards for a task of this magnitude. Pivot to damage control mode to secure a professional extension.";
    } else {
      strategy = 'FIGHT';
      reasoning = "Tight but completely achievable if we eliminate all peripheral meetings, focus your calendar entirely, and pre-populate your work environment immediately.";
    }
  }

  const mockAssessment = {
    completionProbability: probability,
    timeRemaining: lowerInput.includes('5 hour') ? '5 hours 20 mins' : '12 hours 45 mins',
    recommendedStrategy: strategy,
    reasoning,
    details: {
      estimatedOutputCount,
      challenges: [
        "Blank-page start syndrome.",
        "Competing micro-meetings on today's calendar.",
        "High context switching costs."
      ],
      actionItems: [
        "Activate high-impact Focus block.",
        "Pre-populate outline using Search grounded agent.",
        "Postpone low-priority status syncs."
      ]
    }
  };

  res.json({
    geminiUsed: false,
    assessment: mockAssessment
  });
});

// Endpoint 3: Calendar Triage
app.post('/api/calendar', async (req, res) => {
  const { profile, currentDate } = req.body;

  const ai = getGemini();
  if (ai) {
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: `Review this task profile: ${JSON.stringify(profile)}.
        Pretend there is a list of calendar events for the user in the next 12-24 hours.
        Return a list of 4-5 events. Classify each event as:
        - 'critical' (must keep, e.g. urgent client calls, medical)
        - 'skippable' (can skip/cancel, e.g. status updates, informal 1on1s)
        - 'deferrable' (can postpone, e.g. project kickoffs, design critiques)
        Provide realistic titles and start/end times relative to: ${currentDate || new Date().toISOString()}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              events: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    start: { type: Type.STRING },
                    end: { type: Type.STRING },
                    classification: {
                      type: Type.STRING,
                      enum: ['critical', 'skippable', 'deferrable']
                    }
                  },
                  required: ['title', 'start', 'end', 'classification']
                }
              }
            },
            required: ['events']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const mappedEvents = parsed.events.map((e: any, idx: number) => ({
          id: `event-${idx}`,
          ...e
        }));
        return res.json({
          geminiUsed: true,
          events: mappedEvents
        });
      }
    } catch (err: any) {
      console.error('Gemini calendar triage failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine
  const baseDate = currentDate ? new Date(currentDate) : new Date();
  const formatOffset = (hours: number) => {
    const d = new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
    return d.toISOString();
  };

  const mockEvents = [
    {
      id: 'event-1',
      title: 'Weekly Status Sync with Marketing Team',
      start: formatOffset(1),
      end: formatOffset(1.5),
      classification: 'skippable' as const
    },
    {
      id: 'event-2',
      title: '1-on-1 Catch-up with Sarah',
      start: formatOffset(2),
      end: formatOffset(2.5),
      classification: 'skippable' as const
    },
    {
      id: 'event-3',
      title: 'Design Critique & UI Feedback Session',
      start: formatOffset(3.5),
      end: formatOffset(4.5),
      classification: 'deferrable' as const
    },
    {
      id: 'event-4',
      title: 'Urgent Client Alignment Call (Acme Corp)',
      start: formatOffset(5),
      end: formatOffset(5.5),
      classification: 'critical' as const
    }
  ];

  res.json({
    geminiUsed: false,
    events: mockEvents
  });
});

// Endpoint 4: Gmail Agent (Draft Emails)
app.post('/api/gmail', async (req, res) => {
  const { profile, events, isDamageControl } = req.body;

  const ai = getGemini();
  if (ai) {
    try {
      const prompt = isDamageControl
        ? `Draft a high-stakes professional extension request email for this task: ${JSON.stringify(profile)}.
        It should be polite, apologetic without groveling, propose a reasonable revised timeline, and offer a partial draft as a good-faith gesture.`
        : `Draft quick cancel/postpone apology emails for the following meetings that we need to clear to make time for this critical task: ${JSON.stringify(profile)}. 
        Meetings list: ${JSON.stringify(events.filter((e: any) => e.classification === 'skippable' || e.classification === 'deferrable'))}.
        Provide a list of email drafts, each matching a meeting. Keep them concise and polite.`;

      const response = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emails: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    recipient: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                    associatedEventId: { type: Type.STRING, description: "If matching an event from the input, specify its ID here." }
                  },
                  required: ['recipient', 'subject', 'body']
                }
              }
            },
            required: ['emails']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const mappedEmails = parsed.emails.map((e: any, idx: number) => ({
          id: `draft-${idx}`,
          type: isDamageControl ? 'extension_request' : 'apology',
          ...e
        }));
        return res.json({
          geminiUsed: true,
          emails: mappedEmails
        });
      }
    } catch (err: any) {
      console.error('Gemini draft emails failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine
  const emails = [];
  if (isDamageControl) {
    emails.push({
      id: 'draft-ext',
      recipient: profile.taskType === 'essay' ? 'professor@university.edu' : 'manager@company.com',
      subject: `Extension Request: ${profile.taskType === 'presentation' ? 'Client Pitch Deck' : 'Urgent Deliverable'}`,
      body: `Dear Team,\n\nI am writing to request a brief extension on the ${profile.taskType === 'presentation' ? 'pitch deck' : 'deliverable'} originally scheduled for today. To ensure that we deliver the level of depth and accuracy required for this, I believe it would be highly beneficial to take a few extra days.\n\nI propose submitting a revised version by next Monday. In the interest of keeping things moving, I can share my current detailed outline and primary findings as a partial draft by 5:00 PM today. Let me know if this works.\n\nMy apologies for the short notice, and thank you for your understanding.\n\nBest regards,\n[Your Name]`,
      type: 'extension_request' as const
    });
  } else {
    events.forEach((ev: any, idx: number) => {
      if (ev.classification === 'skippable' || ev.classification === 'deferrable') {
        emails.push({
          id: `draft-${idx}`,
          recipient: 'team-lead@company.com',
          subject: `Apologies: Need to reschedule - ${ev.title}`,
          body: `Hi Team,\n\nI have an urgent high-priority deadline coming up in the next few hours and need to skip our "${ev.title}" session today. Things should be back to normal tomorrow. Apologies for the short notice, and thank you for your flexibility!\n\nBest,\n[Your Name]`,
          associatedEventId: ev.id,
          type: 'apology' as const
        });
      }
    });
  }

  res.json({
    geminiUsed: false,
    emails
  });
});

// Endpoint 5: Bootstrap Agent with Search Grounding!
app.post('/api/bootstrap', async (req, res) => {
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: 'Task profile is required' });
  }

  const ai = getGemini();
  if (ai) {
    try {
      // Step 1: Perform search grounding to get facts and context
      const searchPrompt = `Use Google Search to find real, up-to-date content, structures, key figures, academic framing, or market details for this user task.
      User input: "${profile.originalInput}"
      Task Type: ${profile.taskType}
      
      Generate a comprehensive summary of key sections, outlines, facts, and relevant points. Use precise details instead of general placeholders.`;

      const searchResponse = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const searchResultText = searchResponse.text || '';
      
      // Extract sources from Gemini's dynamic grounding metadata
      const rawSources: { title: string; url: string }[] = [];
      const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            rawSources.push({
              title: chunk.web.title || 'Sourced Search Article',
              url: chunk.web.uri
            });
          }
        });
      }

      // Step 2: Format the grounded search facts into the requested JSON schema
      const structurePrompt = `We have gathered the following real-time search-grounded research:
      
      "${searchResultText}"
      
      Structure this research into a highly polished, complete starting outline of 4-5 core sections, each populated with realistic, detailed bullet points (no vague placeholders). Some bullets should have instructions prefixed/suffixed with "[EXPAND THIS]" for user direction.
      Also formulate a title, additional info, and format any referenced sources or links into the structured output.`;

      const formatResponse = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: structurePrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              outline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: { type: Type.STRING },
                    description: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    expandMarker: { type: Type.STRING, description: "A sentence or prompt prefixed/suffixed with [EXPAND THIS] for user direction." }
                  },
                  required: ['section', 'description', 'bullets']
                }
              },
              additionalInfo: { type: Type.STRING },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ['title', 'url']
                }
              }
            },
            required: ['title', 'outline', 'sources']
          }
        }
      });

      if (formatResponse.text) {
        const parsed = JSON.parse(formatResponse.text.trim());
        
        // Merge grounding metadata sources if the schema didn't populate enough
        const finalSources = parsed.sources && parsed.sources.length > 0 
          ? parsed.sources 
          : (rawSources.length > 0 ? rawSources : [{ title: 'Google Search Sourced Data', url: 'https://google.com' }]);

        return res.json({
          geminiUsed: true,
          bootstrap: {
            title: parsed.title || 'Clutch Session Bootstrap',
            type: profile.taskType,
            outline: parsed.outline,
            additionalInfo: parsed.additionalInfo || '',
            sources: finalSources
          }
        });
      }
    } catch (err: any) {
      console.error('Gemini bootstrap failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine with highly detailed tailored starting points
  const outline = [];
  const sources = [
    { title: 'Google Cloud Workspace Platform', url: 'https://workspace.google.com' },
    { title: 'B2B SaaS Market Overview (Statista)', url: 'https://statista.com' }
  ];

  if (profile.taskType === 'presentation') {
    outline.push(
      {
        section: 'Slide 1: Title & Vision',
        description: 'Set the hook and address the core B2B SaaS pain point.',
        bullets: [
          'Clutch: Autonomous deadline management platform addressing the $4.5B productivity leak.',
          'The problem: Existing tools operate DAYS in advance, but crash when the actual night-before crisis hits.',
          'Our solution: Real-time schedule clearing, email drafting, and grounded workspace bootstrapping.'
        ],
        expandMarker: '[EXPAND THIS] Add the precise pricing tiers and launch timeline for Q4.'
      },
      {
        section: 'Slide 2: Market Opportunity & TAM',
        description: 'Size the addressable audience (Students, Pros, Founders).',
        bullets: [
          'Total Addressable Market (TAM): 1.2B knowledge workers globally.',
          'Initial target: 45M US higher-ed students and fast-paced venture entrepreneurs.',
          'Competitors (Motion, Reclaim, Notion) are optimistic planning tools. Clutch is active crisis execution.'
        ],
        expandMarker: '[EXPAND THIS] Insert specific competitor logos and exact target numbers.'
      },
      {
        section: 'Slide 3: Real-Time Tech Demo Walkthrough',
        description: 'Demonstrating 5-agent sequence in action.',
        bullets: [
          'Intake Agent parses natural prompt in seconds.',
          'Mission Assessment calculates honest probability (FIGHT vs NEGOTIATE).',
          'Workspace generates slides/docs via real Google APIs.'
        ],
        expandMarker: '[EXPAND THIS] Embed actual screenshot of the live dashboard.'
      }
    );
  } else if (profile.taskType === 'essay') {
    outline.push(
      {
        section: 'Section 1: Introduction & Thesis Statement',
        description: 'Establishing background and thesis context.',
        bullets: [
          'Overviews the paradigm shift in digital productivity agents.',
          'Highlights behavioral inertia: why users procrastinate despite calendar alerts.',
          'Thesis: Proactive planning and reactive crisis recovery must coexist in a unified agentic loop.'
        ],
        expandMarker: '[EXPAND THIS] Finalize the exact wording of your core thesis statement.'
      },
      {
        section: 'Section 2: Literature Review (Behavioral Economics)',
        description: 'Analyzing current studies on deadline procrastination.',
        bullets: [
          'Hyperbolic discounting: Users systematically overvalue present convenience over future payoffs.',
          'The planning fallacy: Cognitive bias causing users to consistently underestimate task completion time.',
          'Why standard notifications fail: Alert fatigue causes defensive ignoring behaviors.'
        ]
      }
    );
  } else {
    outline.push(
      {
        section: 'Section 1: Objective & Context Brief',
        description: 'High-level goals of this Clutch work session.',
        bullets: [
          `Rapid bootstrap for: "${profile.originalInput}"`,
          'Identified constraints: Tight window, critical stakes.',
          'Key output: Grounded functional brief.'
        ],
        expandMarker: '[EXPAND THIS] Add key stakeholder names and specific metric targets.'
      },
      {
        section: 'Section 2: Action Plan & Core Execution Steps',
        description: 'Sequence of prioritized deep work steps.',
        bullets: [
          'Triage existing calendar events (done).',
          'Review drafted apologies and extension mails.',
          'Fill in specific placeholders in this bootstrapped brief.'
        ]
      }
    );
  }

  res.json({
    geminiUsed: false,
    bootstrap: {
      title: profile.taskType === 'presentation' ? 'Clutch B2B SaaS Pitch Deck Outline' : 'Clutch Deep Work Brief',
      type: profile.taskType,
      outline,
      additionalInfo: 'Sourced automatically via Search Grounding fallback.',
      sources
    }
  });
});

// Endpoint 6: "I'm Stuck" chat scoped strictly to current task
app.post('/api/stuck', async (req, res) => {
  const { chatHistory, message, profile } = req.body;

  const ai = getGemini();
  if (ai) {
    try {
      const history = chatHistory.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Create a chat session with system instruction
      const systemInstruction = `You are the Clutch Support Agent. The user is in the middle of a high-pressure crisis or planning block for the task: "${profile?.originalInput || 'Urgent work'}". 
      Your task is to provide extremely fast, concrete, action-oriented assistance. Do not write long preachy intros or fluff. Help them overcome blank-page paralysis instantly with specific outlines, code stubs, or draft text depending on what they are stuck on. Keep responses brief, encouraging, and highly specific.`;

      // Use generateContent with accumulated context
      const chatContents = [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: chatContents,
        config: {
          systemInstruction,
        }
      });

      if (response.text) {
        return res.json({
          geminiUsed: true,
          reply: response.text
        });
      }
    } catch (err: any) {
      console.error('Gemini chat failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine
  let reply = "I understand the pressure. Let's tackle this step-by-step. Let me give you a starting sentence or outline so we can keep building: \n\n";
  if (profile.taskType === 'presentation') {
    reply += "For slide 3 (Market size), try using this layout:\n1. TAM: '45M US college students facing extreme academic workloads.'\n2. SAM: '12M students with active full-time/part-time jobs.'\n3. Value Prop: 'Saving an average of 4 hours per week on research & administrative prep.'\n\nWhat do you think? Feel free to paste what you have so far and we can refine it!";
  } else {
    reply += "Try beginning with this topic sentence:\n'The emergence of multi-agent orchestration frameworks marks a fundamental departure from single-prompt chat interfaces.'\n\nDoes this feel aligned with your goal? Let me know which section you are currently looking at!";
  }

  res.json({
    geminiUsed: false,
    reply
  });
});

// Endpoint 7: Debrief generator
app.post('/api/debrief', async (req, res) => {
  const { profile, success } = req.body;

  const ai = getGemini();
  if (ai) {
    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.5-flash',
        contents: `Analyze this completed task session:
        Task Profile: ${JSON.stringify(profile)}.
        Was completed successfully? ${success ? 'YES' : 'NO (Time ran out / damage control activated)'}.
        
        Provide:
        1. A brief factual summary of what happened.
        2. A professional root cause analysis identifying why they ended up in a crisis (e.g. planning gap, alert fatigue, underestimating effort).
        3. One highly actionable preventive habit/action with a specific Google Calendar event title & duration to schedule to lock this habit in.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whatHappened: { type: Type.STRING },
              rootCause: { type: Type.STRING },
              preventiveAction: {
                type: Type.OBJECT,
                properties: {
                  suggestion: { type: Type.STRING },
                  actionButtonLabel: { type: Type.STRING },
                  calendarEventToSchedule: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      durationMinutes: { type: Type.INTEGER }
                    },
                    required: ['title', 'durationMinutes']
                  }
                },
                required: ['suggestion', 'actionButtonLabel', 'calendarEventToSchedule']
              }
            },
            required: ['whatHappened', 'rootCause', 'preventiveAction']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          geminiUsed: true,
          debrief: parsed
        });
      }
    } catch (err: any) {
      console.error('Gemini debrief failed, using fallback:', err);
    }
  }

  // Fallback Simulation Engine
  const mockDebrief = {
    whatHappened: success
      ? "You executed the Crisis Protocol and finalized the deliverable with 12 minutes to spare before your 5:00 PM deadline."
      : "The deadline was mathematically impossible. You successfully pivoted to Damage Control Mode, sent an extension request, and cleared calendar blocks for a sustainable completion.",
    rootCause: "The session was triggered only 5 hours before the deadline for a high-effort B2B pitch deck. The root cause was a planning gap — work was postponed due to fear of the 'blank page' phase, combined with micro-meetings cluttering the afternoon.",
    preventiveAction: {
      suggestion: "Schedule a recurring 30-minute 'Clutch Prep block' exactly 72 hours before any major calendar deliverable. This activates our Ambient Mode, pre-building your outlines automatically so you never start from blank again.",
      actionButtonLabel: "Schedule 30-minute Prep Blocks",
      calendarEventToSchedule: {
        title: "🛡️ Clutch — Proactive Workspace Prep",
        durationMinutes: 30
      }
    }
  };

  res.json({
    geminiUsed: false,
    debrief: mockDebrief
  });
});

// Serve frontend SPA
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clutch Server listening on port ${PORT}`);
  });
}

startServer();
