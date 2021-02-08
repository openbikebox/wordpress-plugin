<?php

get_header(); ?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <div
                id="obb-resource-select-box"
                data-api-backend="<?php echo OPEN_BIKE_BOX_BACKEND; ?>"
                data-location-slug="<?php echo preg_replace("/(\W-)+/", '', get_query_var('location')); ?>"
            ></div>
        </main><!-- #main -->
    </div><!-- #primary -->

<?php
get_footer();
