'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: November 24, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to MUSE MUSIC! These Terms of Service (&quot;Terms&quot;) govern your use of our web application. This is an educational project developed for CPE 334 Software Engineering course at King Mongkut&apos;s University of Technology Thonburi (KMUTT). By accessing or using MUSE MUSIC, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use our service.
            </p>
          </section>

          {/* Educational Project Notice */}
          <section className="bg-purple-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Educational Project Notice</h2>
            <p className="text-gray-700 mb-3">
              <strong>Important:</strong> MUSE MUSIC is an educational project developed as part of an academic course at King Mongkut&apos;s University of Technology Thonburi (KMUTT). This means:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>The service is provided for educational and demonstration purposes</li>
              <li>Features and functionality may change without prior notice</li>
              <li>The service may be discontinued at the end of the academic term</li>
              <li>Data may be retained for academic evaluation purposes</li>
              <li>No commercial use is permitted</li>
              <li>The service is provided &quot;as is&quot; without warranties</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility</h2>
            <p className="text-gray-700">
              You must be at least 13 years old to use this service. By using MUSE MUSIC, you represent and warrant that you meet this age requirement. If you are under 18, you must have permission from a parent or guardian to use this service.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration</h2>
            <p className="text-gray-700 mb-3">To use certain features, you may need to create an account. You agree to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Description</h2>
            <p className="text-gray-700 mb-3">MUSE MUSIC provides the following features:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Lyrics Analysis:</strong> AI-powered analysis of song lyrics to detect mood, themes, and sentiment</li>
              <li><strong>Translation Services:</strong> Translation of lyrics between languages using AI/LLM technology</li>
              <li><strong>Music Recommendations:</strong> Personalized song recommendations based on your preferences and mood</li>
              <li><strong>YouTube Integration:</strong> Search and display YouTube videos with synchronized lyrics</li>
              <li><strong>Spotify Integration:</strong> Access to music metadata and song information</li>
              <li><strong>User Features:</strong> Save favorites, rate songs, view history, and customize preferences</li>
            </ul>
          </section>

          {/* AI and LLM Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Artificial Intelligence (AI) Usage</h2>
            <p className="text-gray-700 mb-3">
              Our service uses Large Language Models (LLMs) and AI technologies to analyze and translate lyrics. By using these features, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>AI-generated translations and analyses are predictions, not guaranteed accurate interpretations</li>
              <li>Results may contain errors, biases, or inaccuracies inherent in AI models</li>
              <li>Mood classifications and sentiment analyses are approximations</li>
              <li>AI interpretations should not be considered professional psychological or linguistic analysis</li>
              <li>You use AI-generated content at your own risk and discretion</li>
              <li>We are not responsible for decisions made based on AI-generated content</li>
            </ul>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Conduct and Prohibited Uses</h2>
            <p className="text-gray-700 mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Violate any local, state, national, or international law</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Upload or share malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems or other user accounts</li>
              <li>Scrape, mine, or extract data from our service using automated tools</li>
              <li>Reverse engineer, decompile, or disassemble any part of the service</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the service for commercial purposes without authorization</li>
              <li>Overload or interfere with the proper functioning of the service</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Our Platform</h3>
            <p className="text-gray-700 mb-3">
              The MUSE MUSIC platform itself—including its original source code, user interface design, software architecture, features, and functionality—is owned by the project team and protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or create derivative works of the platform without permission.
            </p>
            <p className="text-gray-700 mt-3">
              <strong>Clarification:</strong> This ownership applies only to our platform and its original code, NOT to the song lyrics, music content, or other third-party materials displayed within the service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Third-Party Content and Copyright</h3>
            <p className="text-gray-700 mb-3">
              Song lyrics, music metadata, and video content are owned by their respective copyright holders. We do not claim ownership of this content. Our service:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Retrieves publicly available lyrics from third-party sources</li>
              <li>Embeds YouTube videos according to YouTube&apos;s Terms of Service</li>
              <li>Uses Spotify API data in compliance with Spotify&apos;s Developer Terms</li>
              <li>Respects copyright and DMCA takedown notices</li>
            </ul>
            <p className="text-gray-700 mt-3">
              <strong>Important Copyright Notice:</strong> This service may display copyrighted song lyrics and related content for educational purposes only under fair use principles. We respect all copyright holders and their intellectual property rights. If you are a copyright holder and believe your content has been used inappropriately or wish to request removal, please contact us immediately at <a href="mailto:contact@phitik.com" className="text-[#7B61FF] hover:underline">contact@phitik.com</a> and we will promptly remove the content in question.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 User Content</h3>
            <p className="text-gray-700 mb-3">
              You retain ownership of any content you submit (e.g., ratings, comments). By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content for the purposes of operating and improving our service.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services and Links</h2>
            <p className="text-gray-700 mb-3">
              Our service integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Google OAuth:</strong> For authentication</li>
              <li><strong>YouTube API:</strong> For video content and search</li>
              <li><strong>YouTube Transcript API:</strong> For retrieving video transcripts (via <a href="https://github.com/Warissaa/youtube-transcript-api" target="_blank" rel="noopener noreferrer" className="text-[#7B61FF] hover:underline">youtube-transcript-api</a>)</li>
              <li><strong>Spotify API:</strong> For music metadata</li>
              <li><strong>LRCLib:</strong> For lyrics synchronization data</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the content, policies, or practices of third-party services.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.1 &quot;As Is&quot; Service</h3>
            <p className="text-gray-700 mb-3">
              MUSE MUSIC is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Accuracy, reliability, or availability of the service</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Error-free or uninterrupted operation</li>
              <li>Security of data transmission</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 No Professional Advice</h3>
            <p className="text-gray-700">
              The mood analysis, lyric interpretations, and recommendations provided by our service are for entertainment and educational purposes only. They do not constitute professional psychological, therapeutic, or medical advice. Always consult qualified professionals for such matters.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.3 Limitation of Liability</h3>
            <p className="text-gray-700">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to loss of data, profits, or other intangible losses.
            </p>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data and Privacy</h2>
            <p className="text-gray-700">
              Your privacy is important to us. Please review our <a href="/privacy" className="text-[#7B61FF] hover:underline font-semibold">Privacy Policy</a> to understand how we collect, use, and protect your information. By using MUSE MUSIC, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Service Availability and Modifications</h2>
            <p className="text-gray-700 mb-3">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Modify, suspend, or discontinue any part of the service at any time</li>
              <li>Change features, functionality, or content without notice</li>
              <li>Perform maintenance and updates as needed</li>
              <li>Terminate the service at the end of the academic project period</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We will make reasonable efforts to notify users of major changes, but are not obligated to do so.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Account Termination</h2>
            <p className="text-gray-700 mb-3">
              We may suspend or terminate your account and access to the service:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>If you violate these Terms</li>
              <li>If you engage in fraudulent or illegal activities</li>
              <li>At our sole discretion for any reason</li>
              <li>Upon your request to delete your account</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Upon termination, your right to use the service will immediately cease. We may retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless MUSE MUSIC, its developers, and King Mongkut&apos;s University of Technology Thonburi from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the service, violation of these Terms, or infringement of any rights of others.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-700 mb-3">
              These Terms shall be governed by and construed in accordance with the laws of Thailand. Any disputes arising from these Terms or your use of the service shall be resolved through:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Good faith negotiation between the parties</li>
              <li>If negotiation fails, mediation or arbitration</li>
              <li>As a last resort, the courts of Thailand shall have exclusive jurisdiction</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to These Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the service after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Entire Agreement</h2>
            <p className="text-gray-700">
              These Terms, along with our Privacy Policy, constitute the entire agreement between you and MUSE MUSIC regarding your use of the service and supersede any prior agreements.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Us</h2>
            <p className="text-gray-700 mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Project:</strong> MUSE MUSIC
              </p>
              <p className="text-gray-700">
                <strong>Developer:</strong> Jedsadaporn Pannok
              </p>
              <p className="text-gray-700">
                <strong>Contact Email:</strong> <a href="mailto:contact@phitik.com" className="text-[#7B61FF] hover:underline">contact@phitik.com</a> or <a href="mailto:jedsadaporn.pannok@gmail.com" className="text-[#7B61FF] hover:underline">jedsadaporn.pannok@gmail.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Notification Email:</strong> musemusic-noreply@phitik.com
              </p>
              <p className="text-gray-700">
                <strong>Institution:</strong> King Mongkut&apos;s University of Technology Thonburi (KMUTT)
              </p>
              <p className="text-gray-700">
                <strong>Course:</strong> CPE 334 Software Engineering
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong> <a href="https://musemusic.phitik.com" className="text-[#7B61FF] hover:underline">https://musemusic.phitik.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Hosted by:</strong> phitik.com (Private Server)
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 italic">
              By using MUSE MUSIC, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

