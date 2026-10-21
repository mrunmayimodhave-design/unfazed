import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import CheckoutForm from '../../components/payments/CheckoutForm';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const therapistId = searchParams.get('therapist_id');
  const clientId = searchParams.get('client_id');
  const sessionId = searchParams.get('session_id');
  const amount = Number(searchParams.get('amount')) || 1500;

  const [therapist, setTherapist] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In direct payment link, setup default entities if not fetched
    setTherapist({
      _id: therapistId || 'demo_therapist',
      name: 'Clinical Practice Provider',
      hourly_rate: amount,
    });
    setClient({
      _id: clientId || 'demo_client',
      name: 'Client',
      email: 'client@example.com',
    });
    setLoading(false);
  }, [therapistId, clientId, amount]);

  if (loading) {
    return <Loader text="Setting up secure checkout..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>

        <CheckoutForm
          therapist={therapist}
          client={client}
          sessionId={sessionId}
          amount={amount}
          itemTitle="Session Consultation Payment"
          onPaymentSuccess={() => {}}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
