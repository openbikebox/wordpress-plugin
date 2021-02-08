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
 * shows all data in order overview in backend
 */
add_filter('woocommerce_order_item_get_formatted_meta_data', function (array $formatted_meta): array {
    $result = array();
    $fields = array(
        'uid', 'request_uid', 'session', 'status', 'value_gross', 'value_net', 'value_tax', 'tax_rate', 'requested_at',
        'location_id', 'location_name', 'resource_identifier', 'location_slug', 'operator_name'
    );
    foreach ($formatted_meta as $key => $item) {
        if (in_array(substr($item->key, 1), $fields, true)) {
            continue;
        }
        if ($item->key === '_begin') {
            $item->display_key = 'Beginn';
            $item->display_value = format_datetime($item->value);
        }
        if ($item->key === '_end') {
            $item->display_key = 'Ende';
            $item->display_value = format_datetime($item->value);
        }
        if ($item->key === '_code') {
            $item->display_key = 'Code';
            $item->display_value = $item->value;
        }
        $result[$key] = $item;
    }
    return $result;
}, 10, 1);
