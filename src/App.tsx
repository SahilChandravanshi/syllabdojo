import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { BarChart3, Check, ChevronDown, Download, Home, MoreHorizontal, Moon, RotateCcw, Search, Sun, Upload, X } from "lucide-react";
import { EXAMS, EXAM_TOPIC_IDS, TOPICS, DATA_VERSION } from "./data";

type Store = {
  completed: string[];
  activity: Record<string, number>;
};

const KEY = "syllabdojo.progress.v1";
const SELECTED_EXAMS_KEY = "syllabdojo.selected-exams.v1";
const VIEW_STATE_KEY = "syllabdojo.view.v1";
const emptyStore: Store = { completed: [], activity: {} };

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
    return { completed: Array.isArray(parsed.completed) ? parsed.completed : [], activity: parsed.activity || {} };
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

  function toggleTopic(id: string) {
    const next = new Set(store.completed);
    const wasDone = next.has(id);
    wasDone ? next.delete(id) : next.add(id);
    const activity = { ...store.activity };
    if (!wasDone) activity[today()] = (activity[today()] || 0) + 1;
    persist({ completed: [...next], activity });
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
        persist({ completed: valid, activity: parsed.activity || {} });
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
        <button className="brand" onClick={()=>setScreen("home")}>
          <span className="brand-mark">S</span>
          <span>Syllab<span>Dojo</span></span>
        </button>
        <button aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className={`theme-btn ${theme}`} onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </header>

      <main>
        {screen==="home" && <HomeScreen completed={completed} globalProgress={globalProgress} examProgress={examProgress} onOpen={(id, category)=>{setSelectedExam(id);setScreen("exam");setOpenCategory(category || null)}} selectedExams={selectedExams} toggleHomeExam={toggleHomeExam} selectorOpen={examSelectorOpen} setSelectorOpen={setExamSelectorOpen} search={examSearch} setSearch={setExamSearch} />}
        {screen==="exam" && <ExamScreen examId={selectedExam} completed={completed} progress={examProgress(selectedExam)} openCategory={openCategory} setOpenCategory={setOpenCategory} toggleTopic={toggleTopic} back={()=>setScreen("home")} />}
        {screen==="analytics" && <Analytics store={store} completed={completed} examProgress={examProgress} back={()=>setScreen("home")} />}
        {screen==="more" && <MoreScreen exportData={exportData} reset={reset} importData={importData} />}
      </main>

      <nav className="bottom-nav">
        <button className={screen==="home" || screen==="exam" ? "nav-item selected":"nav-item"} onClick={()=>setScreen("home")}><Home size={20}/><span>Dashboard</span></button>
        <button className={screen==="analytics"?"nav-item selected":"nav-item"} onClick={()=>setScreen("analytics")}><BarChart3 size={20}/><span>Analytics</span></button>
        <button className={screen==="more"?"nav-item selected":"nav-item"} onClick={()=>setScreen("more")}><MoreHorizontal size={20}/><span>More</span></button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function HomeScreen({completed, globalProgress, examProgress, onOpen, selectedExams, toggleHomeExam, selectorOpen, setSelectorOpen, search, setSearch}:{completed:Set<string>,globalProgress:number,examProgress:(id:string)=>number,onOpen:(id:string,category?:string)=>void,selectedExams:string[],toggleHomeExam:(id:string)=>void,selectorOpen:boolean,setSelectorOpen:(open:boolean)=>void,search:string,setSearch:(value:string)=>void}) {
  const visibleExams = EXAMS.filter(exam => selectedExams.includes(exam.id));
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
          <button className="home-exam-main" onClick={() => onOpen(exam.id)}>
            <div className={`exam-icon exam-${exam.id}`}><ExamIcon examId={exam.id}/></div>
            <div className="home-exam-title"><b>{exam.name}</b><span>{exam.description}</span></div>
            <span className="exam-arrow">›</span>
          </button>
          <div className="home-exam-overall">
            {(() => {
              const topicIds = [...new Set(exam.categories.flatMap(c => c.topicIds))];
              const total = topicIds.length;
              const done = topicIds.filter(id => completed.has(id)).length;
              const percent = examProgress(exam.id);
              return <div className="exam-total-progress">
                <div className="exam-total-copy"><b>Total Progress</b><span>{done}/{total} topics</span></div>
                <div className="exam-total-line"><i style={{width:`${percent}%`}} /></div>
                <strong>{percent}%</strong>
              </div>;
            })()}
          </div>
        </div>
        <SubjectOverview exam={exam} completed={completed} onOpen={onOpen} />
      </div>)}
    </div>

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
      const chartColor = palette[index % palette.length];
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
    "Prelims": {pattern:"Online · 100 marks · 60 minutes · 100 MCQs", note:"Sectional time limits"},
    "Mains": {pattern:"Online + Descriptive · 225 + 25 marks · 180 + 30 minutes", note:"Objective paper followed by descriptive test"}
  },
  "sbi-po": {
    "Prelims": {pattern:"Online · 100 marks · 60 minutes · 100 MCQs", note:"20 minutes per section"},
    "Mains": {pattern:"Online + Descriptive · 250 + 50 marks · 180 + 30 minutes", note:"4 objective sections + 1 descriptive paper"}
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
    "Phase I": {pattern:"Online · 200 marks · 120 minutes · 200 questions", note:"Paper I + Paper II"},
    "Phase II": {pattern:"Online · 200 marks · Descriptive + Objective", note:"Paper I + Paper II"}
  },
  "nabard-grade-a": {
    "Prelims": {pattern:"Online · 200 marks · 120 minutes · 200 MCQs", note:"Qualifying + merit sections"},
    "Mains": {pattern:"Online · 200 marks · Descriptive + Objective", note:"Paper I + Paper II"}
  },
  "ssc-cgl": {
    "Tier I": {pattern:"Computer Based Exam · 200 marks · 60 minutes · 100 MCQs", note:"Qualifying / screening stage"},
    "Tier II": {pattern:"Computer Based Exam · Paper I + post-specific Papers II/III", note:"Paper I is compulsory"}
  }
};

const SUBJECT_META: Record<string, TrackerMeta> = {
  "ibps-po|Prelims|English Language": {marks:"30 marks",questions:"30 questions"},
  "ibps-po|Prelims|Quantitative Aptitude": {marks:"35 marks",questions:"35 questions"},
  "ibps-po|Prelims|Reasoning Ability": {marks:"35 marks",questions:"35 questions"},
  "ibps-po|Mains|Reasoning Ability": {marks:"60 marks",questions:"45 questions"},
  "ibps-po|Mains|Computer Aptitude": {marks:"60 marks",questions:"45 questions",note:"Included in Reasoning & Computer Aptitude"},
  "ibps-po|Mains|Data Analysis & Interpretation": {marks:"60 marks",questions:"35 questions"},
  "ibps-po|Mains|English Language": {marks:"40 marks",questions:"35 questions"},
  "ibps-po|Mains|General Awareness": {marks:"40 marks",questions:"40 questions"},
  "ibps-po|Mains|Economy Awareness": {marks:"40 marks",questions:"40 questions",note:"Part of General/Economy/Banking Awareness"},
  "ibps-po|Mains|Banking Awareness": {marks:"40 marks",questions:"40 questions",note:"Part of General/Economy/Banking Awareness"},
  "ibps-po|Mains|Financial Awareness": {marks:"40 marks",questions:"40 questions",note:"Part of General/Economy/Banking Awareness"},
  "ibps-po|Mains|Descriptive English": {marks:"25 marks",questions:"Descriptive",note:"Letter + Essay"},

  "sbi-po|Prelims|English Language": {marks:"30 marks",questions:"30 questions"},
  "sbi-po|Prelims|Quantitative Aptitude": {marks:"35 marks",questions:"35 questions"},
  "sbi-po|Prelims|Reasoning Ability": {marks:"35 marks",questions:"35 questions"},
  "sbi-po|Mains|Data Analysis & Interpretation": {marks:"60 marks",questions:"35 questions"},
  "sbi-po|Mains|Reasoning Ability": {marks:"60 marks",questions:"45 questions",note:"Part of Reasoning & Computer Aptitude"},
  "sbi-po|Mains|Computer Aptitude": {marks:"60 marks",questions:"45 questions",note:"Part of Reasoning & Computer Aptitude"},
  "sbi-po|Mains|General Awareness": {marks:"40 marks",questions:"40 questions"},
  "sbi-po|Mains|Economy Awareness": {marks:"40 marks",questions:"40 questions",note:"Part of General/Economy/Banking Awareness"},
  "sbi-po|Mains|Banking Awareness": {marks:"40 marks",questions:"40 questions",note:"Part of General/Economy/Banking Awareness"},
  "sbi-po|Mains|Financial Awareness": {marks:"40 marks",questions:"40 questions",note:"Part of General/Economy/Banking Awareness"},
  "sbi-po|Mains|English Language": {marks:"40 marks",questions:"35 questions"},
  "sbi-po|Mains|Descriptive English": {marks:"50 marks",questions:"Descriptive",note:"Essay + Letter + Precis"},

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

function Analytics({store,completed,examProgress,back}:{store:Store,completed:Set<string>,examProgress:(id:string)=>number,back:()=>void}) {
  const recent = Object.entries(store.activity).sort(([a],[b])=>a.localeCompare(b)).slice(-7);
  const totalActivity = Object.values(store.activity).reduce((a,b)=>a+b,0);
  return <section className="page fade-in">
    <div className="hero compact"><p className="eyebrow">ANALYTICS</p><h1>See your momentum.</h1><p className="sub">A simple view of progress and consistency. No clutter.</p></div>
    <div className="analytics-stats">
      <div><strong>{completed.size}</strong><span>topics completed</span></div>
      <div><strong>{totalActivity}</strong><span>completion actions</span></div>
    </div>
    <div className="section-head"><h2>Exam progress</h2></div>
    <div className="analytics-list">
      {EXAMS.map(exam=><div className="analytics-row" key={exam.id}><span>{exam.name}</span><b>{examProgress(exam.id)}%</b><div className="progress-bar"><i style={{width:`${examProgress(exam.id)}%`}}/></div></div>)}
    </div>
    <div className="section-head heat-title"><h2>Activity heatmap</h2></div>
    <div className="heat-card">
      <div className="heat-grid analytics-heat">
        {Array.from({length:91},(_,i)=>{
          const d=new Date(); d.setDate(d.getDate()-(90-i));
          const date=d.toISOString().slice(0,10); const count=store.activity[date]||0;
          return <div key={date} title={`${date}: ${count}`} className={`heat-cell level-${Math.min(4,count)}`}/>;
        })}
      </div>
      <div className="heat-legend"><span>Less</span>{[0,1,2,3,4].map(x=><i key={x} className={`heat-cell level-${x}`}/>)}<span>More</span></div>
    </div>
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
