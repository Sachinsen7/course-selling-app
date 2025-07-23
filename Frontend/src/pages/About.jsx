import React from 'react';

function About() {
  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-xl">About LearnSphere</h1>
        
        <section className="mb-xl">
          <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">Our Mission</h2>
          <p className="text-lg text-text-secondary mb-md">
            At LearnSphere, our mission is to democratize education by providing high-quality, accessible, and engaging learning experiences to everyone, everywhere. We believe that knowledge is the most powerful tool for personal and professional growth, and we are committed to fostering a global community of lifelong learners.
          </p>
          <p className="text-lg text-text-secondary">
            We strive to connect passionate instructors with eager students, creating a vibrant ecosystem where expertise is shared, skills are honed, and dreams are realized.
          </p>
        </section>

        <section className="mb-xl">
          <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">What We Offer</h2>
          <ul className="list-disc list-inside text-lg text-text-secondary space-y-md">
            <li>
              <span className="font-semibold text-text-primary">Diverse Course Catalog:</span> Explore thousands of courses across various domains, from technology and business to arts and personal development.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Expert Instructors:</span> Learn from industry professionals and experienced educators who bring real-world insights to their lessons.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Flexible Learning:</span> Learn at your own pace, anytime, anywhere, with access to lectures, quizzes, assignments, and downloadable resources.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Interactive Community:</span> Engage with instructors and fellow learners through Q&A forums and discussions.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Career Advancement:</span> Gain practical skills, earn certificates, and boost your career prospects.
            </li>
          </ul>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">Our Vision</h2>
          <p className="text-lg text-text-secondary">
            To be the leading global platform for online learning, empowering individuals to achieve their full potential through continuous skill development and knowledge acquisition.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
