<?php
namespace GDS\Connectors;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * CSV Connector.
 */
class CSVConnector implements ConnectorInterface
{

    /**
     * Configuration.
     */
    private $config;

    /**
     * Constructor.
     */
    public function __construct($config = array())
    {
        $this->config = $config;
    }

    /**
     * Test connection (check if file exists/is readable).
     */
    public function test_connection()
    {
        return \GDS\Utils\Result::success(null, 'CSV Connector ready.');
    }

    /**
     * Fetch catalog (Mock implementation for now).
     */
    public function fetch_catalog($params = array())
    {
        // In a real scenario, this would parse a CSV file.
        // Returning a mock array for testing the pipeline.
        return array(
            array(
                'supplier_sku' => 'MOCK-ITEM-001',
                'title' => 'Mock Product 1',
                'description' => 'A mock product for testing.',
                'category' => 'Uncategorized',
                'variants' => array(
                    array(
                        'supplier_v_sku' => 'MOCK-ITEM-001-V1',
                        'cost' => 10.00,
                        'stock_qty' => 50,
                        'attributes' => array('Color' => 'Red'),
                    )
                )
            )
        );
    }

    public function fetch_inventory($skus = array())
    {
        return array();
    }
    public function fetch_prices($skus = array())
    {
        return array();
    }
    public function submit_order($po)
    {
        return \GDS\Utils\Result::error('Not implemented');
    }
    public function fetch_tracking($po_ref)
    {
        return array();
    }
}
