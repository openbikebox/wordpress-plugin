<?php

get_header(); ?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <div
                    data-resource-slug="<?php echo preg_replace("/(\W-)+/", '', get_query_var('resource')); ?>"
                    id="obb-resource-info-box"
                    data-api-backend="<?php echo OPEN_BIKE_BOX_BACKEND; ?>"></div>
        </main>
    </div>

<?php
get_footer();
