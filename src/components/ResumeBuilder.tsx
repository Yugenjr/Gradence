import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import secelogo from '../assets/sece.png';

interface Education {
  id: string;
  type: 'college' | 'school';
  institution: string;
  degree: string;
  score: string;
  year: string;
}

interface Internship {
  id: string;
  company: string;
  year: string;
  description: string;
  skillsAcquired: string;
}

interface Project {
  id: string;
  name: string;
  link: string;
  linkLabel: string;
  date: string;
  techStack: string;
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  year: string;
  bold?: boolean;
}

interface CodingProfile {
  id: string;
  platform: string;
  details: string;
  link: string;
}

interface Certification {
  id: string;
  name: string;
  provider: string;
  year: string;
}

interface ResumeData {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
  education: Education[];
  internships: Internship[];
  projects: Project[];
  achievements: Achievement[];
  codingProfiles: CodingProfile[];
  certifications: Certification[];
  skills: {
    languages: string;
    frameworks: string;
    database: string;
    tools: string;
    concepts: string;
  };
}

const uid = () => Math.random().toString(36).slice(2, 8);

const defaultData: ResumeData = {
  name: '',
  phone: '',
  email: '',
  linkedin: '',
  github: '',
  portfolio: '',
  education: [
    { id: uid(), type: 'college', institution: 'Sri Eshwar College of Engineering', degree: 'B Tech IT', score: '', year: '2024-2028' },
    { id: uid(), type: 'school', institution: '', degree: 'HSC', score: '', year: '' },
    { id: uid(), type: 'school', institution: '', degree: 'SSLC', score: '', year: '' },
  ],
  internships: [{ id: uid(), company: '', year: '', description: '', skillsAcquired: '' }],
  projects: [{ id: uid(), name: '', link: '', linkLabel: 'Github', date: '', techStack: '', description: '' }],
  achievements: [{ id: uid(), title: '', year: '', bold: true }],
  codingProfiles: [{ id: uid(), platform: 'Leetcode', details: '', link: '' }],
  certifications: [{ id: uid(), name: '', provider: '', year: '' }],
  skills: { languages: '', frameworks: '', database: '', tools: '', concepts: '' },
};

// ── Resume Preview (the actual printable template) ──────────────────────────
function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div
      id="resume-preview"
      style={{
        width: '794px',
        minHeight: '1123px',
        background: '#fff',
        color: '#000',
        fontFamily: 'Times New Roman, serif',
        fontSize: '12px',
        padding: '32px 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <img src={secelogo} alt="SECE" style={{ width: '64px', height: '64px', objectFit: 'contain', marginRight: '16px' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px' }}>{data.name || 'Your Name'}</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>
            {data.phone && `Contact: ${data.phone}`}
            {data.phone && data.email && ' | '}
            {data.email && `E-mail: ${data.email}`}
            {(data.linkedin || data.github || data.portfolio) && ' | '}
            {data.linkedin && <a href={data.linkedin} style={{ color: '#1155CC' }}>Linkedin</a>}
            {data.linkedin && data.github && '| '}
            {data.github && <a href={data.github} style={{ color: '#1155CC' }}>Github</a>}
            {data.github && data.portfolio && '| '}
            {data.portfolio && <a href={data.portfolio} style={{ color: '#1155CC' }}>Portfolio</a>}
          </div>
        </div>
      </div>

      <Hr />

      {/* Education */}
      <Section title="EDUCATION">
        {data.education.map(ed => (
          <div key={ed.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold' }}>
                {ed.type === 'college' ? 'COLLEGE EDUCATION' : 'SCHOOLING'}
              </span>
              {' - '}{ed.institution}
            </div>
            <div style={{ width: '140px', textAlign: 'center' }}>{ed.degree}</div>
            <div style={{ width: '140px', textAlign: 'center' }}>|| {ed.score}</div>
            <div style={{ width: '100px', textAlign: 'right' }}>{ed.year}</div>
          </div>
        ))}
      </Section>

      {/* Internships */}
      {data.internships.some(i => i.company) && (
        <>
          <Hr />
          <Section title="INTERNSHIP EXPERIENCES">
            {data.internships.filter(i => i.company).map(intern => (
              <div key={intern.id} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{intern.company}</span>
                  <span>{intern.year}</span>
                </div>
                <div style={{ marginTop: '3px', lineHeight: '1.5' }}>{intern.description}</div>
                {intern.skillsAcquired && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>SKILLS ACQUIRED:</span>
                    <div style={{ marginLeft: '16px', marginTop: '2px' }}>{intern.skillsAcquired}</div>
                  </div>
                )}
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Projects */}
      {data.projects.some(p => p.name) && (
        <>
          <Hr />
          <Section title="PROJECTS">
            {data.projects.filter(p => p.name).map(proj => (
              <div key={proj.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{proj.name}</span>
                  <span style={{ display: 'flex', gap: '16px' }}>
                    {proj.link && <a href={proj.link} style={{ color: '#1155CC' }}>{proj.linkLabel || 'Github'}</a>}
                    <span>{proj.date}</span>
                  </span>
                </div>
                {proj.techStack && (
                  <div style={{ marginTop: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>Tech Stack : </span>{proj.techStack}
                  </div>
                )}
                <div style={{ marginTop: '3px', lineHeight: '1.5' }}>{proj.description}</div>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Achievements */}
      {data.achievements.some(a => a.title) && (
        <>
          <Hr />
          <Section title="ACHIEVEMENTS">
            {data.achievements.filter(a => a.title).map(ach => (
              <div key={ach.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={ach.bold ? { fontWeight: 'bold' } : {}}>{ach.title}</span>
                <span style={{ fontWeight: 'bold' }}>{ach.year}</span>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Coding Profiles */}
      {data.codingProfiles.some(c => c.details) && (
        <>
          <Hr />
          <Section title="CODING PROFILES">
            {data.codingProfiles.filter(c => c.details).map(cp => (
              <div key={cp.id} style={{ marginBottom: '2px' }}>
                {cp.platform}- {cp.details}
                {cp.link && <> | Profile Link: <a href={cp.link} style={{ color: '#1155CC' }}>LINK</a></>}
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Certifications */}
      {data.certifications.some(c => c.name) && (
        <>
          <Hr />
          <Section title="CERTIFICATIONS">
            {data.certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ flex: 1 }}>{cert.name}</span>
                <span style={{ width: '120px' }}>|{cert.provider}</span>
                <span style={{ width: '60px', textAlign: 'right', fontWeight: 'bold' }}>{cert.year}</span>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Technical Skills */}
      {Object.values(data.skills).some(v => v) && (
        <>
          <Hr />
          <Section title="TECHNICAL SKILLS">
            {data.skills.languages && <SkillRow label="Languages" value={data.skills.languages} />}
            {data.skills.frameworks && <SkillRow label="Technologies/Frameworks" value={data.skills.frameworks} />}
            {data.skills.database && <SkillRow label="Database" value={data.skills.database} />}
            {data.skills.tools && <SkillRow label="Tools" value={data.skills.tools} />}
            {data.skills.concepts && <SkillRow label="Core Concepts" value={data.skills.concepts} />}
          </Section>
        </>
      )}
    </div>
  );
}

function Hr() {
  return <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '4px 0' }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '13px', textDecoration: 'underline', marginBottom: '4px', letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SkillRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', marginBottom: '2px' }}>
      <span style={{ fontWeight: 'bold', width: '180px', flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ── Input helpers ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = "w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 mt-1";
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
interface ResumeBuilderProps {
  onBack: () => void;
}

export default function ResumeBuilder({ onBack }: ResumeBuilderProps) {
  const [data, setData] = useState<ResumeData>(defaultData);
  const [preview, setPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (!preview) return;
    const handleResize = () => {
      if (previewRef.current) {
        const containerWidth = previewRef.current.offsetWidth;
        if (containerWidth < 794) {
          setScale(containerWidth / 794);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    const t = setTimeout(handleResize, 50);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [preview]);

  const set = (key: keyof ResumeData, val: any) => setData(d => ({ ...d, [key]: val }));

  const updateList = <T extends { id: string }>(key: keyof ResumeData, id: string, field: keyof T, val: any) => {
    setData(d => ({
      ...d,
      [key]: (d[key] as T[]).map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
  };

  const addItem = <T,>(key: keyof ResumeData, template: T) =>
    setData(d => ({ ...d, [key]: [...(d[key] as T[]), template] }));

  const removeItem = (key: keyof ResumeData, id: string) =>
    setData(d => ({ ...d, [key]: (d[key] as any[]).filter(i => i.id !== id) }));

  const handleDownload = async () => {
    setPreview(true);
    setDownloading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const el = document.getElementById('resume-preview')!;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
      pdf.save(`${data.name || 'resume'}.pdf`);
    } catch (e) {
      alert('Download failed. Make sure html2canvas and jspdf are installed.');
    }
    setDownloading(false);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 border border-[#2A2A2A] rounded-2xl flex items-center justify-center hover:border-white transition-colors cursor-pointer animate-fade-in"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">TOOL</span>
            <h1 className="text-xl font-bold text-white font-odoo-slant">Resume Builder</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white cursor-pointer hover:border-neutral-600"
          >
            {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-black rounded-xl text-xs font-semibold cursor-pointer hover:bg-neutral-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Preview panel */}
      {preview && (
        <div 
          ref={previewRef} 
          className="w-full rounded-2xl border border-neutral-800 bg-white overflow-hidden flex justify-center"
          style={{ height: `${1123 * scale}px` }}
        >
          <div 
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top center',
              width: '794px',
              height: '1123px',
              flexShrink: 0
            }}
          >
            <ResumePreview data={data} />
          </div>
        </div>
      )}

      {/* Form */}
      {!preview && (
        <div className="space-y-6">

          {/* Personal Info */}
          <FormSection title="Personal Info">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" value={data.name} onChange={v => set('name', v)} placeholder="Saravanakumar G" />
              <Field label="Phone" value={data.phone} onChange={v => set('phone', v)} placeholder="9600274526" />
              <Field label="Email" value={data.email} onChange={v => set('email', v)} placeholder="name@sece.ac.in" />
              <Field label="LinkedIn URL" value={data.linkedin} onChange={v => set('linkedin', v)} placeholder="https://linkedin.com/in/..." />
              <Field label="GitHub URL" value={data.github} onChange={v => set('github', v)} placeholder="https://github.com/..." />
              <Field label="Portfolio URL" value={data.portfolio} onChange={v => set('portfolio', v)} placeholder="https://..." />
            </div>
          </FormSection>

          {/* Education */}
          <FormSection title="Education">
            {data.education.map(ed => (
              <div key={ed.id} className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-900 last:border-0">
                <Field label="Institution" value={ed.institution} onChange={v => updateList<Education>('education', ed.id, 'institution', v)} />
                <Field label="Degree / Stream" value={ed.degree} onChange={v => updateList<Education>('education', ed.id, 'degree', v)} />
                <Field label="Score / CGPA" value={ed.score} onChange={v => updateList<Education>('education', ed.id, 'score', v)} placeholder="8.05 (3rd sem)" />
                <Field label="Year" value={ed.year} onChange={v => updateList<Education>('education', ed.id, 'year', v)} placeholder="2024-2028" />
              </div>
            ))}
          </FormSection>

          {/* Internships */}
          <FormSection title="Internship Experiences" onAdd={() => addItem('internships', { id: uid(), company: '', year: '', description: '', skillsAcquired: '' })}>
            {data.internships.map(intern => (
              <div key={intern.id} className="space-y-2 pb-3 border-b border-neutral-900 last:border-0">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company" value={intern.company} onChange={v => updateList<Internship>('internships', intern.id, 'company', v)} />
                  <Field label="Year" value={intern.year} onChange={v => updateList<Internship>('internships', intern.id, 'year', v)} placeholder="2025" />
                </div>
                <Field label="Description" value={intern.description} onChange={v => updateList<Internship>('internships', intern.id, 'description', v)} multiline />
                <Field label="Skills Acquired" value={intern.skillsAcquired} onChange={v => updateList<Internship>('internships', intern.id, 'skillsAcquired', v)} placeholder="Frontend: React, JS | Backend: Node.js" />
                {data.internships.length > 1 && <RemoveBtn onClick={() => removeItem('internships', intern.id)} />}
              </div>
            ))}
          </FormSection>

          {/* Projects */}
          <FormSection title="Projects" onAdd={() => addItem('projects', { id: uid(), name: '', link: '', linkLabel: 'Github', date: '', techStack: '', description: '' })}>
            {data.projects.map(proj => (
              <div key={proj.id} className="space-y-2 pb-3 border-b border-neutral-900 last:border-0">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Project Name" value={proj.name} onChange={v => updateList<Project>('projects', proj.id, 'name', v)} />
                  <Field label="Date" value={proj.date} onChange={v => updateList<Project>('projects', proj.id, 'date', v)} placeholder="June 2026" />
                  <Field label="Link URL" value={proj.link} onChange={v => updateList<Project>('projects', proj.id, 'link', v)} placeholder="https://github.com/..." />
                  <Field label="Link Label" value={proj.linkLabel} onChange={v => updateList<Project>('projects', proj.id, 'linkLabel', v)} placeholder="Github / Drive" />
                </div>
                <Field label="Tech Stack" value={proj.techStack} onChange={v => updateList<Project>('projects', proj.id, 'techStack', v)} placeholder="Python, React, MongoDB..." />
                <Field label="Description" value={proj.description} onChange={v => updateList<Project>('projects', proj.id, 'description', v)} multiline />
                {data.projects.length > 1 && <RemoveBtn onClick={() => removeItem('projects', proj.id)} />}
              </div>
            ))}
          </FormSection>

          {/* Achievements */}
          <FormSection title="Achievements" onAdd={() => addItem('achievements', { id: uid(), title: '', year: '', bold: false })}>
            {data.achievements.map(ach => (
              <div key={ach.id} className="flex gap-2 items-center">
                <div className="flex-1"><Field label="Achievement" value={ach.title} onChange={v => updateList<Achievement>('achievements', ach.id, 'title', v)} /></div>
                <div className="w-20"><Field label="Year" value={ach.year} onChange={v => updateList<Achievement>('achievements', ach.id, 'year', v)} /></div>
                {data.achievements.length > 1 && <button onClick={() => removeItem('achievements', ach.id)} className="mt-4 text-neutral-600 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </FormSection>

          {/* Coding Profiles */}
          <FormSection title="Coding Profiles" onAdd={() => addItem('codingProfiles', { id: uid(), platform: '', details: '', link: '' })}>
            {data.codingProfiles.map(cp => (
              <div key={cp.id} className="grid grid-cols-3 gap-3 pb-2 border-b border-neutral-900 last:border-0">
                <Field label="Platform" value={cp.platform} onChange={v => updateList<CodingProfile>('codingProfiles', cp.id, 'platform', v)} placeholder="Leetcode" />
                <Field label="Details" value={cp.details} onChange={v => updateList<CodingProfile>('codingProfiles', cp.id, 'details', v)} placeholder="Max Rating: 1716 | Solved: 300+" />
                <Field label="Profile Link" value={cp.link} onChange={v => updateList<CodingProfile>('codingProfiles', cp.id, 'link', v)} placeholder="https://..." />
              </div>
            ))}
          </FormSection>

          {/* Certifications */}
          <FormSection title="Certifications" onAdd={() => addItem('certifications', { id: uid(), name: '', provider: '', year: '' })}>
            {data.certifications.map(cert => (
              <div key={cert.id} className="grid grid-cols-3 gap-3 pb-2 border-b border-neutral-900 last:border-0">
                <Field label="Course Name" value={cert.name} onChange={v => updateList<Certification>('certifications', cert.id, 'name', v)} />
                <Field label="Provider" value={cert.provider} onChange={v => updateList<Certification>('certifications', cert.id, 'provider', v)} placeholder="Udemy" />
                <Field label="Year" value={cert.year} onChange={v => updateList<Certification>('certifications', cert.id, 'year', v)} />
              </div>
            ))}
          </FormSection>

          {/* Technical Skills */}
          <FormSection title="Technical Skills">
            <div className="space-y-2">
              <Field label="Languages" value={data.skills.languages} onChange={v => set('skills', { ...data.skills, languages: v })} placeholder="C | C++ | JavaScript | Java | Python | HTML | CSS" />
              <Field label="Technologies / Frameworks" value={data.skills.frameworks} onChange={v => set('skills', { ...data.skills, frameworks: v })} placeholder="Spring-Boot | NodeJS | Express | ReactJS | NextJS | Tailwind" />
              <Field label="Database" value={data.skills.database} onChange={v => set('skills', { ...data.skills, database: v })} placeholder="SQL | MongoDB" />
              <Field label="Tools" value={data.skills.tools} onChange={v => set('skills', { ...data.skills, tools: v })} placeholder="Git | GitHub | Docker | Unity | Photoshop" />
              <Field label="Core Concepts" value={data.skills.concepts} onChange={v => set('skills', { ...data.skills, concepts: v })} placeholder="DSA | OOPS | DBMS | CN" />
            </div>
          </FormSection>

        </div>
      )}

      {/* Hidden preview for PDF generation when not in preview mode */}
      {!preview && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ResumePreview data={data} />
        </div>
      )}
    </div>
  );
}

function FormSection({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="bg-[#0F0F10] border border-neutral-900 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">{title}</span>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white cursor-pointer">
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-red-400 cursor-pointer mt-1">
      <Trash2 className="w-3 h-3" /> Remove
    </button>
  );
}
