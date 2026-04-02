<?php
namespace GDS\Connectors;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Connector Factory.
 */
class ConnectorFactory
{

    /**
     * Create a connector instance based on type.
     *
     * @param string $type   Connector type slug (e.g., 'csv', 'rest').
     * @param array  $config Connector configuration.
     * @return ConnectorInterface|null
     */
    public static function make($type, $config = array())
    {
        switch ($type) {
            case 'csv':
                require_once GDS_PATH . 'includes/Connectors/CSVConnector.php';
                return new CSVConnector($config);
            case 'mock':
                require_once GDS_PATH . 'includes/Connectors/MockConnector.php';
                return new MockConnector($config);
            case 'aliexpress':
                require_once GDS_PATH . 'includes/Connectors/AliExpressConnector.php';
                return new AliExpressConnector($config);
            case 'rest':
                // Future REST connector
                return null;
            default:
                return apply_filters('gds_make_connector', null, $type, $config);
        }
    }
}
