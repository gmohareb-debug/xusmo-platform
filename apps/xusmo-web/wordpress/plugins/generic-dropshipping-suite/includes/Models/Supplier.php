<?php
namespace GDS\Models;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Supplier Model.
 */
class Supplier
{

    /**
     * Supplier ID.
     * @var int
     */
    public $id;

    /**
     * Supplier Name.
     * @var string
     */
    public $name;

    /**
     * Supplier Slug.
     * @var string
     */
    public $slug;

    /**
     * Connector Type.
     * @var string
     */
    public $connector_type;

    /**
     * Connector Configuration.
     * @var array
     */
    public $config;

    /**
     * Is active status.
     * @var bool
     */
    public $is_active;

    /**
     * Last sync timestamp.
     * @var string
     */
    public $last_sync_at;

    /**
     * Constructor.
     *
     * @param array $data Raw db row data.
     */
    public function __construct($data = array())
    {
        if (!empty($data)) {
            $this->id = intval($data['id']);
            $this->name = $data['name'];
            $this->slug = $data['slug'];
            $this->connector_type = $data['connector_type'];
            $this->config = maybe_unserialize($data['config']);
            $this->is_active = (bool) $data['is_active'];
            $this->last_sync_at = $data['last_sync_at'];
        }
    }
}
