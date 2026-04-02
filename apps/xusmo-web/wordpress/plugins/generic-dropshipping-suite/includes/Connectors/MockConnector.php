<?php
namespace GDS\Connectors;

if (!defined('ABSPATH')) {
    exit;
}

use GDS\Utils\Result;

/**
 * Mock Connector.
 * 
 * Used for development and testing common UI patterns.
 */
class MockConnector implements ConnectorInterface
{

    private $config;

    public function __construct($config = array())
    {
        $this->config = $config;
    }

    public function test_connection()
    {
        // Simulate a delay.
        usleep(500000);

        if (isset($this->config['fail'])) {
            return Result::error('Mock connection failed as requested.');
        }

        return Result::success('Mock connection successful!');
    }

    public function fetch_catalog($params = array())
    {
        return array(
            array(
                'supplier_sku' => 'DN-SHIRT-001',
                'title' => 'DropNex Classic Blue Shirt',
                'description' => 'A high-quality cotton shirt for everyday wear.',
                'category' => 'Apparel',
                'image_urls' => array('https://picsum.photos/seed/shirt/800/600'),
                'variants' => array(
                    array(
                        'supplier_v_sku' => 'DN-SHIRT-001-S',
                        'cost' => 15.00,
                        'stock_qty' => 50,
                        'attributes' => array('Size' => 'S', 'Color' => 'Blue')
                    ),
                    array(
                        'supplier_v_sku' => 'DN-SHIRT-001-M',
                        'cost' => 15.00,
                        'stock_qty' => 75,
                        'attributes' => array('Size' => 'M', 'Color' => 'Blue')
                    )
                )
            ),
            array(
                'supplier_sku' => 'DN-JEANS-002',
                'title' => 'Slim Fit Indigo Jeans',
                'description' => 'Durable and stylish indigo jeans with a premium feel.',
                'category' => 'Apparel',
                'image_urls' => array('https://picsum.photos/seed/jeans/800/600'),
                'variants' => array(
                    array(
                        'supplier_v_sku' => 'DN-JEANS-002-32',
                        'cost' => 25.00,
                        'stock_qty' => 30,
                        'attributes' => array('Size' => '32', 'Color' => 'Indigo')
                    )
                )
            ),
            array(
                'supplier_sku' => 'DN-WATCH-003',
                'title' => 'Minimalist Quartz Watch',
                'description' => 'Sleek black watch with a leather strap. Professional elegance.',
                'category' => 'Accessories',
                'image_urls' => array('https://picsum.photos/seed/watch/800/600'),
                'variants' => array(
                    array(
                        'supplier_v_sku' => 'DN-WATCH-003-BLK',
                        'cost' => 45.00,
                        'stock_qty' => 10,
                        'attributes' => array('Color' => 'Black')
                    )
                )
            )
        );
    }

    public function fetch_inventory($skus = array())
    {
        return array('MOCK-001' => 100);
    }

    public function fetch_prices($skus = array())
    {
        return array('MOCK-001' => 10.00);
    }

    public function submit_order($po)
    {
        return Result::success('Mock order submitted (PO #' . $po->id . ')');
    }

    public function fetch_tracking($po_ref)
    {
        return array(
            'carrier' => 'Mock Carrier',
            'tracking_number' => 'MOCK' . time(),
            'status' => 'shipped'
        );
    }
}
