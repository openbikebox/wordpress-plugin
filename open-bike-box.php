<?php
/*
Plugin Name: openbikebox
Plugin URI: https://github.com/openbikebox/wordpress-plugin
Description: openbikebox frontend scripts and backend connection
Version: 1.0.0
Author: binary butterfly GmbH
Author URI: https://binary-butterfly.de
Text Domain: open-bike-box
Domain Path: /languages
License: GPL3
License URI: https://www.gnu.org/licenses/gpl-3.0.en.html
*/

/*
openbikebox Frontend
Copyright (C) 2021 binary butterfly GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

defined('ABSPATH') or die('No script kiddies please!');

define('OPEN_BIKE_BOX_VERSION', '1.1.0');
define('OPEN_BIKE_BOX_BASE_URL', plugins_url('', __FILE__));
define('OPEN_BIKE_BOX_BASE_PATH', plugin_dir_path(__FILE__));
if (!defined('OPEN_BIKE_BOX_BACKEND'))
    define('OPEN_BIKE_BOX_BACKEND', 'https://openbikebox.de');
if (!defined('OPEN_BIKE_BOX_PRODUCT'))
    define('OPEN_BIKE_BOX_PRODUCT', 10);
if (!defined('OPEN_BIKE_BOX_BACKEND_USER'))
    define('OPEN_BIKE_BOX_BACKEND_USER', 'unittest');
if (!defined('OPEN_BIKE_BOX_BACKEND_PASSWORD'))
    define('OPEN_BIKE_BOX_BACKEND_PASSWORD', 'unittest');
if (!defined('OPEN_BIKE_BOX_EXTEND_ENABLED'))
    define('OPEN_BIKE_BOX_EXTEND_ENABLED', true);
if (!defined('OPEN_BIKE_BOX_EXPOSITION_MODE'))
    define('OPEN_BIKE_BOX_EXPOSITION_MODE', 'off');

require 'inc/cart.php';
require 'inc/urls.php';
require 'inc/misc.php';
require 'inc/format.php';
require 'inc/assets.php';
require 'inc/product.php';
require 'inc/ajax.php';
require 'inc/checkout.php';
require 'inc/wc-admin.php';
require 'inc/shortcodes.php';
require 'inc/extend-booking.php';
require 'inc/local-data.php';
require 'inc/post-types.php';
require 'inc/custom-fields.php';
