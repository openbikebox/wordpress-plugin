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

add_action('wp_ajax_obb_add_to_cart', 'obb_add_to_cart_ajax');
add_action('wp_ajax_nopriv_obb_add_to_cart', 'obb_add_to_cart_ajax');

/*
 * reserves an resource and adds it to cart
 */
function obb_add_to_cart_ajax(): array {
    $data = json_decode(stripslashes($_POST['data']));
    obb_clear_cart();
    echo json_encode(handle_obb_add_to_cart(bike_box_request(OPEN_BIKE_BOX_BACKEND . '/api/v1/action/reserve', array(
        'request_uid' => generate_uid(),
        'resource_id' => $data->resource_id,
        'requested_at' => gmdate("Y-m-d\TH:i:s\Z"),
        'begin' => $data->begin,
        'end' => $data->end,
        'predefined_daterange' => $data->predefined_daterange
    ))));
    wp_die();
}


function handle_obb_add_to_cart(object $result, ?int $extended_order_id = null, ?int $extended_order_item_id = null): array {
    if (!$result)
        return array('status' => -1, 'error' => 'invalid response');
    if ($result->status)
        return array('status' => -1, 'error' => 'invalide response status');
    $fields = array(
        'uid', 'request_uid', 'session', 'status', 'value_gross', 'value_net', 'value_tax', 'tax_rate', 'requested_at',
        'begin', 'end', 'valid_till'
    );
    foreach ($fields as $field) {
        $cart_item_data['_' . $field] = $result->data->$field;
    }
    $cart_item_data['_auth_methods'] = implode(',', $result->data->auth_methods);
    $child_defs = array(
        'location' => array('id', 'name', 'slug'),
        'resource' => array('identifier'),
        'operator' => array('name')
    );
    foreach ($child_defs as $parent_field => $child_fields) {
        foreach ($child_fields as $child_field) {
            $cart_item_data['_' . $parent_field . '_' . $child_field] = $result->data->$parent_field->$child_field;
        }
    }
    if ($extended_order_item_id !== null && $extended_order_id !== null) {
        $cart_item_data['_extended_order_id'] = $extended_order_id;
        $cart_item_data['_extended_order_item_id'] = $extended_order_item_id;
    }
    WC()->cart->add_to_cart(OPEN_BIKE_BOX_PRODUCT, 1, 0, array(), $cart_item_data);
    return array('status' => 0);
}

/*
 * clears cart and reservations
 */
function obb_clear_cart() {
    if (!WC()->cart)
        return;
    if (WC()->cart->is_empty())
        return;

    foreach ( WC()->cart->get_cart() as $cart_item ) {
        obb_remove_from_cart($cart_item);
    }
    WC()->cart->empty_cart();
}

/*
 * removes reservation from backend
 */
function obb_remove_from_cart(array $cart_item) {
    foreach (array('_uid', '_session', '_request_uid') as $field) {
        if (!array_key_exists($field, $cart_item) || !$cart_item[$field])
            return;
    }
    bike_box_request(OPEN_BIKE_BOX_BACKEND . '/api/v1/action/cancel', array(
        'uid' => $cart_item['_uid'],
        'session' => $cart_item['_session'],
        'request_uid' => $cart_item['_request_uid']
    ));
}