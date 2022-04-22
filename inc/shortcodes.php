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
 * tiles shortcode
 */
add_shortcode('obb-location-tiles', function ($atts): string {

    ob_start();
?>
<script>
    var obb_locations_data = <?php echo json_encode(obb_get_local_location_data()); ?>;
    var obb_user_data = <?php echo json_encode(obb_get_local_user_data()); ?>;
</script>
<div id="obb-location-tiles-box" data-api-backend="<?php echo OPEN_BIKE_BOX_BACKEND; ?>"></div>
<?php
    return ob_get_clean();
});
