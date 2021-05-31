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


class WC_Extend_Booking_Email extends WC_Email {
    public function __construct() {
        $this->id = 'wc_extend_boooking_email';
        $this->title = 'Verlängerung der Buchung';
        $this->description = 'Mail, die als Erinnerung zur Verlängerung der Buchung gesendet wird';
        $this->heading = 'Jetzt openbikebox Buchung verlängern';
        $this->subject = 'Jetzt openbikebox Buchung verlängern';
        $this->template_html  = 'emails/extend-order.php';
        $this->template_plain = 'emails/plain/extend-order.php';
        $this->template_base  = OPEN_BIKE_BOX_BASE_PATH . 'templates/';
        $this->customer_email = true;
        $this->placeholders   = array(
            '{old_booking_end_date}' => '',
            '{new_booking_end_date}' => '',
            '{booking_extend_link}' => ''
        );
        add_action( 'openbikebox_order_renew_notification_mail', array( $this, 'trigger' ), 10, 2 );
        parent::__construct();
    }

    public function trigger( int $order_id, int $order_item_id) {
        $this->setup_locale();

        $order = wc_get_order($order_id);
        $order_item = get_order_item_by_id($order, $order_item_id);

        if ( !is_a( $order, 'WC_Order' ) ) {
            $this->restore_locale();
            return;
        }

        $this->object = $order;
        $this->recipient = $this->object->get_billing_email();

        $old_begin = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_begin'), new DateTimeZone('UTC'));
        $old_end = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $order_item->get_meta('_end'), new DateTimeZone('UTC'));
        $new_end = (clone $old_end)->add($old_begin->diff($old_end));

        $this->placeholders['{old_booking_end_date}'] = obb_format_end($old_end);
        $this->placeholders['{new_booking_end_date}'] = obb_format_end($new_end);
        $this->placeholders['{booking_extend_link}'] = get_booking_extend_link_by_order($order);
        if ( $this->is_enabled() && $this->get_recipient() ) {
            $result = $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
            echo($result);
        }

        $this->restore_locale();
    }

    public function get_content_html() {
        return $this->format_string(wc_get_template_html( $this->template_html, array(
            'order'         => $this->object,
            'email_heading' => $this->get_heading(),
            'sent_to_admin' => false,
            'plain_text'    => false,
            'email'			=> $this
        ), '', $this->template_base ));
    }

    public function get_content_plain() {
        return $this->format_string(wc_get_template_html( $this->template_plain, array(
            'order'         => $this->object,
            'email_heading' => $this->get_heading(),
            'sent_to_admin' => false,
            'plain_text'    => true,
            'email'			=> $this
        ), '', $this->template_base ));
    }

}