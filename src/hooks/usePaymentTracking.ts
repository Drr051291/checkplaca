import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackPurchase, createProductData } from '@/lib/analytics';

interface PaymentTrackingOptions {
  reportId: string;
  enabled: boolean;
}

/**
 * Hook para rastrear mudanças no status de pagamento
 * e disparar evento de compra quando pago
 */
export const usePaymentTracking = ({ reportId, enabled }: PaymentTrackingOptions) => {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !reportId || hasTrackedRef.current) return;

    console.log('[usePaymentTracking] Starting payment tracking for:', reportId);

    // Subscribe to payment changes
    const subscription = supabase
      .channel(`payment-${reportId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `report_id=eq.${reportId}`,
        },
        async (payload) => {
          console.log('[usePaymentTracking] Payment updated:', payload);
          
          const payment = payload.new as any;
          
          // If payment is confirmed and we haven't tracked it yet
          if (payment.status === 'paid' && !hasTrackedRef.current) {
            console.log('[usePaymentTracking] Payment confirmed! Tracking purchase...');
            
            hasTrackedRef.current = true;
            
            // Get report data to extract plate
            const { data: reportData } = await supabase
              .from('vehicle_reports')
              .select('plate')
              .eq('id', reportId)
              .single();
            
            const plate = reportData?.plate || '';
            const planType = payment.plan_type === 'premium' ? 'premium' : 'completo';
            const product = createProductData(planType, plate);
            
            // Track purchase event
            trackPurchase({
              transaction_id: payment.asaas_payment_id,
              value: parseFloat(payment.amount),
              currency: 'BRL',
              items: [product],
              customer_email: payment.payment_data?.customer?.email,
              customer_phone: payment.payment_data?.customer?.phone,
              payment_method: payment.payment_method,
            });
            
            console.log('[usePaymentTracking] Purchase event tracked successfully');
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('[usePaymentTracking] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [reportId, enabled]);

  return null;
};
