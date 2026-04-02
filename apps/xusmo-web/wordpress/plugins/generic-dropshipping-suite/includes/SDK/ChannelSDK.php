<?php
namespace GDS\SDK;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Channel Interface.
 * 
 * Defines the contract for all GDS Sales Channels (Google, FB, Meta, TikTok).
 */
interface GDS_Channel
{
    public function connect();
    public function publish_products($product_ids);
    public function sync_orders($since);
    public function sync_inventory($since);
    public function sync_prices($since);
    public function webhooks_register();
    public function webhooks_handle($payload);
}

/**
 * Channel Manager Class.
 * 
 * Orchestrates multiple sales channels and their synchronization lifecycles.
 */
class ChannelManager
{
    /**
     * Registered Channels.
     *
     * @var array
     */
    private $channels = [];

    /**
     * Main instance of ChannelManager.
     *
     * @var ChannelManager
     */
    protected static $_instance = null;

    /**
     * Main ChannelManager Instance.
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Register a new sales channel.
     */
    public function register_channel($id, GDS_Channel $channel)
    {
        $this->channels[$id] = $channel;
    }

    /**
     * Get all active channels for the tenant.
     */
    public function get_active_channels()
    {
        $registry = \GDS\Core\TenantRegistry::instance();
        $active = [];

        foreach ($this->channels as $id => $channel) {
            // Only return channels enabled for this tenant
            if ($registry->is_feature_enabled("channel_{$id}")) {
                $active[] = $id;
            }
        }

        return $active;
    }

    /**
     * Trigger a global sync across all channels.
     */
    public function sync_all_channels()
    {
        foreach ($this->channels as $id => $channel) {
            $channel->sync_inventory(time() - 3600);
            $channel->sync_prices(time() - 3600);
        }
    }
}
