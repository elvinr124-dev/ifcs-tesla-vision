import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { ArrowLeft, Calendar, User } from "lucide-react";
import blogBg from "@/assets/blog-bg.jpg";
import peruImg from "@/assets/blog-peru-education.jpg";
import argentinaImg from "@/assets/blog-argentina-vocational.jpg";
import polandImg from "@/assets/blog-poland-dba.jpg";
import russiaImg from "@/assets/blog-russia-nursing.jpg";

const posts: Record<string, { title: string; date: string; author: string; image: string; content: React.ReactNode }> = {
  "alternative-basic-education-peru": {
    title: "Exploring the Benefits of Alternative Basic Education in Peru",
    date: "15 December, 2024",
    author: "Bedire Matoshi, Director of Evaluations",
    image: peruImg,
    content: (
      <>
        <p>In today's rapidly evolving world, education is crucial in empowering individuals, regardless of age or background. However, not everyone has had the opportunity to follow the traditional path of formal schooling. This is where Alternative Basic Education (EBA) steps in as a transformative solution, offering a flexible, accessible, and high-quality alternative to Regular Basic Education.</p>

        <h2>What is Alternative Basic Education (EBA)?</h2>
        <p>Alternative Basic Education (EBA) is designed to provide individuals who missed out on or did not complete their primary or secondary schooling with an opportunity to achieve educational goals. It is equivalent to Regular Basic Education in terms of objectives and quality. Still, it offers a unique, flexible structure tailored to the needs of students, balancing other responsibilities such as work or family care.</p>
        <p>EBA aims to prepare students for further academic achievement and entry into the workforce, equipping them with essential business skills and practical knowledge valuable in their careers. Whether pursuing higher education, technical studies, or a better understanding of business and work environments, EBA provides the foundation to progress.</p>

        <h2>Key Features and Benefits of EBA</h2>
        <h3>Free Enrollment and Educational Materials</h3>
        <p>EBA provides free enrollment and necessary educational materials, ensuring that financial barriers do not prevent access to education. This is especially crucial for individuals from lower-income backgrounds who might otherwise be unable to continue their studies.</p>

        <h3>Flexible Learning Schedule</h3>
        <p>Understanding the realities of adult learners, EBA offers flexible hours that accommodate students' schedules. Whether working full-time or managing other responsibilities, learners can participate in face-to-face, blended, or fully distance-based education, making balancing studies with daily life easier.</p>

        <h3>Certification with Official Value</h3>
        <p>EBA provides students with a certification that holds official value. This certification allows students to continue their education at higher levels, pursue technical training, or even enter the Armed Forces. Its recognition makes it an essential stepping stone toward achieving more advanced academic or career aspirations.</p>

        <h3>Diverse Learning Formats</h3>
        <p>EBA is designed with flexibility in mind. Whether students prefer traditional face-to-face learning, a blend of in-person and online classes, or entirely remote learning, EBA adapts to its learners' diverse needs and preferences. This approach ensures that all students can find a mode of education that suits them best.</p>

        <h2>Who Benefits from EBA?</h2>
        <p>EBA is specifically aimed at individuals aged 14 and over who either never had the chance to attend school or could not complete their studies. The program caters to a broad range of learners, each with unique backgrounds and needs.</p>

        <h2>Conclusion</h2>
        <p>Alternative Basic Education (EBA) is a vital educational modality that provides opportunities for individuals who may have missed out on traditional schooling. By offering flexible schedules, free enrollment, and official certification, EBA equips learners with the skills they need to advance in life, whether by continuing their education at post-secondary institutions or improving their career prospects. This inclusive and adaptable education model helps students reach their full potential and fosters a more equitable society where everyone has access to the tools for success regardless of their background or circumstances.</p>
      </>
    ),
  },
  "vocational-qualifications-argentina": {
    title: "Navigating Vocational Qualifications in Argentina: A Comprehensive Guide to Vocational Education and Training (VET) Opportunities",
    date: "17 August, 2024",
    author: "Bedire Matoshi, Director of Evaluations",
    image: argentinaImg,
    content: (
      <>
        <h2>An Overview of Argentina's Vocational Education System: Unlocking Career Paths</h2>
        <p>Argentina's vocational education and training (VET) system, known as "Educación Técnico Profesional" (ETP), is one of the modalities of the Argentine education system recognized by Article 38 of the National Education Law No. 26,206 and offers a range of programs designed to equip individuals with practical skills and industry knowledge for immediate workforce entry.</p>
        <p>This guide draws on information from the National Institute for Technological Education (INET) and the Ministry of Education.</p>

        <h2>Types of Vocational Qualifications Available in Argentina</h2>
        <p>Argentina's vocational qualifications (ETP) according to the Technical Education Law No. 26.058, has three areas: High School Technical, Higher Technical (non-university), and Professional Training, encompass several programs tailored to different educational levels, professional aspirations, and industry demands:</p>
        <ul>
          <li><strong>High School Technical Education (Educación Técnica de Nivel Secundario):</strong> This program combines general education with technical training across more than 20 specialties. Offered by over 1,600 institutions, it ensures a seamless transition into the workforce or higher levels of study.</li>
          <li><strong>Higher Technical Education (Educación Técnica de Nivel Superior):</strong> Post-secondary programs designed to provide advanced technical knowledge and practical skills. These programs prepare students for mid-level technical roles in fields such as healthcare, industrial technology, and engineering. The curriculum spans two to three years.</li>
          <li><strong>Professional Formation (Formación Profesional):</strong> Aimed at individuals already in the workforce, this pathway focuses on improving, updating, and requalifying workers' skills to meet the demands of the economy.</li>
        </ul>

        <h2>Accreditation and Recognition of Vocational Qualifications in Argentina</h2>
        <p>Vocational qualifications earned through accredited programs are formally recognized within Argentina's educational system. Certified programs listed in the Federal Register of Technical Professional Education Institutions and the National Catalog of Titles and Certifications are aligned with national education standards, ensuring that these qualifications are valid and transferable across educational institutions and professional fields.</p>

        <h2>Admission Requirements for Vocational Programs</h2>
        <p>Admission requirements for vocational programs in Argentina depends on the program and institution. Some programs for Higher Technical Education level and within Professional Formation pathways, may require applicants to have a standard or technical high school diploma or to meet specific criteria outlined in Argentina's Higher Education Law No. 24.521, Article 7.</p>
        <p>Other programs may require entrance exams or interviews to evaluate baseline skills, ensuring students are prepared for technical training and have the necessary foundational knowledge.</p>

        <h2>Comparison to Academic Programs</h2>
        <ul>
          <li><strong>Focus:</strong> Vocational programs emphasize hands-on skills and practical training tailored to specific industries. Academic programs focus on theoretical knowledge and intellectual development.</li>
          <li><strong>Career Pathways:</strong> Vocational education prepares students for direct entry into the workforce. Academic education often serves as a pathway to further studies or research careers.</li>
          <li><strong>Assessment:</strong> Vocational programs utilize practical assessments, including projects, simulations, and work placements, in addition to written exams.</li>
        </ul>

        <h2>Pathways to Further Education and Credit Transferability</h2>
        <p>One of the strengths of Argentina's vocational education system is the ability for students to transfer credits to academic programs. This process is regulated and depends on recognition agreements between institutions and the type of programs involved. Credit transfer is generally more accessible when the technical field of study has a natural progression at the university level.</p>

        <h2>In Conclusion: Why Vocational Education is a Path to Success</h2>
        <p>Argentina's vocational education and training system provides flexible, career-oriented pathways, addressing the growing need for skilled professionals in several market sectors. By equipping students with industry-aligned skills, these programs play a crucial role in economic development and open doors to fulfilling careers across a wide array of industries.</p>
      </>
    ),
  },
  "dba-jagiellonian-academy": {
    title: "Assessment of the Doctor of Business Administration Program at Jagiellonian Academy, Torun, Poland: A Detailed Examination by IFCS",
    date: "28 December, 2023",
    author: "Bedrie Matoshi, Director of Evaluations",
    image: polandImg,
    content: (
      <>
        <h2>Introduction</h2>
        <p>IFCS has recently received numerous requests to evaluate Doctor of Business Administration (DBA) degrees from Jagiellonian Academy in Torun, Poland. This blog aims to provide a comprehensive analysis of the program, considering its key features, the issuing institution, and the official response received from the Ministry of Education and Science in Poland.</p>

        <h2>Program Details</h2>
        <p>The DBA program at Akademia Jagiellońska is open to applicants who hold a Master's degree or its equivalent. The program is two years long and requires a total of 180 ECTS credits, including a thesis. One noteworthy aspect of the program is that it is offered through distance learning, which is becoming increasingly popular in higher education.</p>

        <h2>Issuing Institution</h2>
        <p>Founded in 2002 as a non-public institution, Jagiellonian Academy underwent a significant transformation in February 2022, attaining academy status and adopting the name Akademia Jagiellońska w Toruniu. Operating under the supervision of the Minister of Science and Higher Education, the institution holds a notable position within the Polish higher education landscape.</p>

        <h2>Preliminary Research Findings</h2>
        <p>IFCS initiated preliminary research to ascertain the recognition and accreditation status of the DBA program at Jagiellonian Academy. While the institution itself is recognized by the Ministry of Education and Science in Poland, the DBA program was not listed among the approved degree programs.</p>

        <h2>Communication with the Ministry of Education and Science</h2>
        <h3>Ministry's Clarification</h3>
        <p>The Ministry stated that the title "Doctor of Business Administration (DBA)" does not hold the status of an academic doctorate under Polish legislation. This designation is granted within the framework of postgraduate programs, emphasizing that the completion of such a program does not equate to obtaining an academic doctorate in the Polish system of higher education and science.</p>
        <p>The Ministry also highlighted the autonomy of public and non-public universities in conducting postgraduate programs without requiring explicit approval/accreditation.</p>

        <h2>IFCS Recommendation</h2>
        <p>In light of the Ministry's clarification and recognizing the unique status of the DBA title outside Polish legislation, IFCS recommends acknowledging two years of graduate-level credits for individuals holding this qualification. However, IFCS does not recommend conferring the title of a graduate degree, emphasizing the distinctive nature of the DBA within the Polish higher education context.</p>

        <h2>Conclusion</h2>
        <p>The evaluation of Doctor of Business Administration degrees from Jagiellonian Academy reveals a nuanced scenario. While the institution itself is recognized, the unique characteristics of the DBA program necessitate careful consideration.</p>
      </>
    ),
  },
  "retraining-nursing-russia": {
    title: "Evaluation of the Retraining Program in Nursing offered by Obninsk Center for Advanced Studies, Russia",
    date: "28 December, 2023",
    author: "Bedrie Matoshi, Director of Evaluation",
    image: russiaImg,
    content: (
      <>
        <h2>Introduction</h2>
        <p>The Federal State Budgetary Educational Institution of Continuing Education, known as the Obninsk Center for Advanced Studies and Retraining of Specialists with Secondary Medical and Pharmaceutical Education of the Federal Medical and Biological Agency of Russia, has been a prominent player in the realm of additional professional education for individuals holding secondary medical and pharmaceutical education for over three decades.</p>

        <h2>Program Overview</h2>
        <p>Established on December 25, 1984, the Obninsk Center for Advanced Studies caters to individuals with secondary medical and pharmaceutical education, offering a 2-year retraining program in Nursing.</p>
        <p>In our pursuit of understanding the program, the Institute of Foreign Credential Services (IFCS) sought clarification from the issuing institution and the Ministry of Education and Science. The focus was on how this program aligns with a Bachelor's degree in Nursing and whether holders of the retraining diploma are eligible for admission to a Master's degree program in Nursing based solely on this qualification.</p>

        <h2>The Response</h2>
        <p>According to the Obninsk Center for Advanced Studies, the retraining diploma in Nursing is considered equivalent to a Bachelor's degree and provides access to a Master's program in Nursing. However, the Ministry of Education and Science conveyed a different perspective. They clarified that the retraining diploma in Nursing doesn't hold the status of an academic degree, and its requirements do not align with the standards set by approved degree-granting institutions in Russia.</p>
        <p>Bachelor programs in Nursing, approved by the Federal Agency, mandate 240 z.u., whereas retraining diplomas in Nursing only require 3,500 hours or 97 z.u. (1 cu = 36 hours). Furthermore, due to non-compliance with the Federal State Educational Standards, holders of retraining diplomas in Nursing are ineligible for admission to Master's programs. Although accreditation is not mandatory for continuing education programs, this limitation prohibits the transfer of credits to public university study programs.</p>
        <p>However, this does not allow the transfer of credits for public university (accredited) study programs. This is a terminal diploma, which leads to employment only.</p>

        <h2>Distinctive Features and Recommendations</h2>
        <p>A distinctive feature of the retraining program at the Obninsk Center is its exemption from accreditation requirements, owing to its status as an additional education program. However, this exemption comes at a cost, as the diploma obtained is deemed terminal, restricting its utility to employment purposes only. The absence of accreditation prevents the transfer of credits to public university study programs, particularly those accredited by recognized authorities.</p>

        <h2>The Institute of Foreign Credential Services (IFCS) Recommendation</h2>
        <p>Considering the aforementioned findings, IFCS recommends two years of professional development training in Nursing for individuals holding the diploma from the Obninsk Center. This directive implies a recognition of the program's limitations in preparing candidates for advanced academic pursuits, urging a supplementary investment in professional development to bridge the identified gaps.</p>

        <h2>Conclusion</h2>
        <p>The retraining program in Nursing offered by the Obninsk Center for Advanced Studies occupies a distinctive niche in the landscape of medical education in Russia. However, the evident non-compliance with the Federal State Educational Standard and the lack of accreditation raises critical questions about the program's academic rigor and its alignment with broader educational objectives.</p>
      </>
    ),
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? posts[slug] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
            <Link to="/blog" className="text-accent hover:underline">Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[50vh] min-h-[350px] w-full flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.image})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12 pb-12 hero-text-shadow">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium mb-4 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 content-bg">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="p-8 md:p-12 prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-5 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-p:text-foreground/90 prose-p:leading-[1.9] prose-p:mb-5 prose-li:text-foreground/90 prose-li:leading-[1.8] prose-strong:text-foreground prose-ul:space-y-3 prose-ul:my-5">
              {post.content}
              <div className="mt-12 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground italic">Written by {post.author}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pb-16 content-bg">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
