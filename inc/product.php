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

add_action('init', function () {
    remove_action('woocommerce_order_details_after_order_table', 'woocommerce_order_again_button');
});

/*
 * Sets price to custom price
 */
add_action('woocommerce_before_calculate_totals', function() {
    foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
        if (!array_key_exists('_value_gross', $cart_item) || !$cart_item['_value_gross'])
            continue;
        $cart_item['data']->set_price($cart_item['_value_gross']);
    }
}, 10, 0);

/*
 * makes an unique product in order to prevent item count
 */
add_filter('woocommerce_is_sold_individually', function (bool $status, WC_Product $product): bool {
    if ($product->get_id() === OPEN_BIKE_BOX_PRODUCT)
        return true;
    return $status;
}, 10, 2);
