// ── Header & Navigation ──
import { AnnouncementBar } from './renderers/react/AnnouncementBar'
import { Navbar } from './renderers/react/Navbar'
import { DropdownNav } from './renderers/react/DropdownNav'
import { MegaMenu } from './renderers/react/MegaMenu'
import { StickyHeader } from './renderers/react/StickyHeader'
import { SearchBar } from './renderers/react/SearchBar'
import { LoginButton } from './renderers/react/LoginButton'
import { RegisterButton } from './renderers/react/RegisterButton'
import { UserAvatarMenu } from './renderers/react/UserAvatarMenu'
import { NotificationIcon } from './renderers/react/NotificationIcon'
import { LanguageSelector } from './renderers/react/LanguageSelector'

// ── Hero & Landing ──
import { Hero } from './renderers/react/Hero'
import { HeroVideo } from './renderers/react/HeroVideo'
import { HeroStats } from './renderers/react/HeroStats'
import { TrustBadges } from './renderers/react/TrustBadges'
import { ScrollIndicator } from './renderers/react/ScrollIndicator'

// ── Content Display ──
import { SectionTitle } from './renderers/react/SectionTitle'
import { ContentCard } from './renderers/react/ContentCard'
import { FeaturedContent } from './renderers/react/FeaturedContent'
import { AboutSection } from './renderers/react/AboutSection'
import { ServicesSection } from './renderers/react/ServicesSection'
import { Features } from './renderers/react/Features'
import { ProductGrid } from './renderers/react/ProductGrid'
import { CategoryShowcase } from './renderers/react/CategoryShowcase'
import { TagCloud } from './renderers/react/TagCloud'
import { RelatedContent } from './renderers/react/RelatedContent'
import { AuthorProfile } from './renderers/react/AuthorProfile'

// ── Media ──
import { Gallery } from './renderers/react/Gallery'
import { Carousel } from './renderers/react/Carousel'
import { Lightbox } from './renderers/react/Lightbox'
import { VideoPlayer } from './renderers/react/VideoPlayer'
import { EmbeddedMedia } from './renderers/react/EmbeddedMedia'
import { AudioPlayer } from './renderers/react/AudioPlayer'
import { BeforeAfterComparison } from './renderers/react/BeforeAfterComparison'

// ── Interaction ──
import { Contact } from './renderers/react/Contact'
import { ContactForm } from './renderers/react/ContactForm'
import { NewsletterForm } from './renderers/react/NewsletterForm'
import { QuickInquiryForm } from './renderers/react/QuickInquiryForm'
import { FileUploadForm } from './renderers/react/FileUploadForm'
import { LiveChatWidget } from './renderers/react/LiveChatWidget'
import { ChatbotAssistant } from './renderers/react/ChatbotAssistant'
import { FeedbackForm } from './renderers/react/FeedbackForm'
import { RatingWidget } from './renderers/react/RatingWidget'
import { ReviewForm } from './renderers/react/ReviewForm'
import { CommentSection } from './renderers/react/CommentSection'

// ── Search & Filtering ──
import { AdvancedSearch } from './renderers/react/AdvancedSearch'
import { SearchResults } from './renderers/react/SearchResults'
import { FiltersSidebar } from './renderers/react/FiltersSidebar'
import { SortControls } from './renderers/react/SortControls'
import { PriceFilter } from './renderers/react/PriceFilter'
import { TagFilters } from './renderers/react/TagFilters'
import { CategoryFilters } from './renderers/react/CategoryFilters'
import { ClearFilterButton } from './renderers/react/ClearFilterButton'

// ── Marketplace / Product ──
import { Pricing } from './renderers/react/Pricing'
import { ProductCard } from './renderers/react/ProductCard'
import { ProductDetail } from './renderers/react/ProductDetail'
import { AddToCartButton } from './renderers/react/AddToCartButton'
import { WishlistButton } from './renderers/react/WishlistButton'
import { CompareButton } from './renderers/react/CompareButton'
import { ProductGallery } from './renderers/react/ProductGallery'
import { ProductSpecsTable } from './renderers/react/ProductSpecsTable'
import { StockIndicator } from './renderers/react/StockIndicator'
import { PriceDisplay } from './renderers/react/PriceDisplay'
import { DiscountBadge } from './renderers/react/DiscountBadge'

// ── User Account ──
import { UserDashboard } from './renderers/react/UserDashboard'
import { ProfilePage } from './renderers/react/ProfilePage'
import { EditProfileForm } from './renderers/react/EditProfileForm'
import { OrderHistory } from './renderers/react/OrderHistory'
import { SavedItems } from './renderers/react/SavedItems'
import { NotificationsCenter } from './renderers/react/NotificationsCenter'
import { MessagesInbox } from './renderers/react/MessagesInbox'
import { ActivityTimeline } from './renderers/react/ActivityTimeline'

// ── Business & Trust ──
import { Testimonials } from './renderers/react/Testimonials'
import { CaseStudies } from './renderers/react/CaseStudies'
import { ClientLogos } from './renderers/react/ClientLogos'
import { PricingTable } from './renderers/react/PricingTable'
import { FeatureComparison } from './renderers/react/FeatureComparison'
import { FaqAccordion } from './renderers/react/FaqAccordion'
import { CertificationsBadges } from './renderers/react/CertificationsBadges'

// ── Utility ──
import { Breadcrumbs } from './renderers/react/Breadcrumbs'
import { Pagination } from './renderers/react/Pagination'
import { BackToTop } from './renderers/react/BackToTop'
import { CookieConsent } from './renderers/react/CookieConsent'
import { LoadingSpinner } from './renderers/react/LoadingSpinner'
import { EmptyState } from './renderers/react/EmptyState'
import { ErrorMessage } from './renderers/react/ErrorMessage'
import { MaintenanceNotice } from './renderers/react/MaintenanceNotice'

// ── Footer ──
import { Footer } from './renderers/react/Footer'
import { SocialMediaIcons } from './renderers/react/SocialMediaIcons'
import { FooterNewsletter } from './renderers/react/FooterNewsletter'
import { ContactDetailsBlock } from './renderers/react/ContactDetailsBlock'
import { MapEmbed } from './renderers/react/MapEmbed'
import { LegalLinks } from './renderers/react/LegalLinks'
import { CopyrightNotice } from './renderers/react/CopyrightNotice'

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
