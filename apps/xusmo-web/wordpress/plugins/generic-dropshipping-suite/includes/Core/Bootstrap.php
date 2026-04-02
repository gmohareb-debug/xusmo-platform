<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Bootstrap Class.
 * 
 * Orchestrates the initialization of all GDS modules and agents.
 */
class Bootstrap
{

    /**
     * Main instance of Bootstrap.
     *
     * @var Bootstrap
     */
    protected static $_instance = null;

    /**
     * Main Bootstrap Instance.
     *
     * @return Bootstrap
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Initialize GDS Modules.
     */
    public function init()
    {
        // 1. Initialize Multi-tenant Registry & Billing (Part B)
        require_once GDS_PATH . 'includes/Core/Schema.php';
        require_once GDS_PATH . 'includes/Core/TenantRegistry.php';
        require_once GDS_PATH . 'includes/Core/BillingEngine.php';
        require_once GDS_PATH . 'includes/SDK/ChannelSDK.php';
        require_once GDS_PATH . 'includes/Storefront/StudioManager.php';
        require_once GDS_PATH . 'includes/Core/OnboardingManager.php';
        require_once GDS_PATH . 'includes/Core/SaaSFrontend.php';

        Schema::update_schema();
        TenantRegistry::instance()->init();
        BillingEngine::instance();
        \GDS\SDK\ChannelManager::instance();
        \GDS\Storefront\StudioManager::instance();
        \GDS\Core\OnboardingManager::instance();
        \GDS\Core\SaaSFrontend::init();

        // 2. Load specialized agents (Tenant-aware)
        $this->load_agents();
        $this->init_connectors();
        $this->init_api();
        $this->init_jobs();
        $this->init_ui();
        $this->init_shortcodes();
        $this->init_storefront_scoper();

        // 3. Ensure capabilities are up-to-date (Admin only)
        add_action('admin_init', function () {
            if (current_user_can('manage_options')) {
                \GDS\Core\Capabilities::register();
            }
        });
    }

    /**
     * Initialize Storefront Tenant Isolation.
     */
    private function init_storefront_scoper()
    {
        require_once GDS_PATH . 'includes/Storefront/TenantScoper.php';
        \GDS\Storefront\TenantScoper::init();
    }

    /**
     * Initialize Customer Shortcodes.
     */
    private function init_shortcodes()
    {
        require_once GDS_PATH . 'includes/Core/Shortcodes.php';
        \GDS\Core\Shortcodes::init();
    }

    /**
     * Initialize Background Jobs.
     */
    private function init_jobs()
    {
        require_once GDS_PATH . 'includes/Core/JobOrchestrator.php';
        \GDS\Core\JobOrchestrator::instance()->init();
    }

    /**
     * Initialize REST API.
     */
    private function init_api()
    {
        // Legacy RestApiManager removed in favor of strict TenantRestController models.


        // New strictly-segregated endpoints
        require_once GDS_PATH . 'includes/RestApi/AbstractRestController.php';
        require_once GDS_PATH . 'includes/RestApi/ProductsRestController.php';
        require_once GDS_PATH . 'includes/RestApi/OrdersRestController.php';
        require_once GDS_PATH . 'includes/RestApi/ImportsRestController.php';
        require_once GDS_PATH . 'includes/RestApi/PricingRestController.php';
        require_once GDS_PATH . 'includes/RestApi/PORestController.php';
        require_once GDS_PATH . 'includes/RestApi/RMARestController.php';
        require_once GDS_PATH . 'includes/RestApi/SettingsRestController.php';
        require_once GDS_PATH . 'includes/RestApi/SuppliersRestController.php';
        require_once GDS_PATH . 'includes/RestApi/WebhookRestController.php';
        require_once GDS_PATH . 'includes/RestApi/PaymentWebhookController.php';

        add_action('rest_api_init', function () {
            $products_controller = new \GDS\RestApi\ProductsRestController();
            $products_controller->register_routes();

            $orders_controller = new \GDS\RestApi\OrdersRestController();
            $orders_controller->register_routes();

            $imports_controller = new \GDS\RestApi\ImportsRestController();
            $imports_controller->register_routes();

            $pricing_controller = new \GDS\RestApi\PricingRestController();
            $pricing_controller->register_routes();

            $po_controller = new \GDS\RestApi\PORestController();
            $po_controller->register_routes();

            $rma_controller = new \GDS\RestApi\RMARestController();
            $rma_controller->register_routes();

            $settings_controller = new \GDS\RestApi\SettingsRestController();
            $settings_controller->register_routes();

            $suppliers_controller = new \GDS\RestApi\SuppliersRestController();
            $suppliers_controller->register_routes();

            $webhook_controller = new \GDS\RestApi\WebhookRestController();
            $webhook_controller->register_routes();

            $payment_controller = new \GDS\RestApi\PaymentWebhookController();
            $payment_controller->register_routes();
        });
    }

    /**
     * Load specialized agents.
     */
    private function load_agents()
    {
        require_once GDS_PATH . 'includes/Agents/CatalogAgent.php';
        require_once GDS_PATH . 'includes/Agents/PricingAgent.php';
        require_once GDS_PATH . 'includes/Agents/FulfillmentAgent.php';
        require_once GDS_PATH . 'includes/Agents/ProductAgent.php';

        $registry = AgentRegistry::instance();

        // Register and initialize Catalog Agent.
        $catalog = new \GDS\Agents\CatalogAgent();
        $registry->register('catalog', $catalog);
        $catalog->init();

        // Register and initialize Product Agent.
        $product = new \GDS\Agents\ProductAgent();
        $registry->register('product', $product);
        $product->init();

        // Register and initialize Pricing Agent.
        $pricing = new \GDS\Agents\PricingAgent();
        $registry->register('pricing', $pricing);
        $pricing->init();

        // Register and initialize Fulfillment Agent.
        $fulfillment = new \GDS\Agents\FulfillmentAgent();
        $registry->register('fulfillment', $fulfillment);
        $fulfillment->init();
    }

    /**
     * Initialize supplier connectors.
     */
    private function init_connectors()
    {
        // Connector SDK and initial connectors.
    }

    /**
     * Initialize Admin UI.
     */
    private function init_ui()
    {
        \GDS\Admin\AdminManager::instance()->init();
    }
}
