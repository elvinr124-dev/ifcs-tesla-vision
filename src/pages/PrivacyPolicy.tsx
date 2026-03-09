import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[40vh] min-h-[260px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Legal</p>
          <h1 className="tesla-hero-title text-white">Privacy Policy</h1>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 content-bg">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="p-8 md:p-12 prose prose-sm max-w-none text-foreground">
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Online Privacy Policy Agreement</h2>
              
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Institute Of Foreign Credential Services, (IFCS), is committed to keeping any and all personal information collected of those individuals that visit our website and make use of our online facilities and services accurate, confidential, secure and private. Our privacy policy has been designed and created to ensure those affiliated with of our commitment and realization of our obligation not only to meet but to exceed most existing privacy standards.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                THEREFORE, this Privacy Policy Agreement shall apply to Institute Of Foreign Credential Services, and thus it shall govern any and all data collection and usage thereof. Through the use of ifcsevals.com you are herein consenting to the following data procedures expressed within this agreement.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Collection of Information</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                This website collects various types of information, such as:
              </p>
              <ul className="list-disc pl-5 text-sm text-foreground/90 leading-relaxed space-y-2 mb-4">
                <li>Voluntarily provided information which may include your name, address, email address, billing and/or credit card information etc., which may be used when you purchase products and/or services and to deliver the services you have requested.</li>
              </ul>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Please rest assured that this site shall only collect personal information that you knowingly and willingly provide by way of surveys, completed membership forms, and emails. It is the intent of this site to use personal information only for the purpose for which it was requested and any additional uses specifically provided on this site.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Institute Of Foreign Credential Services may also have the occasion to collect anonymous demographic information that may not be unique to you and may even gather additional or other personal and/or nonpersonal information, such as age, gender, household income, political affiliation, race and religion, at a later time.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                It is highly recommended and suggested that you review the privacy policies and statements of any website you choose to use or frequent as a means to better understand the way in which other websites garner, make use of and share information collected.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Use of Information Collected</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Institute Of Foreign Credential Services may collect and may make use of personal information to assist in the operation of our website and to ensure delivery of the services you need and request. At times, we may find it necessary to use personally identifiable information meant to inform you of other possible products and/or services that may be available to you from ifcsevals.com. Institute Of Foreign Credential Services may also be in contact with you with regards to completing surveys and/or research questionnaires related to your opinion of current or possible new services that are offered or may be offered.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Institute Of Foreign Credential Services does not now, nor will it in the future, sell, rent or lease any of its customer lists and/or names to any third parties.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Institute Of Foreign Credential Services may disclose your personal information, without prior notice to you, only if required to do so pursuant to applicable laws and/or in a good faith belief that such action is deemed necessary or required to:
              </p>
              <ul className="list-disc pl-5 text-sm text-foreground/90 leading-relaxed space-y-2 mb-6">
                <li>Conform to decrees, laws and/or statutes or in an effort to comply with any process which may be served upon Institute Of Foreign Credential Services and/or its website;</li>
                <li>Safeguard and/or preserve all the rights and/or property of Institute Of Foreign Credential Services; and</li>
                <li>Perform under demanding conditions in an effort to safeguard the personal safety of users of ifcsevals.com and/or the general public.</li>
              </ul>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Children Under Age of 13</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                Institute Of Foreign Credential Services does not knowingly collect personal identifiable information from children under the age of thirteen (13) without verifiable parental consent. If it is determined that such information has been inadvertently collected on anyone under the age of thirteen (13), we shall immediately take the necessary steps to ensure that such information is deleted from our system's database. Anyone under the age of thirteen (13) must seek and obtain parent or guardian permission to use this website.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Unsubscribe or Opt-Out</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                All users and/or visitors to our website have the option to discontinue receiving communication from us and/or reserve the right to discontinue receiving communications by way of email or newsletters. To discontinue or unsubscribe to our website please send an e-mail that you wish to unsubscribe to info@ifcsevals.com. If you wish to unsubscribe or opt-out from any third party websites, you must go to that specific website to unsubscribe and/or opt-out.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Links to Other Web Sites</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                Our website does contain links to affiliate and other websites. Institute Of Foreign Credential Services does not claim nor accept responsibility for any privacy policies, practices and/or procedures of other such websites. Therefore, we encourage all users and visitors to be aware when they leave our website and to read the privacy statements of each and every website that collects personally identifiable information. The aforementioned Privacy Policy Agreement applies only and solely to the information collected by our website.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Security</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                Institute Of Foreign Credential Services shall endeavor and shall take every precaution to maintain adequate physical, procedural and technical security with respect to its offices and information storage facilities so as to prevent any loss, misuse, unauthorized access, disclosure or modification of the user's personal information under our control.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Changes to Privacy Policy Agreement</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                Institute Of Foreign Credential Services reserves the right to update and/or change the terms of our privacy policy, and as such we will post those change to our website homepage at ifcsevals.com, so that our users and/or visitors are always aware of the type of information we collect, how it will be used, and under what circumstances, if any, we may disclose such information. If at any point in time Institute Of Foreign Credential Services decides to make use of any personally identifiable information on file, in a manner vastly different from that which was stated when this information was initially collected, the user or users shall be promptly notified by email. Users at that time shall have the option as to whether or not to permit the use of their information in this separate manner.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">Acceptance of Terms</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                Through the use of this website, you are hereby accepting the terms and conditions stipulated within the aforementioned Privacy Policy Agreement. If you are not in agreement with our terms and conditions, then you should refrain from further use of our sites. In addition, your continued use of our website following the posting of any updates or changes to our terms and conditions shall mean that you are in agreement and acceptance of such changes.
              </p>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-3">How to Contact Us</h3>
              <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                If you have any questions or concerns regarding the Privacy Policy Agreement related to our website, please feel free to contact us at the following email, telephone number or mailing address.
              </p>
              <div className="text-sm text-foreground/90 leading-relaxed space-y-1 mb-4">
                <p><strong>Email:</strong> info@ifcsevals.com</p>
                <p><strong>Telephone Number:</strong> (914) 693-2840</p>
                <p><strong>Mailing Address:</strong></p>
                <p>Institute Of Foreign Credential Services</p>
                <p>6 Cedar Street</p>
                <p>Dobbs Ferry, New York 10522</p>
              </div>
              <p className="text-sm text-muted-foreground">3/9/2026</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
