-- Delivery fee is agreed per order on WhatsApp: areas have no price, order fee is optional
ALTER TABLE "DeliveryZone" DROP COLUMN "fee";
ALTER TABLE "Order" ALTER COLUMN "deliveryFee" DROP NOT NULL;
