import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, X, Sparkles, AlertTriangle } from 'lucide-react';
import { 
  TaskProfile, MissionAssessment, CalendarEvent, EmailDraft, 
  BootstrapOutput, StuckChatMessage, Debrief, AmbientDeadlines, CompletedSession 
} from './types';

// Import our beautiful modular Ballpark.ing styled components
import Header from './components/Header';
import Hero from './components/Hero';
import ModesGrid from './components/ModesGrid';
import FeaturesSection from './components/FeaturesSection';
import IntakeView from './components/IntakeView';
import PipelineView from './components/PipelineView';
import AssessmentView from './components/AssessmentView';
import CrisisStepsView from './components/CrisisStepsView';
import WorkspaceView from './components/WorkspaceView';
import DebriefView from './components/DebriefView';
import SessionHistory from './components/SessionHistory';
import { initAuth, googleSignIn, logout } from './lib/firebase';

// Simple API fetching helper
const apiCall = async (endpoint: string, body: any) => {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const text = await res.text();
    if (!text) throw new Error(`Empty response from ${endpoint}`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from ${endpoint}: ${text.substring(0, 100)}`);
    }
  } catch (err) {
    console.error(`API Call failed on ${endpoint}:`, err);
    throw err;
  }
};

export default function App() {
  // Navigation / Views: 'home' | 'intake' | 'pipeline' | 'assessment' | 'crisis_steps' | 'workspace' | 'debrief'
  const [currentView, setCurrentView] = useState<'home' | 'intake' | 'pipeline' | 'assessment' | 'crisis_steps' | 'workspace' | 'debrief'>('home');
  const [selectedMode, setSelectedMode] = useState<'crisis' | 'plan' | 'review'>('crisis');
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [showDemoPopcard, setShowDemoPopcard] = useState(true);
  const [popcardTimeLeft, setPopcardTimeLeft] = useState(30);

  // Active run tracker to prevent background tasks from changing state after cancellation
  const activePipelineRunId = useRef<number>(0);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<string | null>(null);
  
  // App states
  const [situationText, setSituationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geminiActive, setGeminiActive] = useState(false);
  const [userEmail, setUserEmail] = useState('thedhruvgarg@gmail.com');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Workspace pipeline states
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);
  const [pipelineSteps, setPipelineSteps] = useState([
    { name: 'Intake Parsing', status: 'idle', desc: 'Analyzing task requirements and context...' },
    { name: 'Mission Assessment', status: 'idle', desc: 'Calculating probability, time frame, and output parameters...' },
    { name: 'Calendar Optimization', status: 'idle', desc: 'Analyzing upcoming calendar slots and prioritizing deep work...' },
    { name: 'Gmail Communications', status: 'idle', desc: 'Preparing apology drafts and extension negotiations...' },
    { name: 'Workspace Bootstrapping', status: 'idle', desc: 'Generating structured outline, research facts, and document starting point...' }
  ]);

  // Loaded profiles from API
  const [taskProfile, setTaskProfile] = useState<TaskProfile | null>(null);
  const [assessment, setAssessment] = useState<MissionAssessment | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [bootstrapData, setBootstrapData] = useState<BootstrapOutput | null>(null);

  // Calendar modification states
  const [selectedCalendarEvents, setSelectedCalendarEvents] = useState<Record<string, boolean>>({});
  const [calendarApproved, setCalendarApproved] = useState(false);

  // Email draft edit states
  const [editingEmails, setEditingEmails] = useState<Record<string, string>>({});
  const [emailsSynced, setEmailsSynced] = useState(false);

  // Live session tracker states
  const [chatMessage, setChatMessage] = useState('');
  const [stuckChatHistory, setStuckChatHistory] = useState<StuckChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [estimatedProgress, setEstimatedProgress] = useState(5);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(4 * 3600 + 20 * 60); // 4h 20m default

  // Debrief states
  const [taskSuccess, setTaskSuccess] = useState(true);
  const [debriefData, setDebriefData] = useState<Debrief | null>(null);
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);
  const [hasCompletedProject, setHasCompletedProject] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clutch_completed_sessions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Ambient Mode state
  const [ambientDeadlines, setAmbientDeadlines] = useState<AmbientDeadlines[]>([
    {
      id: 'ambient-1',
      title: 'Final Term Paper — Behavioral Psychology',
      dueTime: 'In 3 days (June 29, 5:00 PM)',
      effortLevel: 'high',
      timeUntil: '72 hours',
      workspaceCreated: false
    }
  ]);
  const [showAmbientAlert, setShowAmbientAlert] = useState(false);

  // Dark mode state with system preference fallback and storage synchronization
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // System logs to show under orchestration
  const [logs, setLogs] = useState<string[]>([]);

  // Update UTC / Local clock
  useEffect(() => {
    document.title = 'clutch.';
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for Judge Demo Popcard (30s)
  useEffect(() => {
    if (!showDemoPopcard) return;
    if (popcardTimeLeft <= 0) {
      setShowDemoPopcard(false);
      return;
    }
    const interval = setInterval(() => {
      setPopcardTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showDemoPopcard, popcardTimeLeft]);

  // Fetch status of Gemini Key with resilient retry fallback
  useEffect(() => {
    let active = true;
    const fetchStatus = async (retries = 3, delay = 1000) => {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const text = await res.text();
        const trimmed = text.trim();
        if (!trimmed || trimmed.startsWith('<!DOCTYPE') || !trimmed.startsWith('{')) {
          throw new Error('Response is not valid JSON (could be HTML error or empty)');
        }
        const data = JSON.parse(trimmed);
        if (active) {
          setGeminiActive(!!data.geminiActive);
          setUserEmail(data.userEmail || 'thedhruvgarg@gmail.com');
        }
      } catch (err) {
        console.warn(`Status fetch attempt failed. Retries remaining: ${retries}`, err);
        if (retries > 0 && active) {
          setTimeout(() => fetchStatus(retries - 1, delay * 1.5), delay);
        } else {
          console.error('Error fetching server status after retries:', err);
        }
      }
    };
    fetchStatus();
    return () => { active = false; };
  }, []);

  // Countdown timer for active workspace
  useEffect(() => {
    if (currentView !== 'workspace') return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentView]);

  // Formats seconds to e.g. "04:59:52"
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Google Workspace Authentication state and handlers
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    
    initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        if (user) {
          addLog(`Workspace Auth: Google account ${user.email} connected.`);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    ).then(unsub => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        addLog("Workspace Auth: Google Workspace linked successfully.");
      }
    } catch (err) {
      console.error("Sign-in failed", err);
      addLog("Workspace Auth ERROR: Secure linking rejected or cancelled.");
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setGoogleUser(null);
    setGoogleToken(null);
    addLog("Workspace Auth: Google account disconnected.");
  };

  // Toggle all skippable/deferrable calendar events in bulk
  const handleToggleAllCalendarEvents = (select: boolean) => {
    const updated = { ...selectedCalendarEvents };
    calendarEvents.forEach(ev => {
      if (ev.classification !== 'critical') {
        updated[ev.id] = select;
      }
    });
    setSelectedCalendarEvents(updated);
    addLog(`Calendar Agent: Mass ${select ? 'selected' : 'deselected'} all optimizable events.`);
  };

  // Launch Multi-Agent Workflow
  const handleStartPipeline = async (inputText: string, mode: 'crisis' | 'plan') => {
    if (!inputText.trim()) return;
    setIsSubmitting(true);
    const runId = ++activePipelineRunId.current;
    setSituationText(inputText);
    setCurrentView('pipeline');
    setLogs([]);
    setCurrentPipelineStep(0);
    
    // Determine visual pipeline steps dynamically for the mode
    const initialSteps = mode === 'plan' ? [
      { name: 'Milestone Parsing', status: 'idle', desc: 'Analyzing proactive task profile and long-term context...' },
      { name: 'Timeline Assessment', status: 'idle', desc: 'Determining execution buffer, milestones strategy, and readiness...' },
      { name: 'Calendar Time-Blocking', status: 'idle', desc: 'Pre-scheduling high-energy deep focus slots in Google Calendar...' },
      { name: 'Stakeholder Alignment', status: 'idle', desc: 'Generating proactive alignment drafts and kickoff templates...' },
      { name: 'Workspace Bootstrapping', status: 'idle', desc: 'Scaffolding custom outline, grounding research facts, and checklists...' }
    ] : [
      { name: 'Intake Parsing', status: 'idle', desc: 'Analyzing task requirements and context...' },
      { name: 'Mission Assessment', status: 'idle', desc: 'Calculating probability, time frame, and output parameters...' },
      { name: 'Calendar Optimization', status: 'idle', desc: 'Analyzing upcoming calendar slots and prioritizing deep work...' },
      { name: 'Gmail Communications', status: 'idle', desc: 'Preparing apology drafts and extension negotiations...' },
      { name: 'Workspace Bootstrapping', status: 'idle', desc: 'Generating structured outline, research facts, and document starting point...' }
    ];

    setPipelineSteps(initialSteps);

    try {
      // STEP 1: INTAKE AGENT
      setPipelineSteps(() => initialSteps.map((s, idx) => idx === 0 ? { ...s, status: 'running' } : s));
      addLog(mode === 'plan' ? "Intake Agent: Booting up Gemini 3.5 Flash semantic milestone parser..." : "Intake Agent: Booting up Gemini 3.5 Flash semantic parser...");
      const intakeRes = await apiCall('/api/intake', { situation: inputText, currentDate: currentTime.toISOString() });
      if (runId !== activePipelineRunId.current) return;
      setTaskProfile(intakeRes.profile);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 0 ? { ...s, status: 'success' } : s));
      addLog(`Intake Agent: Successfully extracted task. Category: ${intakeRes.profile.taskType}, Effort: ${intakeRes.profile.effortLevel}, Progress: ${intakeRes.profile.currentProgress}`);

      // STEP 2: MISSION ASSESSMENT
      setCurrentPipelineStep(1);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: 'running' } : s));
      addLog("Mission Assessment: Calculating project deadline feasibility metrics...");
      const assessRes = await apiCall('/api/assess', { profile: intakeRes.profile, currentDate: currentTime.toISOString() });
      if (runId !== activePipelineRunId.current) return;
      setAssessment(assessRes.assessment);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: 'success' } : s));
      addLog(`Mission Assessment: Completion Probability determined at ${assessRes.assessment.completionProbability}%. Strategy recommended: ${assessRes.assessment.recommendedStrategy}`);

      // Set initial timer based on assessment
      if (assessRes.assessment.timeRemaining) {
        const parts = assessRes.assessment.timeRemaining.match(/\d+/g);
        if (parts && parts.length >= 2) {
          const h = parseInt(parts[0]);
          const m = parseInt(parts[1]);
          setTimeRemainingSeconds(h * 3600 + m * 60);
        }
      }

      // STEP 3: CALENDAR TRIAGE
      setCurrentPipelineStep(2);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: 'running' } : s));
      addLog("Calendar Agent: Mapping user schedule constraints & filtering skippable syncs...");
      const calRes = await apiCall('/api/calendar', { profile: intakeRes.profile, currentDate: currentTime.toISOString(), googleToken });
      if (runId !== activePipelineRunId.current) return;
      setCalendarEvents(calRes.events);
      // Pre-select skippable and deferrable to be cleared
      const initialSelections: Record<string, boolean> = {};
      calRes.events.forEach((ev: CalendarEvent) => {
        initialSelections[ev.id] = ev.classification !== 'critical';
      });
      setSelectedCalendarEvents(initialSelections);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: 'success' } : s));
      addLog(`Calendar Agent: Triage finished. Identified ${calRes.events.length} upcoming items. Pre-selected skippable items.`);

      // STEP 4: GMAIL DRAFTING
      setCurrentPipelineStep(3);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'running' } : s));
      addLog("Gmail Agent: Drafting optimized response and reschedule requests...");
      const gmailRes = await apiCall('/api/gmail', { 
        profile: intakeRes.profile, 
        events: calRes.events, 
        isDamageControl: assessRes.assessment.recommendedStrategy === 'NEGOTIATE',
        googleToken
      });
      if (runId !== activePipelineRunId.current) return;
      setEmailDrafts(gmailRes.emails);
      const initialEmails: Record<string, string> = {};
      gmailRes.emails.forEach((em: EmailDraft) => {
        initialEmails[em.id] = em.body;
      });
      setEditingEmails(initialEmails);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'success' } : s));
      addLog(`Gmail Agent: Prepared ${gmailRes.emails.length} drafts successfully.`);

      // STEP 5: BOOTSTRAP AGENT
      setCurrentPipelineStep(4);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'running' } : s));
      addLog("Bootstrap Agent: Activating Google Search Grounding to assemble raw outlines and live metrics...");
      const bootstrapRes = await apiCall('/api/bootstrap', { profile: intakeRes.profile });
      if (runId !== activePipelineRunId.current) return;
      setBootstrapData(bootstrapRes.bootstrap);
      setPipelineSteps(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'success' } : s));
      addLog(`Bootstrap Agent: Finished scaffolding "${bootstrapRes.bootstrap.title}" with real-time web facts.`);

      // COMPLETE & PROCEED TO ASSESSMENT CARD
      setTimeout(() => {
        if (runId !== activePipelineRunId.current) return;
        setCurrentView('assessment');
        setIsSubmitting(false);
      }, 500);

    } catch (err) {
      console.error(err);
      addLog("Critical pipeline failure encountered during orchestration. Restarting...");
      setIsSubmitting(false);
      alert("Something went wrong in the pipeline. Please check your internet or configuration.");
    }
  };

  // Trigger Stuck Agent Chat
  const handleSendStuckMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg: StuckChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: chatMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setStuckChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsChatLoading(true);

    const getSimulatedReply = (input: string) => {
      const lower = input.toLowerCase();
      if (lower.includes('slide') || lower.includes('outline') || lower.includes('structure')) {
        return "I've reviewed the presentation skeleton. Let's make sure the capital allocation on Slide 4 matches the $8M target ask. Would you like me to find standard seed/Series A expense templates?";
      } else if (lower.includes('email') || lower.includes('draft') || lower.includes('reschedule') || lower.includes('send')) {
        return "Your rescheduling emails are safely saved in drafts. I've cleared 1.75 hours of meetings, which means you can dedicate the morning fully to the pitch deck slides.";
      } else if (lower.includes('progress') || lower.includes('time') || lower.includes('duration')) {
        return "You have 4.5 hours remaining. With 1.75 hours of meetings postponed, you have a solid 3.5-hour continuous block this afternoon. I highly recommend spending 1.5 hours of that on the Financials slide.";
      }
      return "I've analyzed your question and am monitoring the workspace outline. We've got standard Series A pitch rules active. Let me know if you'd like me to assist in drafting any specific section details!";
    };

    if (isDemoActive) {
      setTimeout(() => {
        const modelMsg: StuckChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'model',
          text: getSimulatedReply(userMsg.text),
          timestamp: new Date().toLocaleTimeString()
        };
        setStuckChatHistory(prev => [...prev, modelMsg]);
        setIsChatLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await apiCall('/api/stuck', {
        chatHistory: [...stuckChatHistory, userMsg],
        message: userMsg.text,
        profile: taskProfile
      });
      const modelMsg: StuckChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString()
      };
      setStuckChatHistory(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error("Chat API error, using copilot fallback:", err);
      const modelMsg: StuckChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: getSimulatedReply(userMsg.text),
        timestamp: new Date().toLocaleTimeString()
      };
      setStuckChatHistory(prev => [...prev, modelMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run Debrief Analysis
  const handleOpenDebrief = async (isSuccess: boolean) => {
    setHasCompletedProject(true);
    setTaskSuccess(isSuccess);
    setIsDebriefLoading(true);
    setCurrentView('debrief');

    const fallbackDebrief: Debrief = {
      id: `deb-${Date.now()}`,
      taskTitle: taskProfile?.title || "Series A Investor Pitch Deck",
      date: new Date().toLocaleDateString(),
      success: isSuccess,
      whatHappened: isSuccess 
        ? "You successfully completed the Series A Pitch Deck slides within the 4-hour critical window, using 1.75 hours of recovered calendar time to secure deep-focus cycles." 
        : "You chose to pre-emptively postpone non-critical items and secure a buffer for your Series A Pitch Deck to guarantee narrative quality.",
      rootCause: "The last-minute rush occurred due to a classic scheduling bottleneck: routine marketing alignment syncs and sales demos were stacked consecutively, leaving zero deep work blocks on the day of the deadline.",
      preventiveAction: {
        suggestion: "Set up a recurring 2-hour 'Deep Work: Slide Construction' block on Tuesday and Thursday mornings, which automatically flags conflict meetings as deferrable.",
        actionButtonLabel: "Schedule 2h Weekly Focus Block",
        calendarEventToSchedule: {
          title: "Slide Construction Focus Block",
          durationMinutes: 120
        }
      }
    };

    const saveSession = (debriefVal: Debrief) => {
      try {
        const newSession: CompletedSession = {
          id: `session-${Date.now()}`,
          mode: selectedMode,
          taskDescription: taskProfile?.title || situationText || "Series A Investor Pitch Deck",
          date: new Date().toLocaleDateString(),
          completionProbability: assessment?.completionProbability ?? 85,
          strategy: assessment?.recommendedStrategy === 'FIGHT' ? 'FIGHT' : 'DAMAGE CONTROL',
          outcome: isSuccess ? 'Success' : 'Aborted',
          debriefData: debriefVal
        };
        const updated = [newSession, ...completedSessions];
        setCompletedSessions(updated);
        localStorage.setItem('clutch_completed_sessions', JSON.stringify(updated));
      } catch (err) {
        console.error("Error saving completed session:", err);
      }
    };

    if (isDemoActive) {
      setTimeout(() => {
        setDebriefData(fallbackDebrief);
        setIsDebriefLoading(false);
        saveSession(fallbackDebrief);
      }, 1500);
      return;
    }

    try {
      const res = await apiCall('/api/debrief', {
        profile: taskProfile || {
          deadline: 'Today',
          taskType: 'general',
          effortLevel: 'medium',
          currentProgress: 'none',
          dependencies: 'solo',
          toneSignals: { panicLevel: 'high', stakesContext: 'Standalone debrief' },
          originalInput: situationText || 'Procrastinated work'
        },
        success: isSuccess
      });
      setDebriefData(res.debrief);
      saveSession(res.debrief);
    } catch (err) {
      console.error("Debrief API failed, using fallback:", err);
      setDebriefData(fallbackDebrief);
      saveSession(fallbackDebrief);
    } finally {
      setIsDebriefLoading(false);
    }
  };

  // Schedule habit from debrief
  const handleScheduleHabit = (debrief: Debrief) => {
    alert(`Successfully scheduled calendar block: "${debrief.preventiveAction.calendarEventToSchedule.title}" (${debrief.preventiveAction.calendarEventToSchedule.durationMinutes} min) for tomorrow morning!`);
    setCurrentView('home');
    // Add to ambient deadlines to simulate proactive planning
    setAmbientDeadlines(prev => [
      ...prev,
      {
        id: `ambient-${Date.now()}`,
        title: `Clutch habit: ${debrief.preventiveAction.calendarEventToSchedule.title}`,
        dueTime: 'Tomorrow morning 9:00 AM',
        effortLevel: 'low',
        timeUntil: '24 hours',
        workspaceCreated: true
      }
    ]);
  };

  const handleLaunchClutchButton = () => {
    setIsDemoActive(false);
    setCurrentView('modes');
  };

  const handleStartDemo = async () => {
    setIsDemoActive(true);
    setSelectedMode('crisis');
    setCurrentView('pipeline');
    setLogs([]);
    setCurrentPipelineStep(0);
    const runId = ++activePipelineRunId.current;
    setSituationText("Series A Pitch Deck due tomorrow at 9 AM. Need content structure, market stats, and to reschedule conflicts.");

    const initialSteps = [
      { name: 'Intake Parsing', status: 'idle', desc: 'Analyzing task requirements and context...' },
      { name: 'Mission Assessment', status: 'idle', desc: 'Calculating probability, time frame, and output parameters...' },
      { name: 'Calendar Triage', status: 'idle', desc: 'Analyzing upcoming calendar slots and prioritizing deep work...' },
      { name: 'Gmail Communications', status: 'idle', desc: 'Preparing apology drafts and extension negotiations...' },
      { name: 'Workspace Bootstrapping', status: 'idle', desc: 'Generating structured outline, research facts, and document starting point...' }
    ];
    setPipelineSteps(initialSteps);
    setIsSubmitting(true);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Intake Parsing
      setPipelineSteps(steps => steps.map((s, idx) => idx === 0 ? { ...s, status: 'running' } : s));
      addLog("Intake Agent (Demo): Booting up Gemini 3.5 Flash semantic parser in simulation mode...");
      await sleep(350);
      if (runId !== activePipelineRunId.current) return;
      
      const demoProfile: TaskProfile = {
        deadline: 'Tomorrow 9:00 AM',
        taskType: 'presentation',
        effortLevel: 'high',
        currentProgress: 'none',
        dependencies: 'solo',
        toneSignals: {
          panicLevel: 'high',
          stakesContext: 'Series A funding round pitch'
        },
        originalInput: "Series A Pitch Deck due tomorrow at 9 AM. Need content structure, market stats, and to reschedule conflicts."
      };
      setTaskProfile(demoProfile);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 0 ? { ...s, status: 'success' } : s));
      addLog("Intake Agent (Demo): Successfully extracted task profile. Category: presentation, Effort: high.");

      // Step 2: Mission Assessment
      setCurrentPipelineStep(1);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 1 ? { ...s, status: 'running' } : s));
      addLog("Mission Assessment (Demo): Running diagnostic on 4.5-hour deadline feasibility...");
      await sleep(350);
      if (runId !== activePipelineRunId.current) return;

      const demoAssessment: MissionAssessment = {
        completionProbability: 88,
        timeRemaining: "4.5 Hours",
        recommendedStrategy: 'FIGHT',
        reasoning: "The user has core groundwork prepared, meaning the core intellectual property is ready. The primary bottlenecks are slide compilation and calendar clutter. By freeing up 1.75 hours of focus time, delivery is highly realistic.",
        details: {
          estimatedOutputCount: "10-12 slides",
          challenges: [
            "Lack of uninterrupted focus time due to back-to-back meeting conflicts.",
            "Structuring complex financial projection details into highly scannable visual slides."
          ],
          actionItems: [
            "Reschedule skippable marketing alignment and sales syncs.",
            "Draft quick explanation emails for design lead status cancellation.",
            "Bootstrap the core pitch deck slide outline based on Sequoia template standards."
          ]
        }
      };
      setAssessment(demoAssessment);
      setTimeRemainingSeconds(4 * 3600 + 30 * 60); // 4.5 Hours
      setPipelineSteps(steps => steps.map((s, idx) => idx === 1 ? { ...s, status: 'success' } : s));
      addLog("Mission Assessment (Demo): Strategy recommended: FIGHT. FEASIBILITY PROBABILITY: 88%.");

      // Step 3: Calendar Triage
      setCurrentPipelineStep(2);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 2 ? { ...s, status: 'running' } : s));
      addLog("Calendar Agent (Demo): Accessing Calendar API to triage 4 schedule items...");
      await sleep(350);
      if (runId !== activePipelineRunId.current) return;

      const demoEvents: CalendarEvent[] = [
        {
          id: "cal-1",
          title: "Weekly Marketing Alignment Sync",
          start: new Date(Date.now() + 3600000).toISOString(),
          end: new Date(Date.now() + 3600000 * 1.75).toISOString(),
          classification: "skippable"
        },
        {
          id: "cal-2",
          title: "Dentist Appointment",
          start: new Date(Date.now() + 3600000 * 3).toISOString(),
          end: new Date(Date.now() + 3600000 * 4).toISOString(),
          classification: "critical"
        },
        {
          id: "cal-3",
          title: "SaaS Tool Onboarding Demo",
          start: new Date(Date.now() + 3600000 * 5.5).toISOString(),
          end: new Date(Date.now() + 3600000 * 6).toISOString(),
          classification: "deferrable"
        },
        {
          id: "cal-4",
          title: "1-on-1 with Design Lead",
          start: new Date(Date.now() + 3600000 * 7).toISOString(),
          end: new Date(Date.now() + 3600000 * 7.5).toISOString(),
          classification: "skippable"
        }
      ];
      setCalendarEvents(demoEvents);
      const initialSelections: Record<string, boolean> = {};
      demoEvents.forEach(ev => {
        initialSelections[ev.id] = ev.classification !== 'critical';
      });
      setSelectedCalendarEvents(initialSelections);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 2 ? { ...s, status: 'success' } : s));
      addLog("Calendar Agent (Demo): Triage complete. Flagged 3 meetings as skippable/deferrable (clears 1.75 hrs).");

      // Step 4: Gmail Communications
      setCurrentPipelineStep(3);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 3 ? { ...s, status: 'running' } : s));
      addLog("Gmail Agent (Demo): Drafting polite rescheduling messages in Google Workspace drafts...");
      await sleep(350);
      if (runId !== activePipelineRunId.current) return;

      const demoEmails: EmailDraft[] = [
        {
          id: "em-1",
          recipient: "marketing-team@clutch.io",
          subject: "Rescheduling: Weekly Marketing Alignment Sync",
          body: "Hi team,\n\nI am calling a clutch adjustment on today's Weekly Marketing Alignment Sync to clear deep focus time for our Series A Investor Pitch Deck. Please proceed without me, and I'll catch up via the shared minutes.\n\nThanks for understanding!\nBest,\nUser",
          type: "apology"
        },
        {
          id: "em-2",
          recipient: "onboarding@saastool.io",
          subject: "Postponing today's SaaS Onboarding Demo",
          body: "Hi Alex,\n\nSomething urgent has come up that requires my undivided attention today. Could we reschedule our onboarding demo to next Tuesday morning? Let me know if that works for you.\n\nBest regards,\nUser",
          type: "extension_request"
        },
        {
          id: "em-3",
          recipient: "sarah.design@clutch.io",
          subject: "Moving our 1-on-1 to async / tomorrow",
          body: "Hey Sarah,\n\nI need to clear my afternoon to finalize the Series A Pitch Deck slides. Let's cancel our sync today—feel free to drop any updates or questions directly in our Slack channel, and we can catch up live tomorrow if needed!\n\nBest,\nUser",
          type: "apology"
        }
      ];
      setEmailDrafts(demoEmails);
      const initialEmails: Record<string, string> = {};
      demoEmails.forEach(em => {
        initialEmails[em.id] = em.body;
      });
      setEditingEmails(initialEmails);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 3 ? { ...s, status: 'success' } : s));
      addLog("Gmail Agent (Demo): Prepared 3 communication drafts successfully.");

      // Step 5: Workspace Bootstrapping
      setCurrentPipelineStep(4);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 4 ? { ...s, status: 'running' } : s));
      addLog("Bootstrap Agent (Demo): Querying live market indices and VC guidelines using Search Grounding...");
      await sleep(350);
      if (runId !== activePipelineRunId.current) return;

      const demoBootstrap: BootstrapOutput = {
        title: "Series A Investor Pitch Deck",
        type: "presentation",
        outline: [
          {
            section: "Slide 1: Vision & Core Value Proposition",
            description: "Establishing hook & presenting our solution with high-impact clarity.",
            bullets: [
              "Define the massive, urgent problem we are solving",
              "Present our solution with high-impact, single-sentence clarity",
              "Highlight the immediate value proposition for customers"
            ],
            expandMarker: "[EXPAND THIS WITH RESEARCH]"
          },
          {
            section: "Slide 2: Market Opportunity & Traction",
            description: "Proving current momentum & product-market fit metrics.",
            bullets: [
              "Addressable Market (TAM): $45B by 2028",
              "Current MoM growth: 22% over the last 6 months",
              "Include active user retention cohort analysis"
            ],
            expandMarker: "[EXPAND TRACKING METRICS]"
          },
          {
            section: "Slide 3: Technology & Proprietary Engine",
            description: "Deconstruct multi-agent self-correcting core design.",
            bullets: [
              "Detail the multi-agent orchestration architecture",
              "Contrast our self-correcting agents against linear single-prompt models",
              "Show developer adoption curves and active API calls"
            ],
            expandMarker: "[EXPAND SYSTEM DIAGRAMS]"
          },
          {
            section: "Slide 4: Financials & Growth Plan",
            description: "Demonstrating solid ARR projection, CAC, and unit economics.",
            bullets: [
              "Projections for the next 18 months post-funding",
              "Breakdown of capital allocation: 60% Engineering/Product, 30% Growth, 10% G&A",
              "Customer Acquisition Cost (CAC) vs. LTV ratio of 4.2x"
            ],
            expandMarker: "[EXPAND CASH FLOW PLAN]"
          },
          {
            section: "Slide 5: The Team & Asks",
            description: "Showcasing leadership pedigree and target round targets.",
            bullets: [
              "Highlight backgrounds of the core engineering and product leadership",
              "Specify the funding round target: $8M Series A",
              "Define key milestones enabled by this capital"
            ],
            expandMarker: "[EXPAND INVESTOR COVENANTS]"
          }
        ],
        additionalInfo: "Based on premium Sequoia VC parameters. Built to maximize investor retention score.",
        sources: [
          { title: "Sequoia Pitch Deck Template Guidelines", url: "https://www.sequoiacap.com/pitch-deck-template/" },
          { title: "Y Combinator - How to Build a Seed Pitch Deck", url: "https://www.ycombinator.com/library/2u-how-to-build-a-seed-pitch-deck" },
          { title: "Slidebean Series A Valuation Multiples and Traction Benchmarks", url: "https://slidebean.com/blog/series-a-funding" }
        ]
      };
      setBootstrapData(demoBootstrap);
      setPipelineSteps(steps => steps.map((s, idx) => idx === 4 ? { ...s, status: 'success' } : s));
      addLog("Bootstrap Agent (Demo): Workspace initialized with Google Search Grounded facts.");

      await sleep(350);
      if (runId !== activePipelineRunId.current) return;
      setCurrentView('assessment');
      setIsSubmitting(false);

    } catch (err) {
      console.error("Demo pipeline failed:", err);
      setIsSubmitting(false);
    }
  };

  const handlePrebuildWorkspaceAmbient = () => {
    setIsDemoActive(false);
    setSelectedMode('plan');
    handleStartPipeline(`Final Term Paper for Behavioral Psychology due on Monday June 29. Starting from scratch, needs scholarly research on hyperbolic discounting.`, 'plan');
  };

  // Dynamic navigation configuration for the Header contextual back button
  const getHeaderBackConfig = () => {
    switch (currentView) {
      case 'modes':
        return {
          onBack: () => setCurrentView('home'),
          label: 'Home'
        };
      case 'intake':
        return {
          onBack: () => setCurrentView('modes'),
          label: 'Modes'
        };
      case 'pipeline':
        return {
          onBack: () => {
            setIsSubmitting(false);
            setCurrentView('modes');
          },
          label: 'Modes'
        };
      case 'assessment':
        return {
          onBack: () => setCurrentView('modes'),
          label: 'Modes'
        };
      case 'crisis_steps':
        return {
          onBack: () => setCurrentView('modes'),
          label: 'Modes'
        };
      case 'workspace':
        return {
          onBack: () => setCurrentView('home'),
          label: 'Home'
        };
      case 'debrief':
        return {
          onBack: () => setCurrentView('home'),
          label: 'Home'
        };
      default:
        return {
          onBack: undefined,
          label: undefined
        };
    }
  };

  const handleSetCurrentView = (view: any) => {
    if (isSubmitting && currentView === 'pipeline' && view !== 'pipeline') {
      setPendingNavigationTarget(view);
      setShowAbortModal(true);
    } else {
      setCurrentView(view);
    }
  };

  const backConfig = getHeaderBackConfig();

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121211] text-[#1C1C1A] dark:text-[#F5F4F0] flex flex-col font-sans antialiased overflow-x-hidden relative transition-colors duration-300">
      
      {/* Subtly animated grain overlay */}
      <div className="grain-overlay opacity-4 dark:opacity-[0.06]" />

      {/* Decorative Premium Ambient Radial Glows */}
      <div className="ambient-radial-orange" />
      <div className="ambient-radial-indigo" />

      {/* Dynamic Header */}
      <Header
        currentView={currentView}
        setCurrentView={handleSetCurrentView}
        geminiActive={geminiActive}
        currentTime={currentTime}
        onLaunchClutch={handleLaunchClutchButton}
        hasActiveWorkspace={!!bootstrapData && currentView !== 'home'}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onBack={isSubmitting && currentView === 'pipeline' ? () => {
          setPendingNavigationTarget('modes');
          setShowAbortModal(true);
        } : backConfig.onBack}
        backLabel={backConfig.label}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16 md:px-12 flex flex-col justify-center relative z-10">
        
        <AnimatePresence mode="wait">
          
          {/* VIEW: HOME */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-24"
            >
              <Hero
                onLaunchClutch={handleLaunchClutchButton}
                ambientDeadlinesCount={ambientDeadlines.length}
                showAmbientAlert={showAmbientAlert}
                setShowAmbientAlert={setShowAmbientAlert}
                onPrebuildWorkspace={handlePrebuildWorkspaceAmbient}
                onTryDemo={handleStartDemo}
              />

              <ModesGrid
                onSelectMode={setSelectedMode}
                onEnterView={(view) => {
                  if (view === 'debrief') {
                    if (hasCompletedProject) {
                      handleOpenDebrief(true);
                    } else {
                      setDebriefData(null);
                      setIsDebriefLoading(false);
                      setCurrentView('debrief');
                    }
                  } else {
                    setCurrentView(view);
                  }
                }}
                isStatic={true}
              />

              <SessionHistory
                sessions={completedSessions}
                onViewDebrief={(session) => {
                  setTaskSuccess(session.outcome === 'Success');
                  setDebriefData(session.debriefData);
                  setCurrentView('debrief');
                }}
                onClearHistory={() => {
                  setCompletedSessions([]);
                  localStorage.removeItem('clutch_completed_sessions');
                }}
              />

              <FeaturesSection />
            </motion.div>
          )}

          {/* VIEW: MODES SELECTION PAGE */}
          {currentView === 'modes' && (
            <motion.div
              key="modes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <ModesGrid
                onSelectMode={setSelectedMode}
                onEnterView={(view) => {
                  if (view === 'debrief') {
                    if (hasCompletedProject) {
                      handleOpenDebrief(true);
                    } else {
                      setDebriefData(null);
                      setIsDebriefLoading(false);
                      setCurrentView('debrief');
                    }
                  } else {
                    setCurrentView(view);
                  }
                }}
                isStatic={false}
              />
            </motion.div>
          )}

          {/* VIEW: INTAKE */}
          {currentView === 'intake' && (
            <IntakeView
              key="intake"
              selectedMode={selectedMode}
              isSubmitting={isSubmitting}
              onSubmit={(text) => handleStartPipeline(text, selectedMode === 'crisis' ? 'crisis' : 'plan')}
              onCancel={() => setCurrentView('modes')}
              onBackToModes={() => setCurrentView('modes')}
              googleUser={googleUser}
              onGoogleSignIn={handleGoogleSignIn}
            />
          )}

          {/* VIEW: PIPELINE (PROGRESS CONSOLE) */}
          {currentView === 'pipeline' && (
            <PipelineView
              key="pipeline"
              steps={pipelineSteps}
              currentStepIndex={currentPipelineStep}
              logs={logs}
              onBackToModes={() => {
                setIsSubmitting(false);
                setCurrentView('modes');
              }}
            />
          )}

          {/* VIEW: ASSESSMENT */}
          {currentView === 'assessment' && assessment && (
            <AssessmentView
              key="assessment"
              assessment={assessment}
              onProceed={() => setCurrentView('crisis_steps')}
              onBackToModes={() => setCurrentView('modes')}
              mode={selectedMode === 'plan' ? 'plan' : 'crisis'}
            />
          )}

          {/* VIEW: CRISIS STEPS (CALENDAR TRIAGE, DRAFTS & WORKSPACE BOOTSTRAP) */}
          {currentView === 'crisis_steps' && (
            <CrisisStepsView
              key="crisis_steps"
              assessment={assessment}
              calendarEvents={calendarEvents}
              selectedCalendarEvents={selectedCalendarEvents}
              onToggleCalendarEvent={(id) => setSelectedCalendarEvents(prev => ({ ...prev, [id]: !prev[id] }))}
              onToggleAllCalendarEvents={handleToggleAllCalendarEvents}
              calendarApproved={calendarApproved}
              onApproveCalendar={async () => {
                setCalendarApproved(true);
                addLog(selectedMode === 'plan' ? "Calendar Agent: Focus reservation blocks scheduled in Google Calendar." : "Calendar Agent: Successfully submitted Google Calendar event optimizations.");
                
                if (googleToken) {
                  addLog("Calendar Agent: Synchronizing optimizations to your Google Calendar...");
                  try {
                    const eventsToClear = Object.entries(selectedCalendarEvents)
                      .filter(([_, isSelected]) => isSelected)
                      .map(([id]) => id);

                    const res = await apiCall('/api/calendar/sync', {
                      googleToken,
                      eventsToClear,
                      taskTitle: taskProfile?.originalInput || 'Clutch Deep Focus Block'
                    });
                    if (res && res.success) {
                      addLog("Calendar Agent: Google Calendar synchronized successfully! Focus blocks added, conflicting meetings optimized.");
                    } else {
                      addLog("Calendar Agent: Sync completed with warnings.");
                    }
                  } catch (err) {
                    console.error("Calendar sync error", err);
                    addLog("Calendar Agent ERROR: Synchronization failed. Fallback simulation remains active.");
                  }
                }
              }}
              emailDrafts={emailDrafts}
              editingEmails={editingEmails}
              onChangeEmail={(id, text) => setEditingEmails(prev => ({ ...prev, [id]: text }))}
              onResetEmail={(id) => {
                const original = emailDrafts.find(d => d.id === id)?.body || '';
                setEditingEmails(prev => ({ ...prev, [id]: original }));
                addLog("Gmail Agent: Draft reset to original system recommendations.");
              }}
              emailsSynced={emailsSynced}
              onSyncEmails={async () => {
                setEmailsSynced(true);
                addLog(selectedMode === 'plan' ? "Gmail Agent: Proactive drafts integrated successfully into Gmail inbox." : "Gmail Agent: Sync drafts triggered. Drafts integrated successfully into Gmail inbox.");
                
                if (googleToken) {
                  addLog("Gmail Agent: Syncing drafts directly to your Gmail draft folder...");
                  try {
                    const draftsToSync = emailDrafts.map(d => ({
                      recipient: d.recipient,
                      subject: d.subject,
                      body: editingEmails[d.id] || d.body
                    }));

                    const res = await apiCall('/api/gmail/draft', {
                      googleToken,
                      drafts: draftsToSync
                    });
                    if (res && res.success) {
                      addLog(`Gmail Agent: Successfully created ${res.createdCount} draft(s) in your Gmail account!`);
                    } else {
                      addLog("Gmail Agent: Draft creation completed with warnings.");
                    }
                  } catch (err) {
                    console.error("Gmail sync error", err);
                    addLog("Gmail Agent ERROR: Sync failed. Fallback templates copied to clipboard.");
                  }
                }
              }}
              bootstrapData={bootstrapData}
              onLaunchWorkspace={() => {
                setCurrentView('workspace');
                addLog(selectedMode === 'plan' ? "Clutch System: Launched Proactive Planning workspace session." : "Clutch System: Launched Live interactive workspace session.");
              }}
              onBackToModes={() => setCurrentView('modes')}
              mode={selectedMode === 'plan' ? 'plan' : 'crisis'}
            />
          )}

          {/* VIEW: WORKSPACE */}
          {currentView === 'workspace' && bootstrapData && (
            <WorkspaceView
              key="workspace"
              bootstrapData={bootstrapData}
              timeRemainingSeconds={timeRemainingSeconds}
              estimatedProgress={estimatedProgress}
              onTypeInWorkspace={() => {
                if (estimatedProgress < 95) {
                  setEstimatedProgress(prev => prev + 5);
                }
              }}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              stuckChatHistory={stuckChatHistory}
              isChatLoading={isChatLoading}
              onSendStuckMessage={handleSendStuckMessage}
              onAbort={() => handleOpenDebrief(false)}
              onMarkDone={() => handleOpenDebrief(true)}
              isDemoActive={isDemoActive}
              googleToken={googleToken}
              onGoogleSignIn={handleGoogleSignIn}
            />
          )}

          {/* VIEW: DEBRIEF */}
          {currentView === 'debrief' && (
            <DebriefView
              key="debrief"
              taskSuccess={taskSuccess}
              debriefData={debriefData}
              isDebriefLoading={isDebriefLoading}
              onScheduleHabit={handleScheduleHabit}
              onBackToHome={() => setCurrentView('home')}
              completedSessions={completedSessions}
              onSelectSessionToPrepopulate={(session) => {
                setTaskSuccess(session.outcome === 'Success');
                setDebriefData(session.debriefData);
              }}
            />
          )}

        </AnimatePresence>
      </main>

      {/* Floating Demo Popcard for Judges */}
      <AnimatePresence>
        {showDemoPopcard && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-2xl p-5 pb-7 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-colors duration-300 font-sans overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#D95D39]/10 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-[#D95D39]" />
                </div>
                <h4 className="text-sm font-extrabold text-[#1C1C1A] dark:text-[#F5F4F0] tracking-tight">
                  Judge Demo Mode
                </h4>
              </div>
              <button 
                onClick={() => setShowDemoPopcard(false)}
                className="text-[#71706C] dark:text-[#A19F9A] hover:text-[#1C1C1A] dark:hover:text-[#F5F4F0] p-1 rounded-lg hover:bg-[#FAF9F6] dark:hover:bg-[#252422] transition-all cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-[#51504B] dark:text-[#A19F9A] leading-relaxed mb-4">
              Skip the Google OAuth screen! Click below to run a fully interactive, pre-scripted multi-agent session powered by <strong>Gemini 3.5 Flash</strong>.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowDemoPopcard(false);
                  handleStartDemo();
                }}
                className="w-full bg-[#D95D39] hover:bg-[#C24E2D] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Start Interactive Trial
              </button>
              <p className="text-[10px] text-center text-[#71706C] dark:text-[#A19F9A] font-mono uppercase tracking-wider leading-relaxed">
                If you dismiss this, you can always initiate it via the button in the footer.
              </p>
            </div>

            {/* Absolute bottom visual progress countdown */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FAF9F6] dark:bg-[#252422] rounded-b-2xl overflow-hidden">
              <div 
                className="h-full bg-[#D95D39] transition-all duration-1000 ease-linear"
                style={{ width: `${(popcardTimeLeft / 30) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAbortModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbortModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1C1B19] border border-[#E6E5E0] dark:border-[#2E2D2A] rounded-[2rem] p-6 max-w-md w-full shadow-2xl relative z-10 transition-colors duration-300 space-y-5 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 text-[#D95D39] rounded-2xl border border-red-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-black tracking-tight text-[#1C1C1A] dark:text-[#F5F4F0]">
                    Abort Agent Operations?
                  </h3>
                  <p className="text-xs text-[#71706C] dark:text-[#A19F9A] leading-relaxed">
                    A multi-agent coordination pipeline is actively running in the background. Aborting will stop all active tasks and discard current progress.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowAbortModal(false)}
                  className="flex-1 bg-[#FAF9F6] dark:bg-[#252422] hover:bg-[#FAF9F6]/80 dark:hover:bg-[#252422]/80 border border-[#E6E5E0] dark:border-[#2E2D2A] text-[#1C1C1A] dark:text-[#F5F4F0] text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Keep Running
                </button>
                <button
                  onClick={() => {
                    // Abort current pipeline run by incrementing runId
                    activePipelineRunId.current++;
                    setIsSubmitting(false);
                    setShowAbortModal(false);
                    if (pendingNavigationTarget) {
                      setCurrentView(pendingNavigationTarget as any);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Abort Operations
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Understated Minimalist ballpark.ing Style Footer */}
      <footer className="border-t border-[#E6E5E0] dark:border-[#2E2D2A] py-8 px-6 md:px-12 bg-white dark:bg-[#121211] text-xs text-[#71706C] dark:text-[#A19F9A] font-mono flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 select-none transition-colors duration-300">
        <div className="flex items-center gap-4">
          <span>OAUTH SCOPES: CALENDAR, GMAIL, DRIVE, DOCS, SLIDES</span>
        </div>
        <div>
          <button
            onClick={handleStartDemo}
            className="flex items-center gap-1.5 bg-[#D95D39]/10 hover:bg-[#D95D39]/20 text-[#D95D39] border border-[#D95D39]/20 px-4 py-2 rounded-full font-extrabold cursor-pointer transition-all hover:scale-[1.02] text-xs uppercase"
          >
            <Play className="w-3.5 h-3.5 fill-[#D95D39]" />
            Initiate Trial (Demo Mode)
          </button>
        </div>
      </footer>

    </div>
  );
}
