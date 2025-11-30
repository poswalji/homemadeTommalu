import Link from "next/link";
import { appConfig } from "@/config/app.config";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 md:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Link href="/" aria-label="Tommalu Home">
                <Image src="/logo.png" alt="Tommalu" width={140} height={36} />
              </Link>
            </div>
            <p className="text-sm text-gray-600">{appConfig.description}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/food" className="text-gray-600 hover:text-gray-900">
                  Order Food
                </Link>
              </li>
              <li>
                <Link href="/grocery" className="text-gray-600 hover:text-gray-900">
                  Shop Grocery
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gray-900">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie" className="text-gray-600 hover:text-gray-900">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>{appConfig.contact.phone}</li>
              <li>{appConfig.contact.email}</li>
              <li>{appConfig.contact.address}</li>
            </ul>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={appConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Facebook
              </a>
              <a
                href={appConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Instagram
              </a>
              <a
                href={appConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>© 2025 Tommalu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

