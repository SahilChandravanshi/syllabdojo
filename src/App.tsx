import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { BarChart3, Check, ChevronDown, Download, Home, Info, MoreHorizontal, Moon, RotateCcw, Search, Sun, Upload, X } from "lucide-react";
import { EXAMS, EXAM_TOPIC_IDS, TOPICS, DATA_VERSION } from "./data";

type Store = {
  completed: string[];
  activity: Record<string, number>;
  activityByExam?: Record<string, Record<string, number>>;
  activityTopicsByExam?: Record<string, Record<string, string[]>>;
};

const KEY = "syllabdojo.progress.v1";
const SELECTED_EXAMS_KEY = "syllabdojo.selected-exams.v1";
const VIEW_STATE_KEY = "syllabdojo.view.v1";
const emptyStore: Store = { completed: [], activity: {}, activityByExam: {} };

function loadTheme(): "dark" | "light" {
  return localStorage.getItem("syllabdojo.theme") === "light" ? "light" : "dark";
}

function loadSelectedExams(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SELECTED_EXAMS_KEY) || "");
    return Array.isArray(parsed) && parsed.length ? parsed.filter((id:string) => EXAMS.some(e => e.id === id)) : EXAMS.slice(0, 3).map(e => e.id);
  } catch {
    return EXAMS.slice(0, 3).map(e => e.id);
  }
}

function loadViewState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VIEW_STATE_KEY) || "");
    return {
      screen: parsed.screen === "exam" || parsed.screen === "analytics" || parsed.screen === "more" ? parsed.screen : "home",
      selectedExam: EXAMS.some(e => e.id === parsed.selectedExam) ? parsed.selectedExam : EXAMS[0].id,
      openCategory: typeof parsed.openCategory === "string" ? parsed.openCategory : null
    } as const;
  } catch {
    return {screen:"home" as const, selectedExam:EXAMS[0].id, openCategory:null};
  }
}

function loadStore(): Store {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "");
    return { completed: Array.isArray(parsed.completed) ? parsed.completed : [], activity: parsed.activity || {}, activityByExam: parsed.activityByExam || {}, activityTopicsByExam: parsed.activityTopicsByExam || {} };
  } catch { return emptyStore; }
}

function today() {
  return new Date().toISOString().slice(0,10);
}

function App() {
  const initialView = loadViewState();
  const [store, setStore] = useState<Store>(loadStore);
  const [screen, setScreen] = useState<"home"|"exam"|"analytics"|"more">(initialView.screen);
  const [selectedExam, setSelectedExam] = useState(initialView.selectedExam);
  const [selectedExams, setSelectedExams] = useState<string[]>(loadSelectedExams);
  const [examSelectorOpen, setExamSelectorOpen] = useState(false);
  const [examSearch, setExamSearch] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(initialView.openCategory);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<"dark"|"light">(loadTheme);

  // Keep in-app navigation in browser history so Back returns to the previous app screen.
  useEffect(() => {
    const current = { screen, selectedExam, openCategory, syllabdojo: true };
    window.history.replaceState(current, "", window.location.href);
    window.history.pushState(current, "", window.location.href);
    const onPopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.syllabdojo && ["home", "exam", "analytics", "more"].includes(state.screen)) {
        setScreen(state.screen);
        if (typeof state.selectedExam === "string" && EXAMS.some(e => e.id === state.selectedExam)) setSelectedExam(state.selectedExam);
        setOpenCategory(typeof state.openCategory === "string" ? state.openCategory : null);
        // Keep Back on the dashboard inside the app rather than leaving the site.
        if (state.screen === "home") window.history.pushState(state, "", window.location.href);
      } else {
        setScreen("home");
        setOpenCategory(null);
        const homeState = { screen: "home", selectedExam, openCategory: null, syllabdojo: true };
        window.history.pushState(homeState, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // Register once; event state carries the destination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navigate(nextScreen: "home"|"exam"|"analytics"|"more", nextExam = selectedExam, nextCategory: string | null = openCategory) {
    const state = { screen: nextScreen, selectedExam: nextExam, openCategory: nextCategory, syllabdojo: true };
    window.history.pushState(state, "", window.location.href);
    setSelectedExam(nextExam);
    setOpenCategory(nextCategory);
    setScreen(nextScreen);
  }

  // Lock the document while the exam picker sheet is open so the page behind it cannot scroll.
  useEffect(() => {
    if (!examSelectorOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [examSelectorOpen]);

  useEffect(() => {
    localStorage.setItem(VIEW_STATE_KEY, JSON.stringify({screen, selectedExam, openCategory}));
  }, [screen, selectedExam, openCategory]);

  function toggleHomeExam(id: string) {
    setSelectedExams(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      if (!next.length) return prev;
      localStorage.setItem(SELECTED_EXAMS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("syllabdojo.theme", next);
  }

  const completed = new Set<string>(store.completed);

  function persist(next: Store) {
    setStore(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function toggleTopic(id: string, examId = selectedExam) {
    const next = new Set(store.completed);
    const wasDone = next.has(id);
    wasDone ? next.delete(id) : next.add(id);
    const activity = { ...store.activity };
    const activityByExam = { ...(store.activityByExam || {}) };
    const activityTopicsByExam = { ...(store.activityTopicsByExam || {}) };
    if (!wasDone) {
      activity[today()] = (activity[today()] || 0) + 1;
      const examActivity = { ...(activityByExam[examId] || {}) };
      examActivity[today()] = (examActivity[today()] || 0) + 1;
      activityByExam[examId] = examActivity;
      const examTopics = { ...(activityTopicsByExam[examId] || {}) };
      examTopics[today()] = [...(examTopics[today()] || []), id];
      activityTopicsByExam[examId] = examTopics;
    }
    persist({ completed: [...next], activity, activityByExam, activityTopicsByExam });
  }

  function reset() {
    if (!confirm("Reset all progress? This cannot be undone unless you have an export.")) return;
    persist(emptyStore);
  }

  function exportData() {
    const payload = { app: "SyllabDojo", version: 1, dataVersion: DATA_VERSION, exportedAt: new Date().toISOString(), ...store };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="syllabdojo-progress.json"; a.click();
    URL.revokeObjectURL(url);
    notify("Progress exported");
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.completed)) throw new Error();
        const valid = parsed.completed.filter((id:string) => TOPICS.some(t=>t.id===id));
        persist({ completed: valid, activity: parsed.activity || {}, activityByExam: parsed.activityByExam || {}, activityTopicsByExam: parsed.activityTopicsByExam || {} });
        notify("Progress imported");
      } catch { notify("Invalid progress file"); }
    };
    reader.readAsText(file);
  }

  function notify(message:string) {
    setToast(message);
    setTimeout(()=>setToast(""), 1800);
  }

  const totalUnique = TOPICS.length;
  const globalProgress = Math.round(completed.size / totalUnique * 100);

  const examProgress = (examId:string) => {
    const ids = EXAM_TOPIC_IDS[examId] || [];
    return ids.length ? Math.round(ids.filter(id=>completed.has(id)).length / ids.length * 100) : 0;
  };

  return (
    <div className={`app ${theme}`}>
      <header className="topbar">
        <button className="brand" onClick={()=>navigate("home", selectedExam, null)}>
          <span className="brand-mark">S</span>
          <span>Syllab<span>Dojo</span></span>
        </button>
        <button aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className={`theme-btn ${theme}`} onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </header>

      <main>
        {screen==="home" && <HomeScreen completed={completed} globalProgress={globalProgress} examProgress={examProgress} onOpen={(id, category)=>navigate("exam", id, category || null)} selectedExams={selectedExams} toggleHomeExam={toggleHomeExam} selectorOpen={examSelectorOpen} setSelectorOpen={setExamSelectorOpen} search={examSearch} setSearch={setExamSearch} />}
        {screen==="exam" && <ExamScreen examId={selectedExam} completed={completed} progress={examProgress(selectedExam)} openCategory={openCategory} setOpenCategory={setOpenCategory} toggleTopic={(id)=>toggleTopic(id, selectedExam)} back={()=>navigate("home", selectedExam, null)} />}
        {screen==="analytics" && <Analytics store={store} selectedExams={selectedExams} toggleHomeExam={toggleHomeExam} selectorOpen={examSelectorOpen} setSelectorOpen={setExamSelectorOpen} search={examSearch} setSearch={setExamSearch} completed={completed} onOpenExam={(id)=>navigate("exam",id,null)} />}
        {screen==="more" && <MoreScreen exportData={exportData} reset={reset} importData={importData} />}
      </main>

      <nav className="bottom-nav">
        <button className={screen==="home" || screen==="exam" ? "nav-item selected":"nav-item"} onClick={()=>navigate("home", selectedExam, null)}><Home size={20}/><span>Dashboard</span></button>
        <button className={screen==="analytics"?"nav-item selected":"nav-item"} onClick={()=>navigate("analytics", selectedExam, null)}><BarChart3 size={20}/><span>Analytics</span></button>
        <button className={screen==="more"?"nav-item selected":"nav-item"} onClick={()=>navigate("more", selectedExam, null)}><MoreHorizontal size={20}/><span>More</span></button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function HomeScreen({completed, globalProgress, examProgress, onOpen, selectedExams, toggleHomeExam, selectorOpen, setSelectorOpen, search, setSearch}:{completed:Set<string>,globalProgress:number,examProgress:(id:string)=>number,onOpen:(id:string,category?:string)=>void,selectedExams:string[],toggleHomeExam:(id:string)=>void,selectorOpen:boolean,setSelectorOpen:(open:boolean)=>void,search:string,setSearch:(value:string)=>void}) {
  const visibleExams = EXAMS.filter(exam => selectedExams.includes(exam.id));
  const [infoExamId, setInfoExamId] = useState<string | null>(null);
  const infoExam = EXAMS.find(exam => exam.id === infoExamId) ?? null;
  const filteredExams = EXAMS.filter(exam => exam.name.toLowerCase().includes(search.trim().toLowerCase()));

  function openSelector() {
    setSearch("");
    setSelectorOpen(true);
  }

  function closeSelector() {
    setSearch("");
    setSelectorOpen(false);
  }

  return <section className="page dashboard-page fade-in">
    <div className="dashboard-hero">
      <div>
        <p className="eyebrow">SYLLABDOJO</p>
        <h1>Stay on top of your <span>syllabus.</span></h1>
        <p className="sub">A calm, simple way to track every topic across your exams.</p>
      </div>
      <div className="dashboard-stats">
        <div className="dashboard-stat"><strong>{selectedExams.length}</strong><span>exams</span></div>
        <div className="dashboard-stat"><strong>{completed.size}</strong><span>topics done</span></div>
        <div className="dashboard-stat"><strong>{globalProgress}%</strong><span>overall</span></div>
      </div>
    </div>
    <div className="dashboard-selector-card">
      <button className="dashboard-selector-label selector-title-button" onClick={openSelector} aria-haspopup="dialog" aria-expanded={selectorOpen}>
        <span className="selector-title">My Exams</span>
        <span className="selector-meta">
          <span className="selector-count">{visibleExams.length} selected</span>
          <ChevronDown size={13} className="selector-dropdown-icon" aria-hidden="true" />
        </span>
      </button>
      <div className="selected-exam-chips">
        {visibleExams.map(exam => (
          <div className="selected-exam-chip" key={exam.id}>
            <span className={`chip-icon exam-chip-${exam.id}`}><ExamIcon examId={exam.id}/></span>
            <span>{exam.name}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="home-exam-sections">
      {visibleExams.map(exam => <div className="home-exam-section" key={exam.id}>
        <div className="home-exam-heading">
          <div className="home-exam-main" onClick={() => onOpen(exam.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(exam.id); } }} role="button" tabIndex={0} aria-label={`Open ${exam.name} tracker`}>
            <div className={`exam-icon exam-${exam.id}`}><ExamIcon examId={exam.id}/></div>
            <div className="home-exam-content">
              {(() => {
                const topicIds = [...new Set(exam.categories.flatMap(c => c.topicIds))];
                const total = topicIds.length;
                const done = topicIds.filter(id => completed.has(id)).length;
                const percent = examProgress(exam.id);
                return <>
                  <div className="home-exam-title">
                    <span className="home-exam-name">{exam.name}</span>
                    <button className="exam-info-button" type="button" aria-label={`Information about ${exam.name}`} title={`About ${exam.name}`} onClick={e => { e.stopPropagation(); setInfoExamId(exam.id); }} onKeyDown={e => e.stopPropagation()}><Info size={13}/></button>
                    <div className="exam-total-copy"><b>Total Progress</b><span>{done}/{total} topics</span></div>
                    <strong className="exam-title-percent">{percent}%</strong>
                  </div>
                  <div className="exam-total-line"><i style={{width:`${percent}%`}} /></div>
                </>;
              })()}
            </div>
          </div>
        </div>
        <SubjectOverview exam={exam} completed={completed} onOpen={onOpen} />
      </div>)}
    </div>

    {infoExam && <div className="exam-info-backdrop" onMouseDown={() => setInfoExamId(null)}>
      <section className="exam-info-modal" role="dialog" aria-modal="true" aria-label={`${infoExam.name} information`} onMouseDown={e => e.stopPropagation()}>
        <header className="exam-info-head"><div><span className={`exam-info-logo exam-${infoExam.id}`}><ExamIcon examId={infoExam.id}/></span><div><h2>{infoExam.name}</h2><p>{infoExam.description}</p></div></div><button className="modal-close" onClick={() => setInfoExamId(null)} aria-label="Close information"><X size={18}/></button></header>
        <h3>Stages and subjects</h3>
        <div className="exam-info-stages">{Array.from(new Map(infoExam.categories.map(category => [category.stage, infoExam.categories.filter(item => item.stage === category.stage)])).entries()).map(([stage, categories]) => <div className="exam-info-stage" key={stage}><b>{stage}</b><p>{[...new Set(categories.map(category => category.name))].join(" · ")}</p></div>)}</div>
      </section>
    </div>}

    {selectorOpen && <div className="selector-backdrop" onMouseDown={closeSelector}>
      <div className="selector-modal" role="dialog" aria-modal="true" aria-label="Select exams" onMouseDown={e=>e.stopPropagation()}>
        <div className="selector-modal-head">
          <div><b>Select exams</b><span>{selectedExams.length} of {EXAMS.length} selected</span></div>
          <button className="modal-close" onClick={closeSelector} aria-label="Close"><X size={18}/></button>
        </div>
        <div className="selector-search">
          <Search size={15}/>
          <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exams..." aria-label="Search exams"/>
          {search && <button aria-label="Clear search" onClick={()=>setSearch("")}><X size={14}/></button>}
        </div>
        <div className="selector-options">
          {filteredExams.map(exam=>{
            const checked=selectedExams.includes(exam.id);
            return <button className="selector-option" key={exam.id} onClick={()=>toggleHomeExam(exam.id)}>
              <span className={checked ? "check selected-check" : "check"}>{checked ? <Check size={14}/> : null}</span>
              <span className="selector-exam-icon"><ExamIcon examId={exam.id}/></span>
              <span>{exam.name}</span>
            </button>;
          })}
          {!filteredExams.length && <div className="selector-empty">No exams found.</div>}
        </div>
        <button className="selector-done" onClick={closeSelector}>Done</button>
      </div>
    </div>}
  </section>
}
const EXAM_LOGOS: Record<string,string> = {
  "ibps-po":"https://upload.wikimedia.org/wikipedia/commons/d/db/IBPS_LOGO.png",
  "sbi-po":"https://upload.wikimedia.org/wikipedia/commons/3/33/State_Bank_of_India.svg",
  "rrb-po":"https://upload.wikimedia.org/wikipedia/commons/0/05/RRB_LOGO_new.png",
  "rbi-grade-b":"https://upload.wikimedia.org/wikipedia/commons/8/8d/Reserve_Bank_of_India_logo.svg",
  "sebi-grade-a":"https://upload.wikimedia.org/wikipedia/commons/d/da/Securities_and_Exchange_Board_of_India.png",
  "nabard-grade-a":"https://www.nabard.org/images/NABARD-logo.png",
  "ssc-cgl":"https://upload.wikimedia.org/wikipedia/commons/2/27/Staff_Selection_Commission_Logo.jpg"
};

function ExamIcon({examId}:{examId:string}) {
  return <img className={`exam-logo exam-logo-${examId}`} src={EXAM_LOGOS[examId]} alt="" aria-hidden="true" />;
}

type HomeSubjectGroup = { name: string; categoryNames: string[] };

const HOME_SUBJECT_GROUPS: Record<string, HomeSubjectGroup[]> = {
  "ibps-po": [
    { name: "English Language", categoryNames: ["English Language", "Descriptive English"] },
    { name: "Quantitative Aptitude", categoryNames: ["Quantitative Aptitude", "Data Analysis & Interpretation"] },
    { name: "Reasoning & Computer Aptitude", categoryNames: ["Reasoning Ability", "Computer Aptitude"] },
    { name: "General Awareness", categoryNames: ["General Awareness", "Economy Awareness", "Banking Awareness", "Financial Awareness"] }
  ],
  "sbi-po": [
    { name: "English Language", categoryNames: ["English Language", "Descriptive English"] },
    { name: "Quantitative Aptitude", categoryNames: ["Quantitative Aptitude", "Data Analysis & Interpretation"] },
    { name: "Reasoning & Computer Aptitude", categoryNames: ["Reasoning Ability", "Computer Aptitude"] },
    { name: "General Awareness", categoryNames: ["General Awareness", "Economy Awareness", "Banking Awareness", "Financial Awareness"] }
  ],
  "rrb-po": [
    { name: "Reasoning Ability", categoryNames: ["Reasoning Ability"] },
    { name: "Quantitative Aptitude", categoryNames: ["Quantitative Aptitude", "Data Interpretation"] },
    { name: "English Language", categoryNames: ["English Language"] },
    { name: "General Awareness", categoryNames: ["General Awareness", "Financial Awareness"] },
    { name: "Computer Knowledge", categoryNames: ["Computer Knowledge"] }
  ],
  "rbi-grade-b": [
    { name: "General Awareness", categoryNames: ["General Awareness"] },
    { name: "English Language", categoryNames: ["English Language", "English Writing Skills"] },
    { name: "Quantitative Aptitude", categoryNames: ["Quantitative Aptitude"] },
    { name: "Reasoning Ability", categoryNames: ["Reasoning Ability"] },
    { name: "Economic & Social Issues", categoryNames: ["Economic & Social Issues"] },
    { name: "Finance", categoryNames: ["Finance"] },
    { name: "Management", categoryNames: ["Management"] }
  ],
  "sebi-grade-a": [
    { name: "General Awareness", categoryNames: ["General Awareness"] },
    { name: "English Language", categoryNames: ["English Language", "English Descriptive"] },
    { name: "Quantitative Aptitude", categoryNames: ["Quantitative Aptitude"] },
    { name: "Reasoning Ability", categoryNames: ["Reasoning Ability"] },
    { name: "Commerce & Accountancy", categoryNames: ["Commerce & Accountancy"] },
    { name: "Management", categoryNames: ["Management"] },
    { name: "Finance", categoryNames: ["Finance"] },
    { name: "Costing", categoryNames: ["Costing"] },
    { name: "Companies Act", categoryNames: ["Companies Act"] },
    { name: "Economics", categoryNames: ["Economics"] }
  ],
  "nabard-grade-a": [
    { name: "Reasoning Ability", categoryNames: ["Reasoning Ability"] },
    { name: "English Language", categoryNames: ["English Language", "English Descriptive"] },
    { name: "Computer Knowledge", categoryNames: ["Computer Knowledge"] },
    { name: "Quantitative Aptitude", categoryNames: ["Quantitative Aptitude"] },
    { name: "Decision Making", categoryNames: ["Decision Making"] },
    { name: "General Awareness", categoryNames: ["General Awareness"] },
    { name: "Economic & Social Issues", categoryNames: ["Economic & Social Issues"] },
    { name: "Agriculture & Rural Development", categoryNames: ["Agriculture & Rural Development"] }
  ],
  "ssc-cgl": [
    { name: "Mathematical Abilities", categoryNames: ["Mathematical Abilities"] },
    { name: "Reasoning & General Intelligence", categoryNames: ["General Intelligence & Reasoning", "Reasoning & General Intelligence"] },
    { name: "English Language & Comprehension", categoryNames: ["English Language & Comprehension"] },
    { name: "General Awareness", categoryNames: ["General Awareness"] },
    { name: "Computer Knowledge", categoryNames: ["Computer Knowledge"] }
  ]
};

function SubjectOverview({exam, completed, onOpen}:{exam:typeof EXAMS[number], completed:Set<string>, onOpen:(id:string,category?:string)=>void}) {
  const palette = ["#5b8def","#a56be8","#28b989","#e4a52f","#e56c9a","#21a6a1","#7c8798","#d66b4f"];
  const groups = HOME_SUBJECT_GROUPS[exam.id] || [];

  return <div className="subject-mini-grid">
    {groups.map((group, index) => {
      const categories = exam.categories.filter(category => group.categoryNames.includes(category.name));
      const topicIds = [...new Set(categories.flatMap(category => category.topicIds))];
      if (!topicIds.length) return null;
      const done = topicIds.filter(id => completed.has(id)).length;
      const total = topicIds.length;
      const percent = total ? Math.round(done / total * 100) : 0;
      const chartColor = "var(--text)";
      const firstCategory = categories[0];
      const categoryKey = firstCategory ? `${firstCategory.stage}::${firstCategory.name}` : undefined;
      return <button className="subject-mini" key={`${exam.id}-${group.name}`} onClick={() => onOpen(exam.id, categoryKey)}>
        <span className="subject-mini-name">{group.name}</span>
        <div className="subject-mini-ring" style={{"--mini-progress":`${percent * 3.6}deg`, "--mini-color":chartColor} as CSSProperties}>
          <strong>{percent}%</strong>
        </div>
        <small>{done}/{total}</small>
      </button>;
    })}
  </div>;
}

type TrackerMeta = { pattern?: string; marks?: string; questions?: string; note?: string };

const STAGE_META: Record<string, Record<string, TrackerMeta>> = {
  "ibps-po": {
    "Prelims": {pattern:"Online · 100 marks · 60 minutes · 100 questions", note:"Three timed sections; check the current notification for the exact section split"},
    "Mains": {pattern:"Online · Objective + Descriptive · 200 + 25 marks", note:"Section counts and timing can change by recruitment cycle; verify the current IBPS notification"}
  },
  "sbi-po": {
    "Prelims": {pattern:"Online · 100 marks · 60 minutes · 100 questions", note:"2026 pattern: English 40, Quantitative Aptitude 30, Reasoning Ability 30; 20 minutes each"},
    "Mains": {pattern:"Online · Objective + Descriptive · 200 + 30 marks · 180 + 30 minutes", note:"Four separately timed objective sections followed by descriptive English"}
  },
  "rrb-po": {
    "Prelims": {pattern:"Online · 80 marks · 45 minutes · 80 questions"},
    "Mains": {pattern:"Online · 200 marks · 120 minutes · 200 questions"}
  },
  "rbi-grade-b": {
    "Phase I": {pattern:"Online · 200 marks · 120 minutes · 200 questions"},
    "Phase II": {pattern:"Online · 300 marks · Descriptive + Objective", note:"Three papers"}
  },
  "sebi-grade-a": {
    "Phase I": {pattern:"Online · 200 marks · 100 minutes", note:"Paper I: 100 marks / 60 minutes; Paper II: 100 marks / 40 minutes"},
    "Phase II": {pattern:"Online · 200 marks · 150 minutes", note:"Paper I: English descriptive, 100 marks / 60 minutes; General Stream Paper II: 100 marks / 90 minutes"}
  },
  "nabard-grade-a": {
    "Prelims": {pattern:"Online · 200 marks · 120 minutes · 200 MCQs", note:"Qualifying + merit sections"},
    "Mains": {pattern:"Online · 200 marks · about 210 minutes", note:"Paper I: English descriptive, 100 marks / 90 minutes; Paper II: ESI & ARD, 100 marks with objective and descriptive components"}
  },
  "ssc-cgl": {
    "Tier I": {pattern:"Computer Based Exam · 200 marks · 60 minutes · 100 MCQs", note:"Qualifying / screening stage"},
    "Tier II": {pattern:"Computer Based Exam · Paper I + post-specific Papers II/III", note:"Paper I is compulsory"}
  }
};

const SUBJECT_META: Record<string, TrackerMeta> = {
  "ibps-po|Prelims|English Language": {marks:"See current notification",questions:"English Language section",note:"Exact section split is recruitment-cycle specific"},
  "ibps-po|Prelims|Quantitative Aptitude": {marks:"See current notification",questions:"Quantitative Aptitude section",note:"Exact section split is recruitment-cycle specific"},
  "ibps-po|Prelims|Reasoning Ability": {marks:"See current notification",questions:"Reasoning Ability section",note:"Exact section split is recruitment-cycle specific"},
  "ibps-po|Mains|Reasoning Ability": {marks:"See current notification",questions:"Part of Reasoning & Computer Aptitude",note:"Section-level split is not represented separately in the syllabus checklist"},
  "ibps-po|Mains|Computer Aptitude": {marks:"See current notification",questions:"Part of Reasoning & Computer Aptitude",note:"Shared section; not a separate marks allocation"},
  "ibps-po|Mains|Data Analysis & Interpretation": {marks:"See current notification",questions:"Data Analysis & Interpretation section",note:"Verify current cycle notification for exact section pattern"},
  "ibps-po|Mains|English Language": {marks:"See current notification",questions:"English Language section",note:"Verify current cycle notification for exact section pattern"},
  "ibps-po|Mains|General Awareness": {marks:"See current notification",questions:"General / Economy / Banking awareness",note:"Shared awareness area; not separate marks allocations"},
  "ibps-po|Mains|Economy Awareness": {marks:"Part of awareness section",questions:"Part of awareness section",note:"Combined with general and banking awareness for tracker purposes"},
  "ibps-po|Mains|Banking Awareness": {marks:"Part of awareness section",questions:"Part of awareness section",note:"Combined with general and economy awareness for tracker purposes"},
  "ibps-po|Mains|Financial Awareness": {marks:"Part of awareness section",questions:"Part of awareness section",note:"Combined with general and economy awareness for tracker purposes"},
  "ibps-po|Mains|Descriptive English": {marks:"See current notification",questions:"Descriptive English",note:"Check the current notification for format and marks"},

  "sbi-po|Prelims|English Language": {marks:"40 marks",questions:"40 questions",note:"2026 notification"},
  "sbi-po|Prelims|Quantitative Aptitude": {marks:"30 marks",questions:"30 questions",note:"2026 notification"},
  "sbi-po|Prelims|Reasoning Ability": {marks:"30 marks",questions:"30 questions",note:"2026 notification"},
  "sbi-po|Mains|Data Analysis & Interpretation": {marks:"60 marks",questions:"30 questions",note:"2026 notification"},
  "sbi-po|Mains|Reasoning Ability": {marks:"Combined 60 marks",questions:"Combined 40 questions",note:"Shared section with Computer Aptitude; do not count twice"},
  "sbi-po|Mains|Computer Aptitude": {marks:"Combined 60 marks",questions:"Combined 40 questions",note:"Shared section with Reasoning Ability; do not count twice"},
  "sbi-po|Mains|General Awareness": {marks:"60 marks",questions:"60 questions",note:"Combined General Awareness / Economy / Banking Knowledge section"},
  "sbi-po|Mains|Economy Awareness": {marks:"Part of 60 marks",questions:"Part of 60 questions",note:"Included in the combined General Awareness / Economy / Banking Knowledge section"},
  "sbi-po|Mains|Banking Awareness": {marks:"Part of 60 marks",questions:"Part of 60 questions",note:"Included in the combined General Awareness / Economy / Banking Knowledge section"},
  "sbi-po|Mains|Financial Awareness": {marks:"Part of 60 marks",questions:"Part of 60 questions",note:"Included in the combined General Awareness / Economy / Banking Knowledge section"},
  "sbi-po|Mains|English Language": {marks:"20 marks",questions:"40 questions",note:"2026 notification"},
  "sbi-po|Mains|Descriptive English": {marks:"30 marks",questions:"3 tasks",note:"Email, situation analysis, and report or précis writing; 30 minutes"},

  "rrb-po|Prelims|Reasoning Ability": {marks:"40 marks",questions:"40 questions"},
  "rrb-po|Prelims|Quantitative Aptitude": {marks:"40 marks",questions:"40 questions"},
  "rrb-po|Mains|Reasoning Ability": {marks:"50 marks",questions:"40 questions"},
  "rrb-po|Mains|Quantitative Aptitude": {marks:"50 marks",questions:"40 questions"},
  "rrb-po|Mains|General Awareness": {marks:"40 marks",questions:"40 questions"},
  "rrb-po|Mains|Computer Knowledge": {marks:"20 marks",questions:"40 questions"},
  "rrb-po|Mains|English Language": {marks:"40 marks",questions:"40 questions"},

  "rbi-grade-b|Phase I|General Awareness": {marks:"80 marks",questions:"80 questions"},
  "rbi-grade-b|Phase I|English Language": {marks:"30 marks",questions:"30 questions"},
  "rbi-grade-b|Phase I|Quantitative Aptitude": {marks:"30 marks",questions:"30 questions"},
  "rbi-grade-b|Phase I|Reasoning Ability": {marks:"60 marks",questions:"60 questions"},
  "rbi-grade-b|Phase II|Economic & Social Issues": {marks:"100 marks",questions:"Objective + Descriptive",note:"Paper I"},
  "rbi-grade-b|Phase II|Finance": {marks:"Paper III",questions:"Objective + Descriptive",note:"Finance & Management · 100 marks combined"},
  "rbi-grade-b|Phase II|Management": {marks:"Paper III",questions:"Objective + Descriptive",note:"Finance & Management · 100 marks combined"},
  "rbi-grade-b|Phase II|English Writing Skills": {marks:"100 marks",questions:"Descriptive",note:"Paper II"},

  "sebi-grade-a|Phase I|General Awareness": {marks:"Paper I",questions:"Objective",note:"Paper I · 100 marks combined"},
  "sebi-grade-a|Phase I|English Language": {marks:"Paper I",questions:"Objective",note:"Paper I · 100 marks combined"},
  "sebi-grade-a|Phase I|Quantitative Aptitude": {marks:"Paper I",questions:"Objective",note:"Paper I · 100 marks combined"},
  "sebi-grade-a|Phase I|Reasoning Ability": {marks:"Paper I",questions:"Objective",note:"Paper I · 100 marks combined"},
  "sebi-grade-a|Phase II|English Descriptive": {marks:"100 marks",questions:"Descriptive",note:"Paper I"},
  "sebi-grade-a|Phase II|Commerce & Accountancy": {marks:"Paper II",questions:"Objective",note:"General Stream · 100 marks"},
  "sebi-grade-a|Phase II|Management": {marks:"Paper II",questions:"Objective",note:"General Stream · 100 marks"},
  "sebi-grade-a|Phase II|Finance": {marks:"Paper II",questions:"Objective",note:"General Stream · 100 marks"},
  "sebi-grade-a|Phase II|Costing": {marks:"Paper II",questions:"Objective",note:"General Stream · 100 marks"},
  "sebi-grade-a|Phase II|Companies Act": {marks:"Paper II",questions:"Objective",note:"General Stream · 100 marks"},
  "sebi-grade-a|Phase II|Economics": {marks:"Paper II",questions:"Objective",note:"General Stream · 100 marks"},

  "nabard-grade-a|Prelims|Reasoning Ability": {marks:"20 marks",questions:"20 questions"},
  "nabard-grade-a|Prelims|English Language": {marks:"30 marks",questions:"30 questions"},
  "nabard-grade-a|Prelims|Computer Knowledge": {marks:"20 marks",questions:"20 questions"},
  "nabard-grade-a|Prelims|Quantitative Aptitude": {marks:"20 marks",questions:"20 questions"},
  "nabard-grade-a|Prelims|Decision Making": {marks:"10 marks",questions:"10 questions"},
  "nabard-grade-a|Prelims|General Awareness": {marks:"20 marks",questions:"20 questions"},
  "nabard-grade-a|Prelims|Economic & Social Issues": {marks:"40 marks",questions:"40 questions"},
  "nabard-grade-a|Prelims|Agriculture & Rural Development": {marks:"40 marks",questions:"40 questions"},
  "nabard-grade-a|Mains|English Descriptive": {marks:"100 marks",questions:"3 questions",note:"Paper I · Descriptive"},
  "nabard-grade-a|Mains|Economic & Social Issues": {marks:"100 marks",questions:"30 objective + 6 descriptive",note:"Paper II combined with ARD"},
  "nabard-grade-a|Mains|Agriculture & Rural Development": {marks:"100 marks",questions:"30 objective + 6 descriptive",note:"Paper II combined with ESI"},

  "ssc-cgl|Tier I|Mathematical Abilities": {marks:"50 marks",questions:"25 questions"},
  "ssc-cgl|Tier I|General Intelligence & Reasoning": {marks:"50 marks",questions:"25 questions"},
  "ssc-cgl|Tier I|English Language & Comprehension": {marks:"50 marks",questions:"25 questions"},
  "ssc-cgl|Tier I|General Awareness": {marks:"50 marks",questions:"25 questions"},
  "ssc-cgl|Tier II|Mathematical Abilities": {marks:"90 marks",questions:"30 questions",note:"Paper I · Section I"},
  "ssc-cgl|Tier II|Reasoning & General Intelligence": {marks:"90 marks",questions:"30 questions",note:"Paper I · Section I"},
  "ssc-cgl|Tier II|English Language & Comprehension": {marks:"135 marks",questions:"45 questions",note:"Paper I · Section II"},
  "ssc-cgl|Tier II|General Awareness": {marks:"75 marks",questions:"25 questions",note:"Paper I · Section II"},
  "ssc-cgl|Tier II|Computer Knowledge": {marks:"60 marks",questions:"20 questions",note:"Paper I · Section III"}
};

function getSubjectMeta(examId:string, stage:string, name:string): TrackerMeta {
  return SUBJECT_META[`${examId}|${stage}|${name}`] || {};
}

function stageLabel(examId:string, stage:string) {
  const labels: Record<string,string> = {
    "ibps-po|Prelims":"Preliminary Examination",
    "ibps-po|Mains":"Mains Examination",
    "sbi-po|Prelims":"Preliminary Examination",
    "sbi-po|Mains":"Mains Examination",
    "rrb-po|Prelims":"Preliminary Examination",
    "rrb-po|Mains":"Mains Examination",
    "nabard-grade-a|Prelims":"Preliminary Examination",
    "nabard-grade-a|Mains":"Main Examination"
  };
  return labels[`${examId}|${stage}`] || stage;
}

function ExamScreen({examId,completed,progress,openCategory,setOpenCategory,toggleTopic,back}:{examId:string,completed:Set<string>,progress:number,openCategory:string|null,setOpenCategory:(x:string|null)=>void,toggleTopic:(x:string)=>void,back:()=>void}) {
  const exam = EXAMS.find(e=>e.id===examId)!;
  const stages = [...new Set(exam.categories.map(category => category.stage))];
  const [openStages, setOpenStages] = useState<Record<string,boolean>>(() => Object.fromEntries(stages.map((stage,index)=>[stage,index===0])));
  const [openSubjects, setOpenSubjects] = useState<Record<string,boolean>>(() => {
    const first = exam.categories[0];
    return first ? {[`${first.stage}::${first.name}`]: true} : {};
  });

  useEffect(() => {
    setOpenStages(Object.fromEntries(stages.map((stage,index)=>[stage,index===0])));
    setOpenSubjects({});
  }, [examId]);

  function toggleSubject(key:string) {
    setOpenSubjects(prev => ({...prev,[key]:!prev[key]}));
    setOpenCategory(openCategory===key ? null : key);
  }

  return <section className="page tracker-page fade-in">
    <button className="back" onClick={back}>← All exams</button>
    <div className="tracker-hero">
      <div className="tracker-identity">
        <div className={`tracker-logo-frame tracker-logo-${exam.id}`}><ExamIcon examId={exam.id}/></div>
        <div><p className="eyebrow">{exam.short}</p><h1>{exam.name}</h1><p>{exam.description}</p></div>
      </div>
      <div className="big-progress"><strong>{progress}%</strong><span>complete</span></div>
    </div>
    <div className="progress-bar tracker-progress"><i style={{width:`${progress}%`}}/></div>

    <div className="tracker-progress-card">
      <div><b>Syllabus progress</b><span>Mark topics as completed to track your preparation.</span></div>
      <strong>{progress}%</strong>
    </div>

    <div className="tracker-title-row"><h2>Detailed topic-wise syllabus</h2><span>{EXAM_TOPIC_IDS[exam.id]?.length || 0} topics</span></div>

    <div className="tracker-stages">
      {stages.map(stage => {
        const stageCategories = exam.categories.filter(category => category.stage === stage);
        const stageIds = [...new Set(stageCategories.flatMap(category=>category.topicIds))];
        const stageDone = stageIds.filter(id=>completed.has(id)).length;
        const stageOpen = !!openStages[stage];
        const meta = STAGE_META[exam.id]?.[stage] || {};
        return <section className="tracker-stage" key={stage}>
          <button className="tracker-stage-head" onClick={()=>setOpenStages(prev=>({...prev,[stage]:!prev[stage]}))}>
            <div><b>{stageLabel(exam.id, stage)}</b><span>{stageDone}/{stageIds.length} topics</span></div>
            <ChevronDown size={19} className={stageOpen?"rotate":""}/>
          </button>
          {stageOpen && <div className="tracker-stage-body">
            {meta.pattern && <div className="stage-pattern"><span>{meta.pattern}</span>{meta.note && <small>{meta.note}</small>}</div>}
            <div className="tracker-subjects">
              {stageCategories.map(cat=>{
                const key=`${cat.stage}::${cat.name}`;
                const done=cat.topicIds.filter(id=>completed.has(id)).length;
                const open=!!openSubjects[key] || openCategory===key;
                const subjectMeta=getSubjectMeta(exam.id,cat.stage,cat.name);
                return <div className="tracker-subject" key={`${cat.stage}-${cat.name}`}>
                  <button className="tracker-subject-head" onClick={()=>toggleSubject(key)}>
                    <div className="tracker-subject-title"><b>{cat.name}</b><span>{done}/{cat.topicIds.length}</span></div>
                    <div className="tracker-subject-meta">
                      {subjectMeta.marks && <span>{subjectMeta.marks}</span>}
                      {subjectMeta.questions && <span>{subjectMeta.questions}</span>}
                      <ChevronDown size={17} className={open?"rotate":""}/>
                    </div>
                  </button>
                  {open && <div className="tracker-topic-list">
                    {subjectMeta.note && <div className="tracker-note">{subjectMeta.note}</div>}
                    {cat.topicIds.map(id=>{
                      const topic=TOPICS.find(t=>t.id===id)!;
                      const done=completed.has(id);
                      return <button className={done?"tracker-topic done":"tracker-topic"} key={id} onClick={()=>toggleTopic(id)}>
                        <span className="tracker-check">{done?<Check size={13}/>:null}</span>
                        <span>{topic.name}</span>
                      </button>;
                    })}
                  </div>}
                </div>;
              })}
            </div>
          </div>}
        </section>;
      })}
    </div>
  </section>
}

function Analytics({store,selectedExams,toggleHomeExam,selectorOpen,setSelectorOpen,search,setSearch,completed,onOpenExam}:{store:Store,selectedExams:string[],toggleHomeExam:(id:string)=>void,selectorOpen:boolean,setSelectorOpen:(open:boolean)=>void,search:string,setSearch:(value:string)=>void,completed:Set<string>,onOpenExam:(id:string)=>void}) {
  const [period, setPeriod] = useState<"12months"|"month"|"week">("12months");
  const [activePill, setActivePill] = useState<{examId:string,date:string}|null>(null);
  const [pinnedPill, setPinnedPill] = useState<{examId:string,date:string}|null>(null);
  const [detailPosition, setDetailPosition] = useState<{left:number,top:number}|null>(null);
  useEffect(() => {
    if (!activePill) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".heatmap-detail") || target.closest(".github-heat-grid .heat-cell")) return;
      setActivePill(null);
      setPinnedPill(null);
      setDetailPosition(null);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [activePill]);
  const visibleExams = EXAMS.filter(exam => selectedExams.includes(exam.id));
  const openSelector = () => { setSearch(""); setSelectorOpen(true); };
  const filteredExams = EXAMS.filter(exam => exam.name.toLowerCase().includes(search.trim().toLowerCase()));
  const now = new Date(); now.setHours(12,0,0,0);
  let rangeStart = new Date(now), rangeEnd = new Date(now);
  if (period === "12months") { rangeStart = new Date(now.getFullYear(), now.getMonth()-11, 1, 12); }
  if (period === "month") { rangeStart = new Date(now.getFullYear(), now.getMonth()-1, 1, 12); rangeEnd = new Date(now.getFullYear(), now.getMonth(), 0, 12); }
  if (period === "week") { rangeStart = new Date(now); rangeStart.setDate(now.getDate()-6); }
  const gridStart = new Date(rangeStart); gridStart.setDate(gridStart.getDate()-gridStart.getDay());
  const gridEnd = new Date(rangeEnd); gridEnd.setDate(gridEnd.getDate()+(6-gridEnd.getDay()));
  const days: Date[] = [];
  for (const d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate()+1)) days.push(new Date(d));
  const monthLabels: {label:string,index:number}[] = [];
  days.forEach((d,i) => { if (d.getDate() === 1 && d >= gridStart && d <= gridEnd) monthLabels.push({label:d.toLocaleDateString(undefined,{month:"short"}),index:i}); });
  const periodLabel = period === "12months" ? "Last 12 months" : period === "month" ? rangeStart.toLocaleDateString(undefined,{month:"long",year:"numeric"}) : "Last 7 days";
  function dateKey(d:Date) { return d.toISOString().slice(0,10); }
  function topicsFor(examId:string,date:string) {
    const ids = store.activityTopicsByExam?.[examId]?.[date] || [];
    const exam = EXAMS.find(e=>e.id===examId);
    return ids.map(id=>({id,topic:TOPICS.find(topic=>topic.id===id),subject:exam?.categories.find(c=>c.topicIds.includes(id))?.name || TOPICS.find(topic=>topic.id===id)?.category || "Syllabus"})).filter(x=>x.topic);
  }
  return <section className="page fade-in analytics-page">
    <div className="hero compact"><p className="eyebrow">ANALYTICS</p><h1>Your consistency.</h1><p className="sub">Daily activity across the exams you’re preparing for.</p></div>
    <div className="dashboard-selector-card analytics-selector-card">
      <button className="dashboard-selector-label selector-title-button" onClick={openSelector} aria-haspopup="dialog"><span className="selector-title">My Exams</span><span className="selector-meta"><span className="selector-count">{visibleExams.length} selected</span><ChevronDown size={13} className="selector-dropdown-icon" aria-hidden="true" /></span></button>
      <div className="selected-exam-chips">{visibleExams.map(exam=><div className="selected-exam-chip" key={exam.id}><span className={`chip-icon exam-chip-${exam.id}`}><ExamIcon examId={exam.id}/></span><span>{exam.name}</span></div>)}</div>
    </div>
    <div className="heatmap-periods" role="group" aria-label="Heatmap date range">{([{id:"12months",label:"Last 12 months"},{id:"month",label:"Last month"},{id:"week",label:"Last week"}] as const).map(item=><button key={item.id} className={period===item.id?"heatmap-period active":"heatmap-period"} onClick={()=>{setPeriod(item.id);setActivePill(null);setPinnedPill(null);setDetailPosition(null)}}>{item.label}</button>)}</div>
    <div className="analytics-year-controls"><span>{periodLabel}</span><span className="heatmap-help">Select a pill to see completed topics</span></div>
    {visibleExams.map(exam=>{
      const examActivity = store.activityByExam?.[exam.id] || store.activity;
      const selected = activePill?.examId===exam.id ? activePill.date : null;
      const selectedTopics = selected ? topicsFor(exam.id,selected) : [];
      return <section className="exam-heat-section" key={exam.id}>
        <div className="section-head heat-title"><div className="heat-title-name"><h2>{exam.name}</h2><button className="heatmap-syllabus-button" onClick={()=>onOpenExam(exam.id)}>Open syllabus <span aria-hidden="true">↗</span></button></div></div>
        <div className="heat-card github-heat-card">
          <div className="github-months" style={{gridTemplateColumns:`repeat(${Math.ceil(days.length/7)}, minmax(0,1fr))`}}>{monthLabels.map((m,i)=><span key={`${m.label}-${m.index}-${i}`} style={{gridColumn:Math.floor(m.index/7)+1}}>{m.label}</span>)}</div>
          <div className="github-heat-layout"><div className="github-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div className="github-heat-grid">{days.map(d=>{const date=dateKey(d);const inRange=d>=rangeStart&&d<=rangeEnd;const count=inRange?(examActivity[date] ?? store.activity[date] ?? 0):0;const isActive=selected===date;return <button type="button" key={date} disabled={!inRange} aria-label={`${exam.name}, ${date}, ${count} topics completed`} onClick={e=>{const next=isActive?null:{examId:exam.id,date};setActivePill(next);setPinnedPill(next);if(next){const r=e.currentTarget.getBoundingClientRect();const width=Math.min(330,window.innerWidth-24);const left=Math.max(12,Math.min(r.left,window.innerWidth-width-12));const estimatedHeight=190;const top=r.bottom+8+estimatedHeight<window.innerHeight?r.bottom+8:Math.max(12,r.top-estimatedHeight-8);setDetailPosition({left,top});}else{setDetailPosition(null)}}} title={`${date}: ${count} topics completed. Click for details.`} className={`heat-cell level-${Math.min(4,count)} ${!inRange?"heat-cell-outside":""} ${isActive?"heat-cell-selected":""}`} />;})}</div></div>
          <div className="heat-legend"><span>Less</span>{[0,1,2,3,4].map(x=><i key={x} className={`heat-cell level-${x}`}/>)}<span>More</span></div>
          {selected && <div className="heatmap-detail" style={detailPosition?{position:"fixed",left:detailPosition.left,top:detailPosition.top,right:"auto",bottom:"auto"}:undefined} role="status"><div className="heatmap-detail-head"><b>{new Date(`${selected}T12:00:00`).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</b><button onClick={()=>{setActivePill(null);setPinnedPill(null);setDetailPosition(null)}} aria-label="Close activity details"><X size={14}/></button></div>{selectedTopics.length ? <ul>{selectedTopics.map((item,i)=><li key={`${item.id}-${i}`}><span>{item.subject}</span><b>{item.topic.name}</b></li>)}</ul> : <p>No topic-completion details were saved for this date. New completions will appear here.</p>}</div>}
        </div>
      </section>;
    })}
    {!visibleExams.length && <div className="empty-state">Select at least one exam to view its activity heatmap.</div>}
    {selectorOpen && <div className="selector-backdrop" onMouseDown={()=>setSelectorOpen(false)}><div className="selector-modal" role="dialog" aria-modal="true" aria-label="Select exams" onMouseDown={e=>e.stopPropagation()}>
      <div className="selector-modal-head"><div><b>Select exams</b><span>{selectedExams.length} of {EXAMS.length} selected</span></div><button className="modal-close" onClick={()=>setSelectorOpen(false)} aria-label="Close"><X size={18}/></button></div>
      <div className="selector-search"><Search size={15}/><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exams..." aria-label="Search exams"/>{search && <button aria-label="Clear search" onClick={()=>setSearch("")}><X size={14}/></button>}</div>
      <div className="selector-options">{filteredExams.map(exam=>{const checked=selectedExams.includes(exam.id);return <button className="selector-option" key={exam.id} onClick={()=>toggleHomeExam(exam.id)}><span className={checked?"check selected-check":"check"}>{checked?<Check size={14}/>:null}</span><span className="selector-exam-icon"><ExamIcon examId={exam.id}/></span><span>{exam.name}</span></button>;})}{!filteredExams.length && <div className="selector-empty">No exams found.</div>}</div>
      <button className="selector-done" onClick={()=>setSelectorOpen(false)}>Done</button>
    </div></div>}
  </section>
}

function MoreScreen({exportData,reset,importData}:{exportData:()=>void,reset:()=>void,importData:(file:File)=>void}) {
  return <section className="page fade-in">
    <div className="hero compact"><p className="eyebrow">MORE</p><h1>Keep it simple.</h1><p className="sub">Your data stays on your device. Use export/import to move your progress between devices.</p></div>
    <div className="settings-list">
      <button className="setting-row" onClick={exportData}><span className="setting-icon"><Download size={18}/></span><span><b>Export progress</b><small>Save a backup as a JSON file</small></span></button>
      <label className="setting-row"><span className="setting-icon"><Upload size={18}/></span><span><b>Import progress</b><small>Restore a previous JSON backup</small></span><input hidden type="file" accept="application/json" onChange={e=>e.target.files?.[0] && importData(e.target.files[0])}/></label>
      <button className="setting-row danger" onClick={reset}><span className="setting-icon"><RotateCcw size={18}/></span><span><b>Reset progress</b><small>Clear all completed topics and activity</small></span></button>
      <button className="setting-row donate"><span className="setting-icon">♥</span><span><b>Support SyllabDojo</b><small>Donate to help keep the project free</small></span></button>
    </div>
    <p className="more-note">SyllabDojo is free. No account. No subscription. No tracking.</p>
  </section>
}

function Heatmap({store,back}:{store:Store,back:()=>void}) {
  const days = useMemo(()=>{
    const out:{date:string,count:number}[]=[];
    for(let i=83;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const date=d.toISOString().slice(0,10);
      out.push({date,count:store.activity[date]||0});
    }
    return out;
  },[store.activity]);
  const max=Math.max(1,...days.map(d=>d.count));
  return <section className="page fade-in">
    <button className="back" onClick={back}>← Dashboard</button>
    <div className="hero compact"><p className="eyebrow">ACTIVITY</p><h1>Your consistency.</h1><p className="sub">Every newly completed topic adds to your daily activity.</p></div>
    <div className="heat-card">
      <div className="heat-grid">
        {days.map(d=><div key={d.date} title={`${d.date}: ${d.count}`} className={`heat-cell level-${d.count===0?0:Math.min(4,Math.ceil(d.count/max*4))}`}/>)}
      </div>
      <div className="heat-legend"><span>Less</span>{[0,1,2,3,4].map(x=><i key={x} className={`heat-cell level-${x}`}/>)}<span>More</span></div>
    </div>
  </section>
}

export default App;
