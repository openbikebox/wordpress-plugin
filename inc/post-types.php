<?php


defined('ABSPATH') or die('nope');

add_action('init', function () {
    register_post_type(
        'location',
        array(
            'labels' => array(
                'name' => __('Standorte'),
                'singular_name' => __('Standort')
            ),
            'public' => true,
            'menu_position' => 5,
            'has_archive' => false,
            'supports' => array('title', 'custom-fields')
        )
    );
});