<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Agent Registry Class.
 * 
 * Manages the registration and retrieval of specialized GDS agents.
 */
class AgentRegistry
{

    /**
     * Main instance of AgentRegistry.
     *
     * @var AgentRegistry
     */
    protected static $_instance = null;

    /**
     * Registered agents.
     *
     * @var array
     */
    private $agents = array();

    /**
     * Main AgentRegistry Instance.
     *
     * @return AgentRegistry
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Register an agent.
     *
     * @param string $id    Agent ID.
     * @param object $agent Agent instance.
     */
    public function register($id, $agent)
    {
        $this->agents[$id] = $agent;

        // Log registration for auditing.
        error_log("[GDS Info] Agent Registered: $id");
    }

    /**
     * Get an agent by ID.
     *
     * @param string $id Agent ID.
     * @return object|null Agent instance or null if not found.
     */
    public function get($id)
    {
        return isset($this->agents[$id]) ? $this->agents[$id] : null;
    }

    /**
     * Get all registered agents.
     *
     * @return array
     */
    public function get_all()
    {
        return $this->agents;
    }
}
