import { useMemo, useState } from 'react'
import {
  ArrowUpRight, BarChart3, Bell, CalendarDays, Check, ChevronRight, CircleHelp,
  FileText, FolderKanban, ImagePlus, LayoutDashboard, Link2, Menu, Palette,
  Plus, Rocket, Send, Settings, Sparkles, Target, Users, WandSparkles, X,
} from 'lucide-react'
import type { Brand, Campaign, ContentItem, MiroSyncPayload, SyncStatus } from './types/campaign'

const defaultBrand: Brand = {
  company: 'DrStethos', industry: 'Healthcare Recruitment',
  description: 'A platform connecting doctors with hospital job opportunities.',
  audience: 'Doctors and hospitals', personality: 'Professional, trustworthy, modern',
  cta: 'Find your next opportunity', primaryColor: '#5B5CE2', secondaryColor: '#D9D8FF',
}
const demoCampaign: Campaign = {
  campaignId: 'demo-your-next-opportunity',
  campaignName: 'Your Next Opportunity', campaignTheme: 'Make the next move feel obvious',
  brand: 'DrStethos', duration: 7, miroSyncStatus: 'Not Synced',
  campaignObjective: 'Doctor registrations',
  campaignSummary: 'DrStethos earns attention by translating healthcare recruitment expertise into useful, human moments for doctors.',
  targetAudience: 'Doctors and hospitals',
  contentPillars: [
    { name: 'Clarity', purpose: 'Make the problem and the next step easy to understand.' },
    { name: 'Proof', purpose: 'Build trust with practical, grounded insight.' },
    { name: 'Momentum', purpose: 'Turn interest into a confident action.' },
  ],
  calendar: [
    ['The signal your audience is waiting for', 'Reel'], ['Three things your audience should know', 'Carousel'],
    ['A point of view worth sharing', 'LinkedIn post'], ['Behind the scenes of the promise', 'Story'],
    ['The customer question we hear most', 'Carousel'], ['A small win worth celebrating', 'Static post'],
    ['Your next step', 'Reel'],
  ].map(([topic, format], i) => ({
    day: i + 1, platform: i % 2 ? 'LinkedIn' : 'Instagram', format, topic,
    hook: `${topic} — a practical perspective from DrStethos.`,
    caption: `${topic}. Here is what matters: practical, grounded guidance for your next career move. Find your next opportunity.`,
    cta: 'Find your next opportunity', creativeBrief: 'Warm, editorial, confident. Use generous whitespace and a clear focal message.', status: i < 2 ? 'Approved' : 'Draft',
  })),
}
const miroBoardUrl = 'https://miro.com/app/board/uXjVEervLkQ=/'

const icons = { Dashboard: LayoutDashboard, 'Brand Studio': Target, Campaigns: FolderKanban, 'Content Calendar': CalendarDays, 'Creative Studio': Palette, 'Miro Workspace': Link2 }

function App() {
  const [active, setActive] = useState('Dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [brand, setBrand] = useState<Brand>(() => JSON.parse(localStorage.getItem('social-os-brand') ?? JSON.stringify(defaultBrand)))
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = JSON.parse(localStorage.getItem('social-os-campaigns') ?? 'null')
    if (Array.isArray(saved)) return saved
    const legacy = JSON.parse(localStorage.getItem('social-os-campaign') ?? 'null')
    return legacy ? [{ ...legacy, campaignId: legacy.campaignId ?? crypto.randomUUID(), brand: legacy.brand ?? defaultBrand.company, duration: legacy.duration ?? 7, miroSyncStatus: legacy.miroSyncStatus ?? 'Not Synced' }] : []
  })
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(() => localStorage.getItem('social-os-active-campaign'))
  const [selectedDay, setSelectedDay] = useState(0)
  const [toast, setToast] = useState('')
  const [miroPreview, setMiroPreview] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [creativeVersion, setCreativeVersion] = useState('A')

  const campaign = campaigns.find((item) => item.campaignId === activeCampaignId) ?? campaigns[0] ?? null
  const currentItem = campaign?.calendar[selectedDay] ?? demoCampaign.calendar[0]
  const stats = useMemo(() => ({
    campaigns: campaigns.length, pieces: campaigns.reduce((sum, item) => sum + item.calendar.length, 0),
    creatives: campaign ? 3 : 0, approvals: campaign?.calendar.filter((x) => x.status === 'Approved').length ?? 0,
  }), [campaigns, campaign])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000) }
  const saveBrand = () => { localStorage.setItem('social-os-brand', JSON.stringify(brand)); notify('Brand profile saved') }
  const persistCampaigns = (next: Campaign[]) => { setCampaigns(next); localStorage.setItem('social-os-campaigns', JSON.stringify(next)) }
  const loadDemo = () => {
    setBrand(defaultBrand)
    const next = campaigns.some((item) => item.campaignId === demoCampaign.campaignId) ? campaigns : [...campaigns, demoCampaign]
    persistCampaigns(next); setActiveCampaignId(demoCampaign.campaignId); localStorage.setItem('social-os-active-campaign', demoCampaign.campaignId); notify('Demo campaign loaded')
  }
  const generate = async () => {
    setGenerating(true)
    try {
      const response = await fetch('http://localhost:8787/api/campaign/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, campaign: { name: 'Your Next Opportunity', objective: 'Product awareness', duration: 7, platforms: ['Instagram', 'LinkedIn'], tone: 'Professional' } }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      const generated = data.campaign as Campaign
      const next = [...campaigns, generated]
      persistCampaigns(next); setActiveCampaignId(generated.campaignId); localStorage.setItem('social-os-active-campaign', generated.campaignId); setActive('Campaigns'); notify(`Campaign created · ${generated.campaignId.slice(0, 8)}`)
    } catch { loadDemo() } finally { setGenerating(false) }
  }
  const updateStatus = (status: string) => {
    if (!campaign) return
    const next = { ...campaign, calendar: campaign.calendar.map((item, index) => index === selectedDay ? { ...item, status } : item) }
    persistCampaigns(campaigns.map((item) => item.campaignId === campaign.campaignId ? next : item))
  }
  const syncMiro = async () => {
    if (!campaign) return
    setSyncing(true)
    const syncingCampaign = { ...campaign, miroSyncStatus: 'Syncing' as SyncStatus }
    persistCampaigns(campaigns.map((item) => item.campaignId === campaign.campaignId ? syncingCampaign : item))
    try {
      const payloadResponse = await fetch(`http://localhost:8787/api/campaigns/${campaign.campaignId}/miro-payload`)
      const payload = await payloadResponse.json() as MiroSyncPayload
      await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
      const response = await fetch('http://localhost:8787/api/miro/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campaign) })
      const data = await response.json()
      const synced = { ...campaign, miroSyncStatus: data.status === 'Syncing' ? 'Synced' as SyncStatus : 'Sync Failed' as SyncStatus, miroSyncedAt: new Date().toISOString() }
      persistCampaigns(campaigns.map((item) => item.campaignId === campaign.campaignId ? synced : item))
      setMiroPreview(true); notify('Campaign synced to Miro successfully.')
    } catch {
      persistCampaigns(campaigns.map((item) => item.campaignId === campaign.campaignId ? { ...campaign, miroSyncStatus: 'Sync Failed' as SyncStatus } : item))
      notify('Campaign sync failed. Copy the payload and run it through the Copilot Miro MCP workflow.')
    } finally { setSyncing(false) }
  }
  const copyMiroPayload = async () => {
    if (!campaign) return
    const response = await fetch(`http://localhost:8787/api/campaigns/${campaign.campaignId}/miro-payload`)
    const payload = await response.json()
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
    notify('Miro sync payload copied')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark"><Sparkles size={17} /></div><div><strong>SOCIAL OS</strong><span>Campaign command center</span></div></div>
      <nav>
        {Object.keys(icons).map((label) => { const Icon = icons[label as keyof typeof icons]; return <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(label); setMobileNav(false) }}><Icon size={18} /><span>{label}</span>{active === label && <ChevronRight size={15} className="nav-arrow" />}</button> })}
      </nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /><span>Settings</span></button><div className="profile-chip"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><span>Admin workspace</span></div><ChevronRight size={15} /></div></div>
    </aside>
    {mobileNav && <button className="scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu /></button><div><span className="eyebrow">SOCIAL OS / {active.toUpperCase()}</span><h1>{active === 'Dashboard' ? 'Good morning, Jordan' : active}</h1></div><div className="top-actions"><button className="icon-btn" aria-label="Help"><CircleHelp size={19} /></button><button className="icon-btn" aria-label="Notifications"><Bell size={19} /><i /></button><button className="button primary small" onClick={() => { setActive('Campaigns'); setActiveCampaignId(null) }}><Plus size={16} /> New campaign</button></div></header>
      {active === 'Dashboard' && <Dashboard stats={stats} campaign={campaign} onDemo={loadDemo} onNavigate={setActive} />}
      {active === 'Brand Studio' && <BrandStudio brand={brand} setBrand={setBrand} saveBrand={saveBrand} />}
      {active === 'Campaigns' && <CampaignBuilder brand={brand} campaign={campaign} generating={generating} syncing={syncing} onGenerate={generate} onDemo={loadDemo} onSync={syncMiro} onCopyPayload={copyMiroPayload} />}
      {active === 'Content Calendar' && <Calendar campaign={campaign ?? demoCampaign} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
      {active === 'Creative Studio' && <Creative campaign={campaign} item={currentItem} version={creativeVersion} setVersion={setCreativeVersion} onNotify={notify} onImageGenerated={(image) => {
        if (!campaign) return
        const updated = { ...campaign, calendar: campaign.calendar.map((entry) => entry.contentId === currentItem.contentId ? { ...entry, generatedImage: image } : entry), generatedImages: [...(campaign.generatedImages ?? []), image] }
        persistCampaigns(campaigns.map((entry) => entry.campaignId === campaign.campaignId ? updated : entry))
      }} />}
      {active === 'Miro Workspace' && <Miro campaign={campaign ?? demoCampaign} onSync={syncMiro} onPreview={() => setMiroPreview(true)} />}
    </main>
    {miroPreview && <MiroModal campaign={campaign ?? demoCampaign} onClose={() => setMiroPreview(false)} />}
    {toast && <div className="toast"><Check size={17} />{toast}</div>}
  </div>
}

function Dashboard({ stats, campaign, onDemo, onNavigate }: { stats: Record<string, number>; campaign: Campaign | null; onDemo: () => void; onNavigate: (s: string) => void }) {
  return <section className="content fade-in"><div className="hero-card"><div><span className="pill"><Sparkles size={13} /> AI workspace</span><h2>Turn your next idea<br /><em>into momentum.</em></h2><p>From business goal to campaign, content, creative, and results — all in one focused workspace.</p><button className="button dark" onClick={() => onNavigate('Campaigns')}>Build a campaign <ArrowUpRight size={16} /></button></div><div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-card"><Sparkles size={18} /><strong>Campaign intelligence</strong><span>Ready when you are</span></div></div></div><div className="stat-grid">{[['Active campaigns', stats.campaigns, FolderKanban], ['Content pieces', stats.pieces, FileText], ['Creative variations', stats.creatives, Palette], ['Approved items', stats.approvals, Check]].map(([label, value, Icon]) => { const I = Icon as typeof Check; return <div className="stat-card" key={label as string}><div className="stat-icon"><I size={17} /></div><span>{label as string}</span><strong>{value as number}</strong><small>{value ? 'Updated just now' : 'Ready to create'}</small></div> })}</div><div className="section-heading"><div><span className="eyebrow">WORKSPACE</span><h3>Start with a strong foundation</h3></div><button className="text-button" onClick={onDemo}>Load demo data <ArrowUpRight size={15} /></button></div><div className="quick-grid"><Quick icon={Target} title="Define your brand" text="Give the AI the context it needs to sound like you." action={() => onNavigate('Brand Studio')} /><Quick icon={Rocket} title="Build a campaign" text="Generate a strategy and 7-day content calendar." action={() => onNavigate('Campaigns')} /><Quick icon={Link2} title="Sync to Miro" text="Send your campaign to a visual command center." action={() => onNavigate('Miro Workspace')} /></div>{campaign && <div className="recent-card"><div className="section-heading"><div><span className="eyebrow">RECENT CAMPAIGN</span><h3>{campaign.campaignName}</h3></div><span className="status approved">Active</span></div><p>{campaign.campaignSummary}</p><button className="button secondary" onClick={() => onNavigate('Content Calendar')}>View calendar <ArrowUpRight size={15} /></button></div>}</section>
}

function Quick({ icon: Icon, title, text, action }: { icon: typeof Target; title: string; text: string; action: () => void }) { return <button className="quick-card" onClick={action}><div className="quick-icon"><Icon size={18} /></div><strong>{title}</strong><span>{text}</span><ChevronRight size={16} /></button> }
function BrandStudio({ brand, setBrand, saveBrand }: { brand: Brand; setBrand: (b: Brand) => void; saveBrand: () => void }) {
  const field = (key: keyof Brand, label: string, wide = false) => <label className={wide ? 'field wide' : 'field'}>{label}<input value={brand[key]} onChange={(e) => setBrand({ ...brand, [key]: e.target.value })} /></label>
  return <section className="content narrow fade-in"><div className="page-intro"><span className="pill purple"><Target size={13} /> Brand foundation</span><h2>Make the AI sound like you.</h2><p>Your brand profile is saved locally for this MVP and used as context for every campaign.</p></div><div className="form-card"><div className="form-grid">{field('company', 'Company name')}{field('industry', 'Industry')}{field('audience', 'Target audience')}{field('personality', 'Brand personality')}{field('cta', 'Primary CTA')}{field('primaryColor', 'Primary color')}{field('description', 'Company description', true)}{field('secondaryColor', 'Secondary color')}</div><div className="upload-row"><div className="upload-icon"><ImagePlus size={19} /></div><div><strong>Brand assets</strong><span>Logo and reference imagery can be added here when connected to storage.</span></div><button className="button secondary">Choose file</button></div><button className="button primary" onClick={saveBrand}>Save brand profile <Check size={16} /></button></div></section>
}
function CampaignBuilder({ brand, campaign, generating, syncing, onGenerate, onDemo, onSync, onCopyPayload }: { brand: Brand; campaign: Campaign | null; generating: boolean; syncing: boolean; onGenerate: () => void; onDemo: () => void; onSync: () => void; onCopyPayload: () => void }) { return <section className="content narrow fade-in"><div className="page-intro"><span className="pill orange"><WandSparkles size={13} /> Campaign builder</span><h2>Give the week a direction.</h2><p>Use your saved brand context to create a focused campaign strategy and calendar.</p></div><div className="builder-layout"><div className="form-card campaign-form"><div className="form-grid">{['Campaign name|Your Next Opportunity', 'Campaign objective|Product awareness', 'Target audience|Doctors and hospitals', 'Duration|7 days', 'Platforms|Instagram, LinkedIn', 'Tone|Professional, clear, human'].map((entry) => { const [label, value] = entry.split('|'); return <label className="field" key={label}>{label}<input defaultValue={value} /></label> })}<label className="field wide">Additional instructions<textarea placeholder="What should the campaign feel like?" /></label></div><div className="form-footer"><span><Sparkles size={15} /> AI uses {brand.company}'s brand profile</span><div><button className="button secondary" onClick={onDemo}>Use demo data</button><button className="button primary" onClick={onGenerate} disabled={generating}>{generating ? 'Generating…' : 'Generate campaign'} <ArrowUpRight size={16} /></button></div></div></div><div className="side-note"><div className="note-icon"><BarChart3 size={18} /></div><strong>What you’ll get</strong><ul><li>Campaign theme and summary</li><li>Three content pillars</li><li>Seven ready-to-edit ideas</li><li>Creative briefs for every post</li></ul></div></div>{campaign && <div className="success-banner"><Check size={18} /><div><strong>{campaign.campaignName} is ready</strong><span>Your strategy and 7-day calendar are available in Content Calendar.</span></div><span className={`sync-badge ${campaign.miroSyncStatus.toLowerCase().replace(' ', '-')}`}>{campaign.miroSyncStatus}</span><div className="action-row"><button className="button primary" onClick={onSync} disabled={syncing}><Send size={15} /> {syncing ? 'Syncing…' : 'Sync to Miro'}</button><button className="button secondary" onClick={onCopyPayload}>Copy Miro Sync Payload</button></div></div>}</section> }
function Calendar({ campaign, selectedDay, setSelectedDay }: { campaign: Campaign; selectedDay: number; setSelectedDay: (n: number) => void }) { return <section className="content fade-in"><div className="page-intro split"><div><span className="pill purple"><CalendarDays size={13} /> 7-day plan</span><h2>{campaign.campaignName}</h2><p>{campaign.campaignSummary}</p></div><div className="pill objective"><Target size={14} /> {campaign.campaignObjective}</div></div><div className="pillars">{campaign.contentPillars.map((pillar, i) => <div className="pillar" key={pillar.name}><span>0{i + 1}</span><strong>{pillar.name}</strong><p>{pillar.purpose}</p></div>)}</div><div className="calendar-layout"><div className="calendar-list">{campaign.calendar.map((item, i) => <button key={item.day} className={`calendar-item ${i === selectedDay ? 'selected' : ''}`} onClick={() => setSelectedDay(i)}><div className="day-number">0{item.day}<small>DAY</small></div><div className="calendar-copy"><span>{item.platform} · {item.format}</span><strong>{item.topic}</strong><small>{item.hook}</small></div><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span></button>)}</div><div className="detail-card"><span className="eyebrow">CONTENT DETAIL / DAY {currentDay(selectedDay)}</span><h3>{campaign.calendar[selectedDay].topic}</h3><div className="detail-meta"><span>{campaign.calendar[selectedDay].platform}</span><span>{campaign.calendar[selectedDay].format}</span></div><h4>Hook</h4><p>{campaign.calendar[selectedDay].hook}</p><h4>Caption</h4><p>{campaign.calendar[selectedDay].caption}</p><div className="detail-cta"><strong>Creative brief</strong><span>{campaign.calendar[selectedDay].creativeBrief}</span></div></div></div></section> }
function currentDay(day: number) { return String(day + 1).padStart(2, '0') }
function Creative({ campaign, item, version, setVersion, onNotify, onImageGenerated }: { campaign: Campaign | null; item: ContentItem; version: string; setVersion: (v: string) => void; onNotify: (s: string) => void; onImageGenerated: (image: { id: string; url: string; prompt: string }) => void }) {
  const [generatingImage, setGeneratingImage] = useState(false)
  const generateImage = async () => {
    if (!campaign || !item.contentId || !item.creativePrompt) return onNotify('Generate a campaign creative before generating an image.')
    setGeneratingImage(true)
    try {
      const response = await fetch('http://localhost:8787/api/images/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.campaignId, contentId: item.contentId, prompt: item.creativePrompt, aspectRatio: item.aspectRatio ?? '1:1' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onImageGenerated(data.image)
      onNotify('Image generated and saved to this campaign')
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Image generation failed')
    } finally { setGeneratingImage(false) }
  }
  return <section className="content fade-in"><div className="page-intro split"><div><span className="pill pink"><Palette size={13} /> Creative studio</span><h2>Make the idea impossible to scroll past.</h2><p>Generate a visual direction from the selected content brief.</p></div><button className="button primary" onClick={generateImage} disabled={generatingImage}><WandSparkles size={16} /> {generatingImage ? 'Generating image…' : 'Generate image'}</button></div><div className="creative-layout"><div className="creative-preview">{item.generatedImage ? <img className="generated-creative-image" src={item.generatedImage.url.startsWith('/') ? `http://localhost:8787${item.generatedImage.url}` : item.generatedImage.url} alt={item.creativeConcept ?? item.topic} /> : <><div className="creative-top"><span>INSTAGRAM / {item.format.toUpperCase()}</span><span>1080 × 1080</span></div><div className={`creative-art version-${version.toLowerCase()}`}><div className="creative-orb" /><span className="creative-label">DRSTETHOS</span><h3>{item.topic}</h3><p>{item.cta}</p><div className="creative-line" /></div></>}<div className="creative-bottom"><span>{item.generatedImage ? 'Generated asset' : `Preview / Version ${version}`}</span><button className="icon-btn"><ArrowUpRight size={15} /></button></div></div><div className="variation-panel"><span className="eyebrow">VARIATIONS</span><h3>Choose a direction</h3>{[['A', 'Safe / professional', 'Clear hierarchy, trusted tone'], ['B', 'Brand-focused', 'More visual personality'], ['C', 'Bold / creative', 'High contrast, high energy']].map(([v, title, text]) => <button key={v} className={`variation ${v === version ? 'active' : ''}`} onClick={() => setVersion(v)}><span className="variation-letter">{v}</span><div><strong>{title}</strong><small>{text}</small></div>{v === version && <Check size={16} />}</button>)}<button className="button secondary full" onClick={() => onNotify('Creative marked for approval')}>Use this creative <Check size={15} /></button></div></div></section>
}
function Miro({ campaign, onSync, onPreview }: { campaign: Campaign; onSync: () => void; onPreview: () => void }) { return <section className="content fade-in"><div className="page-intro split"><div><span className="pill blue"><Link2 size={13} /> Miro workspace</span><h2>Your visual command center.</h2><p>This campaign is connected to your Miro board through MCP. The preview below mirrors the structure placed there.</p></div><div className="miro-state"><span className="state-dot connected" /> MCP board linked</div></div><div className="miro-board"><div className="board-toolbar"><span><Link2 size={16} /> {campaign.campaignName}</span><span>{campaign.calendar.length} cards · {campaign.contentPillars.length} pillars</span></div><div className="board-canvas"><div className="board-frame overview"><span>01 / OVERVIEW</span><strong>{campaign.campaignName}</strong><small>{campaign.campaignObjective}</small></div><div className="board-frame strategy"><span>02 / STRATEGY</span><div>{campaign.contentPillars.map((p) => <b key={p.name}>{p.name}</b>)}</div></div><div className="board-frame calendar-frame"><span>03 / CONTENT CALENDAR</span><div className="board-mini-grid">{campaign.calendar.slice(0, 7).map((item) => <div key={item.day}><b>0{item.day}</b><small>{item.topic}</small></div>)}</div></div><div className="board-frame approval"><span>04 / APPROVAL</span><div className="approval-track"><b>Draft</b><b>Review</b><b>Approved</b></div></div></div></div><div className="action-row"><button className="button secondary" onClick={onPreview}>Open full preview <ArrowUpRight size={16} /></button><a className="button secondary" href={miroBoardUrl} target="_blank" rel="noreferrer">Open Miro board <ArrowUpRight size={16} /></a><button className="button primary" onClick={onSync}><Send size={16} /> Sync to Miro MCP</button></div></section> }
function MiroModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) { return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">MIRO PREVIEW</span><h3>{campaign.campaignName}</h3></div><button className="icon-btn" onClick={onClose} aria-label="Close preview"><X size={19} /></button></div><div className="modal-board"><div><span>CAMPAIGN OVERVIEW</span><strong>{campaign.campaignTheme}</strong><small>{campaign.campaignSummary}</small></div><div><span>CONTENT STRATEGY</span>{campaign.contentPillars.map((p) => <p key={p.name}><b>{p.name}</b> — {p.purpose}</p>)}</div><div><span>7-DAY CONTENT CALENDAR</span>{campaign.calendar.map((i) => <p key={i.day}><b>Day {i.day}</b> {i.topic} <em>{i.status}</em></p>)}</div></div><div className="modal-foot"><span><CircleHelp size={15} /> Add Miro credentials to enable live sync.</span><button className="button primary" onClick={onClose}>Done</button></div></div></div> }

export default App
