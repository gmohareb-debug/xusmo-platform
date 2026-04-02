<?php
require_once dirname(dirname(dirname(__DIR__))) . '/wp-load.php';
flush_rewrite_rules();
echo "Rules flushed.";
