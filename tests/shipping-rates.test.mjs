import assert from "node:assert/strict";
import test from "node:test";
import {
  combineCommonCouriers,
  parseShiprocketRates,
} from "../shipping/providers/shiprocket.ts";

test("normalizes Shiprocket rupee rates into integer paise", () => {
  const rates = parseShiprocketRates({
    data: {
      available_courier_companies: [
        { courier_company_id: 10, courier_name: "Delhivery", rate: "845.50", cod: 1, estimated_delivery_days: "5" },
        { courier_company_id: 55, courier_name: "Blue Dart Surface", freight_charge: 910, cod: 0, estimated_delivery_days: 3 },
      ],
    },
  }, false);

  assert.deepEqual(rates, [
    { courierId: "10", courierName: "Delhivery", ratePaise: 84550, estimatedDeliveryDays: 5 },
    { courierId: "55", courierName: "Blue Dart Surface", ratePaise: 91000, estimatedDeliveryDays: 3 },
  ]);
});

test("filters non-COD couriers for Cash on Delivery quotes", () => {
  const rates = parseShiprocketRates({
    data: {
      available_courier_companies: [
        { courier_company_id: 10, courier_name: "COD courier", rate: 500, cod: 1 },
        { courier_company_id: 55, courier_name: "Prepaid only", rate: 400, cod: 0 },
      ],
    },
  }, true);
  assert.equal(rates.length, 1);
  assert.equal(rates[0].courierId, "10");
});

test("combines individually packed marble works using one common surface courier", () => {
  const packages = [
    { packageId: "a", productId: "a", name: "A", sku: "A", quantity: 1, weightGrams: 10000, lengthMm: 500, widthMm: 400, heightMm: 700, declaredValuePaise: 100000 },
    { packageId: "b", productId: "b", name: "B", sku: "B", quantity: 1, weightGrams: 8000, lengthMm: 400, widthMm: 300, heightMm: 600, declaredValuePaise: 80000 },
  ];
  const options = combineCommonCouriers(packages, [
    [
      { courierId: "10", courierName: "Delhivery", ratePaise: 70000, estimatedDeliveryDays: 4 },
      { courierId: "55", courierName: "Blue Dart", ratePaise: 90000, estimatedDeliveryDays: 3 },
    ],
    [
      { courierId: "10", courierName: "Delhivery", ratePaise: 60000, estimatedDeliveryDays: 6 },
    ],
  ]);

  assert.equal(options.length, 1);
  assert.equal(options[0].providerServiceCode, "10");
  assert.equal(options[0].shippingPaise, 130000);
  assert.equal(options[0].estimatedDeliveryDays, 6);
  assert.equal(options[0].packageRates.length, 2);
});
