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
 * includes location and resource template files for single locations or resources
 */
add_filter('template_include', function (string $template): string {
    if (get_query_var('location')) {
        return OPEN_BIKE_BOX_BASE_PATH . '/templates/location.php';
    } else if (get_query_var('resource')) {
        return OPEN_BIKE_BOX_BASE_PATH . '/templates/resource.php';
    }
    return $template;
});

/*
 * add location and resource query vars
 */
add_filter('query_vars', function (array $vars): array {
    array_push($vars, 'location', 'resource');
    return $vars;
});

/*
 * enable location to rewrite rules
 */
add_filter('rewrite_rules_array', function (array $rules): array {
    $new = [
        '^location/([^/]*[/]?)$' => 'index.php?location=$matches[1]',
        '^resource/([^/]*[/]?)$' => 'index.php?resource=$matches[1]',
    ];
    return $new + $rules;
});
