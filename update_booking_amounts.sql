-- Update existing bookings with amounts from their payment proofs
-- This syncs the booking total_price with the payment proof amount

UPDATE bookings b
INNER JOIN payment_proofs pp ON b.id = pp.booking_id
SET b.total_price = pp.amount
WHERE b.total_price IS NULL OR b.total_price = 0;

-- Verify the update
SELECT 
    b.id as booking_id,
    b.total_price as booking_amount,
    pp.amount as payment_amount,
    pp.payment_method,
    u.full_name as customer_name
FROM bookings b
LEFT JOIN payment_proofs pp ON b.id = pp.booking_id
LEFT JOIN users u ON b.user_id = u.id
ORDER BY b.id DESC;
