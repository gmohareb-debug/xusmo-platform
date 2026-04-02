<?php
/**
 * Plugin Name: Dropnex Woo
 * Plugin URI:  https://github.com/nex-repository/dropnex
 * Description: A multi-agent orchestration suite for automated dropshipping on WordPress + WooCommerce.
 * Version:     1.0.0
 * Author:      Antigravity
 * Author URI:  https://github.com/nex-repository/dropnex
 * Text Domain: gds
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.1
 *
 * @package GDS
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define GDS constants.
define('GDS_VERSION', '1.0.0');
define('GDS_PLUGIN_FILE', __FILE__);
define('GDS_PATH', plugin_dir_path(__FILE__));
define('GDS_URL', plugin_dir_url(__FILE__));

/**
 * Main GDS Class.
 */
class GDS
{

    /**
     * Main instance of GDS.
     *
     * @var GDS
     */
    protected static $_instance = null;

    /**
     * Main GDS Instance.
     *
     * Ensures only one instance of GDS is loaded or can be loaded.
     *
     * @return GDS - Main instance.
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * GDS Constructor.
     */
    public function __construct()
    {
        $this->define_constants();
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Define GDS Constants.
     */
    private function define_constants()
    {
        // More constants can be added here if needed.
    }

    /**
     * Include required core files.
     */
    public function includes()
    {
        if (file_exists(GDS_PATH . 'vendor/autoload.php')) {
            require_once GDS_PATH . 'vendor/autoload.php';
        } else {
            // Fallback PSR-4 autoloader for environments without Composer.
            spl_autoload_register(function ($class) {
                $prefix = 'GDS\\';
                $base_dir = GDS_PATH . 'includes/';
                $len = strlen($prefix);

                if (strncmp($prefix, $class, $len) !== 0) {
                    return;
                }

                $relative_class = substr($class, $len);
                $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

                if (file_exists($file)) {
                    require $file;
                }
            });
        }

    }

    /**
     * Hook into actions and filters.
     */
    private function init_hooks()
    {
        register_activation_hook(__FILE__, array($this, 'install'));
        add_action('plugins_loaded', array($this, 'on_plugins_loaded'), 10);
    }

    /**
     * On plugins loaded.
     */
    public function on_plugins_loaded()
    {
        // Initialize the Agent Registry.
        \GDS\Core\AgentRegistry::instance();

        // Run Bootstrap.
        \GDS\Core\Bootstrap::instance()->init();
    }

    /**
     * Installation logic.
     */
    public function install()
    {
        \GDS\Core\Schema::update_schema();
        \GDS\Core\Capabilities::register();

        // Mark as installed.
        update_option('gds_installed', time());

        // Seed a sample supplier if none exist.
        if (empty(\GDS\Core\SupplierManager::get_active_suppliers())) {
            \GDS\Core\SupplierManager::create_supplier(array(
                'name' => 'Mock Supplier',
                'connector_type' => 'mock',
                'config' => array('api_key' => '12345'),
                'is_active' => 1
            ));
        }
    }
}

/**
 * Returns the main instance of GDS.
 *
 * @return GDS
 */
function GDS()
{
    return GDS::instance();
}

// Global for backwards compatibility.
$GLOBALS['gds'] = GDS();
