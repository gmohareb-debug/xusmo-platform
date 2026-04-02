<?php
namespace GDS\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * SaaS Frontend Landing Page.
 * 
 * Creates a standalone, unbranded (or DropNex branded) landing page
 * for SaaS onboarding, utilizing the same CSS UI as the plugin admin.
 */
class SaaSFrontend
{
    public static function init()
    {
        add_filter('generate_rewrite_rules', [__CLASS__, 'custom_rewrite_rules']);
        add_filter('query_vars', [__CLASS__, 'custom_query_vars']);
        add_action('template_redirect', [__CLASS__, 'render_landing_page']);
    }

    public static function custom_rewrite_rules($wp_rewrite)
    {
        $new_rules = ['saas-start/?$' => 'index.php?gds_saas_landing=1'];
        $wp_rewrite->rules = $new_rules + $wp_rewrite->rules;
        return $wp_rewrite;
    }

    public static function custom_query_vars($vars)
    {
        $vars[] = 'gds_saas_landing';
        return $vars;
    }

    public static function render_landing_page()
    {
        if (get_query_var('gds_saas_landing') !== '1') {
            return;
        }

        // Before rendering, let's flush rewrite rules if needed. 
        // For local dev we don't strictly need to flush constantly but it's fine.

        // Use the same signup form logic / submit hooks from Shortcodes,
        // Shortcodes::handle_signup_submission() will still fire on template_redirect
        // but it runs before we render if priority allows.

        $plugin_url = plugin_dir_url(dirname(__DIR__));

        $error = isset($_GET['gds_error']) ? sanitize_text_field($_GET['gds_error']) : '';
        $success = isset($_GET['gds_success']) ? 1 : 0;

        ?>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DropNex SaaS - Autonomous Dropshipping</title>
            <!-- Include Admin CSS for same look and feel -->
            <link rel="stylesheet" href="<?php echo esc_url($plugin_url . 'assets/css/admin.css'); ?>">
            <!-- Modern Font -->
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap"
                rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    background: #000;
                    color: #fff;
                    overflow-x: hidden;
                }

                .hero-bg {
                    background: radial-gradient(circle at top right, rgba(0, 242, 255, 0.15), transparent 40%),
                        radial-gradient(circle at bottom left, rgba(138, 43, 226, 0.15), transparent 40%);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                header {
                    padding: 30px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo {
                    font-weight: 900;
                    font-size: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    background: linear-gradient(90deg, #00f2ff, #8a2be2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero {
                    text-align: center;
                    padding: 80px 0;
                }

                .hero h1 {
                    font-size: 4rem;
                    line-height: 1.1;
                    font-weight: 900;
                    margin-bottom: 20px;
                }

                .hero p {
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.7);
                    max-width: 600px;
                    margin: 0 auto 40px;
                }

                .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 30px;
                    margin-top: 60px;
                }

                .pricing-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: left;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .pricing-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(0, 242, 255, 0.5);
                    box-shadow: 0 10px 40px rgba(0, 242, 255, 0.1);
                }

                .pricing-card.popular {
                    border-color: #00f2ff;
                    background: rgba(0, 242, 255, 0.05);
                }

                .pricing-card.popular::before {
                    content: 'MOST POPULAR';
                    position: absolute;
                    top: 15px;
                    right: -30px;
                    background: #00f2ff;
                    color: #000;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 5px 30px;
                    transform: rotate(45deg);
                }

                .plan-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .plan-price {
                    font-size: 3rem;
                    font-weight: 900;
                    margin-bottom: 20px;
                }

                .plan-price span {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin-bottom: 30px;
                }

                .plan-features li {
                    margin-bottom: 10px;
                    color: rgba(255, 255, 255, 0.8);
                    display: flex;
                    align-items: center;
                }

                .plan-features li::before {
                    content: '✓';
                    color: #00f2ff;
                    margin-right: 10px;
                    font-weight: bold;
                }

                .btn-select {
                    display: block;
                    width: 100%;
                    padding: 15px 0;
                    text-align: center;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    text-decoration: none;
                }

                .btn-select:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .popular .btn-select {
                    background: #00f2ff;
                    color: #000;
                    border: none;
                }

                .popular .btn-select:hover {
                    background: #00d2ff;
                }

                #register-section {
                    padding: 80px 0;
                    background: #0a0a0c;
                }
            </style>
        </head>

        <body>
            <div class="hero-bg">
                <div class="container">
                    <header>
                        <div class="logo">DROPNEX</div>
                        <div>
                            <a href="#register-section" class="btn-primary"
                                style="padding: 10px 25px; text-decoration: none; display: inline-block;">Get Started</a>
                        </div>
                    </header>

                    <div class="hero">
                        <h1>Build Your Autonomous Dropshipping Empire.</h1>
                        <p>Zero maintenance. High margins. Complete automation from sourcing to fulfillment across unlimited
                            integrated suppliers.</p>

                        <div class="pricing-grid">
                            <!-- Basic Plan -->
                            <div class="pricing-card">
                                <div class="plan-name">Basic</div>
                                <div class="plan-price">Free</div>
                                <ul class="plan-features">
                                    <li>1 Supplier Connection</li>
                                    <li>Automated Fulfillment</li>
                                    <li>Basic Email Support</li>
                                    <li>100 Orders / mo</li>
                                </ul>
                                <a href="#register-section" class="btn-select"
                                    onclick="document.getElementById('plan-select').value='Basic';">Choose Basic</a>
                            </div>

                            <!-- Growth Plan -->
                            <div class="pricing-card popular">
                                <div class="plan-name">Growth</div>
                                <div class="plan-price">$79<span>/mo</span></div>
                                <ul class="plan-features">
                                    <li>Up to 5 Suppliers</li>
                                    <li>AI Pricing Optimization</li>
                                    <li>Priority Support</li>
                                    <li>1,000 Orders / mo</li>
                                </ul>
                                <a href="#register-section" class="btn-select"
                                    onclick="document.getElementById('plan-select').value='Growth';">Choose Growth</a>
                            </div>

                            <!-- Pro Plan -->
                            <div class="pricing-card">
                                <div class="plan-name">Professional</div>
                                <div class="plan-price">$199<span>/mo</span></div>
                                <ul class="plan-features">
                                    <li>Unlimited Suppliers</li>
                                    <li>Multi-Store Provisioning</li>
                                    <li>White-glove Support</li>
                                    <li>Unlimited Orders</li>
                                </ul>
                                <a href="#register-section" class="btn-select"
                                    onclick="document.getElementById('plan-select').value='Pro';">Choose Pro</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="register-section">
                <div class="container" style="max-width: 600px;">
                    <?php if ($success): ?>
                        <div style="color: #000; background: #00f2ff; padding: 40px; border-radius: 20px; text-align: center;">
                            <h2 style="font-weight: 900; margin-bottom: 10px;">Nexus Initialized!</h2>
                            <p style="opacity: 0.8; margin-bottom: 20px;">Your storefront has been successfully provisioned.</p>
                            <a href="<?php echo admin_url('admin.php?page=gds-dashboard&gds_mode=tenant'); ?>"
                                style="display:inline-block; background:#000; color:#fff; padding: 15px 30px; text-decoration:none; font-weight:bold; border-radius:10px;">Access
                                Control Center</a>
                        </div>
                    <?php else: ?>
                        <div
                            style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 20px;">
                            <h2 style="font-size: 2rem; font-weight: 900; margin-bottom: 20px; text-align: center;">Provision Your
                                Store</h2>

                            <?php if ($error): ?>
                                <div
                                    style="color: #ff4b2b; background: rgba(255,75,43,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; border: 1px solid rgba(255,75,43,0.3);">
                                    <?php echo esc_html($error); ?>
                                </div>
                            <?php endif; ?>

                            <form method="post" action="">
                                <?php wp_nonce_field('gds_self_signup'); ?>

                                <div style="margin-bottom: 20px;">
                                    <label
                                        style="display:block; font-size:0.8rem; font-weight:bold; letter-spacing:1px; margin-bottom:8px; opacity:0.7; text-transform:uppercase;">Selected
                                        Plan</label>
                                    <select name="plan_name" id="plan-select"
                                        style="width:100%; padding:15px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                                        <option value="Basic">Basic (Free)</option>
                                        <option value="Growth" selected>Growth ($79/mo)</option>
                                        <option value="Pro">Professional ($199/mo)</option>
                                    </select>
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <label
                                        style="display:block; font-size:0.8rem; font-weight:bold; letter-spacing:1px; margin-bottom:8px; opacity:0.7; text-transform:uppercase;">Store
                                        Name (Slug)</label>
                                    <input type="text" name="tenant_id" placeholder="e.g. cyber-dynamics" required
                                        style="width:100%; box-sizing:border-box; padding:15px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <label
                                        style="display:block; font-size:0.8rem; font-weight:bold; letter-spacing:1px; margin-bottom:8px; opacity:0.7; text-transform:uppercase;">Access
                                        Domain</label>
                                    <input type="text" name="domain" placeholder="e.g. store.dropnex.cloud" required
                                        style="width:100%; box-sizing:border-box; padding:15px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <label
                                        style="display:block; font-size:0.8rem; font-weight:bold; letter-spacing:1px; margin-bottom:8px; opacity:0.7; text-transform:uppercase;">Admin
                                        Email</label>
                                    <input type="email" name="user_email" placeholder="e.g. boss@domain.com" required
                                        style="width:100%; box-sizing:border-box; padding:15px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                                </div>

                                <div style="margin-bottom: 30px;">
                                    <label
                                        style="display:block; font-size:0.8rem; font-weight:bold; letter-spacing:1px; margin-bottom:8px; opacity:0.7; text-transform:uppercase;">Secure
                                        Password</label>
                                    <input type="password" name="user_pass" placeholder="••••••••" required
                                        style="width:100%; box-sizing:border-box; padding:15px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:10px;">
                                </div>

                                <button type="submit" name="gds_do_onboarding"
                                    style="width:100%; padding:15px; background:linear-gradient(90deg, #00f2ff, #246bfd); color:#000; font-weight:900; font-size:1.1rem; border:none; border-radius:10px; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">Initialize
                                    Tenant</button>
                            </form>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <footer style="text-align:center; padding: 40px 0; color: rgba(255,255,255,0.3); font-size: 0.9rem;">
                &copy; <?php echo date('Y'); ?> DropNex Cloud Platform. All rights reserved.
            </footer>

            <script>
                // Smooth scroll down to registration form when clicking a package
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        document.querySelector(this.getAttribute('href')).scrollIntoView({
                            behavior: 'smooth'
                        });
                    });
                });
            </script>
        </body>

        </html>
        <?php
        exit;
    }
}
