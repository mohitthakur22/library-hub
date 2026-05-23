import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Armchair,
  Zap,
  Shield,
  ChevronDown,
  Star,
  Sparkles,
  Clock,
  MapPin,
  Wind,
  Plug,
  Volume2,
  BookOpen,
  Users,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogoImage } from '@/components/LogoImage';
import * as Accordion from '@radix-ui/react-accordion';

const stats = [
  { value: '40+', label: 'Study cubicles' },
  { value: '200+', label: 'Active members' },
  { value: '12h', label: 'Open daily' },
  { value: '100%', label: 'Seat visibility' },
];

const features = [
  {
    icon: Armchair,
    title: 'Visual Seat Booking',
    desc: 'Interactive hall map — see availability and book your cubicle in seconds.',
    color: 'from-brand-gold/20 to-brand-navy-light/40',
  },
  {
    icon: Shield,
    title: 'Zero Seat Conflicts',
    desc: 'Smart allocation stops double bookings. Admin can resolve rare overlaps quickly.',
    color: 'from-brand-navy-light/60 to-brand-gold/10',
  },
  {
    icon: Zap,
    title: 'Payment Tracking',
    desc: 'Renewal reminders, invoice history, and clear due dates for every plan.',
    color: 'from-brand-gold/15 to-amber-600/10',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance & QR Check-in',
    desc: 'Track study streaks and check in at the entrance with your personal QR code.',
    color: 'from-brand-navy-light/50 to-brand-gold/15',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create your account',
    desc: 'Register with your college details and choose a fixed or rotational plan.',
  },
  {
    step: '02',
    title: 'Pick your seat',
    desc: 'Use the live hall map to select a cubicle — green means available today.',
  },
  {
    step: '03',
    title: 'Study & check in',
    desc: 'Arrive, scan your QR at the desk, and focus. Renew before your plan expires.',
  },
];

const facilities = [
  { icon: Wind, label: 'Air conditioned hall' },
  { icon: Plug, label: 'Power at every seat' },
  { icon: Volume2, label: 'Quiet study zones' },
  { icon: BookOpen, label: 'Exam-focused environment' },
  { icon: Users, label: 'Dedicated cubicles' },
  { icon: MapPin, label: 'Central location' },
];

const testimonials = [
  {
    name: 'Priya K.',
    college: 'DU',
    text: 'My fixed seat means I never waste time finding a spot before mock tests.',
    rating: 5,
  },
  {
    name: 'Arjun M.',
    college: 'IPU',
    text: 'The seat map is clear and fast. I booked cubicle A12 in under a minute.',
    rating: 5,
  },
  {
    name: 'Sneha R.',
    college: 'JNU',
    text: 'Rotational plan fits my budget and the library stays calm all day.',
    rating: 5,
  },
];

const faqs = [
  {
    q: 'What is the difference between fixed and rotational seats?',
    a: 'Fixed seats reserve one cubicle for your entire plan period. Rotational seats let you choose any available seat each day on a first-come basis.',
  },
  {
    q: 'How does conflict resolution work?',
    a: 'The system blocks overlapping bookings automatically. If a rare conflict occurs, staff resolve it from the admin panel.',
  },
  {
    q: 'What are the library timings?',
    a: 'Typical hours are 6:00 AM – 10:00 PM. Confirm current timings with the front desk when you visit.',
  },
  {
    q: 'Is online payment supported?',
    a: 'Payments are tracked in your dashboard now. UPI and card payments will be added soon.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

export function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
      >
        <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-gold/15 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-brand-navy-light/30 blur-3xl" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
            >
              <LogoImage size="hero" className="animate-float" />
            </motion.div>

            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-brand-gold mb-6 border border-brand-gold/20">
              <Sparkles className="h-4 w-4" />
              Where aspirants become achievers
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 text-theme">
              Welcome to
              <br />
              <span className="gradient-text">Aspirants Library</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-theme-muted mb-10">
              A calm, AC study hall with 40 cubicles — fixed or rotational seats, live availability,
              and hassle-free renewals for competitive exam preparation.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => (window.location.href = '/auth/register')}>
                Book Your Seat
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => (window.location.href = '/pricing')}>
                View Plans
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-14 mx-auto max-w-4xl"
          >
            <div className="glass rounded-3xl p-6 md:p-8 neon-glow">
              <div className="grid grid-cols-8 gap-1.5 md:gap-2 mb-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.35, 0.9, 0.35] }}
                    transition={{ duration: 2.5 + (i % 3) * 0.5, repeat: Infinity, delay: i * 0.08 }}
                    className={`aspect-square rounded-md md:rounded-lg ${
                      i % 5 === 0
                        ? 'bg-brand-navy border border-brand-gold/40'
                        : i % 7 === 0
                          ? 'bg-brand-gold/60'
                          : 'bg-emerald-500/35 border border-emerald-500/25'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-theme-subtle">Live hall map — 40 cubicles, real-time status</p>
            </div>
          </motion.div>
        </div>

        <motion.a
          href="#stats"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-theme-subtle hover:text-brand-gold"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.a>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-4 border-y border-[var(--divider)]">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-theme-muted mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-theme mb-4">
              Built for serious preparation
            </h2>
            <p className="text-theme-muted max-w-xl mx-auto">
              Seat booking, payments, and attendance — everything your study library needs in one place.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
                <Card
                  className={`h-full bg-gradient-to-br ${f.color} hover:scale-[1.02] transition-transform duration-300`}
                >
                  <f.icon className="h-10 w-10 text-brand-gold mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2 text-theme">{f.title}</h3>
                  <p className="text-sm text-theme-muted">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-[var(--surface-elevated)]/30">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-theme">How it works</h2>
            <p className="text-theme-muted mt-3">Three simple steps to your study seat</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.12 }}>
                <div className="glass rounded-2xl p-6 h-full relative overflow-hidden group hover:border-brand-gold/30 transition-colors">
                  <span className="font-display text-5xl font-bold text-brand-gold/20 absolute top-2 right-4">
                    {item.step}
                  </span>
                  <p className="text-brand-gold font-semibold text-sm mb-2">Step {item.step}</p>
                  <h3 className="font-display text-xl font-semibold text-theme mb-2">{item.title}</h3>
                  <p className="text-sm text-theme-muted">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-theme">Library facilities</h2>
            <p className="text-theme-muted mt-3">Everything you need for long study sessions</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {facilities.map((f, i) => (
              <motion.div
                key={f.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="glass rounded-xl p-5 flex items-center gap-4 hover:bg-[var(--card-hover)] transition-colors"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-theme">{f.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp}
            className="mt-10 grid md:grid-cols-2 gap-4"
          >
            <div className="glass rounded-2xl p-6 flex items-start gap-4">
              <Clock className="h-8 w-8 text-brand-gold shrink-0" />
              <div>
                <h3 className="font-semibold text-theme mb-1">Opening hours</h3>
                <p className="text-sm text-theme-muted">Monday – Sunday · 6:00 AM – 10:00 PM</p>
                <p className="text-xs text-theme-subtle mt-2">Timings may change on holidays — ask at reception.</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 flex items-start gap-4">
              <MapPin className="h-8 w-8 text-brand-gold shrink-0" />
              <div>
                <h3 className="font-semibold text-theme mb-1">Visit us</h3>
                <p className="text-sm text-theme-muted">
                  Aspirants Library study hall — ask your librarian for the exact address & directions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 {...fadeUp} className="font-display text-3xl font-bold text-theme mb-12">
            What students say
          </motion.h2>
          <Card glow className="relative overflow-hidden">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <p className="text-lg text-theme-muted mb-6">
                &ldquo;{testimonials[testimonialIdx].text}&rdquo;
              </p>
              <p className="font-semibold text-theme">{testimonials[testimonialIdx].name}</p>
              <p className="text-sm text-theme-subtle">{testimonials[testimonialIdx].college}</p>
            </motion.div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === testimonialIdx ? 'w-8 bg-brand-gold' : 'w-2 bg-[var(--divider)]'
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.h2 {...fadeUp} className="font-display text-3xl font-bold text-center text-theme mb-12">
            Frequently asked questions
          </motion.h2>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <Accordion.Item key={i} value={`item-${i}`} className="glass rounded-xl overflow-hidden">
                <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-theme hover:bg-[var(--card-hover)] transition-colors group">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-brand-gold transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 pb-4 text-theme-muted text-sm leading-relaxed">
                  {faq.a}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <Card glow className="max-w-4xl mx-auto text-center py-16 px-6">
          <h2 className="font-display text-3xl font-bold text-theme mb-4">Ready to claim your cubicle?</h2>
          <p className="text-theme-muted mb-8">Join hundreds of aspirants already studying with us</p>
          <Link to="/auth/register">
            <Button size="lg">Start Registration</Button>
          </Link>
        </Card>
      </section>

      <footer className="border-t border-[var(--divider)] py-8 text-center text-sm text-theme-subtle">
        © 2026 Aspirants Library · Serious study. Serious results.
      </footer>
    </div>
  );
}
