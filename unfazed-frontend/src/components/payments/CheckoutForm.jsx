import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import axiosInstance from '../../api/axiosInstance';

const CheckoutForm = ({
  therapist,
  client,
  selectedSlot,
  sessionId,
  packageId,
  amount,
  itemTitle,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedPayment, setCompletedPayment] = useState(null);

  const handleCheckout = async (simulate = false) => {
    setLoading(true);
    setError('');

    // Check contact info
    if (!client?.name?.trim() || !client?.email?.trim()) {
      setError('Please enter your full name and email address above before proceeding.');
      setLoading(false);
      return;
    }

    try {
      let currentSessionId = sessionId || null;
      let currentClientId = client?._id || client?.id || null;

      // 1. If a calendar slot is selected and not yet booked, book it first
      if (selectedSlot && !currentSessionId) {
        const bookRes = await axiosInstance.post('/scheduling/book', {
          therapist_id: therapist._id || therapist.id,
          client_name: client.name.trim(),
          client_email: client.email.trim(),
          client_phone: client.phone || '',
          start_time: selectedSlot.start_time,
          duration_minutes: selectedSlot.duration_minutes || 60,
          session_type: 'video',
        });

        if (bookRes.data.success) {
          currentSessionId = bookRes.data.session._id;
          if (bookRes.data.client) {
            currentClientId = bookRes.data.client._id || bookRes.data.client.id;
          }
        } else {
          throw new Error(bookRes.data.message || 'Unable to reserve selected slot.');
        }
      }

      // 2. Create order on backend
      const orderRes = await axiosInstance.post('/payments/create-order', {
        therapist_id: therapist._id || therapist.id,
        client_id: currentClientId,
        client_name: client.name.trim(),
        client_email: client.email.trim(),
        client_phone: client.phone || '',
        session_id: currentSessionId,
        package_id: packageId || null,
        amount: amount || therapist.hourly_rate || 1500,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create payment order');
      }

      const { order, key_id } = orderRes.data;

      const buildVerifyPayload = (paymentId, signature) => ({
        razorpay_order_id: order.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        therapist_id: therapist._id || therapist.id,
        client_id: currentClientId,
        client_name: client.name.trim(),
        client_email: client.email.trim(),
        client_phone: client.phone || '',
        session_id: currentSessionId,
        package_id: packageId || null,
        amount: amount || therapist.hourly_rate || 1500,
      });

      // If simulate test mode requested or Razorpay window is simulated
      if (simulate || !window.Razorpay || key_id.includes('placeholder') || key_id.includes('simulated')) {
        const verifyRes = await axiosInstance.post(
          '/payments/verify',
          buildVerifyPayload(`pay_sim_${Date.now()}`, 'simulated_test_signature')
        );

        if (verifyRes.data.success) {
          setCompletedPayment(verifyRes.data);
          if (onPaymentSuccess) onPaymentSuccess(verifyRes.data);
        }
        return;
      }

      // Live / Test mode Razorpay checkout script
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: therapist.name || 'Unfazed Therapy',
        description: itemTitle || 'Clinical Consultation',
        order_id: order.id,
        prefill: {
          name: client.name || '',
          email: client.email || '',
          contact: client.phone || '',
        },
        theme: {
          color: '#0d9488',
        },
        handler: async (response) => {
          try {
            const verifyRes = await axiosInstance.post(
              '/payments/verify',
              buildVerifyPayload(response.razorpay_payment_id, response.razorpay_signature)
            );

            if (verifyRes.data.success) {
              setCompletedPayment(verifyRes.data);
              if (onPaymentSuccess) onPaymentSuccess(verifyRes.data);
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment initialization error.');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    if (!completedPayment?.invoiceNumber) return;
    const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5000/api');
    const downloadUrl = `${apiBase}/payments/invoice/${completedPayment.invoiceNumber}/download`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-md mx-auto text-left">
      {completedPayment ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thank you, {client.name}. Your session has been confirmed.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <span className="font-bold text-slate-800">{completedPayment.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-teal-700">₹{amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Includes GST:</span>
              <span className="text-slate-700 font-medium">18% (SAC 999312)</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={Download}
            onClick={downloadInvoice}
          >
            Download GST Tax Invoice (PDF)
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
              Secure Checkout
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1.5">{itemTitle || 'Consultation Session'}</h3>
            <p className="text-xs text-slate-500">Advance reservation with {therapist.name}</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Consultation Fee:</span>
              <span className="font-semibold text-slate-800">
                ₹{(amount / 1.18).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18% Healthcare SAC):</span>
              <span className="font-semibold text-slate-800">
                ₹{(amount - amount / 1.18).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-teal-700 text-base">₹{amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              className="w-full"
              size="lg"
              icon={CreditCard}
              isLoading={loading}
              onClick={() => handleCheckout(false)}
            >
              Pay with Razorpay
            </Button>

            {/* Simulated test button for instant testing */}
            <button
              type="button"
              onClick={() => handleCheckout(true)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition border border-dashed border-slate-300"
            >
              ⚡ Instant Test Payment (Skip Live Keys)
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit SSL encrypted • Instant GST Invoice</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
