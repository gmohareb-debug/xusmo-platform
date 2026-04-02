import { useState, useCallback, useEffect, useRef } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PageRenderer from './PageRenderer'
import componentRegistry from '@xusmo/engine/components'
import layoutExample from './layouts/coffee-shop-layout.json'
import { saveMultiPageLayout, saveLayout, fetchLayout, fetchSite, saveSite } from './services/layoutService'
import { generateWebsite } from './services/aiService'

// ── Component categories for Add Section modal ──
const COMPONENT_CATEGORIES = {
  'Hero & Landing': ['hero','hero-video','hero-image','hero-stats','trust-badges','scroll-indicator'],
  'Content': ['section-title','content-card','featured-content','about-section','services-section','features','category-showcase','tag-cloud','related-content','author-profile'],
  'Media': ['gallery','carousel','lightbox','video-player','embedded-media','audio-player','before-after-comparison'],
  'Interaction': ['contact','contact-form','newsletter-form','quick-inquiry-form','feedback-form','rating-widget','review-form','comment-section'],
  'Marketplace': ['product-grid','product-card','product-detail','pricing','pricing-table','feature-comparison','add-to-cart-button'],
  'Business & Trust': ['testimonials','case-studies','client-logos','faq-accordion','certifications-badges'],
  'Nav & Footer': ['navbar','announcement-bar','sticky-header','dropdown-nav','mega-menu','breadcrumbs','search-bar','footer','social-media-icons','footer-newsletter','contact-details-block','map-embed','legal-links','copyright-notice'],
  'Utility': ['back-to-top','cookie-consent','loading-spinner','empty-state','error-message','maintenance-notice'],
}

// ── Font options for theme editor ──
const HEADING_FONTS = [
  'Playfair Display','Merriweather','Lora','DM Serif Display','Crimson Text',
  'Space Grotesk','Sora','Cormorant Garamond','Nunito','Fredoka One',
]
const BODY_FONTS = [
  'Inter','DM Sans','Plus Jakarta Sans','Outfit','Nunito Sans','Lato','Roboto',
  'IBM Plex Sans',
]

// ── Default props for new sections (minimal) ──
function getDefaultProps(componentName) {
  const defaults = {
    'section-title': { eyebrow: 'Section', title: 'New Section', subtitle: 'Add your description here' },
    'hero': { eyebrow: 'Welcome', title: 'Your Headline Here', subtitle: 'Add a compelling description', ctaLabel: 'Get Started', ctaHref: '#' },
    'about-section': { title: 'About Us', description: 'Tell your story here.', image: 'https://picsum.photos/seed/about/800/600' },
    'services-section': { title: 'Our Services', services: [{ icon: '⚡', title: 'Service 1', description: 'Description', href: '#' }] },
    'contact-form': { title: 'Get In Touch', email: 'hello@example.com', phone: '(555) 123-4567' },
    'testimonials': { title: 'What Our Clients Say', testimonials: [{ name: 'Jane D.', role: 'Client', quote: 'Great experience!', rating: 5 }] },
    'faq-accordion': { title: 'FAQ', items: [{ question: 'Question?', answer: 'Answer here.' }] },
    'footer': { logo: 'Business Name', text: `© ${new Date().getFullYear()} Business Name. All rights reserved.` },
    'navbar': { logo: 'Brand', links: [{ label: 'Home', href: '/' }], cta: { label: 'Contact', href: '/contact' } },
  }
  return defaults[componentName] || { title: componentName }
}

// ── Sortable section item ──
function SortableSection({ id, section, index, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const firstProp = section.props?.title || section.props?.logo || section.props?.eyebrow || ''
  const label = typeof firstProp === 'string' ? firstProp.slice(0, 40) : ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`section-item ${isSelected ? 'section-item--selected' : ''}`}
      onClick={() => onSelect(index)}
    >
      <span className="section-item__drag" {...attributes} {...listeners}>&#x2630;</span>
      <span className="section-item__name">{section.component}</span>
      {label && <span className="section-item__label">{label}</span>}
      <button className="section-item__delete" onClick={(e) => { e.stopPropagation(); onDelete(index) }} title="Remove section">&times;</button>
    </div>
  )
}

// ── Prop editor for a single section ──
function PropEditor({ section, onChange }) {
  if (!section?.props) return null

  const handlePropChange = (key, value) => {
    onChange({ ...section, props: { ...section.props, [key]: value } })
  }

  const handleArrayItemChange = (key, idx, field, value) => {
    const arr = [...(section.props[key] || [])]
    arr[idx] = { ...arr[idx], [field]: value }
    handlePropChange(key, arr)
  }

  const addArrayItem = (key) => {
    const arr = [...(section.props[key] || [])]
    const template = arr.length > 0 ? Object.fromEntries(Object.keys(arr[0]).map(k => [k, ''])) : { label: '', href: '#' }
    handlePropChange(key, [...arr, template])
  }

  const removeArrayItem = (key, idx) => {
    const arr = [...(section.props[key] || [])]
    arr.splice(idx, 1)
    handlePropChange(key, arr)
  }

  return (
    <div className="prop-editor">
      <h5 className="prop-editor__title">Edit: {section.component}</h5>
      {Object.entries(section.props).map(([key, value]) => {
        // Skip complex nested objects that aren't arrays
        if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'cta') return null

        // CTA object
        if (key === 'cta' && value && typeof value === 'object') {
          return (
            <div key={key} className="prop-editor__group">
              <label className="prop-editor__label">CTA</label>
              <input className="prop-editor__input" placeholder="Label" value={value.label || ''} onChange={e => handlePropChange('cta', { ...value, label: e.target.value })} />
              <input className="prop-editor__input" placeholder="Href" value={value.href || ''} onChange={e => handlePropChange('cta', { ...value, href: e.target.value })} />
            </div>
          )
        }

        // Array of objects (services, links, testimonials, items, etc.)
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          const fields = Object.keys(value[0]).filter(f => typeof value[0][f] === 'string' || typeof value[0][f] === 'number')
          return (
            <div key={key} className="prop-editor__group">
              <label className="prop-editor__label">{key} ({value.length} items)</label>
              <div className="prop-editor__array">
                {value.map((item, idx) => (
                  <div key={idx} className="prop-editor__array-item">
                    {fields.slice(0, 4).map(f => (
                      <input
                        key={f}
                        className="prop-editor__input prop-editor__input--sm"
                        placeholder={f}
                        value={item[f] ?? ''}
                        onChange={e => handleArrayItemChange(key, idx, f, e.target.value)}
                      />
                    ))}
                    <button className="prop-editor__remove-btn" onClick={() => removeArrayItem(key, idx)}>&minus;</button>
                  </div>
                ))}
                <button className="prop-editor__add-btn" onClick={() => addArrayItem(key)}>+ Add {key.replace(/s$/, '')}</button>
              </div>
            </div>
          )
        }

        // Boolean
        if (typeof value === 'boolean') {
          return (
            <div key={key} className="prop-editor__group">
              <label className="prop-editor__label">
                <input type="checkbox" checked={value} onChange={e => handlePropChange(key, e.target.checked)} />
                {key}
              </label>
            </div>
          )
        }

        // Number
        if (typeof value === 'number') {
          return (
            <div key={key} className="prop-editor__group">
              <label className="prop-editor__label">{key}</label>
              <input className="prop-editor__input" type="number" value={value} onChange={e => handlePropChange(key, Number(e.target.value))} />
            </div>
          )
        }

        // String — textarea for long values, input for short
        if (typeof value === 'string') {
          const isLong = value.length > 80 || key.includes('description') || key.includes('text') || key.includes('quote') || key.includes('tagline')
          const isUrl = key.includes('url') || key.includes('Url') || key.includes('image') || key.includes('src') || key.includes('href') || key.includes('video')
          const isColor = key.toLowerCase().includes('color')

          if (isColor) {
            return (
              <div key={key} className="prop-editor__group">
                <label className="prop-editor__label">{key}</label>
                <input className="prop-editor__input" type="color" value={value} onChange={e => handlePropChange(key, e.target.value)} />
              </div>
            )
          }

          return (
            <div key={key} className="prop-editor__group">
              <label className="prop-editor__label">{key}</label>
              {isLong ? (
                <textarea className="prop-editor__textarea" value={value} rows={3} onChange={e => handlePropChange(key, e.target.value)} />
              ) : (
                <input className="prop-editor__input" type={isUrl ? 'url' : 'text'} value={value} onChange={e => handlePropChange(key, e.target.value)} />
              )}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

// ── Theme editor panel ──
function ThemeEditor({ theme, onChange }) {
  if (!theme) return <p className="theme-editor__empty">No theme loaded. Generate a site first.</p>

  const updateColor = (key, value) => {
    onChange({ ...theme, colors: { ...theme.colors, [key]: value } })
  }

  const updateFont = (key, value) => {
    onChange({ ...theme, fonts: { ...theme.fonts, [key]: value } })
  }

  const updateRadius = (value) => {
    onChange({ ...theme, radius: value + 'px' })
  }

  const radiusNum = parseInt(theme.radius) || 12

  return (
    <div className="theme-editor">
      <h5 className="theme-editor__heading">Colors</h5>
      {theme.colors && Object.entries(theme.colors).map(([key, val]) => (
        <div key={key} className="theme-editor__row">
          <label className="theme-editor__label">{key}</label>
          <input type="color" value={val || '#000000'} onChange={e => updateColor(key, e.target.value)} />
          <span className="theme-editor__hex">{val}</span>
        </div>
      ))}

      <h5 className="theme-editor__heading">Fonts</h5>
      <div className="theme-editor__row">
        <label className="theme-editor__label">Heading</label>
        <select value={theme.fonts?.heading || ''} onChange={e => updateFont('heading', e.target.value)}>
          {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="theme-editor__row">
        <label className="theme-editor__label">Body</label>
        <select value={theme.fonts?.body || ''} onChange={e => updateFont('body', e.target.value)}>
          {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <h5 className="theme-editor__heading">Border Radius</h5>
      <div className="theme-editor__row">
        <input type="range" min="0" max="32" value={radiusNum} onChange={e => updateRadius(e.target.value)} />
        <span className="theme-editor__hex">{radiusNum}px</span>
      </div>
    </div>
  )
}

// ── Add Section modal ──
function AddSectionModal({ onAdd, onClose }) {
  const [expandedCat, setExpandedCat] = useState(null)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Section</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {Object.entries(COMPONENT_CATEGORIES).map(([cat, components]) => (
            <div key={cat} className="admin__cat-group">
              <button className="admin__cat-toggle" onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}>
                <span className="admin__cat-arrow">{expandedCat === cat ? '\u25BC' : '\u25B6'}</span>
                <span>{cat}</span>
                <span className="admin__cat-count">{components.length}</span>
              </button>
              {expandedCat === cat && (
                <div className="admin__cat-chips">
                  {components.filter(c => componentRegistry[c]).map(c => (
                    <button key={c} className="admin__component-chip admin__component-chip--add" onClick={() => onAdd(c)}>
                      + {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// ══════════════════════════════════════════════════════════════
// ══ AdminShell — Main Component ═════════════════════════════
// ══════════════════════════════════════════════════════════════

export default function AdminShell({ onThemeChange, fetchSite: fetchSiteProp, saveSite: saveSiteProp }) {
  // Allow callers to inject custom data layer (e.g. xusmo-web API instead of WordPress REST)
  const fetchSiteFn = fetchSiteProp || fetchSite
  const saveSiteFn = saveSiteProp || saveSite
  // ── Core state ──
  const [localSite, setLocalSite] = useState(null) // { theme, pages }
  const [isDirty, setIsDirty] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [layoutKey, setLayoutKey] = useState(0)

  // ── UI state ──
  const [workspaceMode, setWorkspaceMode] = useState('split') // 'split' | 'canvas' | 'focus'
  const [sidebarTab, setSidebarTab] = useState('generate') // 'generate' | 'sections' | 'theme'
  const [selectedSection, setSelectedSection] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [view, setView] = useState('preview') // 'preview' | 'editor'
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [overlayPage, setOverlayPage] = useState(null)

  // ── AI generation state ──
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState('')
  const [genMode, setGenMode] = useState('full')
  const [planInfo, setPlanInfo] = useState(null)
  const [saving, setSaving] = useState(false)

  const totalComponents = Object.keys(componentRegistry).length

  // ── Derived data ──
  const pages = localSite?.pages ? Object.entries(localSite.pages).map(([key, page]) => ({
    key,
    label: page.label || key.charAt(0).toUpperCase() + key.slice(1),
  })) : [{ key: 'home', label: 'Home' }]

  const currentPageLayout = localSite?.pages?.[activePage] || null
  const currentSections = currentPageLayout?.sections || []

  // ── DnD sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ── Load site data on mount ──
  useEffect(() => {
    fetchSiteFn()
      .then(site => {
        if (site?.pages) {
          setLocalSite(site)
          if (site.theme && onThemeChange) onThemeChange(site.theme)
          // Set active page to first available page
          const firstPage = Object.keys(site.pages)[0]
          if (firstPage) setActivePage(firstPage)
        }
      })
      .catch(() => {
        // No site data yet — will be created on first generation
        console.log('No site data found, waiting for generation.')
      })
  }, [])

  // ── Update theme in parent whenever localSite.theme changes ──
  useEffect(() => {
    if (localSite?.theme && onThemeChange) {
      onThemeChange(localSite.theme)
    }
  }, [localSite?.theme])

  // ── Section mutation helpers ──
  const updateSections = (newSections) => {
    if (!localSite?.pages?.[activePage]) return
    setLocalSite(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [activePage]: { ...prev.pages[activePage], sections: newSections },
      },
    }))
    setIsDirty(true)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = currentSections.findIndex((_, i) => `section-${i}` === active.id)
    const newIndex = currentSections.findIndex((_, i) => `section-${i}` === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    updateSections(arrayMove([...currentSections], oldIndex, newIndex))
    setSelectedSection(newIndex)
  }

  const handleDeleteSection = (index) => {
    const updated = [...currentSections]
    updated.splice(index, 1)
    updateSections(updated)
    if (selectedSection === index) setSelectedSection(null)
    else if (selectedSection > index) setSelectedSection(selectedSection - 1)
  }

  const handleAddSection = (componentName) => {
    const newSection = {
      component: componentName,
      props: getDefaultProps(componentName),
      layout: { background: 'default', padding: 'lg', width: 'contained', align: 'center' },
      style: {},
    }
    const insertAt = selectedSection != null ? selectedSection + 1 : currentSections.length
    const updated = [...currentSections]
    updated.splice(insertAt, 0, newSection)
    updateSections(updated)
    setSelectedSection(insertAt)
    setShowAddModal(false)
  }

  const handleSectionPropChange = (updatedSection) => {
    if (selectedSection == null) return
    const updated = [...currentSections]
    updated[selectedSection] = updatedSection
    updateSections(updated)
  }

  const handleThemeChange = (newTheme) => {
    setLocalSite(prev => ({ ...prev, theme: newTheme }))
    setIsDirty(true)
  }

  // ── Save to WordPress ──
  const handleSave = async () => {
    if (!localSite || saving) return
    setSaving(true)
    try {
      await saveSiteFn(localSite)
      setIsDirty(false)
      setGenStatus('Saved!')
      setTimeout(() => setGenStatus(''), 2000)
    } catch (e) {
      setGenStatus('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── AI Generation ──
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || generating) return

    setGenerating(true)
    setPlanInfo(null)
    setGenStatus(genMode === 'theme-only' ? 'Generating theme...' : 'Step 1: Analyzing your business...')

    try {
      const currentTheme = localSite?.theme || null
      const currentPages = localSite?.pages || null

      const result = await generateWebsite(prompt.trim(), {
        mode: genMode,
        currentTheme,
        currentPages,
      })

      if (result._plan) {
        setPlanInfo(result._plan)
      }

      setGenStatus('Building site...')

      if (genMode === 'theme-only') {
        setLocalSite(prev => prev ? { ...prev, theme: result.theme } : { pages: {}, theme: result.theme })
      } else if (genMode === 'layout-only') {
        setLocalSite(prev => prev ? { ...prev, pages: result.pages } : { pages: result.pages, theme: {} })
      } else {
        // Full generation — replace everything
        const newSite = { theme: result.theme, pages: result.pages }
        setLocalSite(newSite)
        // Set active page to first generated page
        const firstPage = Object.keys(result.pages)[0]
        if (firstPage) setActivePage(firstPage)
      }

      setIsDirty(true)

      // Auto-save to WordPress
      const siteToSave = genMode === 'theme-only'
        ? { ...localSite, theme: result.theme }
        : genMode === 'layout-only'
        ? { ...localSite, pages: result.pages }
        : { theme: result.theme, pages: result.pages }

      try {
        await saveSiteFn(siteToSave)
        setIsDirty(false)
      } catch { /* save failed, user can retry manually */ }

      const pageCount = result.pages ? Object.keys(result.pages).length : 0
      const planLabel = result._plan
        ? ` (${result._plan.personality || result._plan.archetype}, ${result._plan.componentCount} components)`
        : ''
      setGenStatus(`Done! ${pageCount} pages generated${planLabel}.`)
      setView('preview')
      setSidebarTab('sections')
      setTimeout(() => setGenStatus(''), 5000)
    } catch (error) {
      console.error('Generation failed:', error)
      const msg = error.message || 'Unknown error'
      if (msg.includes('credits') || msg.includes('quota') || msg.includes('402')) {
        setGenStatus('API credits exhausted.')
      } else if (msg.includes('API key') || msg.includes('401')) {
        setGenStatus('Invalid API key. Check .env file.')
      } else if (msg.includes('rate limit') || msg.includes('429')) {
        setGenStatus('Rate limited. Wait a moment and try again.')
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setGenStatus('Cannot reach AI service. Is it running on port 3001?')
      } else {
        setGenStatus('Generation failed. Please try again.')
      }
    } finally {
      setGenerating(false)
    }
  }, [prompt, generating, genMode, localSite])

  // ── Link click handler for preview ──
  const handlePreviewClick = useCallback((e) => {
    const link = e.target.closest('a')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href) return
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    e.preventDefault()

    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Map routes to page keys
    const pageKeys = localSite?.pages ? Object.keys(localSite.pages) : []
    const routeMap = {}
    pageKeys.forEach(k => { routeMap[`/${k}`] = k })
    routeMap['/'] = 'home'

    if (routeMap[href]) {
      setActivePage(routeMap[href])
      return
    }

    if (href.startsWith('/#')) {
      setActivePage('home')
      setTimeout(() => {
        const el = document.getElementById(href.slice(2))
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
      return
    }

    // Overlay for detail pages
    if (href.startsWith('/product/') || href.startsWith('/category/')) {
      const slug = href.split('/').pop()
      const type = href.startsWith('/product/') ? 'Product' : 'Category'
      setOverlayPage({ type, slug: decodeURIComponent(slug).replace(/-/g, ' '), href })
      return
    }

    setOverlayPage({ type: 'Page', slug: href, href })
  }, [localSite])

  // ══════════════════════════════
  // ══ RENDER ══════════════════
  // ══════════════════════════════

  const renderSidebar = () => (
    <aside className="admin__sidebar">
      {/* Sidebar tab switcher */}
      <div className="admin__sidebar-tabs">
        {[
          { key: 'generate', label: 'AI' },
          { key: 'sections', label: 'Sections' },
          { key: 'theme', label: 'Theme' },
        ].map(t => (
          <button
            key={t.key}
            className={`admin__sidebar-tab ${sidebarTab === t.key ? 'admin__sidebar-tab--active' : ''}`}
            onClick={() => setSidebarTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Generate tab ── */}
      {sidebarTab === 'generate' && (
        <div className="admin__sidebar-section admin__generate">
          <h4 className="admin__sidebar-heading">AI Generate</h4>
          <textarea
            className="admin__prompt-input"
            placeholder="Describe your website... e.g. 'Modern yoga studio in Brooklyn, dark calming theme, with class schedule and pricing'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={generating}
          />
          <div className="admin__mode-select">
            {[
              { value: 'full', label: 'Full Website' },
              { value: 'theme-only', label: 'Theme Only' },
              { value: 'layout-only', label: 'Layout Only' },
            ].map((m) => (
              <label key={m.value} className="admin__mode-option">
                <input type="radio" name="genMode" value={m.value} checked={genMode === m.value} onChange={() => setGenMode(m.value)} disabled={generating} />
                {m.label}
              </label>
            ))}
          </div>
          <button
            className="button button--primary admin__generate-btn"
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
          >
            {generating ? 'Generating...' : 'Generate Website'}
          </button>
          {genStatus && (
            <span className={`admin__status ${genStatus.startsWith('Failed') || genStatus.startsWith('API') || genStatus.startsWith('Invalid') || genStatus.startsWith('Cannot') || genStatus.startsWith('Rate') ? 'admin__status--err' : 'admin__status--ok'}`}>
              {genStatus}
            </span>
          )}
          {planInfo && (
            <div className="admin__plan-info">
              {planInfo.archetype && <span className="admin__plan-tag">{planInfo.archetype}</span>}
              {planInfo.personality && <span className="admin__plan-tag">{planInfo.personality}</span>}
              {planInfo.heroVariant && <span className="admin__plan-tag">{planInfo.heroVariant}</span>}
              {planInfo.homeVariant && <span className="admin__plan-tag">{planInfo.homeVariant}</span>}
              {planInfo.componentCount && <span className="admin__plan-tag">{planInfo.componentCount} components</span>}
              {planInfo.pages && <span className="admin__plan-tag">{planInfo.pages.length} pages</span>}
              {planInfo.businessProfile && (
                <div className="admin__plan-profile">
                  <small>{planInfo.businessProfile.businessName} | {planInfo.businessProfile.industry} | {planInfo.businessProfile.tone} | {planInfo.businessProfile.websiteGoal}</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sections tab ── */}
      {sidebarTab === 'sections' && (
        <div className="admin__sidebar-section">
          <h4 className="admin__sidebar-heading">Sections ({currentSections.length})</h4>
          {currentSections.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={currentSections.map((_, i) => `section-${i}`)} strategy={verticalListSortingStrategy}>
                <div className="section-list">
                  {currentSections.map((section, i) => (
                    <SortableSection
                      key={`section-${i}`}
                      id={`section-${i}`}
                      section={section}
                      index={i}
                      isSelected={selectedSection === i}
                      onSelect={setSelectedSection}
                      onDelete={handleDeleteSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="admin__empty-msg">No sections yet. Generate a site or add sections manually.</p>
          )}
          <button className="button admin__add-section-btn" onClick={() => setShowAddModal(true)}>+ Add Section</button>

          {/* Prop editor */}
          {selectedSection != null && currentSections[selectedSection] && (
            <PropEditor
              section={currentSections[selectedSection]}
              onChange={handleSectionPropChange}
            />
          )}
        </div>
      )}

      {/* ── Theme tab ── */}
      {sidebarTab === 'theme' && (
        <div className="admin__sidebar-section">
          <h4 className="admin__sidebar-heading">Theme</h4>
          <ThemeEditor theme={localSite?.theme} onChange={handleThemeChange} />
        </div>
      )}
    </aside>
  )

  const renderPreview = () => (
    <div className={`admin__preview admin__preview--${previewDevice}`} onClick={handlePreviewClick}>
      {overlayPage ? (
        <div className="admin__overlay-page">
          <div className="admin__overlay-page-inner">
            <h1>{overlayPage.type === '404' ? '404 — Page Not Found' : overlayPage.slug}</h1>
            <p className="admin__overlay-note">
              {overlayPage.type === '404' ? `The page ${overlayPage.href} does not exist.` : 'This page will be available when connected to a data source.'}
            </p>
            <button className="button button--primary" onClick={() => setOverlayPage(null)}>Back to Site</button>
          </div>
        </div>
      ) : (
        <PageRenderer
          key={`${activePage}-${layoutKey}`}
          pageId={2}
          fallbackLayout={activePage === 'home' && !localSite ? layoutExample : null}
          onThemeLoaded={onThemeChange}
          overrideLayout={currentPageLayout}
          overrideTheme={localSite?.theme}
          onSectionClick={sidebarTab === 'sections' ? (i) => { setSelectedSection(i); setSidebarTab('sections') } : undefined}
          selectedSection={sidebarTab === 'sections' ? selectedSection : undefined}
        />
      )}
    </div>
  )

  return (
    <div className="admin">
      {/* ── Top bar ── */}
      <header className="admin__topbar">
        <div className="admin__topbar-left">
          <span className="admin__brand">AI Builder</span>
          <span className="admin__badge">{totalComponents} components</span>
        </div>

        {/* Page tabs */}
        <nav className="admin__topbar-center">
          {pages.map(p => (
            <button
              key={p.key}
              className={`admin__tab ${activePage === p.key ? 'admin__tab--active' : ''}`}
              onClick={() => { setActivePage(p.key); setSelectedSection(null); setOverlayPage(null) }}
            >
              {p.label}
            </button>
          ))}
          <span className="admin__tab-divider">|</span>
          <button
            className={`admin__tab ${view === 'editor' ? 'admin__tab--active' : ''}`}
            onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}
          >
            {view === 'editor' ? 'Preview' : 'JSON'}
          </button>
        </nav>

        <div className="admin__topbar-right">
          {/* Workspace mode toggle */}
          <div className="admin__workspace-toggle">
            {[
              { key: 'split', icon: '\u229E', label: 'Split' },
              { key: 'canvas', icon: '\u26F6', label: 'Canvas' },
              { key: 'focus', icon: '\u2630', label: 'Focus' },
            ].map(w => (
              <button
                key={w.key}
                className={`admin__device-btn ${workspaceMode === w.key ? 'admin__device-btn--active' : ''}`}
                onClick={() => setWorkspaceMode(w.key)}
                title={w.label}
              >
                {w.icon}
              </button>
            ))}
          </div>

          {/* Device toggle */}
          <div className="admin__device-toggle">
            {[
              { key: 'desktop', icon: '\u{1F5A5}', label: 'Desktop' },
              { key: 'tablet', icon: '\u{1F4F1}', label: 'Tablet' },
              { key: 'mobile', icon: '\u{1F4F2}', label: 'Mobile' },
            ].map(d => (
              <button
                key={d.key}
                className={`admin__device-btn ${previewDevice === d.key ? 'admin__device-btn--active' : ''}`}
                onClick={() => setPreviewDevice(d.key)}
                title={d.label}
              >
                {d.icon}
              </button>
            ))}
          </div>

          {/* Save button */}
          <button
            className={`button ${isDirty ? 'button--primary' : ''} admin__save-btn`}
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Saving...' : isDirty ? 'Save \u25CF' : 'Saved'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={`admin__body admin__body--${workspaceMode}`}>
        {/* Sidebar (hidden in Canvas mode) */}
        {workspaceMode !== 'canvas' && renderSidebar()}

        {/* Main content */}
        <main className="admin__main">
          {workspaceMode === 'focus' ? (
            // Focus mode: no preview, just the section outline + prop editor
            <div className="admin__focus-panel">
              <h3>Page: {activePage}</h3>
              {currentSections.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={currentSections.map((_, i) => `section-${i}`)} strategy={verticalListSortingStrategy}>
                    <div className="section-list section-list--focus">
                      {currentSections.map((section, i) => (
                        <SortableSection
                          key={`section-${i}`}
                          id={`section-${i}`}
                          section={section}
                          index={i}
                          isSelected={selectedSection === i}
                          onSelect={setSelectedSection}
                          onDelete={handleDeleteSection}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <p>No sections. Generate a site or add sections.</p>
              )}
              <button className="button admin__add-section-btn" onClick={() => setShowAddModal(true)}>+ Add Section</button>
              {selectedSection != null && currentSections[selectedSection] && (
                <PropEditor section={currentSections[selectedSection]} onChange={handleSectionPropChange} />
              )}
            </div>
          ) : view === 'editor' ? (
            <div className="admin__editor">
              <pre className="admin__json">
                {localSite ? JSON.stringify(localSite.pages?.[activePage] || {}, null, 2) : 'No data. Generate a site first.'}
              </pre>
            </div>
          ) : (
            renderPreview()
          )}
        </main>

        {/* Canvas mode floating toolbar */}
        {workspaceMode === 'canvas' && (
          <div className="admin__canvas-toolbar">
            {pages.map(p => (
              <button
                key={p.key}
                className={`admin__canvas-tab ${activePage === p.key ? 'admin__canvas-tab--active' : ''}`}
                onClick={() => setActivePage(p.key)}
              >
                {p.label}
              </button>
            ))}
            <span className="admin__canvas-divider">|</span>
            <button className="admin__canvas-tab" onClick={() => { setWorkspaceMode('split'); setSidebarTab('generate') }}>AI</button>
            <button className="admin__canvas-tab" onClick={() => { setWorkspaceMode('split'); setSidebarTab('sections') }}>Edit</button>
            <button className="admin__canvas-tab" onClick={() => { setWorkspaceMode('split'); setSidebarTab('theme') }}>Theme</button>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal onAdd={handleAddSection} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
