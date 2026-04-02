<?php
namespace GDS\Connectors;

if (!defined('ABSPATH')) {
    exit;
}

use GDS\Utils\Result;

/**
 * AliExpress Connector (Simulation).
 * 
 * Demonstrates a real-world scenario with multiple variants and rich data.
 */
class AliExpressConnector implements ConnectorInterface
{
    private $config;

    public function __construct($config = array())
    {
        $this->config = $config;
    }

    public function test_connection()
    {
        return Result::success('Connected to AliExpress Dropshipping API successfully!');
    }

    public function fetch_catalog($params = array())
    {
        // Simulate a real AliExpress product payload with variants
        return array(
            array(
                'supplier_sku' => 'ALI-EARBUDS-WP1',
                'title' => 'Dropnex Pro TWS Wireless Earbuds - Bluetooth 5.3',
                'description' => 'Experience crystal clear sound with the Dropnex Pro. Features active noise cancellation, 30-hour battery life, and IPX5 water resistance. Perfect for sports and daily commute.',
                'category' => 'Consumer Electronics > Audio',
                'brand' => 'Dropnex',
                'image_urls' => array(
                    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
                    'https://images.unsplash.com/photo-1583394838336-acd977736f90',
                    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46'
                ),
                'variants' => array(
                    array(
                        'supplier_v_sku' => 'ALI-EARBUDS-WP1-BLK',
                        'cost' => 12.50,
                        'currency' => 'USD',
                        'stock_qty' => 540,
                        'attributes' => array('Color' => 'Carbon Black'),
                        'supplier_origin' => 'CN'
                    ),
                    array(
                        'supplier_v_sku' => 'ALI-EARBUDS-WP1-WHT',
                        'cost' => 12.50,
                        'currency' => 'USD',
                        'stock_qty' => 310,
                        'attributes' => array('Color' => 'Cloud White'),
                        'supplier_origin' => 'CN'
                    ),
                    array(
                        'supplier_v_sku' => 'ALI-EARBUDS-WP1-BLU',
                        'cost' => 13.25,
                        'currency' => 'USD',
                        'stock_qty' => 125,
                        'attributes' => array('Color' => 'Sky Blue'),
                        'supplier_origin' => 'CN'
                    )
                )
            )
        );
    }

    public function fetch_inventory($skus = array())
    {
        return array(
            'ALI-EARBUDS-WP1-BLK' => 540,
            'ALI-EARBUDS-WP1-WHT' => 310,
            'ALI-EARBUDS-WP1-BLU' => 125
        );
    }

    public function fetch_prices($skus = array())
    {
        return array(
            'ALI-EARBUDS-WP1-BLK' => 12.50,
            'ALI-EARBUDS-WP1-WHT' => 12.50,
            'ALI-EARBUDS-WP1-BLU' => 13.25
        );
    }

    public function submit_order($po)
    {
        return Result::success('AliExpress Order Placed. AliExpress Ref: ' . strtoupper(bin2hex(random_bytes(6))));
    }

    public function fetch_tracking($po_ref)
    {
        return array(
            'carrier' => 'Cainiao',
            'tracking_number' => 'LP' . rand(100000000, 999999999) . 'SG',
            'status' => 'shipped'
        );
    }
}
