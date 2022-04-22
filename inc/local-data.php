<?php

function obb_get_local_location_data(): array {
    if (!function_exists('get_fields'))
        return [];
    $location_data = [];
    $locations = get_posts([
        'post_type' => 'location',
        'numberposts' => -1,
    ]);
    foreach ($locations as $location) {
        $location_fields = get_fields($location->ID);
        $location_data[] = [
            'id' => intval($location_fields['id']),
            'wordpress_id' => $location->ID,
            'visibility' => $location_fields['visibility'],
            'payment' => $location_fields['payment'],
        ];
    }
    return $location_data;
}

function obb_get_local_user_data(): array {
    if (!function_exists('get_fields'))
        return [
            'type' => 'anonymous',
            'locations' => [],
        ];
    if (is_user_logged_in() && current_user_can('edit_posts')) {
        return [
            'type' => 'admin',
            'locations' => [],
        ];
    }
    if (is_user_logged_in()) {
        $user_locations = get_field('locations', "user_" . strval(get_current_user_id()));
        return [
            'type' => 'customer',
            'locations' => (is_array($user_locations)) ? $user_locations : [],
        ];
    }
    return [
        'type' => 'anonymous',
        'locations' => [],
    ];
}

function get_wordpress_location(int $location_id): ?WP_Post {
    $locations = get_posts([
        'post_type'     => 'location',
        'meta_query'    => [
            [
                'key'       => 'id',
                'type'      => 'NUMERIC',
                'compare'   => '=',
                'value'     => $location_id,
            ],
        ],
    ]);
    if (!count($locations))
        return null;
    return $locations[0];
}