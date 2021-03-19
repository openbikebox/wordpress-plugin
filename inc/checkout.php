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


/*
 * validates all reservations by renewing them
 */
add_action('woocommerce_after_checkout_validation', function ($data, $errors) {
    if (!WC()->cart)
        return;
    if (WC()->cart->is_empty())
        return;
    foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
        $result = obb_renew_reservation($cart_item['_uid'], $cart_item['_session'], $cart_item['_request_uid']);
        if (!$result || $result->status !== 0) {
            $errors->add( 'validation', 'Der angefragte Stellplatz wurde zwischenzeitlich leider von jemand anderem gebucht.');
            obb_remove_from_cart($cart_item);
            WC()->cart->remove_cart_item($cart_item_key);
        }
    }
}, 10, 2);

function obb_renew_reservation(string $uid, string  $session, string $request_uid) {
    return bike_box_request(OPEN_BIKE_BOX_BACKEND . '/api/v1/action/renew', array(
        'uid' => $uid,
        'session' => $session,
        'request_uid' => $request_uid
    ));
}

/*
 * copy cart item attributes to order item
 */
add_action('woocommerce_checkout_create_order_line_item', function (WC_Order_Item $item, string $cart_item_key, array $values) {
    $fields = array(
        'uid', 'request_uid', 'session', 'status', 'value_gross', 'value_net', 'value_tax', 'tax_rate', 'requested_at',
        'begin', 'end', 'location_id', 'location_name', 'resource_identifier', 'location_slug', 'operator_name',
        'valid_till'
    );
    foreach ($fields as $field) {
        $item->add_meta_data('_' . $field, $values['_' . $field], true);
    }
}, 10, 3);

/*
 * finalizes action at backend after successfull order
 */
add_action('woocommerce_checkout_order_created', function (WC_Order $order) {
    foreach($order->get_items() as $item_id => $item) {
        if ($item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT) {
            continue;
        }
        $result = bike_box_request(OPEN_BIKE_BOX_BACKEND . '/api/v1/action/book', array(
            'uid' => $item->get_meta('_uid'),
            'request_uid' => $item->get_meta('_request_uid'),
            'session' => $item->get_meta('_session'),
            'paid_at' => gmdate("Y-m-d\TH:i:s\Z"),
            'token' => array(
                array(
                    'type' => 'code',
                    'identifier' => generate_uid(4, '0123456789')
                )
            )
        ));
        $item->add_meta_data('_code', $result->data->token[0]->secret, true);
        $item->add_meta_data('_pin', $result->data->token[0]->identifier, true);
        $item->save();
    }
    if ($order->get_payment_method() === 'cod') {
        $order->update_status('completed', 'Automatische Fertigstellung aufgrund von Barzahlung');
    }
}, 10, 1);

/*
 * display time at order item
 */
add_filter('woocommerce_order_item_name', function(string $name, WC_Order_Item_Product $item): string {
    if (!$item->is_type('line_item'))
        return $name;
    if ($item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT)
        return $name;
    $result = '<strong>' . $item->get_meta('_location_name') . ': Box ' . $item->get_meta('_resource_identifier') . '</strong><br>';
    $result .= 'Zeitraum: ' . combine_datetime($item->get_meta('_begin'), $item->get_meta('_end'));
    return $result;
}, 10, 2);

/*
 * remove showing count because it's always 1
 */
add_action('woocommerce_order_item_quantity_html', function (string $count, WC_Order_Item_Product $item): string {
    if (!$item->is_type('line_item'))
        return $count;
    if ($item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT)
        return $count;
    return '';
}, 10, 2);

/*
 * extend thank you page with obb related data
 */
add_filter('woocommerce_thankyou_order_received_text', function (string $text, WC_Order $order): string {
    $first = true;
    foreach($order->get_items() as $item_id => $item) {
        if ($item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT) {
            continue;
        }
        if (!$item->get_meta('_code'))
            continue;
        if ($first)
            $text .= '<h2>Ihre Zugangsdaten / access code</h2>';
        $text .= '<table><tr><td>Gültig bis <strong>Datum</strong> /<br>valid until <strong>date</strong></td><th>' . localize_datetime($item->get_meta('_end'))->modify("-1 day")->format('Ymd') . '</th></tr>';
        $text .= '<tr><td>Box <strong>Nummer</strong> /<br>box <strong>number</strong></td><th>' . $item->get_meta('_resource_identifier') . '</th></tr>';
        $text .= '<tr><td><strong>PIN</strong></td><th>' . $item->get_meta('_pin') . '</th></tr>';
        $text .= '<tr><td>Prüf <strong>Summe</strong> /<br>check <strong>sum</strong></td><th>' . $item->get_meta('_code') . '</th></tr></table>';
    }
    return $text . '<h2>Bestelldaten</h2>';
}, 10, 2);