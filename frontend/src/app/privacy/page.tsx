'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: November 24, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to MUSE MUSIC. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application. This is an educational project developed for CPE 334 Software Engineering course at King Mongkut&apos;s University of Technology Thonburi (KMUTT). Please read this privacy policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.1 Personal Information</h3>
            <p className="text-gray-700 mb-3">When you register for an account, we may collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Email address</li>
              <li>Username</li>
              <li>Password (encrypted)</li>
              <li>Profile information (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.2 Google OAuth Information</h3>
            <p className="text-gray-700 mb-3">When you sign in with Google, we receive:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your Google account email</li>
              <li>Your Google profile name</li>
              <li>Your Google profile picture (if available)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.3 Usage Data</h3>
            <p className="text-gray-700 mb-3">We automatically collect certain information when you use our service:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Songs you analyze and translate</li>
              <li>Your search history within the application</li>
              <li>Ratings and feedback you provide</li>
              <li>Your favorite songs and saved translations</li>
              <li>Language preferences</li>
              <li>Session information and login history</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.4 Technical Data</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the collected information for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Account Management:</strong> To create and manage your user account</li>
              <li><strong>Service Delivery:</strong> To provide lyrics analysis, translation, and mood detection services</li>
              <li><strong>Personalization:</strong> To provide personalized song recommendations based on your preferences</li>
              <li><strong>AI Processing:</strong> To analyze lyrics using Large Language Models (LLMs) for translation, mood analysis, and interpretation</li>
              <li><strong>Communication:</strong> To send you service-related notifications and updates via email (from musemusic-noreply@phitik.com)</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve our service</li>
              <li><strong>Security:</strong> To protect against unauthorized access and ensure system security</li>
              <li><strong>Academic Evaluation:</strong> Anonymous, aggregated data may be used for academic assessment of this educational project</li>
            </ul>
          </section>

          {/* AI and LLM Usage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Artificial Intelligence (AI) and Large Language Models</h2>
            <p className="text-gray-700 mb-3">
              MUSE MUSIC uses AI and Large Language Models (LLMs) to analyze song lyrics. When you request a song analysis:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Song lyrics are processed by AI models via Ollama (gpt-oss:120b) and other Large Language Models</li>
              <li>The AI generates translations, mood analysis, summaries, and interpretations</li>
              <li>Results are AI predictions and may not be 100% accurate</li>
              <li>Processed data is stored for improving service quality</li>
              <li>No personal information is sent to AI models, only lyrics content</li>
            </ul>
            <p className="text-gray-700 mt-3">
              <strong>Important:</strong> All AI-generated content is provided &quot;as is&quot; for educational purposes and should not be considered as professional translation or psychological analysis.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-700 mb-3">We integrate with the following third-party services:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Google OAuth</h3>
            <p className="text-gray-700 mb-3">
              For authentication purposes. Please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#7B61FF] hover:underline">Google&apos;s Privacy Policy</a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 YouTube API</h3>
            <p className="text-gray-700 mb-3">
              For searching and displaying videos with synced lyrics. Subject to <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#7B61FF] hover:underline">YouTube Terms of Service</a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Spotify API</h3>
            <p className="text-gray-700 mb-3">
              For music metadata and song information retrieval.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 LRCLib</h3>
            <p className="text-gray-700 mb-3">
              For synchronized lyrics data and timing information.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.5 YouTube Transcript API</h3>
            <p className="text-gray-700 mb-3">
              For retrieving video transcripts and captions. Uses <a href="https://github.com/Warissaa/youtube-transcript-api" target="_blank" rel="noopener noreferrer" className="text-[#7B61FF] hover:underline">youtube-transcript-api library</a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.6 Google Analytics</h3>
            <p className="text-gray-700 mb-3">
              For analyzing website traffic and user behavior (anonymized data).
            </p>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Storage and Security</h2>
            <p className="text-gray-700 mb-3">We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Passwords are encrypted using industry-standard hashing algorithms</li>
              <li>Secure HTTPS connections for all data transmission</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Database encryption for sensitive information</li>
            </ul>
            <p className="text-gray-700 mt-3">
              <strong>Data Retention:</strong> User data is retained for the duration of the educational project (approximately one academic year) and may be deleted upon project completion or user request.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Opt-out of certain data collection (e.g., analytics)</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, please contact us through the contact information provided below.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-3">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintain your login session</li>
              <li>Remember your preferences (language, theme, etc.)</li>
              <li>Analyze usage patterns through Google Analytics</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our service.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Users</h2>
            <p className="text-gray-700">
              This service is hosted in Thailand and operated as an educational project at King Mongkut&apos;s University of Technology Thonburi. By using our service, you consent to the transfer and processing of your information in Thailand.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Educational Project Notice */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Educational Project and Copyright Notice</h2>
            <p className="text-gray-700 mb-3">
              <strong>Important:</strong> MUSE MUSIC is an educational project developed for academic purposes at King Mongkut&apos;s University of Technology Thonburi (KMUTT) as part of CPE 334 Software Engineering course. This project demonstrates software engineering principles, full-stack development, and AI integration. Data collected may be used for academic evaluation in anonymized, aggregated form.
            </p>
            <p className="text-gray-700 mt-3">
              <strong>Copyright Disclaimer:</strong> This service may contain copyrighted song lyrics and related content. All content is used strictly for educational and non-commercial purposes under fair use principles. We do not claim ownership of any copyrighted materials. If you are a copyright holder and believe your content should be removed, please contact us immediately and we will promptly remove it. We respect all intellectual property rights and are committed to complying with copyright laws.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-3">
              If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
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
              By using MUSE MUSIC, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

