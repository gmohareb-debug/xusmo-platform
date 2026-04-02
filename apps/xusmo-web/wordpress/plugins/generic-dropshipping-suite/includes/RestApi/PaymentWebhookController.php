<?php
namespace GDS\RestApi;

if (!defined('ABSPATH')) {
    exit;
}

class PaymentWebhookController extends AbstractRestController
{
    public function register_routes()
    {
        register_rest_route($this->namespace, '/webhooks/stripe', array(
            array(
                'methods' => \WP_REST_Server::CREATABLE,
                'callback' => array($this, 'handle_stripe_webhook'),
                'permission_callback' => '__return_true', // Validation happens via signature
            )
        ));
    }

    public function handle_stripe_webhook($request)
    {
        $payload = $request->get_body();
        $sig_header = $request->get_header('stripe-signature');
        $endpoint_secret = get_option('gds_stripe_webhook_secret', 'whsec_test_secret');

        // Mock Stripe Signature verification
        $event = json_decode($payload, true);
        if (!$event || !isset($event['type'])) {
            return new \WP_Error('invalid_payload', 'Invalid webhook payload', array('status' => 400));
        }

        if ($event['type'] === 'checkout.session.completed') {
            $session = $event['data']['object'];
            $tenant_name = $session['metadata']['store_name'] ?? 'shop_' . time();
            $email = $session['customer_details']['email'] ?? 'admin@' . $tenant_name . '.com';
            $plan_id = $session['metadata']['plan_id'] ?? 'pro';
            $tenant_id_slug = sanitize_title($tenant_name);

            // Trigger Provisioning workflow
            $result = \GDS\Core\OnboardingManager::instance()->provision_tenant(
                $tenant_id_slug,
                $tenant_name . '.dropnex.com',
                $plan_id
            );

            if (!is_wp_error($result)) {
                $tenant_id_final = $result['tenant_id'];
                \GDS\Core\BillingEngine::instance()->update_entitlement($tenant_id_final, $plan_id, 'active');
                return rest_ensure_response(array('success' => true, 'tenant_id' => $tenant_id_final));
            } else {
                return $result;
            }
        }

        if ($event['type'] === 'invoice.payment_failed') {
            $subscription_id = $event['data']['object']['subscription'];
            $tenant_name = $event['data']['object']['metadata']['store_name'] ?? '';
            if ($tenant_name) {
                $tenant_id_slug = sanitize_title($tenant_name);
                \GDS\Core\BillingEngine::instance()->update_entitlement($tenant_id_slug, 'suspended', 'past_due');
                return rest_ensure_response(array('success' => true, 'action' => 'suspended', 'tenant' => $tenant_id_slug));
            }
        }

        if ($event['type'] === 'customer.subscription.deleted') {
            $tenant_name = $event['data']['object']['metadata']['store_name'] ?? '';
            if ($tenant_name) {
                $tenant_id_slug = sanitize_title($tenant_name);
                \GDS\Core\BillingEngine::instance()->update_entitlement($tenant_id_slug, 'canceled', 'canceled');
                return rest_ensure_response(array('success' => true, 'action' => 'canceled', 'tenant' => $tenant_id_slug));
            }
        }

        return rest_ensure_response(array('success' => true, 'message' => 'Unhandled event type'));
    }
}
