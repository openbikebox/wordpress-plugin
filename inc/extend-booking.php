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


function order_item_is_extendable(WC_Order_Item $order_item): bool {
    $end = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_end'), new DateTimeZone('UTC'));
    if ($end < new DateTime()) {
        return false;
    }
    if ($order_item->get_meta('_booking_extend_done') === 'yes')
        return false;
    return true;
}

/*
 * load admin mail
 */
add_filter( 'woocommerce_email_classes', function(array $email_classes): array {
    include 'remember-mail-admin.php';
    $email_classes['WC_Extend_Booking_Email'] = new WC_Extend_Booking_Email();
    return $email_classes;
});

/*
 * generates a link for extending the booking
 */
function get_booking_extend_link_by_order(WC_Order $order): string {
    foreach($order->get_items() as $item_id => $order_item) {
        if ($order_item->get_product_id() !== OPEN_BIKE_BOX_PRODUCT) {
            continue;
        }
        return get_booking_extended_link($order_item);
    }
    return '';
}

function get_booking_extended_link(WC_Order_Item $order_item): string {
    if ($order_item->get_meta('_booking_extend_secret')) {
        $booking_extend_secret = $order_item->get_meta('_booking_extend_secret');
    }
    else {
        $booking_extend_secret = generate_uid();
        $order_item->add_meta_data('_booking_extend_secret', $booking_extend_secret, true);
        $order_item->save();
    }
    return wc_get_cart_url() . '?action=extend-booking&order=' . $order_item->get_order_id() . '&item=' . $order_item->get_id() . '&secret=' . $booking_extend_secret;
}

add_action('wp', function () {
    if (!is_cart()) {
        return;
    }
    if (!isset($_GET['action']) || $_GET['action'] !== 'extend-booking' || !isset($_GET['order']) || !isset($_GET['item']) || !isset($_GET['secret'])) {
        return;
    }
    $order_id = intval($_GET['order']);
    $order_item_id = intval($_GET['item']);
    $secret = $_GET['secret'];

    if ($order_id < 1 || $order_item_id < 1 || strlen($secret) != 32) {
        wc_add_notice('Der Link zum Verlängern der Buchung ist ungültig.', 'error');
        wp_redirect(wc_get_cart_url());
        exit;
    }
    $order = new WC_Order($order_id);
    if (!$order) {
        wc_add_notice('Der Link zum Verlängern der Buchung ist ungültig.', 'error');
        wp_redirect(wc_get_cart_url());
        exit;
    }
    $order_item = get_order_item_by_id($order, $order_item_id);
    if (!$order_item || $order_item->get_meta('_booking_extend_secret') !== $secret) {
        wc_add_notice('Der Link zum Verlängern der Buchung ist ungültig.', 'error');
        wp_redirect(wc_get_cart_url());
        exit;
    }
    if ($order_item->get_meta('_booking_extend_done') === 'yes') {
        wc_add_notice('Der Link zum Verlängern der Buchung wurde bereits genutzt.', 'error');
        wp_redirect(wc_get_cart_url());
        exit;
    }
    $old_begin = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_begin'), new DateTimeZone('UTC'));
    $old_end = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_end'), new DateTimeZone('UTC'));
    $new_end = (clone $old_end)->add($old_begin->diff($old_end));

    obb_clear_cart();
    $result = handle_obb_add_to_cart(bike_box_request(OPEN_BIKE_BOX_BACKEND . '/api/v1/action/extend', array(
        'request_uid' => generate_uid(),
        'requested_at' => gmdate("Y-m-d\TH:i:s\Z"),
        'old_uid' => $order_item->get_meta('_uid'),
        'old_request_uid' => $order_item->get_meta('_request_uid'),
        'old_session' => $order_item->get_meta('_session'),
        'begin' => $old_end->format('Y-m-d\TH:i:s\Z'),
        'end' => $new_end->format('Y-m-d\TH:i:s\Z')
    )), $order_id, $order_item_id);
    if ($result['status']) {
        wc_add_notice('Die Verlängerung konnte nicht zum Warenkorb hinzugefügt werden.', 'error');
        return;
    }
    wc_add_notice('Die Verlängerung wurde zum Warenkorb hinzugefügt.', 'success');
});

function get_order_item_by_id(WC_Order $order, int $order_item_id) {
    foreach($order->get_items() as $item_id => $order_item) {
        if ($order_item->get_id() === $order_item_id) {
            return $order_item;
        }
    }
    return null;
}