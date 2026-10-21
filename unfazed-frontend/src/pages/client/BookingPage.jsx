import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Hero from '../../components/profile/Hero';
import About from '../../components/profile/About';
import ServiceCard from '../../components/profile/ServiceCard';
import SlotPicker from '../../components/scheduling/SlotPicker';
import ContactModal from '../../components/profile/ContactModal';
import CheckoutForm from '../../components/payments/CheckoutForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const BookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [therapist, setTherapist] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Selected item to book / buy
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Client info form for booking
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/therapist/public/${slug}`);
        if (res.data.success) {
          setTherapist(res.data.therapist);
          setPackages(res.data.packages || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Therapist profile could not be found.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSelectedPackage(null);
    setCheckoutModalOpen(true);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedSlot(null);
    setCheckoutModalOpen(true);
  };

  const handleBookingConfirmed = (paymentData) => {
    setBookingConfirmed(paymentData);
  };

  if (loading) {
    return <Loader text="Loading therapist practice profile..." />;
  }

  if (error || !therapist) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-2xl font-bold text-slate-800">Therapist Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          {error || `No therapist found with the URL slug "/${slug}".`}
        </p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* Hero Section */}
      <Hero
        therapist={therapist}
        onBookClick={() => {
          document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onInquiryClick={() => setInquiryModalOpen(true)}
      />

      {/* About Section */}
      <About therapist={therapist} />

      {/* Packages Section */}
      {packages.length > 0 && (
        <div className="py-12 bg-slate-50/70 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100/60 px-3 py-1 rounded-full">
                Session Packages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Bundled Therapy Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Commit to consistent therapeutic growth with discounted multi-session bundles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg, i) => (
                <ServiceCard
                  key={pkg._id}
                  pkg={pkg}
                  isPopular={i === 1}
                  onSelectPackage={handleSelectPackage}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slot Booking Section */}
      <div id="booking-section" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Book an Appointment
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select an open calendar slot. You will receive an instant confirmation and meeting link.
            </p>
          </div>

          <SlotPicker
            therapistSlug={slug}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        therapist={therapist}
      />

      {/* Booking & Checkout Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={selectedPackage ? `Purchase ${selectedPackage.name}` : 'Confirm & Reserve Session'}
        subtitle={`Session with ${therapist.name}`}
      >
        {bookingConfirmed ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Session Booked!</h3>
            <p className="text-xs text-slate-500">
              We have sent full details and your tax receipt to <strong>{clientInfo.email}</strong>.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button onClick={() => setCheckoutModalOpen(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            {/* Client Demographics for checkout */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your Contact Information
              </h4>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name *"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="tel"
                  placeholder="Phone / WhatsApp"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Checkout Form */}
            <CheckoutForm
              therapist={therapist}
              client={clientInfo}
              selectedSlot={selectedSlot}
              packageId={selectedPackage?._id}
              amount={selectedPackage ? selectedPackage.total_price : therapist.hourly_rate || 1500}
              itemTitle={selectedPackage ? selectedPackage.name : 'Individual Therapy Consultation'}
              onPaymentSuccess={handleBookingConfirmed}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingPage;
