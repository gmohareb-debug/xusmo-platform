(function ($) {
    'use strict';

    $(document).ready(function () {
        $('.gds-test-connection').on('click', function (e) {
            e.preventDefault();
            const $btn = $(this);
            const id = $btn.data('id');
            const data = {
                action: 'gds_test_connection',
                id: id,
                nonce: gdsAdmin.nonce
            };

            $btn.prop('disabled', true).text('Testing...');

            $.post(ajaxurl, data, function (response) {
                if (response.success) {
                    alert(response.data);
                } else {
                    alert('Error: ' + response.data);
                }
                $btn.prop('disabled', false).text('Test Connection');
            });
        });

        $('.gds-run-import').on('click', function (e) {
            e.preventDefault();
            const $btn = $(this);
            const id = $btn.data('id');
            const data = {
                action: 'gds_run_import',
                id: id,
                nonce: gdsAdmin.nonce
            };

            $btn.prop('disabled', true).text('Running...');

            $.post(ajaxurl, data, function (response) {
                if (response.success) {
                    alert(response.data);
                } else {
                    alert('Error: ' + response.data);
                }
                $btn.prop('disabled', false).text('Run Import');
            });
        });

        $('.gds-publish-products').on('click', function (e) {
            e.preventDefault();
            const $btn = $(this);
            const id = $btn.data('id');
            const data = {
                action: 'gds_publish_products',
                id: id,
                nonce: gdsAdmin.nonce
            };

            $btn.prop('disabled', true).text('Publishing...');

            $.post(ajaxurl, data, function (response) {
                if (response.success) {
                    alert(response.data);
                } else {
                    alert('Error: ' + response.data);
                }
                $btn.prop('disabled', false).text('Publish to WC');
            });
        });
    });

})(jQuery);
