import { useState } from 'react';
import { submitContactMessage } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', msg: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactMessage(formData);
      setStatus({ type: 'success', msg: res?.data?.message || 'Message sent! Our team will contact you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: err?.response?.data?.message || 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Get in Touch</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">Have questions about a booking? Or want to partner with us? Our travel experts are available 24/7 to assist you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-6">📍</div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Our Office</h3>
               <p className="text-gray-500 text-sm leading-relaxed">London Business Center, 123 Travel Lane<br />London, EC1A 1BB, United Kingdom</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl mb-6">📞</div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Direct Line</h3>
               <p className="text-gray-500 text-sm leading-relaxed">Main: +44 208 044 8838<br />Support: +44 208 044 9000</p>
            </div>

            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-lg font-bold mb-2">Email Us</h3>
                 <p className="text-indigo-100 text-sm mb-4">For fast support, email our ticketing desk directly.</p>
                 <p className="font-bold text-xl">info@zamgotravel.com</p>
               </div>
               <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">📧</div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-gray-50">
               <h2 className="text-2xl font-black text-gray-800 mb-8">Send a Message</h2>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Your Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your inquiry..."
                      rows="5"
                      className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600/10 transition font-medium resize-none"
                    ></textarea>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:shadow-2xl hover:bg-indigo-700 transition transform hover:-translate-y-1 disabled:opacity-50"
                 >
                   {loading ? 'Sending Request...' : 'Send Message Now'}
                 </button>
               </form>

               {status.msg && (
                 <div className={`mt-8 p-6 rounded-2xl text-center font-bold text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.msg}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
