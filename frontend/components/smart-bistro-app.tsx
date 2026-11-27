'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, FileImage, Filter, Info, Leaf, RotateCcw, Search, Sparkles, Upload, X, Zap } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000/api/v1'

type View = 'landing' | 'how' | 'upload' | 'analysis'

type Dish = {
  id: string
  french: string
  english: string
  category: string
  calories: number
  selected?: boolean
  description?: string
  allergens?: string[]
  ingredients?: string[]
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  bounding_box?: { x: number; y: number; w: number; h: number }
}

type PerformanceMetrics = {
  ocr_accuracy: number
  bleu_score: number
  database_confidence: number
}

type ScannedDish = {
  id: number
  original_text: string
  english_translation: string
  description?: string
  calories: number
  allergens: string[]
  ingredients: string[]
  protein_g: number
  carbs_g: number
  fat_g: number
  bounding_box?: Dish['bounding_box']
}

type MenuScanResponse = {
  dishes: ScannedDish[]
  metrics: PerformanceMetrics
}

const INITIAL_DISHES: Dish[] = [
  { id: '1', french: 'Vol-au-vent aux champignons', english: 'Crispy Puff Pastry Shell', category: 'Starter', calories: 420, selected: true, description: 'A crisp, buttery puff-pastry shell filled with sauteed mushrooms and a rich cream sauce. The pastry is baked until golden, then filled just before serving to preserve its flaky texture.', allergens: ['Dairy', 'Gluten'], ingredients: ['Butter', 'Wheat Flour', 'Heavy Cream', 'Wild Mushrooms', 'Puff Pastry'], protein_g: 12, carbs_g: 38, fat_g: 24, bounding_box: { x: 50, y: 120, w: 300, h: 40 } },
  { id: '2', french: 'Coq au Vin', english: 'Braised Chicken Stew', category: 'Main course', calories: 580, selected: true, description: 'Chicken is slowly braised in red wine with bacon, mushrooms, and pearl onions until tender. The long, gentle simmer creates a deeply savory sauce served with the vegetables and pan juices.', allergens: ['Pork', 'Alcohol'], ingredients: ['Chicken Thighs', 'Red Wine', 'Bacon', 'Mushrooms', 'Pearl Onions'], protein_g: 45, carbs_g: 14, fat_g: 32, bounding_box: { x: 50, y: 180, w: 250, h: 40 } },
  { id: '3', french: "Soupe à l'oignon", english: 'Classic French Onion Soup', category: 'Starter', calories: 350, selected: true, description: 'Slow-caramelized onions simmered in a savory broth form the base of this classic French soup. It is traditionally topped with baguette and Gruyere, then broiled until the cheese is bubbling and browned.', allergens: ['Dairy', 'Gluten'], ingredients: ['Caramelized Onions', 'Beef Broth', 'Gruyère Cheese', 'Baguette'], protein_g: 16, carbs_g: 28, fat_g: 19, bounding_box: { x: 50, y: 240, w: 280, h: 40 } },
]

function Brand({ onHome }: { onHome: () => void }) {
  return <button onClick={onHome} className="brand" aria-label="Return to Smart Bistro home"><span className="brand-mark"><span>SB</span></span><span>Smart Bistro</span></button>
}

function Topbar({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  return <header className="topbar"><Brand onHome={() => onNavigate('landing')} /><nav><button className={view === 'how' ? 'nav-active' : ''} onClick={() => onNavigate('how')}>How it works</button><button className={view === 'upload' || view === 'analysis' ? 'nav-active' : ''} onClick={() => onNavigate('upload')}>Scan a menu</button></nav><button className="help-button" aria-label="Help"><CircleHelp size={18} /></button></header>
}

function Landing({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <main className="landing-page"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="live-dot" />AI-powered menu intelligence</div><h1>Make every menu<br /><em>make sense.</em></h1><p className="hero-description">Translate French menus, understand every ingredient, and eat with confidence. Smart Bistro turns a quick photo into a clear nutritional story.</p><div className="hero-actions"><button className="button-primary" onClick={() => onNavigate('upload')}>Start scanning <ArrowRight size={16} /></button><button className="button-quiet" onClick={() => onNavigate('how')}><span className="play-ring">▶</span> How it works</button></div><div className="trust-row"><div className="avatar-stack"><span>AM</span><span>JL</span><span>SK</span></div><span>Trusted by curious diners<br /><strong>across 18 countries</strong></span></div></div><div className="hero-art" aria-label="Preview of translated dishes"><div className="orbit orbit-large" /><div className="orbit orbit-small" /><div className="dish-card card-back"><span className="mini-label">MAIN COURSE</span><strong>Coq au Vin</strong><small>Braised chicken stew</small><span className="card-line" /></div><div className="dish-card card-front"><div className="dish-icon">✦</div><span className="mini-label">TRANSLATED FOR YOU</span><strong>Crispy Puff<br />Pastry Shell</strong><small>Vol-au-vent aux champignons</small><div className="card-meta"><span><Leaf size={12} /> 420 kcal</span><span>96% match</span></div></div><div className="floating-pill"><span className="sparkle-icon"><Sparkles size={13} /></span><span><b>AI synthesis</b><br /><small>Ready in seconds</small></span></div></div></section><section className="feature-strip"><div><span className="feature-number">01</span><span><b>See clearly</b><small>French to English, in context</small></span></div><div><span className="feature-number">02</span><span><b>Know what&apos;s inside</b><small>Ingredients, allergens & macros</small></span></div><div><span className="feature-number">03</span><span><b>Choose confidently</b><small>Your table, your way</small></span></div><span className="strip-note">Powered by <strong>ECoCR</strong> + <strong>NMT</strong></span></section></main>
}

function HowItWorks({ onNavigate }: { onNavigate: (view: View) => void }) {
  const steps = [{ number: '01', icon: Upload, title: 'Upload menu image', text: 'Take a photo or drop in an image of your French menu. Our enhanced OCR reads even the trickiest type.' }, { number: '02', icon: Search, title: 'Select your dishes', text: 'Review detected dishes in French and English, then choose exactly what you want to understand.' }, { number: '03', icon: Sparkles, title: 'Get your AI analysis', text: 'Our NMT engine translates with context while ECoCR synthesizes ingredients, allergens and macros.' }]
  return <main className="simple-page"><div className="section-heading"><div><span className="eyebrow">A clearer way to dine</span><h2>From menu to <em>meaning.</em></h2><p>Three simple steps between you and a more informed order.</p></div><span className="step-count">01 <span>/</span> 03</span></div><div className="steps-grid">{steps.map((step, index) => <div className={`step-card ${index === 1 ? 'step-featured' : ''}`} key={step.number}><div className="step-top"><span>{step.number}</span><step.icon size={20} /></div><h3>{step.title}</h3><p>{step.text}</p><div className="step-arrow"><ChevronRight size={17} /></div></div>)}</div><div className="how-bottom"><div className="tech-note"><Zap size={16} /><span>Built with <b>Enhanced OCR</b> + <b>Neural Machine Translation</b></span></div><button className="button-primary" onClick={() => onNavigate('upload')}>Start scanning now <ArrowRight size={16} /></button></div></main>
}

function UploadView({ 
  onNavigate, 
  onAnalyze,
  dishesList,
  setDishesList,
  setMetrics,
  uploadedImage,
  setUploadedImage
}: { 
  onNavigate: (view: View) => void; 
  onAnalyze: (selectedIds: string[]) => void;
  dishesList: Dish[];
  setDishesList: React.Dispatch<React.SetStateAction<Dish[]>>;
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics>>;
  uploadedImage: string | null;
  setUploadedImage: (url: string | null) => void;
}) {
  const [uploaded, setUploaded] = useState(Boolean(uploadedImage))
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!loading) return

    const intervalId = window.setInterval(() => {
      setProgress((current) => current >= 94 ? current : Math.min(current + Math.max((94 - current) * 0.035, 0.2), 94))
    }, 350)

    return () => window.clearInterval(intervalId)
  }, [loading])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = e.target.files?.[0]
    if (!file) return

    let imageUrl: string | null = null
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120_000)
    try {
      setLoading(true)
      setProgress(0)
      setError(null)
      setDishesList([])
      setSelected([])

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/scan-menu`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`The menu scan failed (HTTP ${response.status}).`)

      const data: MenuScanResponse = await response.json()
      if (!Array.isArray(data.dishes)) {
        throw new Error('The menu scan returned an invalid dish list.')
      }

      const mappedDishes: Dish[] = data.dishes.map((item) => ({
        id: String(item.id),
        french: item.original_text,
        english: item.english_translation,
        category: 'Main course',
        calories: item.calories,
        selected: false,
        description: item.description,
        allergens: item.allergens,
        ingredients: item.ingredients,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        bounding_box: item.bounding_box,
      }))

      imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
      setDishesList(mappedDishes)
      setSelected([])
      setMetrics({
        ocr_accuracy: data.metrics.ocr_accuracy,
        bleu_score: data.metrics.bleu_score,
        database_confidence: data.metrics.database_confidence,
      })

      setProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 250))
      setUploaded(true)
    } catch (err) {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      setUploadedImage(null)
      setDishesList([])
      setSelected([])
      setProgress(0)
      setUploaded(false)
      setError(
        err instanceof Error && err.name === 'AbortError'
          ? 'Menu scanning timed out. Try a smaller or clearer image, then upload again.'
          : err instanceof Error
            ? err.message
            : 'Menu scanning failed. Please try again.',
      )
    } finally {
      clearTimeout(timeoutId)
      input.value = ''
      setLoading(false)
    }
  }

  const handleNewScan = () => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage)
    setUploaded(false)
    setUploadedImage(null)
    setDishesList([])
    setSelected([])
    setError(null)
  }

  const filtered = useMemo(() => dishesList.filter((dish) => `${dish.french} ${dish.english}`.toLowerCase().includes(query.toLowerCase())), [query, dishesList])
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <main className="upload-page">
      <div className="page-kicker">
        <button onClick={() => onNavigate('landing')}><ArrowLeft size={16} /> Back to home</button>
        <span>STEP 1 <i /> STEP 2 <i className="muted" /> STEP 3</span>
      </div>
      <div className="upload-heading">
        <div>
          <span className="eyebrow">Your table starts here</span>
          <h2>Scan your <em>menu.</em></h2>
          <p>Upload a clear photo of the French menu to begin.</p>
        </div>
        {uploaded && <button className="reset-button" onClick={handleNewScan}><RotateCcw size={14} /> New scan</button>}
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {!uploaded ? (
        <label className="drop-zone cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={loading} />
          <span className="upload-icon"><Upload size={22} /></span>
          <strong>{loading ? 'Processing your menu...' : 'Drop your menu photo here'}</strong>
          <span>{loading ? (progress < 25 ? 'Preparing image for analysis...' : progress < 60 ? 'Extracting text regions...' : progress < 90 ? 'Running MarianMT context-aware translation...' : 'Synthesizing culinary profile & macros...') : 'or click to browse from your device'}</span>
          {loading && (
            <div className="w-full max-w-sm mt-4" role="status" aria-live="polite">
              <div className="flex justify-between text-xs mb-2">
                <span>Menu analysis progress</span><span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <div className="h-full rounded-full bg-amber-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <small>JPG, PNG or HEIC · Max 10 MB</small>
        </label>
      ) : (
        <div className="selection-area">
          <div className="scan-preview">
            <img src={uploadedImage || "/menu-scan.png"} alt="Photographed French bistro menu" className="w-full h-full object-cover" />
            <div className="scan-status"><span className="live-dot" /> ECoCR scan complete ({dishesList.length} items)</div>
          </div>
          <div className="dish-selection">
            <div className="selection-title">
              <div><span className="eyebrow">ECoCR detected</span><h3>Choose your dishes <sup>{selected.length}</sup></h3></div>
              <button className="filter-button"><Filter size={14} /> All dishes</button>
            </div>
            <div className="search-field">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search extracted French dishes or English translations..." aria-label="Search extracted dishes" />
              {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}
            </div>
            <div className="dish-list">
              {filtered.map((dish) => (
                <button className={`dish-row ${selected.includes(dish.id) ? 'is-selected' : ''}`} key={dish.id} onClick={() => toggle(dish.id)}>
                  <span className={`check-box ${selected.includes(dish.id) ? 'checked' : ''}`}>{selected.includes(dish.id) && <Check size={13} />}</span>
                  <span className="dish-name"><strong>{dish.french}</strong><small>{dish.english}</small></span>
                  <span className="dish-category">{dish.category}</span>
                  <span className="dish-calories">{dish.calories} kcal</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-white/60">{dishesList.length === 0 ? 'No dishes were detected in this menu.' : 'No dishes match your search.'}</p>}
            </div>
            <button className="button-primary analyze-button" disabled={selected.length === 0} onClick={() => onAnalyze(selected)}>
              Analyze {selected.length} selected dishes <Sparkles size={15} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function MacroBar({ label, value, amount, color }: { label: string; value: number; amount: string; color: string }) { return <div className="macro"><div><span>{label}</span><strong>{amount}</strong></div><div className="macro-track"><span style={{ width: `${value}%`, background: color }} /></div></div> }

function Analysis({ 
  onNavigate, 
  selectedIds,
  dishesList,
  metrics,
  uploadedImage
}: { 
  onNavigate: (view: View) => void; 
  selectedIds: string[];
  dishesList: Dish[];
  metrics: PerformanceMetrics;
  uploadedImage: string | null;
}) {
  const visibleDishes = dishesList.filter((item) => selectedIds.includes(item.id))
  const [activeDish, setActiveDish] = useState(visibleDishes[0]?.id ?? dishesList[0]?.id)
  const dish = visibleDishes.find((item) => item.id === activeDish) ?? visibleDishes[0] ?? dishesList[0]

  return (
    <main className="analysis-page">
      <div className="analysis-header">
        <div>
          <div className="page-kicker"><button onClick={() => onNavigate('upload')}><ArrowLeft size={16} /> Back to selection</button></div>
          <span className="eyebrow"><span className="live-dot" /> Analysis complete</span>
          <h2>Your menu, <em>decoded.</em></h2>
        </div>
        <div className="analysis-actions">
          <span className="confidence"><Check size={14} /> {metrics.ocr_accuracy}% confident</span>
          <button className="icon-action" aria-label="More information"><Info size={17} /></button>
        </div>
      </div>
      <div className="analysis-layout">
        <div className="analysis-menu-card">
          <div className="card-heading">
            <div><span className="eyebrow">ECoCR visual map</span><h3>Original menu scan</h3></div>
            <span className="scan-tag"><span className="live-dot" /> {visibleDishes.length} {visibleDishes.length === 1 ? 'dish' : 'dishes'} found</span>
          </div>
          <div className="large-scan relative overflow-hidden bg-black/40">
            <img src={uploadedImage || "/menu-scan.png"} alt="Scanned French menu" className="w-full h-full object-cover" />
            {/* Dynamic OCR Bounding Boxes */}
            {visibleDishes.map((item, index) => {
              const box = item.bounding_box || { x: 20, y: 15 * (index + 1), w: 200, h: 35 }
              return (
                <div 
                  key={item.id} 
                  className={`absolute border px-2 py-1 rounded cursor-pointer transition-all ${activeDish === item.id ? 'bg-amber-500/60 border-amber-300 ring-2 ring-amber-400 z-10' : 'bg-black/50 border-white/40'}`}
                  style={{ 
                    left: `${Math.min(Math.max(box.x / 3, 5), 75)}%`, 
                    top: `${Math.min(Math.max(box.y / 3, 10), 85)}%` 
                  }}
                  onClick={() => setActiveDish(item.id)}
                >
                  <span className="text-xs font-bold text-white truncate block">
                    0{index + 1} · {item.french}
                  </span>
                </div>
              )
            })}
            <div className="zoom-button">⌕</div>
          </div>
          <div className="menu-thumbs">
            {visibleDishes.map((item, index) => (
              <button key={item.id} className={activeDish === item.id ? 'thumb-active' : ''} onClick={() => setActiveDish(item.id)}>
                <span>0{index + 1}</span>{item.english}
              </button>
            ))}
          </div>
        </div>
        <div className="analysis-detail">
          <div className="detail-intro">
            <span className="mini-label">NMT CONTEXT TRANSLATION</span>
            <h3>{dish?.english}</h3>
            <p>{dish?.french}</p>
            {dish?.description && <p className="mt-3 text-sm leading-relaxed text-white/70">{dish.description}</p>}
          </div>
          <div className="translation-block">
            <div className="label-row"><span>AI translation</span><span className="match-score">{metrics.bleu_score} match</span></div>
            <p>{dish?.english ? `Context-aware neural translation: "${dish.english}"` : 'Context-aware French gastric translation processed via fine-tuned MarianMT parameters.'}</p>
          </div>
          <div className="ingredient-block">
            <div className="label-row"><span>Synthesized ingredients</span><span className="ingredient-count">{(dish?.ingredients || []).length} detected</span></div>
            <div className="ingredient-pills">
              {(dish?.ingredients || ['Puff pastry', 'Wild mushrooms', 'Crème fraîche']).map((ing, idx) => (
                <span key={idx}>{ing}</span>
              ))}
            </div>
          </div>
          {dish?.allergens && (
            <div className="allergen-block">
              <div className="label-row"><span>Allergen flags</span><span className="flag-note">Review before ordering</span></div>
              {dish.allergens.length > 0 ? (
                <div className="allergen-pills">
                  {dish.allergens.map((alg, idx) => (
                    <span key={idx} className={`allergen ${alg.toLowerCase()}`}>● {alg}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">No known major allergens flagged</p>
              )}
            </div>
          )}
          <div className="macro-block">
            <div className="label-row"><span>Nutrition per serving</span><span className="calorie-total">{dish?.calories || 420} <small>kcal</small></span></div>
            <MacroBar label="Protein" value={dish?.protein_g ? Math.min(dish.protein_g * 2, 100) : 46} amount={`${dish?.protein_g || 18}g`} color="#c6a15b" />
            <MacroBar label="Carbohydrates" value={dish?.carbs_g ? Math.min(dish.carbs_g * 2, 100) : 64} amount={`${dish?.carbs_g || 42}g`} color="#8f9a7b" />
            <MacroBar label="Fats" value={dish?.fat_g ? Math.min(dish.fat_g * 2, 100) : 38} amount={`${dish?.fat_g || 16}g`} color="#9b7b78" />
          </div>
        </div>
      </div>
      <footer className="metrics-footer">
        <span>MODEL PERFORMANCE</span>
        <div><b>ECoCR Recognition Accuracy</b><strong>{metrics.ocr_accuracy}%</strong></div>
        <div><b>NMT BLEU Score</b><strong>{metrics.bleu_score}</strong></div>
        <div><b>Database Coverage</b><strong>{metrics.database_confidence}%</strong></div>
        <span className="footer-brand"><span className="brand-mark small"><span>SB</span></span> Smart Bistro</span>
      </footer>
    </main>
  )
}

export default function SmartBistroApp() {
  const [view, setView] = useState<View>('landing')
  const [dishesList, setDishesList] = useState<Dish[]>(INITIAL_DISHES)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ ocr_accuracy: 96.4, bleu_score: 92.4, database_confidence: 88.0 })
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>(INITIAL_DISHES.map((dish) => dish.id))
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const openAnalysis = (ids: string[]) => {
    setSelectedDishIds(ids)
    setView('analysis')
  }

  return (
    <div className="smart-bistro">
      <Topbar view={view} onNavigate={setView} />
      {view === 'landing' && <Landing onNavigate={setView} />}
      {view === 'how' && <HowItWorks onNavigate={setView} />}
      {view === 'upload' && (
        <UploadView 
          onNavigate={setView} 
          onAnalyze={openAnalysis} 
          dishesList={dishesList}
          setDishesList={setDishesList}
          setMetrics={setMetrics}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
        />
      )}
      {view === 'analysis' && (
        <Analysis 
          onNavigate={setView} 
          selectedIds={selectedDishIds} 
          dishesList={dishesList}
          metrics={metrics}
          uploadedImage={uploadedImage}
        />
      )}
    </div>
  )
}