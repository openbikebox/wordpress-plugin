<?php
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

defined('ABSPATH') or die('nope.');

/*
 * remove cart link
 */
add_filter('woocommerce_cart_item_permalink', function (string $url, array $cart_item): string {
    if ($cart_item['product_id'] !== OPEN_BIKE_BOX_PRODUCT)
        return $url;
    return false;
}, 10, 2);

/*
 * remove cart thumbnail
 */
add_filter('woocommerce_cart_item_thumbnail', function (string $url, array $cart_item): string {
    if ($cart_item['product_id'] !== OPEN_BIKE_BOX_PRODUCT)
        return $url;
    return false;
}, 10, 2);

/*
 * adds time data at cart
 */
add_filter('woocommerce_cart_item_name', function(string $name, array $cart_item): string {
    if ($cart_item['product_id'] !== OPEN_BIKE_BOX_PRODUCT)
        return $name;
    $result = '<strong>' . $cart_item['_location_name'] . ': Box ' . $cart_item['_resource_identifier'] . '</strong><br>';
    $result .= 'Zeitraum: ' . obb_format_combine_datetime_str(
        $cart_item['_begin'],
        $cart_item['_end'],
        boolval($cart_item['_future_booking'])
    );
    return $result;
}, 10, 2);

/*
 * adds time data at checkout
 */
add_filter('woocommerce_cart_item_name', function (string $name, array $cart_item): string {
    if (!is_checkout()) {
        return $name;
    }
    $result = '<strong>' . $cart_item['_location_name'] . ': Box ' . $cart_item['_resource_identifier'] . '</strong><br>';
    $result .= 'Zeitraum: ' . obb_format_combine_datetime_str($cart_item['_begin'], $cart_item['_end'], boolval($cart_item['_future_booking'])) . '<br>';
    return $result;
}, 10, 2);

/*
 * cancels action when removed from cart
 */
add_action('woocommerce_remove_cart_item', function (string $cart_item_key, WC_Cart $cart) {
    obb_remove_from_cart($cart->cart_contents[$cart_item_key]);
}, 10, 2);

add_filter('woocommerce_coupon_is_valid_for_product', function ($valid, $product, WC_Coupon $coupon, $values) {
    if (!function_exists('get_fields'))
        return false;
    $coupon_locations = get_field('locations', $coupon->get_id());
    if (!$coupon_locations)
        return $valid;
    $location = get_wordpress_location($values['_location_id']);
    if (!$location)
        return false;
    $valid_payments = get_field('payment', $location->ID);
    if (!$valid_payments || !in_array('coupon', $valid_payments))
        return false;
    if (in_array($location->ID, $coupon_locations, true))
        return $valid;
    return false;
}, 10, 4);