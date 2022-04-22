<?php

get_header(); ?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <script>
                var obb_locations_data = <?php echo json_encode(obb_get_local_location_data()); ?>;
                var obb_user_data = <?php echo json_encode(obb_get_local_user_data()); ?>;
            </script>
            <div
                    data-resource-slug="<?php echo preg_replace("/(\W-)+/", '', get_query_var('resource')); ?>"
                    id="obb-resource-info-box"
                    data-api-backend="<?php echo OPEN_BIKE_BOX_BACKEND; ?>"
            ></div>
        </main>
    </div>

<?php
get_footer();
