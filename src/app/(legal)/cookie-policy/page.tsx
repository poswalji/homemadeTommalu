import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'Cookie Policy for Tommalu.',
};

export default function CookiePolicyPage() {
    return (
        <article className="prose prose-orange max-w-none">
            <h1>Cookie Policy</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2>1. What are Cookies?</h2>
            <p>
                Cookies are small text files that are placed on your computer or mobile device when you browse websites. They are widely used to make websites work, or work more efficiently,
                as well as to provide information to the owners of the site.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>We use cookies to:</p>
            <ul>
                <li><strong>Authentication:</strong> Identify you when you visit our website and as you navigate our website.</li>
                <li><strong>Cart Functionality:</strong> Keep track of items stored in your shopping cart.</li>
                <li><strong>Analysis:</strong> Analyze the use and performance of our website and services.</li>
                <li><strong>Personalization:</strong> Store information about your preferences and to personalize the website for you.</li>
            </ul>

            <h2>3. Types of Cookies We Use</h2>
            <ul>
                <li><strong>Essential Cookies:</strong> These are strictly necessary for the website to function properly.</li>
                <li><strong>Functional Cookies:</strong> Use to remember your preferences and settings.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the website.</li>
            </ul>

            <h2>4. Managing Cookies</h2>
            <p>
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience,
                since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
            </p>

            <h2>5. Changes to This Policy</h2>
            <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons.
                Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>

            <h2>6. Contact Us</h2>
            <p>
                If you have any questions about our use of cookies or other technologies, please email us at support@tommalu.com.
            </p>
        </article>
    );
}
