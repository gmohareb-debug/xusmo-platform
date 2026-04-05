// ── Header & Navigation ──
import { AnnouncementBar } from './components/AnnouncementBar'
import { Navbar } from './components/Navbar'
import { DropdownNav } from './components/DropdownNav'
import { MegaMenu } from './components/MegaMenu'
import { StickyHeader } from './components/StickyHeader'
import { SearchBar } from './components/SearchBar'
import { LoginButton } from './components/LoginButton'
import { RegisterButton } from './components/RegisterButton'
import { UserAvatarMenu } from './components/UserAvatarMenu'
import { NotificationIcon } from './components/NotificationIcon'
import { LanguageSelector } from './components/LanguageSelector'

// ── Hero & Landing ──
import { Hero } from './components/Hero'
import { HeroVideo } from './components/HeroVideo'
import { HeroStats } from './components/HeroStats'
import { TrustBadges } from './components/TrustBadges'
import { ScrollIndicator } from './components/ScrollIndicator'

// ── Content Display ──
import { SectionTitle } from './components/SectionTitle'
import { ContentCard } from './components/ContentCard'
import { FeaturedContent } from './components/FeaturedContent'
import { AboutSection } from './components/AboutSection'
import { ServicesSection } from './components/ServicesSection'
import { Features } from './components/Features'
import { ProductGrid } from './components/ProductGrid'
import { CategoryShowcase } from './components/CategoryShowcase'
import { TagCloud } from './components/TagCloud'
import { RelatedContent } from './components/RelatedContent'
import { AuthorProfile } from './components/AuthorProfile'

// ── Media ──
import { Gallery } from './components/Gallery'
import { Carousel } from './components/Carousel'
import { Lightbox } from './components/Lightbox'
import { VideoPlayer } from './components/VideoPlayer'
import { EmbeddedMedia } from './components/EmbeddedMedia'
import { AudioPlayer } from './components/AudioPlayer'
import { BeforeAfterComparison } from './components/BeforeAfterComparison'

// ── Interaction ──
import { Contact } from './components/Contact'
import { ContactForm } from './components/ContactForm'
import { NewsletterForm } from './components/NewsletterForm'
import { QuickInquiryForm } from './components/QuickInquiryForm'
import { FileUploadForm } from './components/FileUploadForm'
import { LiveChatWidget } from './components/LiveChatWidget'
import { ChatbotAssistant } from './components/ChatbotAssistant'
import { FeedbackForm } from './components/FeedbackForm'
import { RatingWidget } from './components/RatingWidget'
import { ReviewForm } from './components/ReviewForm'
import { CommentSection } from './components/CommentSection'

// ── Search & Filtering ──
import { AdvancedSearch } from './components/AdvancedSearch'
import { SearchResults } from './components/SearchResults'
import { FiltersSidebar } from './components/FiltersSidebar'
import { SortControls } from './components/SortControls'
import { PriceFilter } from './components/PriceFilter'
import { TagFilters } from './components/TagFilters'
import { CategoryFilters } from './components/CategoryFilters'
import { ClearFilterButton } from './components/ClearFilterButton'

// ── Marketplace / Product ──
import { Pricing } from './components/Pricing'
import { ProductCard } from './components/ProductCard'
import { ProductDetail } from './components/ProductDetail'
import { AddToCartButton } from './components/AddToCartButton'
import { WishlistButton } from './components/WishlistButton'
import { CompareButton } from './components/CompareButton'
import { ProductGallery } from './components/ProductGallery'
import { ProductSpecsTable } from './components/ProductSpecsTable'
import { StockIndicator } from './components/StockIndicator'
import { PriceDisplay } from './components/PriceDisplay'
import { DiscountBadge } from './components/DiscountBadge'

// ── User Account ──
import { UserDashboard } from './components/UserDashboard'
import { ProfilePage } from './components/ProfilePage'
import { EditProfileForm } from './components/EditProfileForm'
import { OrderHistory } from './components/OrderHistory'
import { SavedItems } from './components/SavedItems'
import { NotificationsCenter } from './components/NotificationsCenter'
import { MessagesInbox } from './components/MessagesInbox'
import { ActivityTimeline } from './components/ActivityTimeline'

// ── Business & Trust ──
import { Testimonials } from './components/Testimonials'
import { CaseStudies } from './components/CaseStudies'
import { ClientLogos } from './components/ClientLogos'
import { PricingTable } from './components/PricingTable'
import { FeatureComparison } from './components/FeatureComparison'
import { FaqAccordion } from './components/FaqAccordion'
import { CertificationsBadges } from './components/CertificationsBadges'

// ── Utility ──
import { Breadcrumbs } from './components/Breadcrumbs'
import { Pagination } from './components/Pagination'
import { BackToTop } from './components/BackToTop'
import { CookieConsent } from './components/CookieConsent'
import { LoadingSpinner } from './components/LoadingSpinner'
import { EmptyState } from './components/EmptyState'
import { ErrorMessage } from './components/ErrorMessage'
import { MaintenanceNotice } from './components/MaintenanceNotice'

// ── Footer ──
import { Footer } from './components/Footer'
import { SocialMediaIcons } from './components/SocialMediaIcons'
import { FooterNewsletter } from './components/FooterNewsletter'
import { ContactDetailsBlock } from './components/ContactDetailsBlock'
import { MapEmbed } from './components/MapEmbed'
import { LegalLinks } from './components/LegalLinks'
import { CopyrightNotice } from './components/CopyrightNotice'

/**
 * Component Registry
 *
 * Maps lowercase kebab-style keys to React components.
 * The JSON layout references these keys in section.component.
 * Every component is modular — driven entirely by props, no hardcoded values.
 */
const componentRegistry = {
  // Header & Navigation
  'announcement-bar': AnnouncementBar,
  'navbar': Navbar,
  'dropdown-nav': DropdownNav,
  'mega-menu': MegaMenu,
  'sticky-header': StickyHeader,
  'search-bar': SearchBar,
  'login-button': LoginButton,
  'register-button': RegisterButton,
  'user-avatar-menu': UserAvatarMenu,
  'notification-icon': NotificationIcon,
  'language-selector': LanguageSelector,

  // Hero & Landing
  'hero': Hero,
  'hero-video': (props) => Hero({ ...props, variant: 'video' }),
  'hero-image': (props) => Hero({ ...props, variant: 'image' }),
  'hero-stats': HeroStats,
  'trust-badges': TrustBadges,
  'scroll-indicator': ScrollIndicator,

  // Content Display
  'section-title': SectionTitle,
  'content-card': ContentCard,
  'featured-content': FeaturedContent,
  'about-section': AboutSection,
  'services-section': ServicesSection,
  'features': Features,
  'product-grid': ProductGrid,
  'category-showcase': CategoryShowcase,
  'tag-cloud': TagCloud,
  'related-content': RelatedContent,
  'author-profile': AuthorProfile,

  // Media
  'gallery': Gallery,
  'carousel': Carousel,
  'lightbox': Lightbox,
  'video-player': VideoPlayer,
  'embedded-media': EmbeddedMedia,
  'audio-player': AudioPlayer,
  'before-after-comparison': BeforeAfterComparison,

  // Interaction
  'contact': Contact,
  'contact-form': ContactForm,
  'newsletter-form': NewsletterForm,
  'quick-inquiry-form': QuickInquiryForm,
  'file-upload-form': FileUploadForm,
  'live-chat-widget': LiveChatWidget,
  'chatbot-assistant': ChatbotAssistant,
  'feedback-form': FeedbackForm,
  'rating-widget': RatingWidget,
  'review-form': ReviewForm,
  'comment-section': CommentSection,

  // Search & Filtering
  'advanced-search': AdvancedSearch,
  'search-results': SearchResults,
  'filters-sidebar': FiltersSidebar,
  'sort-controls': SortControls,
  'price-filter': PriceFilter,
  'tag-filters': TagFilters,
  'category-filters': CategoryFilters,
  'clear-filter-button': ClearFilterButton,

  // Marketplace / Product
  'pricing': Pricing,
  'product-card': ProductCard,
  'product-detail': ProductDetail,
  'add-to-cart-button': AddToCartButton,
  'wishlist-button': WishlistButton,
  'compare-button': CompareButton,
  'product-gallery': ProductGallery,
  'product-specs-table': ProductSpecsTable,
  'stock-indicator': StockIndicator,
  'price-display': PriceDisplay,
  'discount-badge': DiscountBadge,

  // User Account
  'user-dashboard': UserDashboard,
  'profile-page': ProfilePage,
  'edit-profile-form': EditProfileForm,
  'order-history': OrderHistory,
  'saved-items': SavedItems,
  'notifications-center': NotificationsCenter,
  'messages-inbox': MessagesInbox,
  'activity-timeline': ActivityTimeline,

  // Business & Trust
  'testimonials': Testimonials,
  'case-studies': CaseStudies,
  'client-logos': ClientLogos,
  'pricing-table': PricingTable,
  'feature-comparison': FeatureComparison,
  'faq-accordion': FaqAccordion,
  'certifications-badges': CertificationsBadges,

  // Utility
  'breadcrumbs': Breadcrumbs,
  'pagination': Pagination,
  'back-to-top': BackToTop,
  'cookie-consent': CookieConsent,
  'loading-spinner': LoadingSpinner,
  'empty-state': EmptyState,
  'error-message': ErrorMessage,
  'maintenance-notice': MaintenanceNotice,

  // Footer
  'footer': Footer,
  'social-media-icons': SocialMediaIcons,
  'footer-newsletter': FooterNewsletter,
  'contact-details-block': ContactDetailsBlock,
  'map-embed': MapEmbed,
  'legal-links': LegalLinks,
  'copyright-notice': CopyrightNotice,
}

export default componentRegistry
