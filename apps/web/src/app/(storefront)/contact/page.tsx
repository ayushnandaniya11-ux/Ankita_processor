'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button, Input, Textarea, Label } from '@ankita/ui'
import { toast } from 'sonner'
import { APP_NAME } from '@ankita/config'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success('Thank you for reaching out! Our team will get back to you within 24 hours.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 600)
  }

  return (
    <div className="container-wide py-12 max-w-5xl space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Get in Touch</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact Customer Care & Business Inquiries</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Have questions about an order, styling recommendations, or wholesale bulk orders? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Details */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <MapPin className="h-5 w-5" />
              <h2 className="font-semibold text-foreground">Registered Office</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {APP_NAME} Ankita Processors<br />
              Ploat No. 5 BEHIEND VIVEKANAND SCHOOL,<br />
              Jetpur, Gujarat, India - 360370
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Mail className="h-5 w-5" />
              <h2 className="font-semibold text-foreground">Email Support</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Retail: <a href="ankitaprocessors@gmail.com" className="text-primary hover:underline">ankitaprocessors@gmail.com</a><br />
              Wholesale: <a href="ankitaprocessors@gmail.com" className="text-primary hover:underline">ankitaprocessors@gmail.com</a>
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Phone className="h-5 w-5" />
              <h2 className="font-semibold text-foreground">Phone & WhatsApp</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              +91 7043637284<br />
              WhatsApp: +91 7043637284
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Clock className="h-5 w-5" />
              <h2 className="font-semibold text-foreground">Business Hours</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Monday – Saturday: 10:00 AM – 7:00 PM IST<br />
              Sunday: Closed
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 md:col-span-2 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full Name *</Label>
                <Input
                  id="contact-name"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone Number *</Label>
                <Input
                  id="contact-phone"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email Address *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  placeholder="Order query, Wholesale, etc."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea
                id="contact-message"
                required
                rows={5}
                placeholder="How can we help you today?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
