import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Calendar, User } from "lucide-react";
import blogBg from "@/assets/blog-bg.jpg";
import peruImg from "@/assets/blog-peru-education.jpg";
import argentinaImg from "@/assets/blog-argentina-vocational.jpg";
import polandImg from "@/assets/blog-poland-dba.jpg";
import russiaImg from "@/assets/blog-russia-nursing.jpg";

const blogPosts = [
  {
    slug: "alternative-basic-education-peru",
    title: "Exploring the Benefits of Alternative Basic Education in Peru",
    date: "15 December, 2024",
    excerpt: "Exploring the Benefits of Alternative Basic Education in Peru. In today's rapidly evolving world...",
    image: peruImg,
  },
  {
    slug: "vocational-qualifications-argentina",
    title: "Navigating Vocational Qualifications in Argentina: A Comprehensive Guide to Vocational Education and Training (VET) Opportunities",
    date: "17 August, 2024",
    excerpt: "Navigating Vocational Qualifications in Argentina: A Comprehensive Guide to Vocational Education and...",
    image: argentinaImg,
  },
  {
    slug: "dba-jagiellonian-academy",
    title: "Assessment of the Doctor of Business Administration Program at Jagiellonian Academy, Torun, Poland: A Detailed Examination by IFCS",
    date: "28 December, 2023",
    excerpt: "Assessment of the Doctor of Business Administration Program at Jagiellonian Academy, Torun, Poland: ...",
    image: polandImg,
  },
  {
    slug: "retraining-nursing-russia",
    title: "Evaluation of the Retraining Program in Nursing offered by Obninsk Center for Advanced Studies, Russia",
    date: "28 December, 2023",
    excerpt: "Evaluation of the Retraining Program in Nursing offered by Obninsk Center for Advanced Studies, Russ...",
    image: russiaImg,
  },
];

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${blogBg})` }} />
      <div className="video-overlay" />
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 hero-text-shadow">
        <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-white">Insights & Research</p>
        <h1 className="tesla-hero-title text-white">Blog</h1>
        <p className="tesla-hero-subtitle text-white/90 max-w-lg">
          Expert analysis and insights on international credential evaluation and education systems worldwide.
        </p>
      </div>
    </section>

    <section className="py-24 px-6 md:px-12 content-bg">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300 overflow-hidden"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                <span className="flex items-center gap-1"><User size={12} /> Bedire Matoshi</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-3">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              <span className="inline-block mt-4 text-sm font-semibold text-accent">Read More →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>

    <BackToHome />

    <Footer />
  </div>
);

export default Blog;
