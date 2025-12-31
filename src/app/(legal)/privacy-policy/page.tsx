import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Tommalu - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
    return (
        <article className="prose prose-orange max-w-none">
            <h1>Privacy Policy</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to Tommalu ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We collect information that you strictly provide to us when you register, place an order, or communicate with us.</p>
            <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address.</li>
                <li><strong>Order Information:</strong> Details of the products you purchase and your transaction history.</li>
                <li><strong>Device Information:</strong> We may collect info about the device you use to access our services for optimization purposes.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Process and deliver your orders.</li>
                <li>Create and manage your account.</li>
                <li>Send you order updates and notifications.</li>
                <li>Improve our website and customer service.</li>
                <li>Prevent fraud and ensure the security of our platform.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>
                We do not sell your personal information. We may share your information with:
            </p>
            <ul>
                <li><strong>Service Providers:</strong> Third-party vendors who help us with delivery, payment processing (if applicable), and hosting.</li>
                <li><strong>Legal Obligations:</strong> If required by law or to protect our rights.</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
                We implement appropriate technical and organizational security measures to protect your personal information.
                However, please note that no electronic transmission over the Internet is 100% secure.
            </p>

            <h2>6. Your Rights</h2>
            <p>
                You have the right to access, correct, or delete your personal information. You can manage your profile settings within the app
                or contact us directly for assistance.
            </p>

            <h2>7. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <strong>Email:</strong> support@tommalu.com
            </p>
        </article>
    );
}
