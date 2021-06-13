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
        'valid_till', 'extended_order_id', 'extended_order_item_id', 'auth_methods'
    );
    foreach ($fields as $field) {
        if (!array_key_exists('_' . $field, $values))
            continue;
        $item->add_meta_data('_' . $field, $values['_' . $field], true);
    }
}, 10, 3);

/*
 * finalizes action at backend after successfull order
 */
add_action('woocommerce_checkout_order_created', function (WC_Order $order) {
    if ($order->get_payment_method() === 'cod') {
        $order->update_status('completed', 'Automatische Fertigstellung aufgrund von Barzahlung');
    }
    if (floatval($order->get_total('raw')) === 0.0) {
        $order->update_status('completed', 'Automatische Fertigstellung aufgrund von Gutschein');
    }
}, 10, 1);


add_action('woocommerce_order_status_completed', function (int $order_id, WC_Order $order) {
    eventually_finalize_booking($order);
}, 10, 2);


function eventually_finalize_booking(WC_Order $order) {
    if ($order->get_status() !== 'completed')
        return;
    if ($order->get_meta('_booking_finalized'))
        return;
    foreach($order->get_items() as $item_id => $item) {
        if ($item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT)
            continue;
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

        // check if extended order
        $extended_order_id = $item->get_meta('_extended_order_id');
        if ($extended_order_id) {
            $extended_order_item_id = $item->get_meta('_extended_order_item_id');
            if (!$extended_order_item_id)
                continue;
            $extended_order_item = get_order_item_by_id(wc_get_order($extended_order_id), $extended_order_item_id);
            $extended_order_item->add_meta_data('_booking_extend_done', 'yes');
            $extended_order_item->add_meta_data('_followup_order_id', $order->get_id());
            $extended_order_item->add_meta_data('_followup_order_item_id', $item_id);
            $extended_order_item->save();
        }
        if (!$item->get_meta('_extend_order_notification_id'))
            $item->add_meta_data('_extend_order_notification_id', obb_schedule_remember_mail($order, $item));
        $item->save();
    }
    $order->update_meta_data('_booking_finalized', '1');
    $order->save();
}


/*
 * display time at order item
 */
add_filter('woocommerce_order_item_name', function(string $name, WC_Order_Item_Product $order_item): string {
    if (!$order_item->is_type('line_item'))
        return $name;
    if ($order_item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT)
        return $name;
    $result = '<strong>' . $order_item->get_meta('_location_name') . ': Box ' . $order_item->get_meta('_resource_identifier') . '</strong><br>';
    $result .= 'Zeitraum: ' . combine_datetime_str($order_item->get_meta('_begin'), $order_item->get_meta('_end')). '<br>';
    if (is_account_page()) {
        $extended_order_id = $order_item->get_meta('_extended_order_id');
        if ($extended_order_id) {
            $result .= '<a class="button is-info" href="/mein-konto/bestellung/' . $extended_order_id . '/">Alte Buchung</a> ';
        }
        if (order_item_is_extendable($order_item)) {
            $result .= '<a class="button is-success" href="' . get_booking_extended_link($order_item) . '">jetzt Buchung verlängern</a>';
        }
        else {
            $followup_order_id = $order_item->get_meta('_followup_order_id');
            if ($followup_order_id) {
                $result .= '<a class="button is-info" href="/mein-konto/bestellung/' . $followup_order_id . '/">Neue Buchung</a> ';
            }
        }
    }
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
    foreach($order->get_items() as $item_id => $order_item) {
        if ($order_item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT) {
            continue;
        }
        $auth_methods = explode(',', $order_item->get_meta('_auth_methods') ?? '');
        if (in_array('code', $auth_methods) && $order_item->get_meta('_code')) {
            if ($first)
                $text .= '<h2>Ihre ' . ($order_item->get_meta('_extended_order_id') ? 'neuen ' : '') . 'Zugangsdaten / access code</h2>';
            $text .= '<table><tr><td>Gültig bis <strong>Datum</strong> /<br>valid until <strong>date</strong></td><th>' . localize_datetime($order_item->get_meta('_end'))->modify("-1 day")->format('Ymd') . '</th></tr>';
            $text .= '<tr><td>Box <strong>Nummer</strong> /<br>box <strong>number</strong></td><th>' . $order_item->get_meta('_resource_identifier') . '</th></tr>';
            $text .= '<tr><td><strong>PIN</strong></td><th>' . $order_item->get_meta('_pin') . '</th></tr>';
            $text .= '<tr><td>Prüf <strong>Summe</strong> /<br>check <strong>sum</strong></td><th>' . $order_item->get_meta('_code') . '</th></tr></table>';
        }

        $begin = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_begin'), new DateTimeZone('UTC'));
        $end = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_end'), new DateTimeZone('UTC'));
        if (in_array('connect', $auth_methods) && $begin->getTimestamp() <= (new DateTime())->getTimestamp() && $end->getTimestamp() >= (new DateTime())->getTimestamp()) {
            $text .= '<div 
                id="obb-thank-you" 
                data-session="' . hash('sha256', $order_item->get_meta('_session')) . '" 
                data-uid="' . $order_item->get_meta('_uid') . '" 
                data-request-uid="' . $order_item->get_meta('_request_uid') . '" 
                data-url="' . OPEN_BIKE_BOX_BACKEND . '"
                data-resource-id="' . $order_item->get_meta('_resource') . '"
            ></div>';
        }
    }
    return $text . '<h2>Bestelldaten</h2>';
}, 10, 2);

/*
 * schedules the remember e-mail
 */
function obb_schedule_remember_mail(WC_Order $order, WC_Order_Item $order_item): int {
    $begin = DateTime::createFromFormat(
        'Y-m-d\TH:i:s\Z',
        $order_item->get_meta('_begin'),
        new DateTimeZone('UTC')
    );
    $end = DateTime::createFromFormat(
        'Y-m-d\TH:i:s\Z',
        $order_item->get_meta('_end'),
        new DateTimeZone('UTC')
    );
    $remember_datetime = obb_get_remember_datetime($begin, $end);
    if ($remember_datetime < new DateTime())
        return 0;
    return as_schedule_single_action(
        $remember_datetime->getTimestamp(),
        'openbikebox_order_renew_notification',
        array('order_id' => $order->get_id(), 'order_item_id' => $order_item->get_id())
    );
}

/*
 * calculates the moment when the remember mail should be sent
 */
function obb_get_remember_datetime(DateTime $begin, DateTime $end): DateTime {
    $timedelta = $begin->diff($end)->days;
    if ($timedelta > 40)
        return (clone $end)->sub(new DateInterval('P7D'));
    if ($timedelta > 20)
        return (clone $end)->sub(new DateInterval('P3D'));
    if ($timedelta > 3)
        return (clone $end)->sub(new DateInterval('P1D'));
    return (clone $end)->sub(new DateInterval('PT12H'));
}

/*
 * force loading emails in scheduler
 */
add_action('action_scheduler_run_queue', function() {
    if(!class_exists('WC_Emails'))
        return;
    WC_Emails::instance();
}, 0);


/*
 * registers remember mail trigger and by transforming args
 */
add_action('openbikebox_order_renew_notification', function ($order_id, $order_item_id) {
    do_action('openbikebox_order_renew_notification_mail', $order_id, $order_item_id);
}, 10, 2);
