import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for using Tommalu platform.',
};

export default function TermsOfServicePage() {
    return (
        <article className="prose prose-orange max-w-none">
            <h1>Terms of Service</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2>1. Agreement to Terms</h2>
            <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Tommalu ("we," "us," or "our"),
                concerning your access to and use of the Tommalu website and application.
            </p>

            <h2>2. User Registration</h2>
            <p>
                You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password.
                We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate.
            </p>

            <h2>3. Products and Orders</h2>
            <p>
                We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site.
                However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.
                All products are subject to availability.
            </p>

            <h2>4. User Conduct</h2>
            <p>
                You agree not to use the Site for any unlawful purpose or in any way that interrupts, damages, impairs, or renders the Site less efficient or accurate.
            </p>

            <h2>5. Intellectual Property Rights</h2>
            <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs,
                and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
            </p>

            <h2>6. Termination</h2>
            <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation,
                including but not limited to a breach of the Terms.
            </p>

            <h2>7. Modifications and Interruptions</h2>
            <p>
                We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice.
                We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
            </p>

            <h2>8. Governing Law</h2>
            <p>
                These Terms shall be governed by and defined following the laws of India. Tommalu and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>

            <h2>9. Contact Us</h2>
            <p>
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
                <br />
                <strong>Email:</strong> support@tommalu.com
            </p>
        </article>
    );
}
