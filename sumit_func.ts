async function generateSumitReceipt(orderId: number) {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) return;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];

    const sumitCompanyId = db.prepare(SELECT value FROM settings WHERE key = 'sumit_company_id').get() as any;
    const sumitApiKey = db.prepare(SELECT value FROM settings WHERE key = 'sumit_api_key').get() as any;

    if (!sumitCompanyId?.value || !sumitApiKey?.value) {
      console.log('Sumit credentials missing, skipping receipt generation.');
      return;
    }

    const payload = {
      Credentials: {
        CompanyID: parseInt(sumitCompanyId.value),
        APIKey: sumitApiKey.value
      },
      Details: {
        Type: 2, 
        Customer: {
          Name: order.customer_name,
          Phone: order.phone,
          EmailAddress: order.email || ''
        },
        SendByEmail: order.email ? {
          EmailAddress: order.email,
          Original: true
        } : undefined
      },
      Payments: [
        {
          Amount: order.total_amount,
          Type: 6 
        }
      ],
      Items: items.map(item => ({
        Quantity: item.quantity,
        UnitPrice: item.price,
        TotalPrice: item.price * item.quantity,
        Item: {
          Name: item.product_name
        }
      })),
      VATIncluded: true
    };

    const res = await fetch('https://api.sumit.co.il/accounting/documents/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Sumit Response:', data);
  } catch (err) {
    console.error('Failed to generate Sumit receipt:', err);
  }
}
