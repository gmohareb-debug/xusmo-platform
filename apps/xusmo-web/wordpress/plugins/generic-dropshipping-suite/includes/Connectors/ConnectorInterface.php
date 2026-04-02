<?php
namespace GDS\Connectors;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Connector Interface.
 * 
 * Defines the contract for all supplier-specific connectors in GDS.
 */
interface ConnectorInterface
{

    /**
     * Test the connection to the supplier.
     *
     * @return \GDS\Utils\Result
     */
    public function test_connection();

    /**
     * Fetch products from the supplier catalog.
     *
     * @param array $params Query parameters for filtering/pagination.
     * @return array List of normalized product data.
     */
    public function fetch_catalog($params = array());

    /**
     * Fetch inventory/stock levels from the supplier.
     *
     * @param array $skus List of supplier SKUs to check.
     * @return array Map of SKU to stock level.
     */
    public function fetch_inventory($skus = array());

    /**
     * Fetch latest pricing from the supplier.
     *
     * @param array $skus List of supplier SKUs to check.
     * @return array Map of SKU to cost.
     */
    public function fetch_prices($skus = array());

    /**
     * Submit a Purchase Order (PO) to the supplier.
     *
     * @param object $po The PO entity.
     * @return \GDS\Utils\Result
     */
    public function submit_order($po);

    /**
     * Fetch tracking information for a given PO reference.
     *
     * @param string $po_ref Supplier-side PO reference.
     * @return array Tracking details (carrier, tracking number, status).
     */
    public function fetch_tracking($po_ref);
}
