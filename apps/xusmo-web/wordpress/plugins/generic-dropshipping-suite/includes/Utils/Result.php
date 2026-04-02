<?php
namespace GDS\Utils;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Result Class.
 * 
 * A standardized response object for GDS operations.
 */
class Result
{

    /**
     * Whether the operation was successful.
     *
     * @var bool
     */
    private $success;

    /**
     * Response message.
     *
     * @var string
     */
    private $message;

    /**
     * Response data.
     *
     * @var mixed
     */
    private $data;

    /**
     * Error code if applicable.
     *
     * @var string
     */
    private $error_code;

    /**
     * Constructor.
     *
     * @param bool   $success    Success status.
     * @param string $message    Message.
     * @param mixed  $data       Data.
     * @param string $error_code Error code.
     */
    public function __construct($success, $message = '', $data = null, $error_code = '')
    {
        $this->success = $success;
        $this->message = $message;
        $this->data = $data;
        $this->error_code = $error_code;
    }

    /**
     * Static helper for success.
     */
    public static function success($data = null, $message = '')
    {
        return new self(true, $message, $data);
    }

    /**
     * Static helper for error.
     */
    public static function error($message = '', $error_code = '', $data = null)
    {
        return new self(false, $message, $data, $error_code);
    }

    /**
     * Is success?
     */
    public function is_success()
    {
        return $this->success;
    }

    /**
     * Get message.
     */
    public function get_message()
    {
        return $this->message;
    }

    /**
     * Get data.
     */
    public function get_data()
    {
        return $this->data;
    }

    /**
     * Get error code.
     */
    public function get_error_code()
    {
        return $this->error_code;
    }
}
